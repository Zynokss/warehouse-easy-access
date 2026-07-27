'use client';

import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { ShoppingBag, PhoneCall, Boxes, ArrowRight, ClipboardList, ShieldCheck, Zap, Globe, Moon, Sun } from 'lucide-react';
import Link from 'next/link';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function LandingPage() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [isDark, setIsDark] = useState(true);

  const t = {
    ar: {
      tag: 'B2B منصة اللوجستيات V2.0',
      subtitleTag: 'الكتالوج الذكي',
      title: 'مستودع إكسبريس',
      desc: 'اختر بيئة التشغيل الخاصة بك لإدارة المخزون أو تلبية الطلبات أو تصفح الطرفية النشطة.',
      card1Title: 'الكتالوج العام',
      card1Desc: 'طرفية موجهة للعميل لتصفح المخزون وتنفيذ طلبات B2B.',
      card1Action: 'فتح البوابة',
      card2Title: 'طلبات المالك',
      card2Desc: 'إدارة طلبات العملاء الواردة والتحقق من مستويات المخزون وتنفيذ التسليم.',
      card2Action: 'مركز التحكم',
      card3Title: 'مكتب سريع',
      card3Desc: 'محطة نقاط بيع سريعة البرق لتلقي المكالمات الهاتفية السريعة والإدخال اليدوي.',
      card3Action: 'فتح الطرفية',
      card4Title: 'إدارة المخزون',
      card4Desc: 'لوحة التحكم لتتبع مستويات المخزون والأسعار وإضافة SKUs.',
      card4Action: 'إدارة المخزون',
      footer: 'قاعدة بيانات آمنة سحابية • تشفير من طرف إلى طرف',
    },
    en: {
      tag: 'B2B Logistical Core V2.0',
      subtitleTag: 'Smart Catalogue',
      title: 'Warehouse Express',
      desc: 'Select your operating environment to manage inventory, fulfill requisitions, or browse the active terminal.',
      card1Title: 'Public Catalog',
      card1Desc: 'Client-facing terminal for browsing inventory and dispatching B2B orders.',
      card1Action: 'Open Portal',
      card2Title: 'Owner Orders',
      card2Desc: 'Manage incoming client requisitions, verify stock levels, and execute fulfillment.',
      card2Action: 'Command Center',
      card3Title: 'Fast Desk',
      card3Desc: 'Lightning-fast POS terminal for taking rapid phone calls and manual entry.',
      card3Action: 'Open Terminal',
      card4Title: 'Inventory Admin',
      card4Desc: 'Catalog control panel for tracking stock levels, pricing, and adding SKUs.',
      card4Action: 'Manage Stock',
      footer: 'Secure Cloud Database • End-to-End Encrypted',
    }
  };

  const current = t[lang];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0a0a] text-slate-100' : 'bg-[#f8fafc] text-slate-950'} flex flex-col items-center justify-center p-6 lg:p-12 font-sans selection:bg-emerald-500/30 overflow-hidden relative transition-colors duration-300`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Ambient Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Controls Bar */}
      <div className="absolute top-6 right-6 left-6 max-w-7xl mx-auto flex justify-between items-center z-20">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-2.5 rounded-full border transition-all ${isDark ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

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
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs font-bold tracking-widest text-emerald-400 mb-2 uppercase"
          >
            {current.subtitleTag}
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 border shadow-sm ${isDark ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50' : 'bg-white/80 text-emerald-700 border-emerald-100'}`}
          >
            <Zap className="w-4 h-4 fill-emerald-500" /> {current.tag}
          </motion.div>

          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-black tracking-tight mb-6"
          >
            {current.title}
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`font-medium max-w-xl mx-auto text-base md:text-lg leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
          >
            {current.desc}
          </motion.p>
        </div>

        {/* Portal Grid */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* 1. Public Catalog */}
          <Link href="/catalog" passHref className="h-full">
            <motion.div variants={item} whileHover={{ y: -8, scale: 1.02 }} className={`backdrop-blur-xl rounded-[32px] p-8 border transition-all cursor-pointer group h-full flex flex-col justify-between ${isDark ? 'bg-slate-900/60 border-slate-800/80 hover:border-emerald-500/40 hover:shadow-[0_30px_60px_rgba(16,185,129,0.1)]' : 'bg-white/80 border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_30px_60px_rgba(16,185,129,0.12)]'}`}>
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

          {/* 2. Warehouse Orders Feed */}
          <Link href="/orders" passHref className="h-full">
            <motion.div variants={item} whileHover={{ y: -8, scale: 1.02 }} className="bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-[32px] p-8 shadow-[0_20px_40px_rgba(16,185,129,0.3)] hover:shadow-[0_30px_60px_rgba(16,185,129,0.4)] transition-all cursor-pointer group h-full flex flex-col justify-between relative overflow-hidden text-white">
              <div className="absolute top-0 right-0 bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-bl-2xl tracking-wider flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> LIVE
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
          </Link>

          {/* 3. Fast Desk Counter */}
          <Link href="/counter" passHref className="h-full">
            <motion.div variants={item} whileHover={{ y: -8, scale: 1.02 }} className={`rounded-[32px] p-8 border shadow-xl transition-all cursor-pointer group h-full flex flex-col justify-between relative overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800 text-white hover:border-emerald-500/50' : 'bg-slate-900 border-slate-800 text-white'}`}>
              <div className="absolute -right-12 -top-12 w-40 h-40 bg-emerald-500 rounded-full opacity-20 blur-3xl group-hover:opacity-40 transition-opacity" />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black mb-3">{current.card3Title}</h2>
                <p className="text-sm text-slate-400 font-medium leading-relaxed mb-8">{current.card3Desc}</p>
              </div>
              <div className="flex items-center text-emerald-400 font-extrabold text-xs tracking-wide uppercase mt-auto relative z-10 gap-1">
                {current.card3Action} <ArrowRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180 group-hover:-translate-x-2' : 'group-hover:translate-x-2'} transition-transform`} />
              </div>
            </motion.div>
          </Link>

          {/* 4. Inventory Admin */}
          <Link href="/inventory" passHref className="h-full">
            <motion.div variants={item} whileHover={{ y: -8, scale: 1.02 }} className={`backdrop-blur-xl rounded-[32px] p-8 border transition-all cursor-pointer group h-full flex flex-col justify-between ${isDark ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700' : 'bg-white/80 border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)]'}`}>
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
          </Link>

        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center flex items-center justify-center gap-2 text-xs font-bold text-slate-400"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-500" /> {current.footer}
        </motion.div>

      </div>
    </div>
  );
}