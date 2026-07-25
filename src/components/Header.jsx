import { motion } from 'framer-motion';
import { Mail, MapPin } from 'lucide-react';

export function Header({ profile, hostelName }) {
  const name = profile?.name || 'Student';
  const email = profile?.email || '';
  const room = profile?.room ? `Room ${profile.room} · Floor ${profile.floor}` : hostelName;

  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-40 px-5 py-4 glass-panel shadow-sm"
    >
      <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-extrabold text-slate-900 tracking-tight truncate leading-tight">
            {name}
          </h1>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200/40">
              <Mail className="w-3 h-3" />
              {email}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500">
              <MapPin className="w-3 h-3 text-slate-400" />
              {room}
            </span>
          </div>
        </div>

        <motion.div
          whileHover={{ scale: 1.08, rotate: 3 }}
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-400 to-indigo-500 text-white font-extrabold text-sm flex items-center justify-center shadow-lg shadow-brand-500/25 shrink-0 cursor-pointer"
        >
          {initials || 'HM'}
        </motion.div>
      </div>
    </motion.header>
  );
}
