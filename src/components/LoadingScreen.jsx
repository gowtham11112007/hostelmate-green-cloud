import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-6">
      <div className="app-bg" />
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-2xl shadow-brand-500/30"
      >
        <Leaf className="w-10 h-10 text-white" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="text-center"
      >
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">HostelMate</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Loading your portal…</p>
      </motion.div>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.4, duration: 1.5, ease: 'easeInOut' }}
        className="w-40 h-1.5 rounded-full bg-gradient-to-r from-brand-400 to-brand-600 origin-left"
      />
    </div>
  );
}
