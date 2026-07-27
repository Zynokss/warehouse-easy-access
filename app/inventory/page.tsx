'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, Edit2, Trash2, X, Boxes, ArrowLeft, Save, RefreshCw, 
  AlertTriangle, PackageCheck, Layers, Check, Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';

interface Product { 
  id: string; 
  name: string; 
  description: string; 
  price: number; 
  category: string; 
  unit?: string; 
  image?: string; 
  stock_quantity?: number;
}

export default function InventoryAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Product>>({ 
    name: '', 
    category: '', 
    price: 0, 
    unit: '', 
    image: '', 
    description: '',
    stock_quantity: 50
  });

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setProducts(data);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openDrawer = (product?: Product) => {
    if (product) { 
      setEditingId(product.id); 
      setFormData({ ...product, stock_quantity: product.stock_quantity ?? 50 }); 
    } else { 
      setEditingId(null); 
      setFormData({ name: '', category: '', price: 0, unit: '', image: '', description: '', stock_quantity: 50 }); 
    }
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => { 
    setIsDrawerOpen(false); 
    setTimeout(() => setEditingId(null), 300); 
  };

  const handleSave = async () => {
    if (!formData.name || formData.price === undefined || !formData.category) {
      return alert("Required fields missing: Name, Category, and Price.");
    }
    
    setIsSaving(true);
    const payload = { 
      name: formData.name, 
      category: formData.category, 
      price: Number(formData.price), 
      unit: formData.unit || '', 
      image: formData.image || '', 
      description: formData.description || '',
      stock_quantity: Number(formData.stock_quantity ?? 0)
    };
    
    if (editingId) {
      const { error } = await supabase.from('products').update(payload).eq('id', editingId);
      if (!error) { 
        setProducts(products.map(p => p.id === editingId ? { ...p, ...payload } as Product : p)); 
        showToast('SKU updated successfully!');
        closeDrawer(); 
      } else {
        alert('Failed to update: ' + error.message);
      }
    } else {
      const { data, error } = await supabase.from('products').insert([payload]).select();
      if (!error && data) { 
        setProducts([data[0], ...products]); 
        showToast('New SKU added to catalog!');
        closeDrawer(); 
      } else {
        alert('Failed to create: ' + error.message);
      }
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this SKU from database?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      setProducts(products.filter(p => p.id !== id));
      showToast('SKU deleted');
    }
  };

  const lowStockCount = products.filter(p => (p.stock_quantity ?? 0) < 5).length;

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

      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[128px] pointer-events-none" />

      {/* Header Bar */}
      <header className="bg-[#0a0a0a]/80 backdrop-blur-2xl border-b border-slate-800/80 sticky top-0 z-30 px-6 py-4 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-2xl text-slate-300 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight">Inventory Terminal</h1>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">SKU Stock Control</p>
              </div>
            </div>
          </div>

          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => openDrawer()} 
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" /> New SKU
          </motion.button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8 relative z-10">
        
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-[32px] p-6 shadow-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Active SKUs</p>
              <p className="text-4xl font-black text-white">{products.length}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-slate-300 flex items-center justify-center">
              <Layers className="w-6 h-6 text-emerald-400" />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-[32px] p-6 shadow-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Low Stock Alerts</p>
              <p className={`text-4xl font-black ${lowStockCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{lowStockCount}</p>
            </div>
            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${lowStockCount > 0 ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-gradient-to-tr from-emerald-600 to-emerald-500 rounded-[32px] p-6 shadow-xl text-white flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-100 uppercase tracking-wider mb-1">Database Sync</p>
              <p className="text-2xl font-black">Live Postgres</p>
            </div>
            <div className="w-3 h-3 rounded-full bg-white animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
          </div>
        </div>

        {/* Data Filter & Table Container */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-[32px] shadow-2xl overflow-hidden">
          
          <div className="p-4 border-b border-slate-800/80 bg-slate-950/50 flex justify-between items-center gap-4">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-500" />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="Search catalog by name or category..." 
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-11 pr-4 py-2.5 text-xs font-bold text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-all" 
              />
            </div>
            <button 
              onClick={fetchProducts} 
              className="p-3 text-slate-400 hover:text-white bg-slate-900 rounded-2xl border border-slate-800 hover:bg-slate-800 transition-all"
              title="Refresh Catalog"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>

          {/* Table View */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-950/80 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product SKU</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock Level</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Price</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-500 mb-2" />
                      Loading inventory...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs font-bold text-slate-500">
                      No matching SKU items found in inventory.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(product => {
                    const isLowStock = (product.stock_quantity ?? 0) < 5;
                    return (
                      <tr key={product.id} className="hover:bg-slate-800/40 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                              {product.image ? (
                                <img src={product.image} className="w-full h-full object-contain p-1" alt="" />
                              ) : (
                                <span className="text-lg opacity-40">📦</span>
                              )}
                            </div>
                            <div>
                              <p className="font-black text-white text-sm group-hover:text-emerald-400 transition-colors">{product.name}</p>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{product.unit || 'Standard Unit'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border border-slate-700/50">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 border ${
                            isLowStock 
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {isLowStock && <AlertTriangle className="w-3 h-3" />}
                            {product.stock_quantity ?? 0} Units
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono font-black text-white text-sm" dir="ltr">
                          {product.price.toFixed(2)} <span className="text-[10px] text-slate-400 font-bold">MAD</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => openDrawer(product)} 
                              className="p-2.5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all"
                              title="Edit SKU"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(product.id)} 
                              className="p-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                              title="Delete SKU"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Editor Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={closeDrawer} 
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
            />
            <motion.aside 
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }} 
              className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 h-full shadow-2xl z-10 flex flex-col text-slate-100"
            >
              <div className="px-6 py-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                <h3 className="text-lg font-black text-white">{editingId ? 'Edit Inventory SKU' : 'Add New Catalog SKU'}</h3>
                <button onClick={closeDrawer} className="p-2 bg-slate-800 border border-slate-700 rounded-full text-slate-400 hover:text-white transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Image URL</label>
                  <input 
                    type="text" 
                    value={formData.image || ''} 
                    onChange={e => setFormData({ ...formData, image: e.target.value })} 
                    placeholder="https://..." 
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none transition-all placeholder:text-slate-600" 
                  />
                  {formData.image && (
                    <div className="mt-3 w-24 h-24 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center p-2 overflow-hidden">
                      <img src={formData.image} className="max-w-full max-h-full object-contain" alt="Preview"/>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Product Name *</label>
                  <input 
                    type="text" 
                    value={formData.name || ''} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                    placeholder="e.g. Premium Olive Oil 1L" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none transition-all placeholder:text-slate-600" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category *</label>
                    <input 
                      type="text" 
                      value={formData.category || ''} 
                      onChange={e => setFormData({ ...formData, category: e.target.value })} 
                      placeholder="e.g. Oils" 
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none transition-all placeholder:text-slate-600" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Unit / Packaging</label>
                    <input 
                      type="text" 
                      value={formData.unit || ''} 
                      onChange={e => setFormData({ ...formData, unit: e.target.value })} 
                      placeholder="e.g. 1L Glass Bottle" 
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none transition-all placeholder:text-slate-600" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Price (MAD) *</label>
                    <input 
                      type="number" 
                      value={formData.price ?? 0} 
                      onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} 
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm font-mono font-black text-emerald-400 focus:border-emerald-500 focus:outline-none transition-all" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Stock Quantity</label>
                    <input 
                      type="number" 
                      value={formData.stock_quantity ?? 0} 
                      onChange={e => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })} 
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm font-mono font-black text-white focus:border-emerald-500 focus:outline-none transition-all" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                  <textarea 
                    value={formData.description || ''} 
                    onChange={e => setFormData({ ...formData, description: e.target.value })} 
                    rows={4} 
                    placeholder="Logistical specs, weight, storage info..." 
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none transition-all placeholder:text-slate-600" 
                  />
                </div>
              </div>

              <div className="p-6 border-t border-slate-800 bg-slate-950/60">
                <motion.button 
                  whileTap={{ scale: 0.95 }} 
                  onClick={handleSave} 
                  disabled={isSaving} 
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> {editingId ? 'Update SKU' : 'Save New SKU'}</>}
                </motion.button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}