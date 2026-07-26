'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Edit2, Trash2, X, Boxes, ArrowLeft, Save, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface Product { id: string; name: string; description: string; price: number; category: string; unit?: string; image?: string; }

export default function InventoryAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<Product>>({ name: '', category: '', price: 0, unit: '', image: '', description: '' });

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()));

  const openDrawer = (product?: Product) => {
    if (product) { setEditingId(product.id); setFormData({ ...product }); }
    else { setEditingId(null); setFormData({ name: '', category: '', price: 0, unit: '', image: '', description: '' }); }
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => { setIsDrawerOpen(false); setTimeout(() => setEditingId(null), 300); };

  const handleSave = async () => {
    if (!formData.name || formData.price === undefined || !formData.category) return alert("Required fields missing.");
    setIsSaving(true);
    const payload = { name: formData.name, category: formData.category, price: Number(formData.price), unit: formData.unit || '', image: formData.image || '', description: formData.description || '' };
    
    if (editingId) {
      const { error } = await supabase.from('products').update(payload).eq('id', editingId);
      if (!error) { setProducts(products.map(p => p.id === editingId ? { ...p, ...payload } as Product : p)); closeDrawer(); }
    } else {
      const { data, error } = await supabase.from('products').insert([payload]).select();
      if (!error && data) { setProducts([data[0], ...products]); closeDrawer(); }
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this SKU?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) setProducts(products.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 font-sans selection:bg-emerald-200 pb-12">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-20 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors border border-slate-200/50">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/20">
              <Boxes className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-black tracking-tight">Inventory Admin</h1>
          </div>
        </div>
        <button onClick={() => openDrawer()} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all uppercase tracking-wider">
          <Plus className="w-4 h-4" /> New SKU
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Metric Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition-all">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Active SKUs</p>
            <p className="text-4xl font-black text-slate-900">{products.length}</p>
          </div>
          <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition-all">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Categories</p>
            <p className="text-4xl font-black text-slate-900">{new Set(products.map(p => p.category)).size}</p>
          </div>
          <div className="bg-emerald-50 rounded-[32px] p-6 border border-emerald-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Database Status</p>
              <p className="text-2xl font-black text-emerald-700">Online & Synced</p>
            </div>
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
          </div>
        </div>

        {/* Data Table Area */}
        <div className="bg-white border border-slate-200/80 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div className="relative w-full max-w-sm">
              <Search className="w-5 h-5 absolute left-4 top-3 text-slate-400" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search catalog..." className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <button onClick={fetchProducts} className="p-2.5 text-slate-400 hover:text-slate-900 bg-white rounded-xl border border-slate-200 shadow-sm transition-all">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white">
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product SKU</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Price</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                          {product.image ? <img src={product.image} className="w-full h-full object-contain p-1" alt="" /> : <span className="text-lg opacity-50">📦</span>}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm group-hover:text-emerald-600 transition-colors">{product.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{product.unit || 'Standard Unit'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">{product.category}</span>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900 text-sm">
                      {product.price.toFixed(2)} <span className="text-[10px] text-slate-400 font-bold">MAD</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openDrawer(product)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Editor Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeDrawer} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col">
              <div className="px-6 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-lg font-black text-slate-900">{editingId ? 'Edit Product' : 'Add New SKU'}</h3>
                <button onClick={closeDrawer} className="p-2 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-slate-900 shadow-sm"><X className="w-4 h-4" /></button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Image URL</label>
                  <input type="text" value={formData.image || ''} onChange={e => setFormData({ ...formData, image: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:outline-none" />
                  {formData.image && <div className="mt-3 w-24 h-24 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center p-2"><img src={formData.image} className="max-w-full max-h-full object-contain" alt="Preview"/></div>}
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Product Name *</label>
                  <input type="text" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category *</label>
                    <input type="text" value={formData.category || ''} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Unit / Size</label>
                    <input type="text" value={formData.unit || ''} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Price (MAD) *</label>
                  <input type="number" value={formData.price ?? 0} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-black text-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none" />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                  <textarea value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:outline-none" />
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-white">
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleSave} disabled={isSaving} className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-[0_8px_20px_rgba(0,0,0,0.15)] transition-all">
                  {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> {editingId ? 'Update Product' : 'Save Product'}</>}
                </motion.button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}