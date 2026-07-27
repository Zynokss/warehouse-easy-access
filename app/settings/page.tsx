'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { 
  Settings, Phone, MessageSquare, Save, ArrowLeft, 
  CheckCircle2, ShieldCheck, Key, RefreshCw, Eye
} from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const [whatsappPhone, setWhatsappPhone] = useState<string>('');
  const [whatsappHeader, setWhatsappHeader] = useState<string>('*WAREHOUSE EXPRESS — REQUISITION ORDER*');
  const [whatsappFooter, setWhatsappFooter] = useState<string>('Thank you for your order!');
  const [masterPin, setMasterPin] = useState<string>('');
  
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    async function fetchSettings() {
      const { data, error } = await supabase.from('store_settings').select('*');

      if (!error && data) {
        data.forEach((item) => {
          if (item.key_name === 'whatsapp_phone') setWhatsappPhone(item.key_value || '');
          if (item.key_name === 'whatsapp_header') setWhatsappHeader(item.key_value || '');
          if (item.key_name === 'whatsapp_footer') setWhatsappFooter(item.key_value || '');
          if (item.key_name === 'master_pin') setMasterPin(item.key_value || '');
        });
      }
      setLoading(false);
    }
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    const updates = [
      { key_name: 'whatsapp_phone', key_value: whatsappPhone.trim() },
      { key_name: 'whatsapp_header', key_value: whatsappHeader.trim() },
      { key_name: 'whatsapp_footer', key_value: whatsappFooter.trim() },
    ];

    if (masterPin.trim()) {
      updates.push({ key_name: 'master_pin', key_value: masterPin.trim() });
    }

    const { error } = await supabase
      .from('store_settings')
      .upsert(updates, { onConflict: 'key_name' });

    if (!error) {
      setSuccessMsg('Settings updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      alert('Error saving settings: ' + error.message);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-100 p-6 md:p-12 font-sans max-w-4xl mx-auto space-y-8">
      
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Terminal Settings</h1>
            <p className="text-xs font-bold text-slate-400">Configure WhatsApp dispatch and store preferences</p>
          </div>
        </div>

        <Link href="/">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-all">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </Link>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        
        {/* WHATSAPP PHONE NUMBER */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-[28px] p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-black text-sm uppercase tracking-wider">
            <Phone className="w-4 h-4" />
            <h2>Dispatch WhatsApp Number</h2>
          </div>
          <p className="text-xs text-slate-400 font-bold">
            All customer WhatsApp orders and support messages will be redirected to this phone number. Include country code without spaces (e.g., <code className="text-emerald-400">212762487466</code>).
          </p>
          <input
            type="text"
            value={whatsappPhone}
            onChange={(e) => setWhatsappPhone(e.target.value)}
            placeholder="e.g. 212762487466"
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm font-black text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
        </div>

        {/* WHATSAPP TEMPLATE CUSTOMIZER */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-[28px] p-6 space-y-6">
          <div className="flex items-center gap-2 text-emerald-400 font-black text-sm uppercase tracking-wider">
            <MessageSquare className="w-4 h-4" />
            <h2>WhatsApp Message Template</h2>
          </div>
          <p className="text-xs text-slate-400 font-bold">
            Customize the automated header and footer text sent in client WhatsApp requisitions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Header Input */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-300 uppercase tracking-wider">Message Header</label>
              <textarea
                value={whatsappHeader}
                onChange={(e) => setWhatsappHeader(e.target.value)}
                rows={4}
                placeholder="Header text, greeting, or tax ID..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>

            {/* Footer Input */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-300 uppercase tracking-wider">Message Footer</label>
              <textarea
                value={whatsappFooter}
                onChange={(e) => setWhatsappFooter(e.target.value)}
                rows={4}
                placeholder="Footer text, bank details, or delivery policy..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
          </div>

          {/* LIVE TEMPLATE PREVIEW BOX */}
          <div className="bg-slate-950/80 border border-slate-800/60 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-wider">
              <Eye className="w-3.5 h-3.5 text-emerald-400" /> Live Message Preview
            </div>
            <div className="font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-900/90 p-4 rounded-xl border border-slate-800/50">
              <span className="text-emerald-400 font-bold">{whatsappHeader || '[Header Template]'}</span>
              {"\n===================================\n"}
              <span>📋 Client: Company Reference (KEY-1001)\n</span>
              <span>📅 Date: {new Date().toLocaleDateString()}\n</span>
              {"===================================\n\n"}
              <span className="text-slate-400">*ORDERED ITEMS:*\n1. Item Example x 2 = 20.00 MAD\n\n</span>
              {"-----------------------------------\n"}
              <span>💵 TOTAL ESTIMATE: 20.00 MAD\n</span>
              {"===================================\n"}
              <span className="text-emerald-400 font-bold">{whatsappFooter || '[Footer Template]'}</span>
            </div>
          </div>
        </div>

        {/* MASTER ADMIN PIN */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-[28px] p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-black text-sm uppercase tracking-wider">
            <Key className="w-4 h-4" />
            <h2>Master Admin PIN</h2>
          </div>
          <p className="text-xs text-slate-400 font-bold">
            The security PIN required to unlock owner stats and management pages on the landing screen.
          </p>
          <input
            type="password"
            value={masterPin}
            onChange={(e) => setMasterPin(e.target.value)}
            placeholder="Enter new Master PIN"
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm font-black text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
        </div>

        {/* SAVE BUTTON */}
        <div className="pt-4 flex items-center justify-between">
          {successMsg ? (
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 rounded-2xl">
              <CheckCircle2 className="w-5 h-5" /> {successMsg}
            </div>
          ) : <div />}

          <motion.button
            whileTap={{ scale: 0.96 }}
            type="submit"
            disabled={saving}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-8 py-4 rounded-2xl text-sm uppercase tracking-wider shadow-[0_8px_20px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2 ml-auto"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Settings
          </motion.button>
        </div>

      </form>
    </div>
  );
}