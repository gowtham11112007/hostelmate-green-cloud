import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Siren, MapPin, Clock, CheckCircle, X } from 'lucide-react';
import { db } from '../lib/firebase';
import firebase from '../lib/firebase';

export function EmergencyBanner() {
  const [emergencies, setEmergencies] = useState([]);
  const audioRef = useRef(null);

  // Play alert sound when new emergencies arrive
  useEffect(() => {
    if (emergencies.length > 0 && !audioRef.current) {
      try {
        // Use Web Audio API for a notification beep
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.type = 'sine';
        gain.gain.value = 0.3;
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
        audioRef.current = true;
        setTimeout(() => { audioRef.current = null; }, 5000);
      } catch (_) {
        // Audio not supported — ignore
      }
    }
  }, [emergencies.length]);

  useEffect(() => {
    const processSnapshot = (snap) => {
      const active = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((e) => e.status === 'active')
        .map((e) => ({
          ...e,
          timeAgo: e.createdAt ? getTimeAgo(e.createdAt.toMillis()) : 'just now',
        }));
      // Sort client-side to ensure newest first
      active.sort((a, b) => {
        const aTime = a.createdAt ? a.createdAt.toMillis() : 0;
        const bTime = b.createdAt ? b.createdAt.toMillis() : 0;
        return bTime - aTime;
      });
      setEmergencies(active);
    };

    // Track active unsubscribe so fallback can replace it cleanly
    let activeUnsub = null;
    let isMounted = true;

    // Try ordered query first; fall back to unordered if index is missing
    activeUnsub = db.collection('emergencies')
      .orderBy('createdAt', 'desc')
      .onSnapshot(processSnapshot, (err) => {
        console.warn('Ordered emergency query failed, falling back:', err.message);
        if (!isMounted) return;
        // Fallback: listen without orderBy (no composite index needed)
        activeUnsub = db.collection('emergencies')
          .where('status', '==', 'active')
          .onSnapshot(processSnapshot, (fallbackErr) => {
            console.error('EmergencyBanner fallback listener error:', fallbackErr);
            if (!isMounted) return;
            // Final fallback: get all emergencies, filter client-side
            activeUnsub = db.collection('emergencies')
              .onSnapshot(processSnapshot, () => {});
          });
      });

    return () => {
      isMounted = false;
      if (activeUnsub) activeUnsub();
    };
  }, []);

  const handleResolve = async (id) => {
    try {
      await db.collection('emergencies').doc(id).update({
        status: 'resolved',
        resolvedAt: firebase.firestore.Timestamp.now(),
      });
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  if (emergencies.length === 0) return null;

  return (
    <div className="space-y-2">
      {emergencies.map((em, i) => (
        <motion.div
          key={em.id}
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ delay: i * 0.08 }}
          className="relative overflow-hidden rounded-2xl border-2 border-rose-400 shadow-lg shadow-rose-500/20"
        >
          {/* Animated blinking background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-rose-500 to-rose-600"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Sweeping light effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          />

          <div className="relative z-10 px-5 py-4 flex items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0"
            >
              <Siren className="w-5 h-5 text-white" />
            </motion.div>

            <div className="flex-1 min-w-0 text-white">
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm">🚨 EMERGENCY ALERT</h4>
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-white"
                />
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs font-semibold text-rose-100">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Floor {em.floor}</span>
                <span>·</span>
                <span>{em.studentName}</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {em.timeAgo}</span>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleResolve(em.id)}
              className="px-3.5 py-2 rounded-xl bg-white text-rose-600 text-xs font-extrabold flex items-center gap-1.5 shrink-0 shadow-md hover:bg-rose-50 transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Resolved
            </motion.button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function getTimeAgo(ms) {
  const diff = Date.now() - ms;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`;
  return `${Math.round(diff / 86400000)}d ago`;
}
