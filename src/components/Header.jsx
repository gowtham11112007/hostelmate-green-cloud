import { motion } from 'framer-motion';
import { Mail, MapPin, Hash, User, Moon, Sun } from 'lucide-react';

export function Header({ profile, hostelName, isDark, setIsDark }) {
  const name = profile?.name || 'Student';
  const email = profile?.email || '';
  const regNo = profile?.regNo && profile.regNo !== '—' ? profile.regNo : null;
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
        {/* Left Side: Greeting / Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight truncate leading-tight flex items-center gap-2">
            {name}
          </h1>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {/* Show RegNo if available, else show email */}
            {regNo ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200/40">
                <Hash className="w-3 h-3" />
                {regNo}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200/40">
                <Mail className="w-3 h-3" />
                {email}
              </span>
            )}
            
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500">
              <MapPin className="w-3 h-3 text-slate-400" />
              {room}
            </span>
          </div>
        </div>

        {/* Right Side: Toggles & Avatar */}
        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => setIsDark(!isDark)}
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-amber-400 flex items-center justify-center border border-slate-200/60 dark:border-slate-700/60 shadow-inner transition-colors"
          >
            <motion.div
              initial={false}
              animate={{ rotate: isDark ? 360 : 0, scale: isDark ? 1.1 : 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            >
              {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-5 h-5" />}
            </motion.div>
          </motion.button>

          {/* Avatar */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center shadow-lg shadow-brand-500/25 shrink-0 cursor-pointer"
          >
            {initials || <User className="w-4 h-4" />}
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
