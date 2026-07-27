'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, CheckCircle2, Clock, AlertTriangle, 
  ArrowLeft, Search, RefreshCw, PackageCheck, XCircle, TrendingUp,
  MessageCircle, Printer, Sun, Moon, Globe, Check, Eye, Download
} from 'lucide-react';
import Link from 'next/link';

interface OrderItem { 
  id: string; 
  name: string; 
  price: number; 
  quantity: number; 
}

interface Order { 
  id: string; 
  client_name: string; 
  client_access_key?: string;
  items: OrderItem[]; 
  total_amount: number; 
  notes?: string; 
  status: 'pending' | 'fulfilled' | 'cancelled'; 
  created_at: string; 
}

interface Product { 
  id: string; 
  name: string; 
}

const WAREHOUSE_PHONE = '212762487466';

const dict = {
  ar: {
    title: 'مركز إدارة الطلبات',
    subtitle: 'متابعة وتنفيذ طلبات العملاء المباشرة',
    refresh: 'تحديث Feed',
    exportCSV: 'تصدير CSV',
    pendingRequisitions: 'طلبات قيد الانتظار',
    fulfilledOrders: 'طلبات تم تنفيذها',
    totalRevenue: 'إجمالي المبيعات المنفذة',
    searchPlaceholder: 'البحث عن عميل أو رقم الطلب...',
    all: 'الكل',
    pending: 'قيد المعالجة',
    fulfilled: 'مكتمل',
    cancelled: 'ملغي',
    noOrdersTitle: 'لا توجد طلبات',
    noOrdersSub: 'في انتظار استقبال الطلبيات الجديدة من العملاء.',
    manifestBreakdown: 'تفاصيل بيان الطلبية',
    clientNote: 'ملاحظة العميل:',
    outOfStock: 'غير متوفر في المخزون',
    totalValue: 'القيمة الإجمالية',
    fulfillBtn: 'تأكيد وتنفيذ الطلب',
    cancelBtn: 'إلغاء الطلب',
    revertBtn: 'إعادة إلى قيد المعالجة',
    whatsappContact: 'تواصل عبر واتساب',
    printManifest: 'طباعة البيان',
    syncing: 'جاري تحديث البيانات...',
    statusUpdated: 'تم تحديث حالة الطلب بنجاح!',
    currency: 'د.م.',
  },
  en: {
    title: 'Orders Command Center',
    subtitle: 'Live client requisition dispatch & fulfillment',
    refresh: 'Refresh Feed',
    exportCSV: 'Export CSV',
    pendingRequisitions: 'Pending Requisitions',
    fulfilledOrders: 'Fulfilled Orders',
    totalRevenue: 'Total Revenue (Fulfilled)',
    searchPlaceholder: 'Search by client or order ID...',
    all: 'All',
    pending: 'Pending',
    fulfilled: 'Fulfilled',
    cancelled: 'Cancelled',
    noOrdersTitle: 'No Orders Found',
    noOrdersSub: 'Waiting for incoming client requisitions.',
    manifestBreakdown: 'Manifest Breakdown',
    clientNote: 'Client Note:',
    outOfStock: 'Out of Stock',
    totalValue: 'Total Value',
    fulfillBtn: 'Fulfill Order',
    cancelBtn: 'Cancel Order',
    revertBtn: 'Revert to Pending',
    whatsappContact: 'WhatsApp Client',
    printManifest: 'Print Manifest',
    syncing: 'Syncing Data...',
    statusUpdated: 'Order status updated!',
    currency: 'MAD',
  }
};

export default function OwnerOrdersPage() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [isDark, setIsDark] = useState<boolean>(true);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const t = dict[lang];

  const fetchData = async () => {
    setLoading(true);
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: prodData } = await supabase
      .from('products')
      .select('id, name');

    if (ordersData) setOrders(ordersData);
    if (prodData) setProducts(prodData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    // Supabase Realtime subscription for incoming orders
    const channel = supabase.channel('realtime-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        setOrders((prev) => [payload.new as Order, ...prev]);
        showToast('New order received!');
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
        setOrders((prev) => prev.map(o => o.id === payload.new.id ? payload.new as Order : o));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const exportOrdersToCSV = () => {
    if (orders.length === 0) return;

    const headers = ["Order ID", "Client Name", "Status", "Total Amount (MAD)", "Created At"];
    const rows = orders.map(o => [
      o.id,
      `"${o.client_name || 'Anonymous'}"`,
      o.status,
      o.total_amount,
      `"${new Date(o.created_at).toLocaleString()}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `warehouse_orders_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateOrderStatus = async (id: string, newStatus: 'pending' | 'fulfilled' | 'cancelled') => {
    setUpdatingId(id);
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
      showToast(t.statusUpdated);
    } else {
      alert('Failed to update order status: ' + error.message);
    }
    setUpdatingId(null);
  };

  const isItemInStock = (itemName: string) => 
    products.some(p => p.name.toLowerCase().trim() === itemName.toLowerCase().trim());

  const filteredOrders = orders.filter(o => 
    (o.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) || o.id.includes(searchQuery)) && 
    (statusFilter === 'all' || o.status === statusFilter)
  );

  const totalRevenue = orders
    .filter(o => o.status === 'fulfilled')
    .reduce((acc, curr) => acc + (curr.total_amount || 0), 0);

  const openWhatsApp = (order: Order) => {
    let msg = `*WAREHOUSE EXPRESS — ORDER UPDATE*\n`;
    msg += `===================================\n`;
    msg += `📋 *Order ID:* #${order.id.slice(0, 8).toUpperCase()}\n`;
    msg += `👤 *Client:* ${order.client_name}\n`;
    msg += `STATUS: *${order.status.toUpperCase()}*\n`;
    msg += `===================================\n\n`;
    msg += `Thank you for your business!`;

    const url = `https://wa.me/${WAREHOUSE_PHONE}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const printOrder = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Order Manifest #${order.id.slice(0, 8)}</title>
          <style>
            body { font-family: monospace; padding: 20px; color: #000; }
            h2 { border-bottom: 2px solid #000; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; }
            .total { font-weight: bold; font-size: 16px; text-align: right; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h2>WAREHOUSE EXPRESS — MANIFEST RECEIPT</h2>
          <p><strong>Order ID:</strong> #${order.id.slice(0, 8).toUpperCase()}</p>
          <p><strong>Client:</strong> ${order.client_name}</p>
          <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
          <p><strong>Status:</strong> ${order.status.toUpperCase()}</p>
          
          <table>
            <thead>
              <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
            </thead>
            <tbody>
              ${order.items.map(i => `
                <tr>
                  <td>${i.name}</td>
                  <td>${i.quantity}</td>
                  <td>${i.price.toFixed(2)} MAD</td>
                  <td>${(i.price * i.quantity).toFixed(2)} MAD</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total">Total: ${order.total_amount.toFixed(2)} MAD</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`min-h-screen transition-colors duration-300 font-sans ${isDark ? 'bg-[#0a0a0a] text-slate-100' : 'bg-[#f8fafc] text-slate-900'}`}>
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-xs shadow-2xl flex items-center gap-2 border border-emerald-400">
            <Check className="w-4 h-4" /> {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <header className={`sticky top-0 z-30 px-6 py-4 border-b backdrop-blur-2xl transition-all ${isDark ? 'bg-[#0a0a0a]/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <Link href="/" className={`p-2.5 rounded-2xl border transition-all ${isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
              <ArrowLeft className={`w-5 h-5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
            </Link>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-400 text-white flex items-center justify-center font-black shadow-lg shadow-emerald-500/20">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black">{t.title}</h1>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Sync Active
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button 
              onClick={exportOrdersToCSV}
              className="px-4 py-2.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{t.exportCSV}</span>
            </button>

            <button 
              onClick={() => setIsDark(!isDark)} 
              className={`p-2.5 rounded-2xl border transition-all ${isDark ? 'bg-slate-900 border-slate-800 text-amber-400' : 'bg-white border-slate-200 text-slate-700'}`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button 
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} 
              className={`px-3.5 py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-1.5 ${isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}
            >
              <Globe className="w-4 h-4 text-emerald-500" />
              <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            <button 
              onClick={fetchData} 
              className={`px-4 py-2.5 border rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${isDark ? 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
              <span className="hidden sm:inline">{t.refresh}</span>
            </button>
          </div>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            onClick={() => setStatusFilter('pending')}
            className={`cursor-pointer rounded-[32px] p-6 border transition-all flex items-center justify-between group shadow-lg ${statusFilter === 'pending' ? 'border-amber-500 ring-2 ring-amber-500/20' : ''} ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-100'}`}
          >
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t.pendingRequisitions}</p>
              <p className="text-4xl font-black text-amber-400">{orders.filter(o => o.status === 'pending').length}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div 
            onClick={() => setStatusFilter('fulfilled')}
            className={`cursor-pointer rounded-[32px] p-6 border transition-all flex items-center justify-between group shadow-lg ${statusFilter === 'fulfilled' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : ''} ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-100'}`}
          >
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{t.fulfilledOrders}</p>
              <p className="text-4xl font-black text-emerald-400">{orders.filter(o => o.status === 'fulfilled').length}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PackageCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-gradient-to-tr from-emerald-600 to-emerald-500 rounded-[32px] p-6 shadow-xl text-white flex items-center justify-between group">
            <div>
              <p className="text-xs font-bold text-emerald-100 uppercase tracking-wider mb-1">{t.totalRevenue}</p>
              <p className="text-4xl font-black tracking-tight" dir="ltr">{totalRevenue.toFixed(2)} <span className="text-sm font-bold text-emerald-200">{t.currency}</span></p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className={`p-3 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="relative w-full md:max-w-md flex-1">
            <Search className={`w-4 h-4 absolute top-3.5 text-slate-400 ${lang === 'ar' ? 'right-4' : 'left-4'}`} />
            <input 
              type="text" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              placeholder={t.searchPlaceholder} 
              className={`w-full bg-transparent text-xs font-bold focus:outline-none placeholder-slate-400 ${lang === 'ar' ? 'pr-11 pl-4' : 'pl-11 pr-4'}`} 
            />
          </div>

          <div className={`flex items-center gap-1 w-full md:w-auto p-1 rounded-xl border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
            {['all', 'pending', 'fulfilled', 'cancelled'].map((st) => (
              <button 
                key={st} 
                onClick={() => setStatusFilter(st)} 
                className={`px-3.5 py-2 rounded-lg text-xs font-black uppercase transition-all ${statusFilter === st ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                {t[st as keyof typeof t] || st}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Feed */}
        <div className="space-y-5">
          {loading ? (
            <div className={`rounded-[32px] p-16 text-center border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <RefreshCw className="w-8 h-8 mx-auto text-emerald-500 animate-spin mb-3" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.syncing}</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className={`rounded-[32px] p-16 text-center border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <ClipboardList className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-40" />
              <h3 className="text-base font-black mb-1">{t.noOrdersTitle}</h3>
              <p className="text-xs font-medium text-slate-400">{t.noOrdersSub}</p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredOrders.map((order) => {
                const orderDate = new Date(order.created_at).toLocaleString();
                const allItemsAvailable = order.items?.every(item => isItemInStock(item.name));
                const isUpdatingThis = updatingId === order.id;

                return (
                  <motion.div 
                    key={order.id} 
                    layout 
                    initial={{ opacity: 0, y: 15 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 0.95 }} 
                    className={`rounded-[32px] p-6 lg:p-8 border shadow-xl transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-8 ${isDark ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200'}`}
                  >
                    
                    {/* Left: Order Info & Manifest */}
                    <div className="space-y-4 flex-1 w-full">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black ${isDark ? 'bg-slate-800 text-emerald-400' : 'bg-slate-100 text-emerald-600'}`}>
                            {order.client_name ? order.client_name.charAt(0).toUpperCase() : 'C'}
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-emerald-400">{order.client_name || 'Anonymous Client'}</h3>
                            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-bold mt-0.5">
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {orderDate}</span>
                              <span>&bull;</span>
                              <span className="font-mono uppercase text-[10px]">ID: #{order.id.slice(0, 8)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Utility Icons */}
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => openWhatsApp(order)} 
                            className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all text-xs font-bold flex items-center gap-1.5"
                            title={t.whatsappContact}
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">{t.whatsappContact}</span>
                          </button>

                          <button 
                            onClick={() => printOrder(order)} 
                            className={`p-2.5 rounded-xl border transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700'}`}
                            title={t.printManifest}
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Manifest Breakdown */}
                      <div className={`rounded-2xl p-4 border ${isDark ? 'bg-slate-950 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{t.manifestBreakdown}</p>
                        <div className="space-y-2">
                          {order.items?.map((item, idx) => {
                            const inStock = isItemInStock(item.name);
                            return (
                              <div key={idx} className="flex items-center justify-between text-xs font-bold">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)] animate-pulse'}`} />
                                  <span>{item.name}</span>
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-700'}`}>x{item.quantity}</span>
                                </div>
                                <span className="text-emerald-400 font-mono" dir="ltr">{(item.price * item.quantity).toFixed(2)} {t.currency}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {order.notes && (
                        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3 rounded-xl text-xs font-medium">
                          <strong className="font-black uppercase tracking-wider mr-2">{t.clientNote}</strong> {order.notes}
                        </div>
                      )}
                    </div>

                    {/* Right: Status & Action Controls */}
                    <div className={`flex flex-col items-end justify-between gap-6 w-full md:w-60 shrink-0 pt-6 md:pt-0 border-t md:border-t-0 ${lang === 'ar' ? 'md:border-r md:pr-8' : 'md:border-l md:pl-8'} ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                      <div className="text-right w-full">
                        <div className="flex items-center justify-end gap-2 mb-2">
                          {!allItemsAvailable && order.status === 'pending' && (
                            <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> {t.outOfStock}
                            </span>
                          )}
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                            order.status === 'fulfilled' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : order.status === 'cancelled' 
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {t[order.status as keyof typeof t] || order.status}
                          </span>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{t.totalValue}</span>
                        <span className="text-2xl font-black tracking-tight" dir="ltr">{(order.total_amount || 0).toFixed(2)} <span className="text-xs text-slate-400 font-bold">{t.currency}</span></span>
                      </div>

                      <div className="flex items-center gap-2 w-full">
                        {order.status === 'pending' ? (
                          <>
                            <motion.button 
                              whileTap={{ scale: 0.95 }} 
                              onClick={() => updateOrderStatus(order.id, 'fulfilled')} 
                              disabled={isUpdatingThis}
                              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(16,185,129,0.3)] transition-all"
                            >
                              {isUpdatingThis ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                              <span>{t.fulfillBtn}</span>
                            </motion.button>

                            <motion.button 
                              whileTap={{ scale: 0.95 }} 
                              onClick={() => updateOrderStatus(order.id, 'cancelled')} 
                              disabled={isUpdatingThis}
                              className="p-3.5 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 rounded-2xl transition-all" 
                              title={t.cancelBtn}
                            >
                              <XCircle className="w-4 h-4" />
                            </motion.button>
                          </>
                        ) : (
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'pending')} 
                            disabled={isUpdatingThis}
                            className={`w-full py-3 rounded-2xl text-xs font-bold border transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}
                          >
                            {isUpdatingThis ? '⏳' : t.revertBtn}
                          </button>
                        )}
                      </div>
                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

      </main>
    </div>
  );
}