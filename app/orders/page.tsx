'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, CheckCircle2, Clock, AlertTriangle, 
  ArrowLeft, Search, RefreshCw, PackageCheck, XCircle, TrendingUp
} from 'lucide-react';
import Link from 'next/link';

interface OrderItem { id: string; name: string; price: number; quantity: number; }
interface Order { id: string; client_name: string; items: OrderItem[]; total_amount: number; notes?: string; status: 'pending' | 'fulfilled' | 'cancelled'; created_at: string; }
interface Product { id: string; name: string; }

export default function OwnerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchData = async () => {
    setLoading(true);
    const { data: ordersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    const { data: prodData } = await supabase.from('products').select('id, name');
    if (ordersData) setOrders(ordersData);
    if (prodData) setProducts(prodData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const channel = supabase.channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        setOrders((prev) => [payload.new as Order, ...prev]);
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateOrderStatus = async (id: string, newStatus: 'pending' | 'fulfilled' | 'cancelled') => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    if (!error) setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const isItemInStock = (itemName: string) => products.some(p => p.name.toLowerCase() === itemName.toLowerCase());
  
  const filteredOrders = orders.filter(o => 
    (o.client_name.toLowerCase().includes(searchQuery.toLowerCase()) || o.id.includes(searchQuery)) && 
    (statusFilter === 'all' || o.status === statusFilter)
  );

  const totalRevenue = orders.filter(o => o.status === 'fulfilled').reduce((acc, curr) => acc + curr.total_amount, 0);

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 font-sans selection:bg-emerald-200">
      
      {/* Sleek Navbar */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-20 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors border border-slate-200/50">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight leading-tight">Command Center</h1>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Sync Active
              </div>
            </div>
          </div>
        </div>
        <button onClick={fetchData} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 transition-all flex items-center gap-2 text-xs font-bold shadow-sm hover:shadow">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-500' : ''}`} /> Refresh Feed
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Metric Cards - Apple Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between group hover:shadow-lg transition-all">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pending Requisitions</p>
              <p className="text-4xl font-black text-slate-900">{orders.filter(o => o.status === 'pending').length}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between group hover:shadow-lg transition-all">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Fulfilled Orders</p>
              <p className="text-4xl font-black text-emerald-500">{orders.filter(o => o.status === 'fulfilled').length}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PackageCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[32px] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.2)] text-white flex items-center justify-between group hover:shadow-2xl transition-all">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Revenue</p>
              <p className="text-4xl font-black tracking-tight">{totalRevenue.toLocaleString()} <span className="text-lg text-slate-400 font-bold">MAD</span></p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative w-full md:max-w-md flex-1">
            <Search className="w-5 h-5 absolute left-4 top-3 text-slate-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by client or ID..." className="w-full bg-transparent text-slate-900 pl-12 pr-4 py-2.5 text-sm font-bold focus:outline-none placeholder-slate-400" />
          </div>
          <div className="flex items-center gap-1 w-full md:w-auto p-1 bg-slate-50 rounded-xl">
            {['all', 'pending', 'fulfilled', 'cancelled'].map((status) => (
              <button key={status} onClick={() => setStatusFilter(status)} className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all ${statusFilter === status ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Feed */}
        <div className="space-y-5">
          {loading ? (
            <div className="bg-white rounded-[32px] p-20 text-center border border-slate-200 shadow-sm">
              <RefreshCw className="w-10 h-10 mx-auto text-emerald-500 animate-spin mb-4" />
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Syncing Data...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-[32px] p-20 text-center border border-slate-200 shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-1">No Orders Found</h3>
              <p className="text-sm font-medium text-slate-400">Waiting for incoming requisitions.</p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredOrders.map((order) => {
                const orderDate = new Date(order.created_at).toLocaleString();
                const allItemsAvailable = order.items.every(item => isItemInStock(item.name));

                return (
                  <motion.div key={order.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[32px] p-6 lg:p-8 border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-8 group">
                    
                    {/* Order Details */}
                    <div className="space-y-4 flex-1 w-full">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl font-black text-slate-400 group-hover:text-emerald-500 transition-colors">
                          {order.client_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-slate-900">{order.client_name || 'Anonymous Client'}</h3>
                          <div className="flex items-center gap-3 text-xs text-slate-400 font-bold mt-1">
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {orderDate}</span>
                            <span>&bull;</span>
                            <span className="uppercase font-mono text-[10px]">ID: {order.id.slice(0, 8)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Manifest */}
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Manifest Breakdown</p>
                        <div className="space-y-2">
                          {order.items.map((item, idx) => {
                            const inStock = isItemInStock(item.name);
                            return (
                              <div key={idx} className="flex items-center justify-between text-sm font-bold text-slate-700">
                                <div className="flex items-center gap-2.5">
                                  <span className={`w-2 h-2 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)] animate-pulse'}`} />
                                  <span>{item.name}</span>
                                  <span className="text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-xs">x{item.quantity}</span>
                                </div>
                                <span className="text-emerald-600 font-black">{(item.price * item.quantity).toFixed(2)} MAD</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {order.notes && (
                        <div className="bg-amber-50 text-amber-700 p-3 rounded-xl text-xs font-medium border border-amber-100/50">
                          <strong className="font-black uppercase tracking-wider mr-2">Client Note:</strong> {order.notes}
                        </div>
                      )}
                    </div>

                    {/* Actions & Status */}
                    <div className="flex flex-col items-end justify-between gap-6 w-full md:w-64 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
                      <div className="text-right w-full">
                        <div className="flex items-center justify-end gap-2 mb-2">
                          {!allItemsAvailable && order.status === 'pending' && (
                            <span className="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Out of Stock</span>
                          )}
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${order.status === 'fulfilled' ? 'bg-emerald-100 text-emerald-700' : order.status === 'cancelled' ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-700'}`}>
                            {order.status}
                          </span>
                        </div>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Total Value</span>
                        <span className="text-3xl font-black text-slate-900 tracking-tight">{order.total_amount.toFixed(2)} <span className="text-sm text-slate-400 tracking-normal">MAD</span></span>
                      </div>

                      <div className="flex items-center gap-2 w-full">
                        {order.status === 'pending' ? (
                          <>
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => updateOrderStatus(order.id, 'fulfilled')} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(16,185,129,0.25)] transition-all">
                              <CheckCircle2 className="w-4 h-4" /> Fulfill Order
                            </motion.button>
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => updateOrderStatus(order.id, 'cancelled')} className="p-3 bg-slate-50 border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-400 hover:text-rose-600 rounded-xl transition-colors" title="Cancel">
                              <XCircle className="w-4 h-4" />
                            </motion.button>
                          </>
                        ) : (
                          <button onClick={() => updateOrderStatus(order.id, 'pending')} className="w-full py-2 text-xs font-bold text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
                            Revert Status
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