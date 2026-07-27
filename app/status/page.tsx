'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Clock, CheckCircle2, PackageCheck, AlertCircle, 
  ArrowLeft, KeyRound, Hash, ShoppingBag, Loader2, Sparkles, XCircle
} from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function OrderStatusPage() {
  const [orderId, setOrderId] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clean user input (remove leading #, lowercase, trim whitespace)
    const cleanOrderId = orderId.replace(/^#/, '').trim().toLowerCase();

    if (!cleanOrderId) return;

    setLoading(true);
    setError('');
    setOrder(null);

    // Fetch orders and match in memory to avoid Postgres UUID type mismatches
    const { data: allOrders, error: fetchErr } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchErr) {
      setError('Database connection error. Please try again.');
      setLoading(false);
      return;
    }

    // Find matching order by ID prefix or inclusion
    const foundOrder = allOrders?.find((o) => 
      o.id.toLowerCase().startsWith(cleanOrderId) || 
      o.id.toLowerCase().includes(cleanOrderId)
    );

    if (!foundOrder) {
      setError('Order not found. Please verify your Order ID.');
    } else {
      // Validate optional access key
      if (
        accessKey.trim() && 
        foundOrder.client_access_key && 
        foundOrder.client_access_key.toLowerCase() !== accessKey.trim().toLowerCase()
      ) {
        setError('Access key does not match this order manifest.');
      } else {
        setOrder(foundOrder);
      }
    }
    setLoading(false);
  };

  const getStepStatus = (step: 'received' | 'dispatched' | 'complete') => {
    if (!order) return 'inactive';
    if (order.status === 'cancelled') return step === 'received' ? 'active' : 'cancelled';

    if (step === 'received') return 'completed';
    if (step === 'dispatched') return order.status === 'fulfilled' ? 'completed' : 'active';
    if (step === 'complete') return order.status === 'fulfilled' ? 'completed' : 'inactive';

    return 'inactive';
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden selection:bg-emerald-500/30">
      
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-xl w-full space-y-6 relative z-10"
      >
        
        {/* Navigation Link */}
        <div className="flex items-center justify-between">
          <Link 
            href="/catalog" 
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-emerald-400 transition-colors group px-3 py-1.5 rounded-xl hover:bg-slate-900/60 border border-transparent hover:border-slate-800"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
            <span>Back to Catalog</span>
          </Link>
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-400/80 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            <Sparkles className="w-3 h-3 animate-pulse" /> Live Dispatch
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/90 border border-slate-800/80 backdrop-blur-2xl rounded-[32px] p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-6" dir="ltr">
          
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Track Requisition</h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">Enter your order manifest details to monitor real-time fulfillment.</p>
          </div>

          <form onSubmit={handleLookup} className="space-y-3.5">
            <div className="relative">
              <Hash className="w-4 h-4 absolute left-4 top-4 text-slate-500" />
              <input 
                type="text" 
                value={orderId} 
                onChange={(e) => setOrderId(e.target.value)} 
                placeholder="Order ID (e.g. 9A794EAB or #9A794EAB)" 
                className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl pl-11 pr-5 py-3.5 text-xs sm:text-sm font-mono font-bold focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 transition-all text-white placeholder:text-slate-600"
                dir="ltr"
              />
            </div>

            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-4 top-4 text-slate-500" />
              <input 
                type="text" 
                value={accessKey} 
                onChange={(e) => setAccessKey(e.target.value)} 
                placeholder="Client Access Key (Optional Verification)" 
                className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl pl-11 pr-5 py-3.5 text-xs sm:text-sm font-mono font-bold focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 transition-all text-white placeholder:text-slate-600"
                dir="ltr"
              />
            </div>

            <motion.button 
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={loading} 
              className="w-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-black py-4 rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Scanning Database...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" /> 
                  <span>Search Order Status</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-xs font-bold flex items-center gap-3" dir="ltr">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" /> 
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Order Found Breakdown */}
          <AnimatePresence>
            {order && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="border-t border-slate-800/80 pt-6 space-y-6"
                dir="ltr"
              >
                {/* Meta Summary */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Wholesale Account</span>
                    <span className="text-sm font-black text-emerald-400">{order.client_name || 'Anonymous Client'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Total Amount</span>
                    <span className="text-base font-black text-white font-mono" dir="ltr">
                      {order.total_amount?.toFixed(2)} <span className="text-xs font-bold text-slate-400">MAD</span>
                    </span>
                  </div>
                </div>

                {/* Animated Status Stepper */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-black text-slate-400 uppercase tracking-wider px-1">
                    <span>Order Progress</span>
                    <span className={`px-2 py-0.5 rounded-md ${
                      order.status === 'fulfilled' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      order.status === 'cancelled' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {/* Step 1: Received */}
                    <div className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      getStepStatus('received') === 'completed' || getStepStatus('received') === 'active'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/5'
                        : 'bg-slate-950/40 border-slate-800 text-slate-600'
                    }`}>
                      <Clock className="w-4 h-4" />
                      <span className="text-[11px] font-bold">Received</span>
                    </div>

                    {/* Step 2: Dispatched */}
                    <div className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      getStepStatus('dispatched') === 'completed'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/5'
                        : getStepStatus('dispatched') === 'cancelled'
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        : 'bg-slate-950/40 border-slate-800 text-slate-600'
                    }`}>
                      <PackageCheck className="w-4 h-4" />
                      <span className="text-[11px] font-bold">Dispatched</span>
                    </div>

                    {/* Step 3: Complete */}
                    <div className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                      order.status === 'fulfilled'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/5'
                        : order.status === 'cancelled'
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        : 'bg-slate-950/40 border-slate-800 text-slate-600'
                    }`}>
                      {order.status === 'cancelled' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      <span className="text-[11px] font-bold">{order.status === 'cancelled' ? 'Cancelled' : 'Complete'}</span>
                    </div>
                  </div>
                </div>

                {/* Manifest Itemized List */}
                {order.items && order.items.length > 0 && (
                  <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-wider border-b border-slate-800/60 pb-2">
                      <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Ordered Items ({order.items.length})</span>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {order.items.map((item: OrderItem, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-xs font-bold text-slate-300">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{item.name}</span>
                            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-md text-slate-400">x{item.quantity}</span>
                          </div>
                          <span className="font-mono text-slate-400">{(item.price * item.quantity).toFixed(2)} MAD</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </motion.div>
    </div>
  );
}