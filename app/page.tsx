'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, PhoneCall, Boxes, ArrowRight, ClipboardList, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col items-center justify-center p-6 lg:p-12 font-sans selection:bg-emerald-200 overflow-hidden relative">
      
      {/* Ambient Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-400/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl w-full relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="w-24 h-24 mx-auto rounded-[2rem] bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center font-black text-3xl shadow-[0_20px_40px_rgba(16,185,129,0.3)] mb-8 tracking-wider"
          >
            WE
          </motion.div>
          
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md text-emerald-700 px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-emerald-100 shadow-sm"
          >
            <Zap className="w-4 h-4 fill-emerald-600" /> B2B Logistical Core v2.0
          </motion.div>

          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 mb-6"
          >
            Warehouse Express
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-500 font-medium max-w-xl mx-auto text-base md:text-lg leading-relaxed"
          >
            Select your operating environment to manage inventory, fulfill requisitions, or browse the active terminal.
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
            <motion.div variants={item} whileHover={{ y: -8, scale: 1.02 }} className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_30px_60px_rgba(16,185,129,0.12)] transition-all cursor-pointer group h-full flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-slate-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-50 transition-colors">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-slate-900 mb-3">Public Catalog</h2>
                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">Client-facing terminal for browsing inventory and dispatching B2B orders.</p>
              </div>
              <div className="flex items-center text-emerald-600 font-extrabold text-xs tracking-wide uppercase mt-auto">
                Open Portal <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-2 transition-transform" />
              </div>
            </motion.div>
          </Link>

          {/* 2. Warehouse Orders Feed */}
          <Link href="/orders" passHref className="h-full">
            <motion.div variants={item} whileHover={{ y: -8, scale: 1.02 }} className="bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-[32px] p-8 shadow-[0_20px_40px_rgba(16,185,129,0.3)] hover:shadow-[0_30px_60px_rgba(16,185,129,0.4)] transition-all cursor-pointer group h-full flex flex-col justify-between relative overflow-hidden text-white">
              <div className="absolute top-0 right-0 bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-bl-2xl tracking-wider flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> Live
              </div>
              <div>
                <div className="w-14 h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black mb-3">Owner Orders</h2>
                <p className="text-sm text-emerald-50 font-medium leading-relaxed mb-8">Manage incoming client requisitions, verify stock levels, and execute fulfillment.</p>
              </div>
              <div className="flex items-center text-white font-extrabold text-xs tracking-wide uppercase mt-auto">
                Command Center <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-2 transition-transform" />
              </div>
            </motion.div>
          </Link>

          {/* 3. Fast Desk Counter */}
          <Link href="/counter" passHref className="h-full">
            <motion.div variants={item} whileHover={{ y: -8, scale: 1.02 }} className="bg-slate-900 rounded-[32px] p-8 border border-slate-800 shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.4)] transition-all cursor-pointer group h-full flex flex-col justify-between relative overflow-hidden text-white">
              <div className="absolute -right-12 -top-12 w-40 h-40 bg-emerald-500 rounded-full opacity-20 blur-3xl group-hover:opacity-40 transition-opacity" />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20 transition-colors">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black mb-3">Fast Desk</h2>
                <p className="text-sm text-slate-400 font-medium leading-relaxed mb-8">Lightning-fast POS terminal for taking rapid phone calls and manual entry.</p>
              </div>
              <div className="flex items-center text-emerald-400 font-extrabold text-xs tracking-wide uppercase mt-auto relative z-10">
                Open Terminal <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-2 transition-transform" />
              </div>
            </motion.div>
          </Link>

          {/* 4. Inventory Admin */}
          <Link href="/inventory" passHref className="h-full">
            <motion.div variants={item} whileHover={{ y: -8, scale: 1.02 }} className="bg-white/80 backdrop-blur-xl rounded-[32px] p-8 border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)] transition-all cursor-pointer group h-full flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-slate-50 text-slate-700 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-slate-100 transition-colors">
                  <Boxes className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-slate-900 mb-3">Inventory Admin</h2>
                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">Catalog control panel for tracking stock levels, pricing, and adding SKUs.</p>
              </div>
              <div className="flex items-center text-slate-700 font-extrabold text-xs tracking-wide uppercase mt-auto">
                Manage Stock <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-2 transition-transform" />
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
          <ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure Cloud Database &bull; End-to-End Encrypted
        </motion.div>

      </div>
    </div>
  );
}