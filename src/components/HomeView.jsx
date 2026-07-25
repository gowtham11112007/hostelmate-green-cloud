import { motion } from 'framer-motion';
import { Siren, Plus, ChevronRight, Ticket, CheckCircle2, Building2, Clock, Sparkles } from 'lucide-react';
import { TicketCard } from './TicketCard';

export function HomeView({ tickets, profile, onNavigate, onTicketClick, onEmergency }) {
  const recentTickets = tickets.slice(0, 3);
  const openCount = tickets.filter((t) => t.step < 4).length;
  const resolvedCount = tickets.filter((t) => t.step === 4).length;
  const avgHours = resolvedCount > 0
    ? Math.round(tickets.filter((t) => t.resolvedAt && t.createdAt).reduce((sum, t) => {
        const created = t.createdAt?.toMillis?.() || 0;
        const resolved = t.resolvedAt?.toMillis?.() || 0;
        return sum + (resolved - created);
      }, 0) / resolvedCount / 3600000) || '—'
    : '—';

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Good Morning' : greetingHour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="space-y-6">
      {/* Greeting with animated wave */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          {greeting}
          <motion.span
            animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
            className="inline-block origin-[70%_70%]"
          >
            👋
          </motion.span>
        </h2>
        <p className="text-sm font-medium text-slate-500 mt-0.5">Here's what's happening today</p>
      </motion.div>

      {/* 🚨 Emergency Alert Button */}
      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.97 }}
        onClick={onEmergency}
        className="w-full p-4 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 text-white flex items-center gap-4 shadow-lg shadow-rose-500/25 relative overflow-hidden group"
      >
        {/* Sweeping shine */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />

        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 relative z-10"
        >
          <Siren className="w-5 h-5" />
        </motion.div>
        <div className="text-left relative z-10 flex-1">
          <h3 className="font-extrabold text-sm">Emergency Alert</h3>
          <p className="text-xs text-rose-100 font-medium">Health emergency? Tap to alert staff instantly</p>
        </div>
        <ChevronRight className="w-5 h-5 text-rose-200 group-hover:translate-x-1 transition-transform relative z-10" />
      </motion.button>

      {/* Stats Grid — replaced water/power with useful info */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { icon: Ticket, label: 'Active', value: openCount, color: 'from-amber-400 to-orange-500', shadow: 'shadow-orange-500/20', textColor: 'text-amber-600' },
          { icon: CheckCircle2, label: 'Resolved', value: resolvedCount, color: 'from-brand-400 to-brand-600', shadow: 'shadow-brand-500/20', textColor: 'text-brand-600' },
          { icon: Clock, label: 'Avg Time', value: avgHours, unit: avgHours !== '—' ? 'hrs' : '', color: 'from-violet-400 to-violet-600', shadow: 'shadow-violet-500/20', textColor: 'text-violet-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.85, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.18 + i * 0.08, type: 'spring', stiffness: 200, damping: 15 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="clay-card p-4 text-center space-y-2.5 cursor-default"
          >
            <motion.div
              whileHover={{ rotate: 12, scale: 1.1 }}
              className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto shadow-lg ${stat.shadow}`}
            >
              <stat.icon className="w-4.5 h-4.5 text-white" />
            </motion.div>
            <div>
              <span className={`text-2xl font-extrabold ${stat.textColor}`}>{stat.value}</span>
              {stat.unit && <span className="text-xs font-bold text-slate-400 ml-0.5">{stat.unit}</span>}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Action — Report an Issue */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        onClick={() => onNavigate('submit')}
        className="clay-card p-5 flex items-center gap-4 cursor-pointer group relative overflow-hidden"
      >
        {/* Animated gradient border shimmer */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, transparent 50%, rgba(99,102,241,0.08) 100%)',
          }}
        />

        <motion.div
          whileHover={{ rotate: 90 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/25 shrink-0 relative z-10"
        >
          <Plus className="w-5 h-5 text-white" />
        </motion.div>
        <div className="flex-1 relative z-10">
          <h3 className="font-extrabold text-slate-900 text-[15px]">Report an Issue</h3>
          <p className="text-xs font-medium text-slate-500 mt-0.5">Electrical, plumbing, WiFi, furniture faults</p>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all relative z-10" />
      </motion.div>

      {/* Hostel Quick Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.34 }}
        className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 to-violet-50/80 border border-indigo-200/40 flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-extrabold text-indigo-900">Krishna Hostel</p>
          <p className="text-[11px] font-medium text-indigo-600">
            {profile?.room ? `Room ${profile.room} · Floor ${profile.floor}` : '8 Floors · 240 Rooms'}
            {' · '}
            {tickets.length} total tickets filed
          </p>
        </div>
        <Sparkles className="w-4 h-4 text-indigo-400" />
      </motion.div>

      {/* Recent Tickets */}
      <div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.38 }}
          className="flex items-center justify-between mb-4"
        >
          <h3 className="text-base font-extrabold text-slate-900">Recent Complaints</h3>
          <button
            onClick={() => onNavigate('tickets')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-0.5 transition-colors"
          >
            All ({openCount} open) <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>

        {recentTickets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="p-10 rounded-3xl bg-white/60 border border-slate-200/40 text-center"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <CheckCircle2 className="w-12 h-12 text-brand-400 mx-auto mb-3" />
            </motion.div>
            <p className="font-extrabold text-slate-800 text-sm">All clear!</p>
            <p className="text-xs text-slate-500 mt-1">No active complaints right now.</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {recentTickets.map((ticket, i) => (
              <TicketCard key={ticket.id} ticket={ticket} index={i} onClick={() => onTicketClick(ticket)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
