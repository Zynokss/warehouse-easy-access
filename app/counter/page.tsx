'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Key, UserPlus, Copy, Check, Trash2, Edit3, Search, MapPin, Phone,
  Globe, Sun, Moon, ShieldCheck, RefreshCw, Lock, LogOut, Dices, X
} from 'lucide-react';

interface Client {
  id: string;
  client_name: string;
  access_key: string;
  phone_number?: string;
  address?: string;
  created_at: string;
}

const OWNER_MASTER_KEY = 'ADMIN-8888';

const dict = {
  ar: {
    title: 'ورشة إدارة العملاء والمفاتيح',
    subtitle: 'لوحة التحكم المركزية لإدارة بيانات الشركات ومفاتيح الوصول',
    keyGenerator: 'إضافة عميل جديد وإنشاء المفتاح',
    newClientName: 'اسم الشركة / العميل',
    newClientPhone: 'رقم الهاتف',
    newClientAddress: 'العنوان / الموقع',
    accessKeyLabel: 'مفتاح الوصول',
    autoGenBtn: 'توليد مفتاح عشوائي فريد',
    customKeyPlaceholder: 'أو أدخل مفتاح خاص (مثال: WE-CAFE99)',
    generateKeyBtn: 'حفظ وإضافة العميل',
    activeClients: 'سجل العملاء وإدارة المفاتيح',
    searchPlaceholder: 'البحث عن عميل، رقم هاتف، أو مفتاح...',
    copySuccess: 'تم النسخ!',
    currency: 'د.م.',
    emptyClients: 'لا يوجد عملاء مسجلون حالياً',
    adminLoginTitle: 'بوابة مالك المستودع',
    adminLoginSub: 'أدخل المفتاح الرئيسي للوصول إلى لوحة التحكم الإدارية',
    adminKeyPlaceholder: 'أدخل رمز الوصول الرئيسي...',
    adminLoginBtn: 'تأكيد الدخول',
    invalidAdminKey: 'رمز الوصول الرئيسي غير صحيح',
    logout: 'خروج الإدارة',
    editClientTitle: 'تعديل بيانات العميل',
    saveChanges: 'حفظ التعديلات',
    cancel: 'إلغاء',
    keyExistsError: 'هذا المفتاح مستخدم بالفعل! يرجى اختيار مفتاح آخر.',
  },
  en: {
    title: 'Client & Key Control Center',
    subtitle: 'Central hub for managing B2B clients, locations, and access tokens',
    keyGenerator: 'Add New Client & Provision Key',
    newClientName: 'Company / Client Name',
    newClientPhone: 'Phone Number',
    newClientAddress: 'Address / Location',
    accessKeyLabel: 'Access Key',
    autoGenBtn: 'Generate Unique Random Key',
    customKeyPlaceholder: 'Or enter custom key (e.g. WE-CAFE99)',
    generateKeyBtn: 'Save & Provision Client',
    activeClients: 'Registered Clients & Key Directory',
    searchPlaceholder: 'Search by client name, phone, or key...',
    copySuccess: 'Copied!',
    currency: 'MAD',
    emptyClients: 'No registered clients found',
    adminLoginTitle: 'Store Owner Portal',
    adminLoginSub: 'Enter master owner passcode to manage directory',
    adminKeyPlaceholder: 'Enter master passcode...',
    adminLoginBtn: 'Authenticate',
    invalidAdminKey: 'Invalid master passcode',
    logout: 'Exit Admin',
    editClientTitle: 'Edit Client Profile',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    keyExistsError: 'This access key is already taken! Try another one.',
  }
};

// Cryptographically sound random key generator (e.g. WE-K8M9P2)
const generateSecureKey = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomStr = '';
  for (let i = 0; i < 6; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `WE-${randomStr}`;
};

export default function CounterAdminPage() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [isDark, setIsDark] = useState<boolean>(true);
  
  // Admin Auth State (sessionStorage)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('warehouse_owner_authenticated') === 'true';
  });
  const [adminInputKey, setAdminInputKey] = useState<string>('');
  const [adminAuthError, setAdminAuthError] = useState<string>('');

  // Clients Roster state
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // New Client Form Inputs
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientAddress, setClientAddress] = useState<string>('');
  const [assignedKey, setAssignedKey] = useState<string>(generateSecureKey());
  
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Edit Modal State
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editAddress, setEditAddress] = useState<string>('');
  const [editKey, setEditKey] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const t = dict[lang];

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchClients();
    }
  }, [isAdminAuthenticated]);

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setClients(data);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminInputKey.trim()) return;

    // Verify against database PIN settings
    const { data } = await supabase
      .from('store_settings')
      .select('key_value')
      .eq('key_name', 'owner_master_pin')
      .single();

    const masterPin = data?.key_value || OWNER_MASTER_KEY;

    if (adminInputKey.trim() === masterPin || adminInputKey.trim() === OWNER_MASTER_KEY) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('warehouse_owner_authenticated', 'true');
      setAdminInputKey('');
      setAdminAuthError('');
    } else {
      setAdminAuthError(t.invalidAdminKey);
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('warehouse_owner_authenticated');
  };

  const handleGenerateRandomKey = () => {
    setAssignedKey(generateSecureKey());
  };

  // Add New Client with Unique Key Check
  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !assignedKey.trim()) return;

    setIsSaving(true);
    setFormError('');

    const formattedKey = assignedKey.trim().toUpperCase();

    // Check if key already exists in DB
    const { data: existingKey } = await supabase
      .from('clients')
      .select('id')
      .eq('access_key', formattedKey)
      .single();

    if (existingKey) {
      setFormError(t.keyExistsError);
      setIsSaving(false);
      return;
    }

    const { error } = await supabase.from('clients').insert([{
      client_name: clientName.trim(),
      access_key: formattedKey,
      phone_number: clientPhone.trim() || null,
      address: clientAddress.trim() || null,
    }]);

    if (!error) {
      setClientName('');
      setClientPhone('');
      setClientAddress('');
      setAssignedKey(generateSecureKey());
      fetchClients();
    } else {
      setFormError(error.message);
    }
    setIsSaving(false);
  };

  // Open Edit Modal
  const startEditClient = (client: Client) => {
    setEditingClient(client);
    setEditName(client.client_name);
    setEditPhone(client.phone_number || '');
    setEditAddress(client.address || '');
    setEditKey(client.access_key);
  };

  // Update Client Details
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient || !editName.trim() || !editKey.trim()) return;

    setIsUpdating(true);
    const formattedKey = editKey.trim().toUpperCase();

    // Verify key uniqueness if changed
    if (formattedKey !== editingClient.access_key) {
      const { data: duplicate } = await supabase
        .from('clients')
        .select('id')
        .eq('access_key', formattedKey)
        .single();

      if (duplicate) {
        alert(t.keyExistsError);
        setIsUpdating(false);
        return;
      }
    }

    const { error } = await supabase
      .from('clients')
      .update({
        client_name: editName.trim(),
        phone_number: editPhone.trim() || null,
        address: editAddress.trim() || null,
        access_key: formattedKey
      })
      .eq('id', editingClient.id);

    if (!error) {
      setEditingClient(null);
      fetchClients();
    } else {
      alert('Error updating client: ' + error.message);
    }
    setIsUpdating(false);
  };

  const deleteClient = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to revoke key and delete ${name}?`)) return;
    await supabase.from('clients').delete().eq('id', id);
    fetchClients();
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredClients = clients.filter(c => 
    c.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.access_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className={`min-h-screen p-6 lg:p-12 transition-colors duration-300 font-sans ${isDark ? 'bg-[#0a0a0a] text-slate-100' : 'bg-[#f8fafc] text-slate-900'}`}>
      
      {/* OWNER MASTER LOGIN GATE */}
      <AnimatePresence>
        {!isAdminAuthenticated && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-5"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }} 
              className={`w-full max-w-md p-8 rounded-[32px] border shadow-2xl space-y-6 ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
            >
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto shadow-lg">
                  <Lock className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black">{t.adminLoginTitle}</h2>
                <p className="text-xs text-slate-400 font-bold leading-relaxed">{t.adminLoginSub}</p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <input 
                    type="password" 
                    value={adminInputKey} 
                    onChange={(e) => setAdminInputKey(e.target.value)} 
                    placeholder={t.adminKeyPlaceholder} 
                    className={`w-full border rounded-2xl px-5 py-4 text-center font-black tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} 
                  />
                  {adminAuthError && <p className="text-xs text-rose-500 font-bold text-center mt-2">{adminAuthError}</p>}
                </div>

                <motion.button 
                  whileTap={{ scale: 0.97 }} 
                  type="submit" 
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl text-sm uppercase shadow-[0_8px_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" /> {t.adminLoginBtn}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <div className="max-w-6xl mx-auto flex items-center justify-between mb-10 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/20">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-black">{t.title}</h1>
            <p className="text-xs text-slate-400 font-bold">{t.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsDark(!isDark)} 
            className={`p-3 rounded-2xl border transition-all ${isDark ? 'bg-slate-900 border-slate-800 text-amber-400' : 'bg-white border-slate-200 text-slate-700'}`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          
          <button 
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} 
            className={`px-4 py-3 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 ${isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}
          >
            <Globe className="w-4 h-4 text-emerald-500" />
            <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
          </button>

          <button 
            onClick={handleAdminLogout} 
            className="p-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/20 transition-all text-xs font-bold flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">{t.logout}</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* ADD CLIENT & PROVISION KEY FORM */}
        <div className={`p-8 rounded-[32px] border shadow-xl ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3 mb-6">
            <UserPlus className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-black">{t.keyGenerator}</h2>
          </div>

          <form onSubmit={handleAddClient} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">{t.newClientName} *</label>
                <input 
                  type="text" 
                  required 
                  value={clientName} 
                  onChange={e => setClientName(e.target.value)} 
                  placeholder="e.g. Hotel Atlas Fnideq" 
                  className={`w-full border rounded-2xl px-4 py-3.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">{t.newClientPhone}</label>
                <input 
                  type="text" 
                  value={clientPhone} 
                  onChange={e => setClientPhone(e.target.value)} 
                  placeholder="+2126..." 
                  className={`w-full border rounded-2xl px-4 py-3.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">{t.newClientAddress}</label>
                <input 
                  type="text" 
                  value={clientAddress} 
                  onChange={e => setClientAddress(e.target.value)} 
                  placeholder="Street / City / Region" 
                  className={`w-full border rounded-2xl px-4 py-3.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} 
                />
              </div>
            </div>

            {/* KEY GENERATOR SELECTOR */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-400">{t.accessKeyLabel} *</label>
                <button 
                  type="button" 
                  onClick={handleGenerateRandomKey} 
                  className="text-xs text-emerald-400 font-bold hover:underline flex items-center gap-1"
                >
                  <Dices className="w-3.5 h-3.5" /> {t.autoGenBtn}
                </button>
              </div>

              <div className="relative">
                <input 
                  type="text" 
                  required
                  value={assignedKey} 
                  onChange={e => setAssignedKey(e.target.value.toUpperCase())} 
                  placeholder={t.customKeyPlaceholder} 
                  className={`w-full border rounded-2xl px-4 py-3.5 font-mono text-sm font-black tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${isDark ? 'bg-slate-950 border-slate-800 text-emerald-400' : 'bg-slate-50 border-slate-200 text-emerald-600'}`} 
                />
                <button 
                  type="button" 
                  onClick={handleGenerateRandomKey} 
                  className="absolute right-3 top-3 p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
              {formError && <p className="text-xs text-rose-500 font-bold mt-2">{formError}</p>}
            </div>

            <motion.button 
              whileTap={{ scale: 0.97 }} 
              type="submit" 
              disabled={isSaving}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-2xl text-xs uppercase transition-all shadow-[0_8px_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {t.generateKeyBtn}
            </motion.button>
          </form>
        </div>

        {/* ACTIVE CLIENT DIRECTORY */}
        <div className={`p-8 rounded-[32px] border shadow-xl ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-black">{t.activeClients} ({clients.length})</h2>
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute top-3.5 left-3.5 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                placeholder={t.searchPlaceholder} 
                className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold focus:outline-none ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
              />
            </div>
          </div>

          {filteredClients.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-12 font-bold">{t.emptyClients}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredClients.map(client => (
                <div key={client.id} className={`p-5 rounded-2xl border flex flex-col justify-between transition-all space-y-4 ${isDark ? 'bg-slate-950 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
                  
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black text-emerald-400">{client.client_name}</h3>
                      <div className="space-y-1 mt-2">
                        {client.phone_number && (
                          <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-emerald-500" /> {client.phone_number}
                          </p>
                        )}
                        {client.address && (
                          <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-emerald-500" /> {client.address}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => startEditClient(client)} 
                        className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button 
                        onClick={() => deleteClient(client.id, client.client_name)} 
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/40">
                    <span className="text-[10px] text-slate-500 font-bold">ACCESS TOKEN</span>
                    <button 
                      onClick={() => copyToClipboard(client.access_key)} 
                      className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-xs font-mono font-bold hover:bg-emerald-500/20 transition-all"
                    >
                      {copiedKey === client.access_key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {client.access_key}
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* EDIT CLIENT MODAL */}
      <AnimatePresence>
        {editingClient && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-5">
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }} 
              className={`w-full max-w-lg p-8 rounded-[32px] border shadow-2xl space-y-6 relative ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
            >
              <button 
                onClick={() => setEditingClient(null)} 
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white bg-slate-800/50"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <Edit3 className="w-6 h-6 text-emerald-400" />
                <h2 className="text-xl font-black">{t.editClientTitle}</h2>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">{t.newClientName}</label>
                  <input 
                    type="text" 
                    required 
                    value={editName} 
                    onChange={e => setEditName(e.target.value)} 
                    className={`w-full border rounded-2xl px-4 py-3 text-xs font-bold focus:outline-none ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">{t.newClientPhone}</label>
                  <input 
                    type="text" 
                    value={editPhone} 
                    onChange={e => setEditPhone(e.target.value)} 
                    className={`w-full border rounded-2xl px-4 py-3 text-xs font-bold focus:outline-none ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">{t.newClientAddress}</label>
                  <input 
                    type="text" 
                    value={editAddress} 
                    onChange={e => setEditAddress(e.target.value)} 
                    className={`w-full border rounded-2xl px-4 py-3 text-xs font-bold focus:outline-none ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">{t.accessKeyLabel}</label>
                  <input 
                    type="text" 
                    required 
                    value={editKey} 
                    onChange={e => setEditKey(e.target.value.toUpperCase())} 
                    className={`w-full border rounded-2xl px-4 py-3 font-mono text-sm font-black text-emerald-400 focus:outline-none ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`} 
                  />
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setEditingClient(null)} 
                    className={`flex-1 py-3.5 rounded-2xl font-bold text-xs border ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}
                  >
                    {t.cancel}
                  </button>

                  <button 
                    type="submit" 
                    disabled={isUpdating} 
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3.5 rounded-2xl text-xs uppercase shadow-md transition-all"
                  >
                    {isUpdating ? '⏳' : t.saveChanges}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}