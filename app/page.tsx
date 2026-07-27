'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Users, Boxes, ArrowRight, ClipboardList, ShieldCheck, Zap, Globe, Moon, Sun, Lock, Key, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [isDark, setIsDark] = useState(true);

  // Lock Modal States
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [inputPin, setInputPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  
  // SWITCHED TO sessionStorage: Clears automatically when tab/browser closes!
  const [isOwnerUnlocked, setIsOwnerUnlocked] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('warehouse_owner_authenticated') === 'true';
  });

  const t = {
    ar: {
      tag: 'B2B منصة اللوجستيات V2.0',
      subtitleTag: 'الكتالوج الذكي',
      title: 'مستودع إكسبريس',
      desc: 'اختر بيئة التشغيل الخاصة بك لإدارة المخزون أو تلبية الطلبات أو إدارة مفاتيح العملاء.',
      card1Title: 'الكتالوج العام',
      card1Desc: 'طرفية موجهة للعميل لتصفح المخزون وتنفيذ طلبات B2B.',
      card1Action: 'فتح البوابة',
      card2Title: 'طلبات المالك',
      card2Desc: 'إدارة طلبات العملاء الواردة والتحقق من مستويات المخزون وتنفيذ التسليم.',
      card2Action: 'مركز التحكم',
      card3Title: 'إدارة العملاء والمفاتيح',
      card3Desc: 'إضافة عملاء الجملة، إنشاء مفاتيح الوصول الفريدة، وتعديل بيانات الاتصال والمواقع.',
      card3Action: 'إدارة العملاء',
      card4Title: 'إدارة المخزون',
      card4Desc: 'لوحة التحكم لتتبع مستويات المخزون والأسعار وإضافة SKUs.',
      card4Action: 'إدارة المخزون',
      footer: 'قاعدة بيانات آمنة سحابية • تشفير من طرف إلى طرف',
      lockModalTitle: 'منطقة المالك المحمية',
      lockModalSub: 'يرجى إدخال رمز الوصول الخاص بمالك المستودع',
      pinPlaceholder: 'رمز الوصول الخاص بمالك المستودع',
      verifyBtn: 'تأكيد ودخول',
      invalidPin: 'رمز الوصول غير صحيح',
      restrictedTag: 'محمي للـمالك',
    },
    en: {
      tag: 'B2B Logistical Core V2.0',
      subtitleTag: 'Smart Catalogue',
      title: 'Warehouse Express',
      desc: 'Select your operating environment to manage inventory, fulfill requisitions, or manage client access keys.',
      card1Title: 'Public Catalog',
      card1Desc: 'Client-facing terminal for browsing inventory and dispatching B2B orders.',
      card1Action: 'Open Portal',
      card2Title: 'Owner Orders',
      card2Desc: 'Manage incoming client requisitions, verify stock levels, and execute fulfillment.',
      card2Action: 'Command Center',
      card3Title: 'Client & Key Directory',
      card3Desc: 'Provision unique access keys, add B2B client profiles, update phone numbers, and manage locations.',
      card3Action: 'Manage Directory',
      card4Title: 'Inventory Admin',
      card4Desc: 'Catalog control panel for tracking stock levels, pricing, and adding SKUs.',
      card4Action: 'Manage Stock',
      footer: 'Secure Cloud Database • End-to-End Encrypted',
      lockModalTitle: 'Owner Restricted Area',
      lockModalSub: 'Enter store owner passcode to access administrative controls',
      pinPlaceholder: 'Owner Access Passcode',
      verifyBtn: 'Verify & Enter',
      invalidPin: 'Incorrect passcode provided',
      restrictedTag: 'Owner Only',
    }
  };

  const current = t[lang];

  // Intercept Admin Navigation
  const handleAdminNavigation = (href: string) => {
    if (isOwnerUnlocked) {
      router.push(href);
    } else {
      setPendingHref(href);
      setPinError('');
      setInputPin('');
    }
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
      // Save session in sessionStorage so closing tab forces re-login
      sessionStorage.setItem('warehouse_owner_authenticated', 'true');
      const target = pendingHref;
      setPendingHref(null);
      if (target) router.push(target);
    } else {
      setPinError(current.invalidPin);
    }
    setIsVerifying(false);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0a] text-slate-100' : 'bg-[#f8fafc] text-slate-950'} flex flex-col items-center justify-center p-6 lg:p-12 font-sans selection:bg-emerald-500/30 overflow-hidden relative transition-colors duration-300`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Ambient Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Controls Bar */}
      <div className="absolute top-6 right-6 left-6 max-w-7xl mx-auto flex justify-between items-center z-20">
        <button
          onClick={() => setIsDark(!isDark)}
          className={`p-2.5 rounded-full border transition-all ${isDark ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-all ${isDark ? 'bg-slate-900 border-slate-800 text-emerald-400 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
        >
          <Globe className="w-4 h-4" />
          <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
        </button>
      </div>

      <div className="max-w-6xl w-full relative z-10 mt-12 lg:mt-0">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-xs font-bold tracking-widest text-emerald-400 mb-2 uppercase">
            {current.subtitleTag}
          </motion.div>

          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 border shadow-sm ${isDark ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50' : 'bg-white/80 text-emerald-700 border-emerald-100'}`}>
            <Zap className="w-4 h-4 fill-emerald-500" /> {current.tag}
          </motion.div>

          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-5xl md:text-7xl font-black tracking-tight mb-6">
            {current.title}
          </motion.h1>
          
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className={`font-medium max-w-xl mx-auto text-base md:text-lg leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {current.desc}
          </motion.p>
        </div>

        {/* Portal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* 1. PUBLIC CATALOG (UNLOCKED) */}
          <Link href="/catalog" passHref className="h-full">
            <motion.div whileHover={{ y: -8, scale: 1.02 }} className={`backdrop-blur-xl rounded-[32px] p-8 border transition-all cursor-pointer group h-full flex flex-col justify-between ${isDark ? 'bg-slate-900/60 border-slate-800/80 hover:border-emerald-500/40' : 'bg-white/80 border-white/40 shadow-sm'}`}>
              <div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${isDark ? 'bg-slate-800 text-emerald-400 group-hover:bg-slate-700' : 'bg-slate-50 text-emerald-600 group-hover:bg-emerald-50'}`}>
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h2 className={`text-xl font-black mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{current.card1Title}</h2>
                <p className={`text-sm font-medium leading-relaxed mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{current.card1Desc}</p>
              </div>
              <div className="flex items-center text-emerald-500 font-extrabold text-xs tracking-wide uppercase mt-auto gap-1">
                {current.card1Action} <ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180 group-hover:-translate-x-2' : 'group-hover:translate-x-2'} transition-transform`} />
              </div>
            </motion.div>
          </Link>

          {/* 2. OWNER ORDERS (LOCKED) */}
          <div onClick={() => handleAdminNavigation('/orders')} className="h-full cursor-pointer">
            <motion.div whileHover={{ y: -8, scale: 1.02 }} className="bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-[32px] p-8 shadow-xl transition-all group h-full flex flex-col justify-between relative overflow-hidden text-white">
              <div className="absolute top-0 right-0 bg-slate-950/40 backdrop-blur-md text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-bl-2xl tracking-wider flex items-center gap-1.5 border-b border-l border-white/10">
                <Lock className="w-3 h-3 text-amber-300" /> {current.restrictedTag}
              </div>
              <div>
                <div className="w-14 h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black mb-3">{current.card2Title}</h2>
                <p className="text-sm text-emerald-50 font-medium leading-relaxed mb-8">{current.card2Desc}</p>
              </div>
              <div className="flex items-center text-white font-extrabold text-xs tracking-wide uppercase mt-auto gap-1">
                {current.card2Action} <ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180 group-hover:-translate-x-2' : 'group-hover:translate-x-2'} transition-transform`} />
              </div>
            </motion.div>
          </div>

          {/* 3. CLIENT & KEY DIRECTORY (LOCKED) */}
          <div onClick={() => handleAdminNavigation('/counter')} className="h-full cursor-pointer">
            <motion.div whileHover={{ y: -8, scale: 1.02 }} className={`rounded-[32px] p-8 border shadow-xl transition-all group h-full flex flex-col justify-between relative overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-900 border-slate-800 text-white'}`}>
              <div className="absolute top-0 right-0 bg-slate-800/80 backdrop-blur-md text-amber-400 text-[10px] font-black uppercase px-4 py-1.5 rounded-bl-2xl tracking-wider flex items-center gap-1.5 border-b border-l border-slate-700">
                <Lock className="w-3 h-3" /> {current.restrictedTag}
              </div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors">
                  <Users className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black mb-3">{current.card3Title}</h2>
                <p className="text-sm text-slate-400 font-medium leading-relaxed mb-8">{current.card3Desc}</p>
              </div>
              <div className="flex items-center text-emerald-400 font-extrabold text-xs tracking-wide uppercase mt-auto relative z-10 gap-1">
                {current.card3Action} <ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180 group-hover:-translate-x-2' : 'group-hover:translate-x-2'} transition-transform`} />
              </div>
            </motion.div>
          </div>

          {/* 4. INVENTORY ADMIN (LOCKED) */}
          <div onClick={() => handleAdminNavigation('/inventory')} className="h-full cursor-pointer">
            <motion.div whileHover={{ y: -8, scale: 1.02 }} className={`backdrop-blur-xl rounded-[32px] p-8 border transition-all group h-full flex flex-col justify-between relative overflow-hidden ${isDark ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white/80 border-white/40 shadow-sm'}`}>
              <div className={`absolute top-0 right-0 backdrop-blur-md text-[10px] font-black uppercase px-4 py-1.5 rounded-bl-2xl tracking-wider flex items-center gap-1.5 border-b border-l ${isDark ? 'bg-slate-800/80 text-amber-400 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                <Lock className="w-3 h-3" /> {current.restrictedTag}
              </div>
              <div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${isDark ? 'bg-slate-800 text-slate-300 group-hover:bg-slate-700' : 'bg-slate-50 text-slate-700 group-hover:bg-slate-100'}`}>
                  <Boxes className="w-6 h-6" />
                </div>
                <h2 className={`text-xl font-black mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>{current.card4Title}</h2>
                <p className={`text-sm font-medium leading-relaxed mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{current.card4Desc}</p>
              </div>
              <div className={`flex items-center font-extrabold text-xs tracking-wide uppercase mt-auto gap-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                {current.card4Action} <ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180 group-hover:-translate-x-2' : 'group-hover:translate-x-2'} transition-transform`} />
              </div>
            </motion.div>
          </div>

        </div>

        <div className="mt-16 text-center flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" /> {current.footer}
        </div>

      </div>

      {/* MASTER PIN VERIFICATION MODAL */}
      <AnimatePresence>
        {pendingHref && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-5">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className={`w-full max-w-md p-8 rounded-[32px] border shadow-2xl space-y-6 relative ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
              <button onClick={() => setPendingHref(null)} className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white bg-slate-800/50"><X className="w-4 h-4" /></button>
              
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
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl text-sm uppercase shadow-[0_8px_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2"
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