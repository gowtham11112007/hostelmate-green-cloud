import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Siren, X, ChevronUp, ChevronDown, Send, ShieldAlert } from 'lucide-react';
import firebase, { db, auth, HOSTEL } from '../lib/firebase';

export function EmergencyAlert({ profile, onClose }) {
  const [floor, setFloor] = useState(profile?.floor || 1);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!auth.currentUser) return;
    setSending(true);
    try {
      await db.collection('emergencies').add({
        studentId: auth.currentUser.uid,
        studentName: profile?.name || 'Student',
        studentEmail: auth.currentUser.email,
        room: profile?.room || '—',
        floor: Number(floor),
        hostel: HOSTEL.name,
        status: 'active',
        createdAt: firebase.firestore.Timestamp.now(),
      });
      setSent(true);
      setTimeout(() => onClose(), 2500);
    } catch (e) {
      alert('Failed: ' + e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-5"
    >
      {/* Pulsing red overlay */}
      <motion.div
        className="absolute inset-0 bg-rose-950/60 backdrop-blur-md"
        animate={{ opacity: [0.6, 0.8, 0.6] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.7, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.7, y: 40 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="relative z-10 w-full max-w-sm"
      >
        {sent ? (
          /* ── Success State ── */
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="rounded-3xl bg-white p-8 text-center shadow-2xl space-y-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 250, damping: 12 }}
              className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto"
            >
              <ShieldAlert className="w-8 h-8 text-emerald-600" />
            </motion.div>
            <h3 className="text-xl font-extrabold text-slate-900">Alert Sent!</h3>
            <p className="text-sm text-slate-500 font-medium">
              Staff has been notified about the emergency on <strong>Floor {floor}</strong>. Help is on the way.
            </p>
          </motion.div>
        ) : (
          /* ── Alert Form ── */
          <div className="rounded-3xl overflow-hidden shadow-2xl">
            {/* Red Header */}
            <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-6 text-center relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-rose-400/0 via-rose-300/30 to-rose-400/0"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
              <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>

              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 backdrop-blur-sm"
              >
                <Siren className="w-7 h-7 text-white" />
              </motion.div>
              <h3 className="text-xl font-extrabold text-white relative z-10">Emergency Alert</h3>
              <p className="text-xs text-rose-100 font-medium mt-1 relative z-10">Health issue or urgent emergency</p>
            </div>

            {/* Body */}
            <div className="bg-white p-6 space-y-5">
              <div className="text-center">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">Select Your Floor</label>

                <div className="flex items-center justify-center gap-4">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setFloor(Math.max(1, floor - 1))}
                    className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.button>

                  <motion.div
                    key={floor}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-50 to-rose-100 border-2 border-rose-200 flex flex-col items-center justify-center"
                  >
                    <span className="text-3xl font-extrabold text-rose-600">{floor}</span>
                    <span className="text-[9px] font-bold text-rose-400 uppercase">Floor</span>
                  </motion.div>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setFloor(Math.min(HOSTEL.floors, floor + 1))}
                    className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <ChevronUp className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleSend}
                disabled={sending}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-shadow disabled:opacity-50"
              >
                {sending ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white" style={{ animation: 'spin-slow 0.8s linear infinite' }} />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Emergency Alert
                  </>
                )}
              </motion.button>

              <p className="text-[11px] text-center text-slate-400 font-medium">
                This will immediately notify all hostel staff on duty.
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
