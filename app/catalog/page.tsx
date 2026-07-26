'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { 
  Search, ShoppingCart, Plus, Minus, Home, 
  Heart, ArrowLeft, Zap, X, Send, Globe, LayoutGrid, MessageCircle, Database, CheckCircle2
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

const WAREHOUSE_PHONE = '212762487466';

// Multi-language dictionary updated for the new UI
const dict = {
  ar: {
    appName: 'ويرهاوس إكسبريس',
    discover: 'الكتالوج',
    tagline: 'طلب توريد سريع للشركات',
    searchPlaceholder: 'ابحث في الكتالوج...',
    categoriesTitle: 'الأقسام',
    seeAll: 'عرض الكل',
    allCategories: 'الكل',
    featuredItems: 'المنتجات الممتازة',
    itemsCount: 'منتج',
    noProducts: 'لا توجد منتجات مطابقة',
    orderManifest: 'بيان الطلبيات',
    clientName: 'اسم العميل / الشركة',
    clientPlaceholder: 'أدخل اسم الشركة...',
    specialNotes: 'ملاحظات خاصة بالتوصيل',
    notesPlaceholder: 'الموقع، وقت التسليم...',
    estimatedTotal: 'الإجمالي التقديري',
    dispatchDatabase: 'تأكيد وإرسال الطلب',
    dispatchWhatsApp: 'طلب عبر واتساب',
    currency: 'د.م.',
    emptyCart: 'قائمة الطلبات فارغة حالياً',
    expressNotice: 'خدمة التوصيل السريع',
    expressSub: 'إرسال مباشر عبر واتساب',
    bannerBadge: 'توصيل سريع',
    productDetails: 'تفاصيل المنتج',
    addToCart: 'إضافة إلى السلة',
    fastDelivery: 'توصيل سريع',
    orderHistory: 'سجل الطلبات',
    noOrders: 'لا توجد طلبات سابقة',
    orderSuccess: 'تم إرسال الطلب بنجاح!',
  },
  en: {
    appName: 'Warehouse Express',
    discover: 'Catalog',
    tagline: 'B2B Quick Order Terminal',
    searchPlaceholder: 'Search catalog...',
    categoriesTitle: 'Categories',
    seeAll: 'See all',
    allCategories: 'All',
    featuredItems: 'Featured Items',
    itemsCount: 'items',
    noProducts: 'No matching items found',
    orderManifest: 'Order Manifest',
    clientName: 'Client / Company Reference',
    clientPlaceholder: 'Enter business name...',
    specialNotes: 'Delivery Instructions',
    notesPlaceholder: 'Delivery slot, location...',
    estimatedTotal: 'Estimated Total',
    dispatchDatabase: 'Submit Official Order',
    dispatchWhatsApp: 'Order via WhatsApp',
    currency: 'MAD',
    emptyCart: 'Your manifest is empty',
    expressNotice: 'Express B2B Supply',
    expressSub: 'Direct dispatch via manifest',
    bannerBadge: 'Fast Delivery',
    productDetails: 'Product Details',
    addToCart: 'Add to cart',
    fastDelivery: 'Fast Delivery',
    orderHistory: 'Order History',
    noOrders: 'No previous orders found',
    orderSuccess: 'Order submitted successfully!',
  },
};

export default function CatalogPage() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'favorites' | 'orders'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalQty, setModalQty] = useState<number>(1);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [clientName, setClientName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  
  // Submission States
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);

  const t = dict[lang];

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

  // Function 1: Submit to Database ONLY
  const handleDatabaseSubmit = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    const orderPayload = {
      client_name: clientName || 'Anonymous Client',
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
      setClientName('');
      setNotes('');
      setTimeout(() => {
        setOrderSuccess(false);
        setIsCartOpen(false);
      }, 3000);
    } else {
      console.error('Failed to save order to database:', error.message);
      alert('Error saving order: ' + error.message);
    }
    setIsSubmitting(false);
  };

  // Function 2: Generate WhatsApp Link ONLY
  const handleWhatsAppSubmit = () => {
    if (cart.length === 0) return;

    let msg = `*WAREHOUSE EXPRESS — REQUISITION ORDER*\n`;
    msg += `===================================\n`;
    if (clientName) msg += `📋 *Account/Client:* ${clientName}\n`;
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

    const whatsappUrl = `https://wa.me/${WAREHOUSE_PHONE}?text=${encodeURIComponent(msg)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans p-6">
        <div className="h-10 w-40 bg-slate-200 rounded-lg animate-pulse mb-6" />
        <div className="h-14 w-full bg-slate-200 rounded-2xl animate-pulse mb-8" />
        <div className="h-40 w-full bg-emerald-100 rounded-[32px] animate-pulse mb-8" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-slate-200 rounded-3xl h-56 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col overflow-x-hidden selection:bg-emerald-200 selection:text-emerald-900 font-sans pb-28 md:pb-12">
      
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl sticky top-0 z-30 px-5 lg:px-8 pt-6 pb-4 border-b border-slate-200/60 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">{t.discover}</h1>
          </div>
          <div className="flex items-center gap-3">
            <motion.button whileTap={{ scale: 0.92 }} onClick={toggleLanguage} className="flex items-center justify-center w-10 h-10 bg-white border border-slate-200 text-slate-700 rounded-full transition-all hover:bg-slate-50 shadow-sm">
              <Globe className="w-5 h-5" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.92 }} onClick={() => setIsCartOpen(true)} className="relative flex items-center justify-center w-10 h-10 bg-slate-900 text-white rounded-full transition-all hover:bg-slate-800 shadow-sm">
              <ShoppingCart className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{totalItemsCount}</span>
              )}
            </motion.button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-5 pt-6">
        {/* Search */}
        <div className="mb-8 relative group">
          <Search className={`w-5 h-5 absolute top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors ${lang === 'ar' ? 'right-4' : 'left-4'}`} />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.searchPlaceholder} className={`w-full bg-white text-slate-900 border border-slate-200 rounded-2xl ${lang === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3.5 text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm transition-all`} />
        </div>

        {/* Banner */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-500 text-white rounded-[32px] p-8 mb-10 shadow-[0_10px_30px_rgba(16,185,129,0.3)] flex items-center justify-between relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-emerald-400 rounded-full opacity-50 blur-2xl" />
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-emerald-600 rounded-full opacity-50 blur-2xl" />
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
              <h3 className="text-lg font-black text-slate-900">{t.categoriesTitle}</h3>
              <button onClick={() => setSelectedCategory('All')} className="text-emerald-600 text-sm font-bold hover:text-emerald-700 transition-colors">{t.seeAll}</button>
            </div>
            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => (
                <motion.button key={cat} whileTap={{ scale: 0.95 }} onClick={() => setSelectedCategory(cat)} className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${selectedCategory === cat ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'}`}>
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
              <div className="bg-white rounded-[32px] p-16 text-center border border-slate-200 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center shadow-sm mb-4">
                  <LayoutGrid className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-2">{t.orderHistory}</h3>
                <p className="text-sm font-medium text-slate-500">{t.noOrders}</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-[32px] p-16 text-center border border-slate-200 shadow-sm">
                <Search className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-500">{t.noProducts}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => {
                  const inCart = cart.find((i) => i.id === product.id);
                  const isFav = favorites.includes(product.id);
                  const [wholePrice, decimalPrice] = product.price.toFixed(2).split('.');

                  return (
                    <motion.div key={product.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ y: -5 }} onClick={() => { setSelectedProduct(product); setModalQty(inCart ? inCart.quantity : 1); }} className="bg-white rounded-[28px] p-4 border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between text-center relative cursor-pointer group">
                      <button onClick={(e) => toggleFavorite(product.id, e)} className={`absolute top-4 ${lang === 'ar' ? 'left-4' : 'right-4'} z-10 p-2 rounded-full bg-white hover:bg-rose-50 border border-slate-200 text-slate-400 hover:text-rose-500 transition-all shadow-sm`}>
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                      <div className="h-28 sm:h-32 w-full flex items-center justify-center p-2 mb-3 relative bg-slate-50 rounded-2xl">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="max-h-full max-w-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-500 ease-out" />
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl font-bold relative z-10">📦</div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-between">
                        <div>
                          <h3 className="text-xs sm:text-sm font-black text-slate-800 line-clamp-2 leading-snug group-hover:text-emerald-600 transition-colors">{product.name}</h3>
                          <p className="text-[11px] font-bold text-slate-500 mt-1">{product.unit || 'Standard Unit'}</p>
                        </div>
                        <div className="my-3.5 flex items-baseline justify-center font-black text-slate-900">
                          <span className="text-xl sm:text-2xl tracking-tighter">{wholePrice}</span>
                          <span className="text-xs tracking-tight">.{decimalPrice}</span>
                          <span className="text-[10px] font-bold text-slate-500 ml-1">{t.currency}</span>
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
                          <motion.button whileTap={{ scale: 0.95 }} onClick={() => addToCart(product, 1)} className="w-full py-3 rounded-2xl bg-slate-100 border border-slate-200 hover:bg-slate-900 text-slate-700 hover:text-white font-black transition-all flex items-center justify-center gap-1">
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
            <div className="bg-white rounded-[32px] p-6 border border-slate-200/80 shadow-[0_10px_40px_rgb(0,0,0,0.04)] space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-50 rounded-xl">
                    <ShoppingCart className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">{t.orderManifest}</h3>
                </div>
                <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg text-[10px] font-black">{cart.length} SKU</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">{t.clientName}</label>
                  <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder={t.clientPlaceholder} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all" />
                </div>

                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 pr-2">
                  {cart.length === 0 ? (
                    <div className="py-10 text-center text-slate-400">
                      <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-xs font-bold">{t.emptyCart}</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                        <div className="min-w-0 pr-3">
                          <p className="font-bold text-slate-800 truncate">{item.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold mt-0.5">{(item.price * item.quantity).toFixed(2)} {t.currency}</p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl px-2 py-1 border border-slate-200">
                          <button onClick={() => updateQuantity(item.id, -1)} className="text-slate-600 font-bold p-1"><Minus className="w-3 h-3"/></button>
                          <span className="font-black text-slate-900 w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="text-slate-600 font-bold p-1"><Plus className="w-3 h-3"/></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">{t.specialNotes}</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t.notesPlaceholder} rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all" />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-400 text-xs uppercase">{t.estimatedTotal}</span>
                  <span className="text-2xl font-black text-slate-900 tracking-tight">{totalAmount.toFixed(2)} <span className="text-xs text-slate-500 ml-1 tracking-normal">{t.currency}</span></span>
                </div>

                {orderSuccess ? (
                  <div className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl p-4 flex items-center justify-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" /> {t.orderSuccess}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleDatabaseSubmit}
                      disabled={cart.length === 0 || isSubmitting}
                      className={`w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black py-4 text-xs uppercase transition-all shadow-md ${cart.length === 0 ? 'pointer-events-none opacity-40 shadow-none' : ''}`}
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

      {/* Modern Floating Bottom Navigation */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-white/90 backdrop-blur-xl rounded-full px-2 py-2 shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-slate-200 flex items-center gap-1">
        
        <div className="relative">
          {activeTab === 'home' && (
            <motion.div layoutId="navPill" className="absolute inset-0 bg-slate-100 rounded-full" transition={{ type: "spring", stiffness: 300, damping: 25 }} />
          )}
          <button onClick={() => setActiveTab('home')} className={`relative p-3.5 rounded-full transition-colors ${activeTab === 'home' ? 'text-emerald-600' : 'text-slate-400'}`}>
            <Home className="w-5 h-5" />
          </button>
        </div>

        <div className="relative">
          {activeTab === 'favorites' && (
            <motion.div layoutId="navPill" className="absolute inset-0 bg-slate-100 rounded-full" transition={{ type: "spring", stiffness: 300, damping: 25 }} />
          )}
          <button onClick={() => setActiveTab('favorites')} className={`relative p-3.5 rounded-full transition-colors ${activeTab === 'favorites' ? 'text-emerald-600' : 'text-slate-400'}`}>
            <Heart className="w-5 h-5" />
          </button>
        </div>

        <div className="relative">
          {activeTab === 'orders' && (
            <motion.div layoutId="navPill" className="absolute inset-0 bg-slate-100 rounded-full" transition={{ type: "spring", stiffness: 300, damping: 25 }} />
          )}
          <button onClick={() => setActiveTab('orders')} className={`relative p-3.5 rounded-full transition-colors ${activeTab === 'orders' ? 'text-emerald-600' : 'text-slate-400'}`}>
            <LayoutGrid className="w-5 h-5" />
          </button>
        </div>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setIsCartOpen(true)} className="p-3.5 rounded-full text-slate-600 relative transition-colors">
          <ShoppingCart className="w-5 h-5" />
          {totalItemsCount > 0 && (
            <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
              {totalItemsCount}
            </span>
          )}
        </motion.button>
      </div>

      {/* Swipe-to-Dismiss Mobile Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 250 }} drag="y" dragConstraints={{ top: 0 }} dragElastic={0.2} onDragEnd={(e, info) => handleDragEnd(e, info, () => setIsCartOpen(false))} className="relative w-full max-w-lg bg-white rounded-t-[32px] lg:rounded-3xl p-6 shadow-2xl z-10 space-y-5 max-h-[90vh] overflow-y-auto flex flex-col">
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-200 rounded-full z-50 lg:hidden" />
              <div className="flex items-center justify-between pt-4 pb-3 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{t.orderManifest}</h3>
                <button onClick={() => setIsCartOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 transition-colors lg:hidden"><X className="w-4 h-4" /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">{t.clientName}</label>
                  <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder={t.clientPlaceholder} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                </div>
                <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1">
                  {cart.length === 0 ? (
                    <div className="py-10 text-center text-slate-400">
                      <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      <p className="text-xs font-bold">{t.emptyCart}</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="py-3.5 flex items-center justify-between text-xs">
                        <div className="min-w-0 pr-3">
                          <p className="font-bold text-slate-800 text-sm truncate">{item.name}</p>
                          <p className="text-[11px] text-slate-500 font-bold mt-1">{(item.price * item.quantity).toFixed(2)} {t.currency}</p>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-2 py-1.5 border border-slate-200 shrink-0">
                          <button onClick={() => updateQuantity(item.id, -1)} className="font-black text-slate-600 p-1"><Minus className="w-3 h-3"/></button>
                          <span className="font-black text-slate-900 w-5 text-center text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="font-black text-slate-600 p-1"><Plus className="w-3 h-3"/></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">{t.specialNotes}</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t.notesPlaceholder} rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs font-black text-slate-400 uppercase">{t.estimatedTotal}</span>
                  <span className="text-2xl font-black text-slate-900 tracking-tight">{totalAmount.toFixed(2)} <span className="text-sm text-slate-500 ml-1 tracking-normal">{t.currency}</span></span>
                </div>

                {orderSuccess ? (
                  <div className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl p-4 flex items-center justify-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" /> {t.orderSuccess}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleDatabaseSubmit}
                      disabled={cart.length === 0 || isSubmitting}
                      className={`w-full flex items-center justify-center gap-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black py-4 text-sm uppercase shadow-md transition-all ${cart.length === 0 ? 'pointer-events-none opacity-40 shadow-none' : ''}`}
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

      {/* Swipe-to-Dismiss Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProduct(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 250 }} drag="y" dragConstraints={{ top: 0 }} dragElastic={0.2} onDragEnd={(e, info) => handleDragEnd(e, info, () => setSelectedProduct(null))} className="relative w-full max-w-lg bg-white rounded-t-[32px] overflow-hidden shadow-2xl z-10 flex flex-col">
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-300 rounded-full z-50" />

              <div className="pt-8 px-4 pb-4 flex items-center justify-between">
                <button onClick={() => setSelectedProduct(null)} className="bg-slate-100 p-2.5 rounded-full hover:bg-slate-200 border border-slate-200 transition-colors">
                  <ArrowLeft className={`w-5 h-5 text-slate-700 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                </button>
                <span className="text-xs font-black tracking-widest text-slate-400 uppercase">{t.productDetails}</span>
                <div className="w-10" />
              </div>

              <div className="p-6 space-y-5">
                <div className="w-full h-56 bg-slate-50 rounded-[28px] flex items-center justify-center overflow-hidden p-6 relative border border-slate-200/80">
                  {selectedProduct.image ? (
                    <img src={selectedProduct.image} alt={selectedProduct.name} className="max-h-full max-w-full object-contain relative z-10" />
                  ) : (
                    <span className="text-6xl relative z-10">📦</span>
                  )}
                </div>

                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 leading-tight">{selectedProduct.name}</h2>
                      <p className="text-xs font-bold text-slate-500 mt-1">{selectedProduct.unit || 'Standard Unit'}</p>
                    </div>
                    <button onClick={() => toggleFavorite(selectedProduct.id)} className="p-2.5 bg-slate-100 border border-slate-200 rounded-full text-slate-400 hover:text-rose-500">
                      <Heart className={`w-5 h-5 ${favorites.includes(selectedProduct.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">{selectedProduct.price.toFixed(2)}</span>
                    <span className="text-sm font-bold text-slate-500">{t.currency}</span>
                    <span className={`bg-emerald-50 text-emerald-700 text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-emerald-200 ${lang === 'ar' ? 'mr-auto' : 'ml-auto'}`}>
                      <Zap className="w-3.5 h-3.5 fill-emerald-600" /> {t.fastDelivery}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 mt-4 leading-relaxed font-medium">
                    {selectedProduct.description || 'High quality inventory item perfectly suited for standard logistical requirements.'}
                  </p>
                </div>

                <div className="pt-4 flex items-center gap-4">
                  <div className="flex items-center bg-slate-100 rounded-2xl px-2 py-1.5 border border-slate-200">
                    <button onClick={() => setModalQty((q) => Math.max(1, q - 1))} className="p-3 text-slate-600 hover:text-slate-900 transition-colors"><Minus className="w-4 h-4" /></button>
                    <span className="w-8 text-center text-sm font-black text-slate-900">{modalQty}</span>
                    <button onClick={() => setModalQty((q) => q + 1)} className="p-3 text-slate-600 hover:text-slate-900 transition-colors"><Plus className="w-4 h-4" /></button>
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