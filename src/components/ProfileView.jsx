import { motion } from 'framer-motion';
import { Mail, MapPin, Hash, LogOut, Award, Building2, Leaf } from 'lucide-react';
import { HOSTEL } from '../lib/firebase';

export function ProfileView({ profile, totalTickets, onSignOut }) {
  const name = profile?.name || 'Student';
  const email = profile?.email || '';
  const regNo = profile?.regNo || '—';
  const initials = name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="space-y-5">
      {/* Avatar Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="clay-card p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
          className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-400 to-indigo-500 text-white font-extrabold text-2xl flex items-center justify-center mx-auto shadow-xl shadow-brand-500/25 mb-4"
        >
          {initials}
        </motion.div>

        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{name}</h2>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mt-2 border border-brand-200/40">
          <Mail className="w-3 h-3" /> {email}
        </div>
      </motion.div>

      {/* Info Grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3"
      >
        {[
          { icon: Hash, label: 'Register No', value: regNo, color: 'text-indigo-600 bg-indigo-100' },
          { icon: Building2, label: 'Hostel', value: HOSTEL.name, color: 'text-brand-600 bg-brand-100' },
          { icon: MapPin, label: 'Location', value: profile?.room ? `Room ${profile.room}, Floor ${profile.floor}` : 'Not set', color: 'text-sky-600 bg-sky-100' },
          { icon: Award, label: 'Tickets Filed', value: `${totalTickets} total`, color: 'text-amber-600 bg-amber-100' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.06 }}
            className="clay-card p-4 space-y-2"
          >
            <div className={`w-8 h-8 rounded-xl ${item.color} flex items-center justify-center`}>
              <item.icon className="w-4 h-4" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
            <p className="text-sm font-extrabold text-slate-900">{item.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* SDG Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-3 p-4 rounded-2xl bg-brand-50/60 border border-brand-200/40"
      >
        <Leaf className="w-5 h-5 text-brand-600 shrink-0" />
        <div>
          <p className="text-xs font-bold text-brand-800">SDG 11 & 12 Contributor</p>
          <p className="text-[11px] font-medium text-brand-600">Sustainable cities & responsible consumption</p>
        </div>
      </motion.div>

      {/* Sign Out */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        whileTap={{ scale: 0.97 }}
        onClick={onSignOut}
        className="w-full py-3.5 rounded-2xl bg-white border border-rose-200/60 text-rose-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-rose-50 transition-colors shadow-sm"
      >
        <LogOut className="w-4 h-4" /> Sign Out
      </motion.button>
    </div>
  );
}
