'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Users, Boxes, ArrowRight, ClipboardList, ShieldCheck, Zap, 
  Globe, Moon, Sun, Lock, Key, X, SearchCheck, TrendingUp, Sparkles, Activity,
  LogOut, ShieldAlert, Settings
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [isDark, setIsDark] = useState(true);

  // Live Metrics State
  const [stats, setStats] = useState({ revenue: 0, totalOrders: 0, totalClients: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  // Lock Modal States
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [inputPin, setInputPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  
  // Owner Authentication Session (Stored in sessionStorage)
  const [isOwnerUnlocked, setIsOwnerUnlocked] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('warehouse_owner_authenticated') === 'true';
  });

  // Fetch Live Metrics ONLY if Owner is Unlocked
  useEffect(() => {
    if (!isOwnerUnlocked) return;

    async function fetchPortalMetrics() {
      setLoadingStats(true);
      const { data: orders } = await supabase.from('orders').select('total_amount, status');
      const { count: clientCount } = await supabase.from('clients').select('*', { count: 'exact', head: true });

      if (orders) {
        const fulfilledRevenue = orders
          .filter(o => o.status === 'fulfilled')
          .reduce((acc, curr) => acc + (curr.total_amount || 0), 0);

        setStats({
          revenue: fulfilledRevenue,
          totalOrders: orders.length,
          totalClients: clientCount || 0
        });
      }
      setLoadingStats(false);
    }
    fetchPortalMetrics();
  }, [isOwnerUnlocked]);

  const t = {
    ar: {
      tag: 'منصة اللوجستيات الذكية V2.0',
      subtitleTag: 'المركز الرئيسي للعمليات',
      title: 'ويرهاوس إكسبريس',
      desc: 'تفضل باختيار الكتالوج العام أو تتبع طلبيتك. بالنسبة لإدارة المستودع، يرجى تسجيل دخول المالك.',
      card1Title: 'الكتالوج العام',
      card1Desc: 'طرفية موجهة للعميل لتصفح المخزون وتنفيذ طلبات B2B.',
      card1Action: 'فتح الكتالوج',
      card2Title: 'إدارة الطلبيات',
      card2Desc: 'معالجة ومتابعة الطلبيات الواردة، وتحديث حالة الشحن مباشرة.',
      card2Action: 'مركز التحكم',
      card3Title: 'دليل العملاء',
      card3Desc: 'إدارة حسابات الجملة، إنشاء مفاتيح الوصول وتتبع العناوين.',
      card3Action: 'سجل العملاء',
      card4Title: 'إدارة المخزون',
      card4Desc: 'متابعة مستويات الكميات، وتحديث أسعار SKUs وإشارات المخزون.',
      card4Action: 'التحكم بالمخزون',
      card5Title: 'تتبع الطلبية',
      card5Desc: 'بوابة سريعة للعملاء للتحقق من حالة الطلبية عبر رمز ID.',
      card5Action: 'تتبع الآن',
      card6Title: 'إعدادات النظام',
      card6Desc: 'تغيير رمز المالك Master PIN، ورقم واتساب، وإعدادات المتجر.',
      card6Action: 'تعديل الإعدادات',
      footer: 'قاعدة بيانات آمنة سحابية • تشفير آمن وحماية متكاملة',
      lockModalTitle: 'تسجيل دخول المالك',
      lockModalSub: 'يرجى إدخال رمز الوصول الخاص بالإدارة للوصول للوحة التحكم',
      pinPlaceholder: 'رمز الوصول Master PIN',
      verifyBtn: 'تأكيد ودخول',
      invalidPin: 'رمز الوصول غير صحيح',
      restrictedTag: 'محمي للـمالك',
      liveRevenue: 'إجمالي مبيعات المستودع',
      activeOrders: 'إجمالي الطلبات',
      registeredClients: 'حسابات العملاء',
      currency: 'د.م.',
      adminLogin: 'دخول المالك',
      adminLogout: 'خروج الإدارة',
      ownerActive: 'جلسة المالك نشطة',
    },
    en: {
      tag: 'B2B Logistical Core V2.0',
      subtitleTag: 'Operations Terminal',
      title: 'Warehouse Express',
      desc: 'Browse public inventory or track order status. Authenticate as Store Owner to unlock administrative controls.',
      card1Title: 'Public Catalog',
      card1Desc: 'Client-facing terminal for browsing inventory and dispatching B2B orders.',
      card1Action: 'Open Portal',
      card2Title: 'Owner Orders',
      card2Desc: 'Manage incoming client requisitions, verify stock levels, and execute fulfillment.',
      card2Action: 'Command Center',
      card3Title: 'Client Directory',
      card3Desc: 'Provision unique access keys, add B2B profiles, and manage corporate accounts.',
      card3Action: 'Manage Directory',
      card4Title: 'Inventory Admin',
      card4Desc: 'Catalog control panel for tracking stock levels, pricing, and adding SKUs.',
      card4Action: 'Manage Stock',
      card5Title: 'Track Order',
      card5Desc: 'Quick status portal for clients to check real-time order dispatch progress.',
      card5Action: 'Track Status',
      card6Title: 'Terminal Settings',
      card6Desc: 'Update Master PIN, WhatsApp dispatch numbers, and default currency.',
      card6Action: 'System Settings',
      footer: 'Secure Cloud Database • End-to-End Encrypted',
      lockModalTitle: 'Store Owner Authentication',
      lockModalSub: 'Enter administrative passcode to unlock owner features',
      pinPlaceholder: 'Owner Access Passcode',
      verifyBtn: 'Verify & Enter',
      invalidPin: 'Incorrect passcode provided',
      restrictedTag: 'Owner Only',
      liveRevenue: 'Fulfilled Revenue',
      activeOrders: 'Total Requisitions',
      registeredClients: 'B2B Accounts',
      currency: 'MAD',
      adminLogin: 'Admin Login',
      adminLogout: 'Lock Terminal',
      ownerActive: 'Owner Session Active',
    }
  };

  const current = t[lang];

  // Open PIN Modal
  const openPinModal = (targetHref?: string) => {
    if (targetHref) setPendingHref(targetHref);
    setInputPin('');
    setPinError('');
    setIsLoginModalOpen(true);
  };

  // Verify PIN against Supabase Database
  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPin.trim()) return;

    setIsVerifying(true);
    setPinError('');

    const { data } = await supabase
      .from('store_settings')
      .select('key_value')
      .eq('key_name', 'owner_master_pin')
      .single();

    const dbPin = data?.key_value || '8888';

    if (inputPin.trim() === dbPin) {
      setIsOwnerUnlocked(true);
      sessionStorage.setItem('warehouse_owner_authenticated', 'true');
      setIsLoginModalOpen(false);
      
      const target = pendingHref;
      setPendingHref(null);
      if (target) router.push(target);
    } else {
      setPinError(current.invalidPin);
    }
    setIsVerifying(false);
  };

  const handleLogout = () => {
    setIsOwnerUnlocked(false);
    sessionStorage.removeItem('warehouse_owner_authenticated');
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#07090e] text-slate-100' : 'bg-[#f8fafc] text-slate-950'} flex flex-col justify-between p-6 lg:p-12 font-sans selection:bg-emerald-500/30 overflow-x-hidden relative transition-colors duration-300`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Controls Bar */}
      <div className="max-w-7xl w-full mx-auto flex justify-between items-center z-20 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20">
            <Zap className="w-5 h-5 fill-slate-950" />
          </div>
          <span className="font-black tracking-tight text-lg hidden sm:inline">{current.title}</span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Admin Login / Session Status Button */}
          {isOwnerUnlocked ? (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3.5 py-2 rounded-2xl text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">{current.ownerActive}</span>
              <button 
                onClick={handleLogout} 
                className="hover:text-rose-400 transition-colors ml-1"
                title={current.adminLogout}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openPinModal()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-black transition-all"
            >
              <Key className="w-4 h-4 text-amber-400" />
              <span>{current.adminLogin}</span>
            </button>
          )}

          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-2.5 rounded-2xl border transition-all ${isDark ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all ${isDark ? 'bg-slate-900 border-slate-800 text-emerald-400 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >
            <Globe className="w-4 h-4" />
            <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl w-full mx-auto relative z-10 my-auto">
        
        {/* Header Hero Section */}
        <div className="text-center mb-12">
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-xs font-bold tracking-widest text-emerald-400 mb-2 uppercase flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4" /> {current.subtitleTag}
          </motion.div>

          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 border shadow-sm ${isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/80 text-emerald-700 border-emerald-100'}`}>
            <Activity className="w-4 h-4 text-emerald-400" /> {current.tag}
          </motion.div>

          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-4">
            {current.title}
          </motion.h1>
          
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={`font-medium max-w-2xl mx-auto text-sm md:text-base leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {current.desc}
          </motion.p>
        </div>

        {/* 🔒 Live Metrics Row (ONLY VISIBLE WHEN OWNER UNLOCKED) */}
        <AnimatePresence>
          {isOwnerUnlocked && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: 15 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -15 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12">
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{current.liveRevenue}</p>
                    <p className="text-xl font-black text-emerald-400 font-mono mt-0.5" dir="ltr">
                      {loadingStats ? '...' : stats.revenue.toFixed(2)} <span className="text-xs text-slate-400">{current.currency}</span>
                    </p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>

                <div className={`p-4 rounded-2xl border flex items-center justify-between ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{current.activeOrders}</p>
                    <p className="text-xl font-black text-white mt-0.5">{loadingStats ? '...' : stats.totalOrders}</p>
                  </div>
                  <ClipboardList className="w-5 h-5 text-amber-400" />
                </div>

                <div className={`p-4 rounded-2xl border flex items-center justify-between ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{current.registeredClients}</p>
                    <p className="text-xl font-black text-white mt-0.5">{loadingStats ? '...' : stats.totalClients}</p>
                  </div>
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          
          {/* 1. PUBLIC CATALOG (ALWAYS VISIBLE) */}
          <Link href="/catalog" passHref className="h-full">
            <motion.div whileHover={{ y: -6, scale: 1.01 }} whileTap={{ scale: 0.98 }} className={`backdrop-blur-xl rounded-[32px] p-8 border transition-all cursor-pointer group h-full flex flex-col justify-between ${isDark ? 'bg-slate-900/60 border-slate-800 hover:border-emerald-500/40' : 'bg-white/80 border-slate-200 shadow-sm'}`}>
              <div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${isDark ? 'bg-slate-800 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950' : 'bg-slate-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white'}`}>
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h2 className={`text-xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{current.card1Title}</h2>
                <p className={`text-xs font-bold leading-relaxed mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{current.card1Desc}</p>
              </div>
              <div className="flex items-center text-emerald-400 font-black text-xs tracking-wide uppercase mt-auto gap-1">
                {current.card1Action} <ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180 group-hover:-translate-x-2' : 'group-hover:translate-x-2'} transition-transform`} />
              </div>
            </motion.div>
          </Link>

          {/* 2. ORDER TRACKER (ALWAYS VISIBLE) */}
          <Link href="/status" passHref className="h-full">
            <motion.div whileHover={{ y: -6, scale: 1.01 }} whileTap={{ scale: 0.98 }} className={`backdrop-blur-xl rounded-[32px] p-8 border transition-all cursor-pointer group h-full flex flex-col justify-between ${isDark ? 'bg-slate-900/60 border-slate-800 hover:border-emerald-500/40' : 'bg-white/80 border-slate-200 shadow-sm'}`}>
              <div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${isDark ? 'bg-slate-800 text-amber-400 group-hover:bg-amber-400 group-hover:text-slate-950' : 'bg-slate-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white'}`}>
                  <SearchCheck className="w-6 h-6" />
                </div>
                <h2 className={`text-xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{current.card5Title}</h2>
                <p className={`text-xs font-bold leading-relaxed mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{current.card5Desc}</p>
              </div>
              <div className="flex items-center text-amber-400 font-black text-xs tracking-wide uppercase mt-auto gap-1">
                {current.card5Action} <ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180 group-hover:-translate-x-2' : 'group-hover:translate-x-2'} transition-transform`} />
              </div>
            </motion.div>
          </Link>

          {/* 🔒 ADMIN PAGES (ONLY RENDER WHEN OWNER IS UNLOCKED) */}
          {isOwnerUnlocked && (
            <>
              {/* 3. OWNER ORDERS */}
              <Link href="/orders" passHref className="h-full">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ y: -6, scale: 1.01 }} whileTap={{ scale: 0.98 }} className="bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-[32px] p-8 shadow-xl transition-all group h-full flex flex-col justify-between text-white">
                  <div>
                    <div className="w-14 h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors">
                      <ClipboardList className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-black mb-2">{current.card2Title}</h2>
                    <p className="text-xs text-emerald-50 font-bold leading-relaxed mb-8">{current.card2Desc}</p>
                  </div>
                  <div className="flex items-center text-white font-black text-xs tracking-wide uppercase mt-auto gap-1">
                    {current.card2Action} <ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180 group-hover:-translate-x-2' : 'group-hover:translate-x-2'} transition-transform`} />
                  </div>
                </motion.div>
              </Link>

              {/* 4. CLIENT DIRECTORY */}
              <Link href="/counter" passHref className="h-full">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ y: -6, scale: 1.01 }} whileTap={{ scale: 0.98 }} className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 shadow-xl transition-all group h-full flex flex-col justify-between text-white">
                  <div>
                    <div className="w-14 h-14 bg-white/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors">
                      <Users className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-black mb-2">{current.card3Title}</h2>
                    <p className="text-xs text-slate-400 font-bold leading-relaxed mb-8">{current.card3Desc}</p>
                  </div>
                  <div className="flex items-center text-emerald-400 font-black text-xs tracking-wide uppercase mt-auto gap-1">
                    {current.card3Action} <ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180 group-hover:-translate-x-2' : 'group-hover:translate-x-2'} transition-transform`} />
                  </div>
                </motion.div>
              </Link>

              {/* 5. INVENTORY ADMIN */}
              <Link href="/inventory" passHref className="h-full">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ y: -6, scale: 1.01 }} whileTap={{ scale: 0.98 }} className={`backdrop-blur-xl rounded-[32px] p-8 border transition-all group h-full flex flex-col justify-between ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white/80 border-slate-200 shadow-sm'}`}>
                  <div>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${isDark ? 'bg-slate-800 text-slate-300 group-hover:bg-slate-700' : 'bg-slate-50 text-slate-700 group-hover:bg-slate-100'}`}>
                      <Boxes className="w-6 h-6" />
                    </div>
                    <h2 className={`text-xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{current.card4Title}</h2>
                    <p className={`text-xs font-bold leading-relaxed mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{current.card4Desc}</p>
                  </div>
                  <div className={`flex items-center font-black text-xs tracking-wide uppercase mt-auto gap-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {current.card4Action} <ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180 group-hover:-translate-x-2' : 'group-hover:translate-x-2'} transition-transform`} />
                  </div>
                </motion.div>
              </Link>

              {/* 6. STORE SETTINGS */}
              <Link href="/settings" passHref className="h-full">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ y: -6, scale: 1.01 }} whileTap={{ scale: 0.98 }} className={`backdrop-blur-xl rounded-[32px] p-8 border transition-all group h-full flex flex-col justify-between ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white/80 border-slate-200 shadow-sm'}`}>
                  <div>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${isDark ? 'bg-slate-800 text-amber-400 group-hover:bg-slate-700' : 'bg-slate-50 text-amber-600 group-hover:bg-slate-100'}`}>
                      <Settings className="w-6 h-6" />
                    </div>
                    <h2 className={`text-xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{current.card6Title}</h2>
                    <p className={`text-xs font-bold leading-relaxed mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{current.card6Desc}</p>
                  </div>
                  <div className="flex items-center text-amber-400 font-black text-xs tracking-wide uppercase mt-auto gap-1">
                    {current.card6Action} <ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180 group-hover:-translate-x-2' : 'group-hover:translate-x-2'} transition-transform`} />
                  </div>
                </motion.div>
              </Link>
            </>
          )}

        </div>

      </div>

      {/* Footer */}
      <div className="mt-16 text-center flex items-center justify-center gap-2 text-xs font-bold text-slate-500 relative z-10">
        <ShieldCheck className="w-4 h-4 text-emerald-500" /> {current.footer}
      </div>

      {/* MASTER PIN VERIFICATION MODAL */}
      <AnimatePresence>
        {isLoginModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-5">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className={`w-full max-w-md p-8 rounded-[32px] border shadow-2xl space-y-6 relative ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
              <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white bg-slate-800/50"><X className="w-4 h-4" /></button>
              
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center text-amber-400 mx-auto shadow-lg">
                  <Lock className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black">{current.lockModalTitle}</h2>
                <p className="text-xs text-slate-400 font-bold leading-relaxed">{current.lockModalSub}</p>
              </div>

              <form onSubmit={handleVerifyPin} className="space-y-4">
                <div>
                  <input 
                    type="password" 
                    value={inputPin} 
                    onChange={(e) => setInputPin(e.target.value)} 
                    placeholder={current.pinPlaceholder} 
                    className={`w-full border rounded-2xl px-5 py-4 text-center font-black tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} 
                  />
                  {pinError && <p className="text-xs text-rose-500 font-bold text-center mt-2">{pinError}</p>}
                </div>

                <motion.button 
                  whileTap={{ scale: 0.97 }} 
                  type="submit" 
                  disabled={isVerifying}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {isVerifying ? <span className="animate-spin text-lg">⏳</span> : <Key className="w-4 h-4" />} {current.verifyBtn}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}