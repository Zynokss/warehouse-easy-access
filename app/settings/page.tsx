'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, Key, Phone, ArrowLeft, Save, RefreshCw, 
  ShieldCheck, Check, DollarSign, Globe, Lock, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function StoreSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form States
  const [masterPin, setMasterPin] = useState<string>('8888');
  const [confirmPin, setConfirmPin] = useState<string>('8888');
  const [whatsappPhone, setWhatsappPhone] = useState<string>('212762487466');
  const [storeCurrency, setStoreCurrency] = useState<string>('MAD');
  const [defaultLanguage, setDefaultLanguage] = useState<string>('ar');

  const [pinError, setPinError] = useState<string>('');

  // Protect page with Owner Session
  useEffect(() => {
    const isUnlocked = sessionStorage.getItem('warehouse_owner_authenticated') === 'true';
    if (!isUnlocked) {
      router.push('/');
      return;
    }

    fetchSettings();
  }, [router]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('store_settings')
      .select('key_name, key_value');

    if (!error && data) {
      data.forEach((row) => {
        if (row.key_name === 'owner_master_pin') {
          setMasterPin(row.key_value);
          setConfirmPin(row.key_value);
        }
        if (row.key_name === 'whatsapp_phone') setWhatsappPhone(row.key_value);
        if (row.key_name === 'store_currency') setStoreCurrency(row.key_value);
        if (row.key_name === 'default_language') setDefaultLanguage(row.key_value);
      });
    }
    setLoading(false);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    if (masterPin.trim() !== confirmPin.trim()) {
      setPinError('Passcodes do not match.');
      return;
    }

    if (masterPin.trim().length < 4) {
      setPinError('PIN must be at least 4 digits.');
      return;
    }

    setIsSaving(true);

    const settingsArray = [
      { key_name: 'owner_master_pin', key_value: masterPin.trim() },
      { key_name: 'whatsapp_phone', key_value: whatsappPhone.replace(/[^0-9]/g, '') },
      { key_name: 'store_currency', key_value: storeCurrency },
      { key_name: 'default_language', key_value: defaultLanguage },
    ];

    const { error } = await supabase
      .from('store_settings')
      .upsert(settingsArray, { onConflict: 'key_name' });

    if (!error) {
      showToast('Settings saved successfully!');
    } else {
      alert('Failed to save settings: ' + error.message);
    }

    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans selection:bg-emerald-500/30 pb-16 relative overflow-x-hidden">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 px-6 py-3 rounded-2xl font-black text-xs shadow-2xl flex items-center gap-2 border border-emerald-400">
            <Check className="w-4 h-4" /> {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-[#0a0a0a]/80 backdrop-blur-2xl border-b border-slate-800/80 sticky top-0 z-30 px-6 py-4 shadow-xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-2xl text-slate-300 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight">Terminal Settings</h1>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Store Defaults & Security</p>
              </div>
            </div>
          </div>

          <button 
            onClick={fetchSettings} 
            className="p-3 text-slate-400 hover:text-white bg-slate-900 rounded-2xl border border-slate-800 hover:bg-slate-800 transition-all"
            title="Reload Settings"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 relative z-10">
        
        {loading ? (
          <div className="py-20 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-500 mb-3" />
            Loading store settings...
          </div>
        ) : (
          <form onSubmit={handleSaveSettings} className="space-y-8">
            
            {/* 1. MASTER PIN SECURITY */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-[32px] p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Owner Master PIN Security</h2>
                  <p className="text-xs text-slate-400 font-bold">Passcode required to unlock owner controls across the platform.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">New Master PIN</label>
                  <div className="relative">
                    <Key className="w-4 h-4 absolute left-4 top-4 text-slate-500" />
                    <input 
                      type="password" 
                      value={masterPin} 
                      onChange={(e) => setMasterPin(e.target.value)} 
                      placeholder="e.g. 8888" 
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-5 py-3.5 text-sm font-mono font-bold text-white focus:border-emerald-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Confirm Master PIN</label>
                  <div className="relative">
                    <ShieldCheck className="w-4 h-4 absolute left-4 top-4 text-slate-500" />
                    <input 
                      type="password" 
                      value={confirmPin} 
                      onChange={(e) => setConfirmPin(e.target.value)} 
                      placeholder="Re-enter PIN" 
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-5 py-3.5 text-sm font-mono font-bold text-white focus:border-emerald-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {pinError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}
            </div>

            {/* 2. WHATSAPP & LOGISTICS DISPATCH */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-[32px] p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Logistics & WhatsApp Integration</h2>
                  <p className="text-xs text-slate-400 font-bold">Primary phone number used for WhatsApp order dispatches.</p>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">WhatsApp Phone Number (International Format)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-4 top-4 text-slate-500" />
                  <input 
                    type="text" 
                    value={whatsappPhone} 
                    onChange={(e) => setWhatsappPhone(e.target.value)} 
                    placeholder="212762487466" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-5 py-3.5 text-sm font-mono font-bold text-white focus:border-emerald-500 focus:outline-none transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500 font-bold mt-2">Do not include + or spaces (e.g. 212762487466).</p>
              </div>
            </div>

            {/* 3. STORE DEFAULTS & CURRENCY */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-[32px] p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Store Defaults</h2>
                  <p className="text-xs text-slate-400 font-bold">Configure terminal currency and language defaults.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Currency Label</label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-4 top-4 text-slate-500" />
                    <select 
                      value={storeCurrency} 
                      onChange={(e) => setStoreCurrency(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-5 py-3.5 text-sm font-bold text-white focus:border-emerald-500 focus:outline-none transition-all appearance-none"
                    >
                      <option value="MAD">MAD (Moroccan Dirham)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Default Terminal Language</label>
                  <div className="relative">
                    <Globe className="w-4 h-4 absolute left-4 top-4 text-slate-500" />
                    <select 
                      value={defaultLanguage} 
                      onChange={(e) => setDefaultLanguage(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-5 py-3.5 text-sm font-bold text-white focus:border-emerald-500 focus:outline-none transition-all appearance-none"
                    >
                      <option value="ar">Arabic (العربية)</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <motion.button 
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={isSaving}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Save System Settings</>}
            </motion.button>

          </form>
        )}

      </main>
    </div>
  );
}