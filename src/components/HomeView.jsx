import { motion } from 'framer-motion';
import { Leaf, Plus, ChevronRight, Droplets, Zap, TrendingUp } from 'lucide-react';
import { TicketCard } from './TicketCard';

export function HomeView({ eco, tickets, onNavigate, onTicketClick }) {
  const recentTickets = tickets.slice(0, 3);
  const openCount = tickets.filter((t) => t.step < 4).length;

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dashboard</h2>
        <p className="text-sm font-medium text-slate-500 mt-0.5">Your hostel at a glance</p>
      </motion.div>

      {/* Eco Impact Grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { icon: TrendingUp, label: 'Resolved', value: eco.closed, unit: '', color: 'from-brand-400 to-brand-600', shadowColor: 'shadow-brand-500/20' },
          { icon: Droplets, label: 'Water Saved', value: eco.water >= 1000 ? `${(eco.water / 1000).toFixed(1)}k` : eco.water, unit: 'L', color: 'from-sky-400 to-sky-600', shadowColor: 'shadow-sky-500/20' },
          { icon: Zap, label: 'Power Saved', value: Math.round(eco.power), unit: 'kWh', color: 'from-amber-400 to-amber-600', shadowColor: 'shadow-amber-500/20' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.08 }}
            className="clay-card p-4 text-center space-y-2"
          >
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto shadow-lg ${stat.shadowColor}`}>
              <stat.icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-slate-900">{stat.value}</span>
              {stat.unit && <span className="text-xs font-bold text-slate-400 ml-0.5">{stat.unit}</span>}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Action */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        whileHover={{ y: -2 }}
        onClick={() => onNavigate('submit')}
        className="clay-card p-5 flex items-center gap-4 cursor-pointer group"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/25 shrink-0 group-hover:shadow-brand-500/40 transition-shadow">
          <Plus className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-extrabold text-slate-900 text-[15px]">Report an Issue</h3>
          <p className="text-xs font-medium text-slate-500 mt-0.5">Electrical, plumbing, WiFi, furniture faults</p>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-brand-500 transition-colors" />
      </motion.div>

      {/* Recent Tickets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-extrabold text-slate-900">Recent Complaints</h3>
          <button
            onClick={() => onNavigate('tickets')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-0.5 transition-colors"
          >
            All ({openCount} open) <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTickets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-10 rounded-3xl bg-white/60 border border-slate-200/40 text-center"
          >
            <Leaf className="w-10 h-10 text-brand-400 mx-auto mb-3" />
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
