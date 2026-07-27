'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { 
  Search, ShoppingCart, Plus, Minus, Home, 
  Heart, ArrowLeft, Zap, X, Send, Globe, LayoutGrid, MessageCircle, Database, CheckCircle2, Sun, Moon, Sparkles, Clock, Key, LogOut, User
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  unit?: string;
  image?: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface ClientSession {
  id: string;
  client_name: string;
  access_key: string;
  phone_number?: string;
}

interface OrderRecord {
  id: string;
  created_at?: string;
  date?: string;
  items: CartItem[];
  total_amount?: number;
  total?: number;
  client_name?: string;
  status: string;
}

const WAREHOUSE_PHONE = '212762487466';

const dict = {
  ar: {
    appName: 'ويرهاوس إكسبريس',
    discover: 'الكتالوج الذكي',
    tagline: 'طلب توريد سريع للشركات',
    searchPlaceholder: 'ابحث في الكتالوج...',
    categoriesTitle: 'الأقسام',
    seeAll: 'عرض الكل',
    allCategories: 'الكل',
    noProducts: 'لا توجد منتجات مطابقة',
    orderManifest: 'بيان الطلبيات',
    clientName: 'اسم العميل / الشركة',
    specialNotes: 'ملاحظات خاصة بالتوصيل',
    notesPlaceholder: 'الموقع، وقت التسليم...',
    estimatedTotal: 'الإجمالي التقديري',
    dispatchDatabase: 'تأكيد وإرسال الطلب',
    dispatchWhatsApp: 'طلب عبر واتساب',
    currency: 'د.م.',
    emptyCart: 'قائمة الطلبات فارغة حالياً',
    expressNotice: 'خدمة التوصيل السريع',
    bannerBadge: 'توصيل سريع',
    productDetails: 'تفاصيل المنتج',
    addToCart: 'إضافة إلى السلة',
    fastDelivery: 'توصيل سريع',
    orderHistory: 'سجل الطلبات الرسمية',
    noOrders: 'لا توجد طلبات سابقة لهذا الحساب',
    orderSuccess: 'تم إرسال الطلب بنجاح!',
    favoritesTitle: 'المنتجات المفضلة',
    statusPending: 'قيد المعالجة',
    loginTitle: 'تسجيل دخول العملاء',
    loginSub: 'أدخل مفتاح الدخول الخاص بشركتك للبدء',
    keyPlaceholder: 'رمز العميل',
    loginBtn: 'دخول إلى الكتالوج',
    invalidKey: 'مفتاح الدخول غير صحيح، يرجى التواصل مع الإدارة',
    welcomeBack: 'مرحباً بك،',
    logout: 'خروج',
  },
  en: {
    appName: 'Warehouse Express',
    discover: 'Smart Catalog',
    tagline: 'B2B Quick Order Terminal',
    searchPlaceholder: 'Search catalog...',
    categoriesTitle: 'Categories',
    seeAll: 'See all',
    allCategories: 'All',
    noProducts: 'No matching items found',
    orderManifest: 'Order Manifest',
    clientName: 'Client / Company Reference',
    specialNotes: 'Delivery Instructions',
    notesPlaceholder: 'Delivery slot, location...',
    estimatedTotal: 'Estimated Total',
    dispatchDatabase: 'Submit Official Order',
    dispatchWhatsApp: 'Order via WhatsApp',
    currency: 'MAD',
    emptyCart: 'Your manifest is empty',
    expressNotice: 'Express B2B Supply',
    bannerBadge: 'Fast Delivery',
    productDetails: 'Product Details',
    addToCart: 'Add to cart',
    fastDelivery: 'Fast Delivery',
    orderHistory: 'Official Order History',
    noOrders: 'No previous orders found for this account',
    orderSuccess: 'Order submitted successfully!',
    favoritesTitle: 'Favorite Products',
    statusPending: 'Pending',
    loginTitle: 'B2B Portal Access',
    loginSub: 'Enter your assigned company key to access the terminal',
    keyPlaceholder: 'e.g. KEY-1001',
    loginBtn: 'Access Terminal',
    invalidKey: 'Invalid access key. Contact support.',
    welcomeBack: 'Welcome,',
    logout: 'Logout',
  },
};

export default function CatalogPage() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [isDark, setIsDark] = useState<boolean>(true);
  const [products, setProducts] = useState<Product[]>([]);
  
  // SWITCHED TO sessionStorage: Clears automatically when tab/browser closes!
  const [client, setClient] = useState<ClientSession | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = sessionStorage.getItem('warehouse_client_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [inputKey, setInputKey] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [isVerifyingKey, setIsVerifyingKey] = useState<boolean>(false);

  // Persistent Cart & Favorites across sessions
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('warehouse_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('warehouse_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Supabase Order History
  const [orderHistory, setOrderHistory] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<'home' | 'favorites' | 'orders'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalQty, setModalQty] = useState<number>(1);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);

  const t = dict[lang];

  useEffect(() => {
    try {
      localStorage.setItem('warehouse_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('warehouse_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error('Failed to save favorites:', e);
    }
  }, [favorites]);

  useEffect(() => {
    if (client) {
      try {
        sessionStorage.setItem('warehouse_client_session', JSON.stringify(client));
      } catch (e) {
        console.error('Failed to save client session:', e);
      }
    } else {
      sessionStorage.removeItem('warehouse_client_session');
    }
  }, [client]);

  // Fetch Inventory Products
  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching inventory:', error);
      } else if (data) {
        setProducts(data);
      }
      setTimeout(() => setLoading(false), 500);
    }
    fetchProducts();
  }, []);

  // Fetch Supabase Orders for Current Client Key
  const fetchClientOrders = async () => {
    if (!client?.access_key) return;
    setLoadingOrders(true);

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('client_access_key', client.access_key)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrderHistory(data);
    }
    setLoadingOrders(false);
  };

  useEffect(() => {
    if (client) {
      fetchClientOrders();
    }
  }, [client, activeTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) return;
    
    setIsVerifyingKey(true);
    setLoginError('');

    const formattedKey = inputKey.trim().toUpperCase();

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('access_key', formattedKey)
      .single();

    if (error || !data) {
      setLoginError(t.invalidKey);
    } else {
      setClient(data);
      setInputKey('');
    }
    setIsVerifyingKey(false);
  };

  const handleLogout = () => {
    setClient(null);
    setOrderHistory([]);
  };

  const toggleLanguage = () => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  const filteredProducts = products.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'favorites') {
      return matchesCategory && matchesSearch && favorites.includes(item.id);
    }
    return matchesCategory && matchesSearch;
  });

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFavorites((prev) => prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]);
  };

  const addToCart = (product: Product, qty: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + qty } : item);
      }
      return [...prev, { ...product, quantity: qty }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as CartItem[]
    );
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo, closeAction: () => void) => {
    if (info.offset.y > 100 || info.velocity.y > 500) closeAction();
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleDatabaseSubmit = async () => {
    if (cart.length === 0 || !client) return;
    setIsSubmitting(true);

    const orderPayload = {
      client_name: client.client_name,
      client_access_key: client.access_key,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      total_amount: totalAmount,
      notes: notes || '',
      status: 'pending'
    };

    const { error } = await supabase.from('orders').insert([orderPayload]);

    if (!error) {
      setOrderSuccess(true);
      setCart([]);
      setNotes('');
      fetchClientOrders();
      setTimeout(() => {
        setOrderSuccess(false);
        setIsCartOpen(false);
      }, 3000);
    } else {
      console.error('Failed to save order:', error.message);
      alert('Error saving order: ' + error.message);
    }
    setIsSubmitting(false);
  };

  const handleWhatsAppSubmit = async () => {
    if (cart.length === 0 || !client) return;

    let msg = `*WAREHOUSE EXPRESS — REQUISITION ORDER*\n`;
    msg += `===================================\n`;
    msg += `📋 *Client:* ${client.client_name} (${client.access_key})\n`;
    msg += `📅 *Date:* ${new Date().toLocaleDateString()}\n`;
    msg += `===================================\n\n`;
    msg += `*ORDERED ITEMS:*\n`;

    cart.forEach((item, index) => {
      msg += `${index + 1}. *${item.name}*\n`;
      msg += `   Qty: ${item.quantity} × ${item.price.toFixed(2)} ${t.currency} = *${(item.price * item.quantity).toFixed(2)} ${t.currency}*\n`;
    });

    msg += `\n-----------------------------------\n`;
    msg += `💵 *TOTAL ESTIMATE:* ${totalAmount.toFixed(2)} ${t.currency}\n`;
    if (notes) msg += `📝 *Notes:* ${notes}\n`;
    msg += `===================================`;

    // Save copy in Supabase too
    await supabase.from('orders').insert([{
      client_name: client.client_name,
      client_access_key: client.access_key,
      items: cart.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity })),
      total_amount: totalAmount,
      notes: notes || '',
      status: 'pending'
    }]);

    setCart([]);
    setNotes('');
    setIsCartOpen(false);
    fetchClientOrders();

    const whatsappUrl = `https://wa.me/${WAREHOUSE_PHONE}?text=${encodeURIComponent(msg)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`min-h-screen p-6 ${isDark ? 'bg-[#0a0a0a] text-white' : 'bg-[#f8fafc] text-slate-900'}`}>
        <div className="h-10 w-40 bg-slate-800 rounded-lg animate-pulse mb-6" />
        <div className="h-14 w-full bg-slate-800 rounded-2xl animate-pulse mb-8" />
        <div className="h-40 w-full bg-emerald-900/40 rounded-[32px] animate-pulse mb-8" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-slate-800/60 rounded-3xl h-56 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`min-h-screen flex flex-col overflow-x-hidden font-sans pb-28 md:pb-12 transition-colors duration-300 ${isDark ? 'bg-[#0a0a0a] text-slate-100 selection:bg-emerald-500/30' : 'bg-[#f8fafc] text-slate-900 selection:bg-emerald-200'}`}>
      
      {/* ACCESS KEY LOGIN MODAL */}
      <AnimatePresence>
        {!client && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-5"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }} 
              className={`w-full max-w-md p-8 rounded-[32px] border shadow-2xl space-y-6 ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
            >
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-emerald-400 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-500/30">
                  <Key className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black">{t.loginTitle}</h2>
                <p className="text-xs text-slate-400 font-bold leading-relaxed">{t.loginSub}</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <input 
                    type="text" 
                    value={inputKey} 
                    onChange={(e) => setInputKey(e.target.value)} 
                    placeholder={t.keyPlaceholder} 
                    className={`w-full border rounded-2xl px-5 py-4 text-center font-black tracking-widest text-lg uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all ${isDark ? 'bg-slate-950 border-slate-800 text-emerald-400' : 'bg-slate-50 border-slate-200 text-emerald-600'}`} 
                  />
                  {loginError && <p className="text-xs text-rose-500 font-bold text-center mt-2">{loginError}</p>}
                </div>

                <motion.button 
                  whileTap={{ scale: 0.97 }} 
                  type="submit" 
                  disabled={isVerifyingKey}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl text-sm uppercase shadow-[0_8px_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2"
                >
                  {isVerifyingKey ? <span className="animate-spin text-lg">⏳</span> : <Key className="w-4 h-4" />} {t.loginBtn}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER NAVBAR */}
      <header className={`sticky top-0 z-30 px-5 lg:px-8 py-4 border-b transition-all duration-300 backdrop-blur-2xl ${isDark ? 'bg-[#0a0a0a]/80 border-slate-800/80 shadow-[0_4px_30px_rgba(0,0,0,0.5)]' : 'bg-white/80 border-slate-200/80 shadow-sm'}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo Badge & Branding */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-400 text-white flex items-center justify-center font-black text-sm shadow-[0_0_20px_rgba(16,185,129,0.4)] group-hover:scale-105 transition-transform">
              WE
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl lg:text-2xl font-black tracking-tight">{t.appName}</h1>
                <Sparkles className="w-4 h-4 text-emerald-400 fill-emerald-400/20 animate-pulse" />
              </div>
              {client ? (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <User className="w-3 h-3" /> {client.client_name} ({client.access_key})
                  </span>
                  <button onClick={handleLogout} className="text-[10px] text-rose-400 hover:underline flex items-center gap-0.5 font-bold">
                    <LogOut className="w-2.5 h-2.5" /> {t.logout}
                  </button>
                </div>
              ) : (
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{t.tagline}</p>
              )}
            </div>
          </div>

          {/* Action Control Pills */}
          <div className="flex items-center gap-2.5">
            <motion.button 
              whileTap={{ scale: 0.92 }} 
              onClick={() => setIsDark(!isDark)} 
              className={`flex items-center justify-center w-10 h-10 rounded-2xl border transition-all shadow-sm ${isDark ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.button>

            {/* Order History Desktop Header Button */}
            <motion.button 
              whileTap={{ scale: 0.92 }} 
              onClick={() => setActiveTab(activeTab === 'orders' ? 'home' : 'orders')} 
              className={`relative flex items-center justify-center w-10 h-10 border rounded-2xl transition-all shadow-sm ${activeTab === 'orders' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
              aria-label="Order History"
            >
              <LayoutGrid className="w-4 h-4" />
              {orderHistory.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-[#0a0a0a]">
                  {orderHistory.length}
                </span>
              )}
            </motion.button>

            {/* Favorites Header Button */}
            <motion.button 
              whileTap={{ scale: 0.92 }} 
              onClick={() => setActiveTab(activeTab === 'favorites' ? 'home' : 'favorites')} 
              className={`relative flex items-center justify-center w-10 h-10 border rounded-2xl transition-all shadow-sm ${activeTab === 'favorites' ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : isDark ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
              aria-label="Favorites"
            >
              <Heart className={`w-4 h-4 ${favorites.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-[#0a0a0a]">
                  {favorites.length}
                </span>
              )}
            </motion.button>

            {/* Language Switch Button */}
            <motion.button 
              whileTap={{ scale: 0.92 }} 
              onClick={toggleLanguage} 
              className={`flex items-center justify-center px-3.5 h-10 border rounded-2xl text-xs font-bold transition-all shadow-sm gap-1.5 ${isDark ? 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
            >
              <Globe className="w-4 h-4 text-emerald-500" />
              <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
            </motion.button>

            {/* Shopping Cart Button */}
            <motion.button 
              whileTap={{ scale: 0.92 }} 
              onClick={() => setIsCartOpen(true)} 
              className="relative flex items-center justify-center w-10 h-10 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              <ShoppingCart className="w-4 h-4" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-emerald-500">{totalItemsCount}</span>
              )}
            </motion.button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-5 pt-6">
        {/* Search */}
        <div className="mb-8 relative group">
          <Search className={`w-5 h-5 absolute top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors ${lang === 'ar' ? 'right-4' : 'left-4'}`} />
          <input 
            type="text" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder={t.searchPlaceholder} 
            className={`w-full border rounded-2xl ${lang === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3.5 text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${isDark ? 'bg-slate-900/80 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'}`} 
          />
        </div>

        {/* Banner */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-[32px] p-8 mb-10 shadow-[0_10px_30px_rgba(16,185,129,0.25)] flex items-center justify-between relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-emerald-400 rounded-full opacity-40 blur-2xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-emerald-700 rounded-full opacity-40 blur-2xl pointer-events-none" />
          <div className="relative z-10 w-2/3">
            <h2 className="text-2xl lg:text-3xl font-black leading-tight mb-3">{t.expressNotice}</h2>
            <span className="inline-flex items-center gap-1.5 bg-white text-emerald-600 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
              <Zap className="w-3.5 h-3.5 fill-emerald-600" /> {t.bannerBadge}
            </span>
          </div>
          <div className={`absolute ${lang === 'ar' ? 'left-2' : 'right-2'} bottom-0 text-8xl opacity-90 drop-shadow-2xl translate-y-4`}>📦</div>
        </motion.div>

        {/* Categories */}
        {activeTab !== 'orders' && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black">{activeTab === 'favorites' ? t.favoritesTitle : t.categoriesTitle}</h3>
              <button onClick={() => { setSelectedCategory('All'); setActiveTab('home'); }} className="text-emerald-500 text-sm font-bold hover:text-emerald-400 transition-colors">{t.seeAll}</button>
            </div>
            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => (
                <motion.button 
                  key={cat} 
                  whileTap={{ scale: 0.95 }} 
                  onClick={() => setSelectedCategory(cat)} 
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${selectedCategory === cat ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20' : isDark ? 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'}`}
                >
                  {cat === 'All' ? t.allCategories : cat}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Main Feed vs Order Panel Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8">
            {activeTab === 'orders' ? (
              <div className="space-y-4">
                <h3 className="text-xl font-black mb-4">{t.orderHistory}</h3>
                {loadingOrders ? (
                  <div className="text-center py-10 font-bold text-slate-400 animate-pulse">⏳ Loading official order history from Supabase...</div>
                ) : orderHistory.length === 0 ? (
                  <div className={`rounded-[32px] p-16 text-center border shadow-sm flex flex-col items-center justify-center min-h-[350px] ${isDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-200'}`}>
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-400'}`}>
                      <LayoutGrid className="w-10 h-10" />
                    </div>
                    <p className="text-sm font-medium text-slate-400">{t.noOrders}</p>
                  </div>
                ) : (
                  orderHistory.map((ord) => (
                    <div key={ord.id} className={`p-6 rounded-[28px] border space-y-4 transition-all ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <div className="flex items-center justify-between border-b pb-3 border-slate-800/40">
                        <div>
                          <span className="font-black text-sm text-emerald-400">ORDER #{ord.id.substring(0, 8).toUpperCase()}</span>
                          <p className="text-[11px] text-slate-400 font-bold mt-0.5">
                            {ord.created_at ? new Date(ord.created_at).toLocaleDateString() : ord.date} &bull; {ord.client_name || client?.client_name}
                          </p>
                        </div>
                        <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-3 py-1.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {ord.status || t.statusPending}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs font-bold">
                            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{item.name} <span className="text-slate-500">× {item.quantity}</span></span>
                            <span dir="ltr">{(item.price * item.quantity).toFixed(2)} {t.currency}</span>
                          </div>
                        ))}
                      </div>

                      <div className={`pt-3 border-t flex justify-between items-center ${isDark ? 'border-slate-800/40' : 'border-slate-100'}`}>
                        <span className="text-xs font-black text-slate-400">{t.estimatedTotal}</span>
                        <span className="text-lg font-black text-emerald-400" dir="ltr">{(ord.total_amount || ord.total || 0).toFixed(2)} {t.currency}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className={`rounded-[32px] p-16 text-center border ${isDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-200'}`}>
                <Search className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-400">{t.noProducts}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => {
                  const inCart = cart.find((i) => i.id === product.id);
                  const isFav = favorites.includes(product.id);
                  const [wholePrice, decimalPrice] = product.price.toFixed(2).split('.');

                  return (
                    <motion.div 
                      key={product.id} 
                      layout 
                      initial={{ opacity: 0, scale: 0.95 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      whileHover={{ y: -5 }} 
                      onClick={() => { setSelectedProduct(product); setModalQty(inCart ? inCart.quantity : 1); }} 
                      className={`rounded-[28px] p-4 border transition-all duration-300 flex flex-col justify-between text-center relative cursor-pointer group ${isDark ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90 shadow-lg' : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-sm'}`}
                    >
                      <button onClick={(e) => toggleFavorite(product.id, e)} className={`absolute top-4 ${lang === 'ar' ? 'left-4' : 'right-4'} z-10 p-2 rounded-full border transition-all shadow-sm ${isDark ? 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-rose-500 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-400 hover:text-rose-500'}`}>
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                      
                      <div className={`h-28 sm:h-32 w-full flex items-center justify-center p-2 mb-3 relative rounded-2xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-500 ease-out" />
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-2xl font-bold relative z-10">📦</div>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col items-center justify-between">
                        <div>
                          <h3 className={`text-xs sm:text-sm font-black line-clamp-2 leading-snug group-hover:text-emerald-500 transition-colors ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{product.name}</h3>
                          <p className="text-[11px] font-bold text-slate-400 mt-1">{product.unit || 'Standard Unit'}</p>
                        </div>
                        
                        <div className="my-3.5 flex items-baseline justify-center font-black" dir="ltr">
                          <span className="text-xl sm:text-2xl tracking-tighter">{wholePrice}</span>
                          <span className="text-xs tracking-tight">.{decimalPrice}</span>
                          <span className={`text-[10px] font-bold mx-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t.currency}</span>
                        </div>
                      </div>

                      <div onClick={(e) => e.stopPropagation()} className="w-full mt-auto">
                        {inCart ? (
                          <div className="w-full py-2.5 rounded-2xl bg-emerald-500 text-white flex items-center justify-between px-3 font-bold shadow-md shadow-emerald-500/20 transition-all">
                            <button onClick={() => updateQuantity(product.id, -1)} className="p-1 hover:bg-white/20 rounded-lg transition-colors"><Minus className="w-4 h-4" /></button>
                            <span className="text-sm font-black">{inCart.quantity}</span>
                            <button onClick={() => updateQuantity(product.id, 1)} className="p-1 hover:bg-white/20 rounded-lg transition-colors"><Plus className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <motion.button whileTap={{ scale: 0.95 }} onClick={() => addToCart(product, 1)} className={`w-full py-3 rounded-2xl border font-black transition-all flex items-center justify-center gap-1 ${isDark ? 'bg-slate-800 border-slate-700 hover:bg-emerald-500 text-slate-200 hover:text-white' : 'bg-slate-100 border-slate-200 hover:bg-slate-900 text-slate-700 hover:text-white'}`}>
                            <Plus className="w-5 h-5 stroke-[2.5]" />
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Desktop Order Panel Sidebar */}
          <div className="hidden lg:block lg:col-span-4 sticky top-24">
            <div className={`rounded-[32px] p-6 border shadow-xl space-y-5 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className={`flex items-center justify-between pb-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-wider">{t.orderManifest}</h3>
                </div>
                <span className="bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg text-[10px] font-black">{cart.length} SKU</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">{t.clientName}</label>
                  <input type="text" value={client?.client_name || ''} disabled readOnly className={`w-full border rounded-2xl px-4 py-3 text-xs font-black cursor-not-allowed ${isDark ? 'bg-slate-950/60 border-slate-800 text-emerald-400' : 'bg-slate-100 border-slate-200 text-emerald-600'}`} />
                </div>

                <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/40 pr-2">
                  {cart.length === 0 ? (
                    <div className="py-10 text-center text-slate-500">
                      <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-xs font-bold">{t.emptyCart}</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                        <div className="min-w-0 pr-3">
                          <p className="font-bold truncate">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5" dir="ltr">{(item.price * item.quantity).toFixed(2)} {t.currency}</p>
                        </div>
                        <div className={`flex items-center gap-1.5 rounded-xl px-2 py-1 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                          <button onClick={() => updateQuantity(item.id, -1)} className="font-bold p-1 text-slate-400 hover:text-white"><Minus className="w-3 h-3"/></button>
                          <span className="font-black w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="font-bold p-1 text-slate-400 hover:text-white"><Plus className="w-3 h-3"/></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">{t.specialNotes}</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t.notesPlaceholder} rows={2} className={`w-full border rounded-2xl px-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} />
                </div>
              </div>

              <div className={`pt-4 border-t space-y-4 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-400 text-xs uppercase">{t.estimatedTotal}</span>
                  <span className="text-2xl font-black tracking-tight" dir="ltr">{totalAmount.toFixed(2)} <span className="text-xs text-slate-400 mx-1 tracking-normal">{t.currency}</span></span>
                </div>

                {orderSuccess ? (
                  <div className="w-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" /> {t.orderSuccess}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleDatabaseSubmit}
                      disabled={cart.length === 0 || isSubmitting}
                      className={`w-full flex items-center justify-center gap-2 rounded-2xl font-black py-4 text-xs uppercase transition-all shadow-md ${isDark ? 'bg-slate-100 text-slate-950 hover:bg-white' : 'bg-slate-900 text-white hover:bg-slate-800'} ${cart.length === 0 ? 'pointer-events-none opacity-40 shadow-none' : ''}`}
                    >
                      {isSubmitting ? <span className="animate-spin text-lg">⏳</span> : <Database className="w-4 h-4" />} {t.dispatchDatabase}
                    </motion.button>
                    
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleWhatsAppSubmit}
                      disabled={cart.length === 0}
                      className={`w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 text-xs uppercase transition-all shadow-[0_8px_20px_rgba(16,185,129,0.3)] ${cart.length === 0 ? 'pointer-events-none opacity-40 shadow-none' : ''}`}
                    >
                      <Send className="w-4 h-4" /> {t.dispatchWhatsApp}
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <a href={`https://wa.me/${WAREHOUSE_PHONE}?text=${encodeURIComponent(lang === 'ar' ? 'مرحباً ويرهاوس، أحتاج إلى مساعدة بخصوص منتجاتكم.' : 'Hello Warehouse, I need some assistance with your catalog.')}`} target="_blank" rel="noopener noreferrer" className="fixed bottom-24 right-5 md:bottom-6 md:right-6 z-40 bg-emerald-500 text-white p-4 rounded-full shadow-[0_8px_30px_rgba(16,185,129,0.4)] hover:bg-emerald-600 hover:scale-105 transition-all flex items-center justify-center">
        <MessageCircle className="w-6 h-6" />
      </a>

      {/* Mobile Bottom Navigation Bar */}
      <div className={`md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-30 rounded-full px-2 py-2 shadow-2xl border flex items-center gap-1 backdrop-blur-xl ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
        
        <div className="relative">
          {activeTab === 'home' && (
            <motion.div layoutId="navPill" className={`absolute inset-0 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} transition={{ type: "spring", stiffness: 300, damping: 25 }} />
          )}
          <button onClick={() => setActiveTab('home')} className={`relative p-3.5 rounded-full transition-colors ${activeTab === 'home' ? 'text-emerald-500' : 'text-slate-400'}`}>
            <Home className="w-5 h-5" />
          </button>
        </div>

        <div className="relative">
          {activeTab === 'favorites' && (
            <motion.div layoutId="navPill" className={`absolute inset-0 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} transition={{ type: "spring", stiffness: 300, damping: 25 }} />
          )}
          <button onClick={() => setActiveTab('favorites')} className={`relative p-3.5 rounded-full transition-colors ${activeTab === 'favorites' ? 'text-emerald-500' : 'text-slate-400'}`}>
            <Heart className="w-5 h-5" />
          </button>
        </div>

        <div className="relative">
          {activeTab === 'orders' && (
            <motion.div layoutId="navPill" className={`absolute inset-0 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} transition={{ type: "spring", stiffness: 300, damping: 25 }} />
          )}
          <button onClick={() => setActiveTab('orders')} className={`relative p-3.5 rounded-full transition-colors ${activeTab === 'orders' ? 'text-emerald-500' : 'text-slate-400'}`}>
            <LayoutGrid className="w-5 h-5" />
          </button>
        </div>

        <div className={`w-px h-6 mx-1 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsCartOpen(true)} className="p-3.5 rounded-full text-emerald-500 relative transition-colors">
          <ShoppingCart className="w-5 h-5" />
          {totalItemsCount > 0 && (
            <span className="absolute top-2 right-2 bg-slate-900 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-emerald-500">
              {totalItemsCount}
            </span>
          )}
        </motion.button>
      </div>

      {/* Cart Mobile Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 250 }} drag="y" dragConstraints={{ top: 0 }} dragElastic={0.2} onDragEnd={(e, info) => handleDragEnd(e, info, () => setIsCartOpen(false))} className={`relative w-full max-w-lg rounded-t-[32px] lg:rounded-3xl p-6 shadow-2xl z-10 space-y-5 max-h-[90vh] overflow-y-auto flex flex-col ${isDark ? 'bg-slate-900 text-white border-t border-slate-800' : 'bg-white text-slate-900'}`}>
              <div className={`absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full z-50 lg:hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
              
              <div className={`flex items-center justify-between pt-4 pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <h3 className="text-sm font-black uppercase tracking-widest">{t.orderManifest}</h3>
                <button onClick={() => setIsCartOpen(false)} className={`p-2 rounded-full lg:hidden ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}><X className="w-4 h-4" /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">{t.clientName}</label>
                  <input type="text" value={client?.client_name || ''} disabled readOnly className={`w-full border rounded-2xl px-4 py-3 text-xs font-black cursor-not-allowed ${isDark ? 'bg-slate-950/60 border-slate-800 text-emerald-400' : 'bg-slate-100 border-slate-200 text-emerald-600'}`} />
                </div>

                <div className="divide-y divide-slate-800/40 max-h-56 overflow-y-auto pr-1">
                  {cart.length === 0 ? (
                    <div className="py-10 text-center text-slate-500">
                      <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      <p className="text-xs font-bold">{t.emptyCart}</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="py-3.5 flex items-center justify-between text-xs">
                        <div className="min-w-0 pr-3">
                          <p className="font-bold text-sm truncate">{item.name}</p>
                          <p className="text-[11px] text-slate-400 font-bold mt-1" dir="ltr">{(item.price * item.quantity).toFixed(2)} {t.currency}</p>
                        </div>
                        <div className={`flex items-center gap-2 rounded-xl px-2 py-1.5 border shrink-0 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                          <button onClick={() => updateQuantity(item.id, -1)} className="font-black p-1 text-slate-400 hover:text-white"><Minus className="w-3 h-3"/></button>
                          <span className="font-black w-5 text-center text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="font-black p-1 text-slate-400 hover:text-white"><Plus className="w-3 h-3"/></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">{t.specialNotes}</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t.notesPlaceholder} rows={2} className={`w-full border rounded-2xl px-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} />
                </div>
              </div>

              <div className={`pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs font-black text-slate-400 uppercase">{t.estimatedTotal}</span>
                  <span className="text-2xl font-black tracking-tight" dir="ltr">{totalAmount.toFixed(2)} <span className="text-sm text-slate-400 mx-1 tracking-normal">{t.currency}</span></span>
                </div>

                {orderSuccess ? (
                  <div className="w-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" /> {t.orderSuccess}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleDatabaseSubmit}
                      disabled={cart.length === 0 || isSubmitting}
                      className={`w-full flex items-center justify-center gap-2 rounded-2xl font-black py-4 text-sm uppercase shadow-md transition-all ${isDark ? 'bg-slate-100 text-slate-950 hover:bg-white' : 'bg-slate-900 text-white hover:bg-slate-800'} ${cart.length === 0 ? 'pointer-events-none opacity-40 shadow-none' : ''}`}
                    >
                      {isSubmitting ? <span className="animate-spin text-lg">⏳</span> : <Database className="w-4 h-4" />} {t.dispatchDatabase}
                    </motion.button>
                    
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleWhatsAppSubmit}
                      disabled={cart.length === 0}
                      className={`w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl text-sm uppercase shadow-[0_8px_20px_rgba(16,185,129,0.3)] transition-all ${cart.length === 0 ? 'pointer-events-none opacity-40 shadow-none' : ''}`}
                    >
                      <Send className="w-4 h-4" /> {t.dispatchWhatsApp}
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Swipe Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProduct(null)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />

            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 250 }} drag="y" dragConstraints={{ top: 0 }} dragElastic={0.2} onDragEnd={(e, info) => handleDragEnd(e, info, () => setSelectedProduct(null))} className={`relative w-full max-w-lg rounded-t-[32px] overflow-hidden shadow-2xl z-10 flex flex-col ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
              <div className={`absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full z-50 ${isDark ? 'bg-slate-800' : 'bg-slate-300'}`} />

              <div className="pt-8 px-4 pb-4 flex items-center justify-between">
                <button onClick={() => setSelectedProduct(null)} className={`p-2.5 rounded-full border transition-colors ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}>
                  <ArrowLeft className={`w-5 h-5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                </button>
                <span className="text-xs font-black tracking-widest text-slate-400 uppercase">{t.productDetails}</span>
                <div className="w-10" />
              </div>

              <div className="p-6 space-y-5">
                <div className={`w-full h-56 rounded-[28px] flex items-center justify-center overflow-hidden p-6 relative border ${isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200/80'}`}>
                  {selectedProduct.image ? (
                    <img src={selectedProduct.image} alt={selectedProduct.name} className="max-h-full max-w-full object-contain relative z-10" />
                  ) : (
                    <span className="text-6xl relative z-10">📦</span>
                  )}
                </div>

                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-black leading-tight">{selectedProduct.name}</h2>
                      <p className="text-xs font-bold text-slate-400 mt-1">{selectedProduct.unit || 'Standard Unit'}</p>
                    </div>
                    <button onClick={() => toggleFavorite(selectedProduct.id)} className={`p-2.5 border rounded-full text-slate-400 hover:text-rose-500 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                      <Heart className={`w-5 h-5 ${favorites.includes(selectedProduct.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mt-4" dir="ltr">
                    <span className="text-3xl font-black tracking-tight">{selectedProduct.price.toFixed(2)}</span>
                    <span className="text-sm font-bold text-slate-400">{t.currency}</span>
                    <span className={`bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-emerald-500/20 ${lang === 'ar' ? 'mr-auto' : 'ml-auto'}`}>
                      <Zap className="w-3.5 h-3.5 fill-emerald-500" /> {t.fastDelivery}
                    </span>
                  </div>

                  <p className="text-sm text-slate-400 mt-4 leading-relaxed font-medium">
                    {selectedProduct.description || 'High quality inventory item perfectly suited for standard logistical requirements.'}
                  </p>
                </div>

                <div className="pt-4 flex items-center gap-4">
                  <div className={`flex items-center rounded-2xl px-2 py-1.5 border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                    <button onClick={() => setModalQty((q) => Math.max(1, q - 1))} className="p-3 text-slate-400 hover:text-white transition-colors"><Minus className="w-4 h-4" /></button>
                    <span className="w-8 text-center text-sm font-black">{modalQty}</span>
                    <button onClick={() => setModalQty((q) => q + 1)} className="p-3 text-slate-400 hover:text-white transition-colors"><Plus className="w-4 h-4" /></button>
                  </div>

                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => { addToCart(selectedProduct, modalQty); setSelectedProduct(null); }} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(16,185,129,0.3)] transition-all">
                    <ShoppingCart className="w-5 h-5" /> {t.addToCart}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}