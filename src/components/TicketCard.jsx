import { motion } from 'framer-motion';
import { Clock, AlertTriangle, CheckCircle, ChevronRight, Zap, Droplet, Armchair, Sparkles, Wifi, MoreHorizontal } from 'lucide-react';

const iconMap = { Zap, Droplet, Armchair, Sparkles, Wifi, MoreHorizontal };

export function TicketCard({ ticket, onClick, index = 0 }) {
  const Icon = iconMap[ticket.cat?.icon] || MoreHorizontal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="clay-card p-5 cursor-pointer space-y-3"
    >
      {/* Top row: category + status */}
      <div className="flex items-center justify-between gap-2">
        <span
          className="status-badge shadow-sm"
          style={{ backgroundColor: ticket.cat?.bg, color: ticket.cat?.fg }}
        >
          <Icon className="w-3.5 h-3.5" />
          {ticket.cat?.label}
        </span>

        <span
          className="status-badge"
          style={{ backgroundColor: ticket.meta?.bg, color: ticket.meta?.fg }}
        >
          {ticket.meta?.label}
        </span>
      </div>

      {/* Title + location */}
      <div>
        <h4 className="font-extrabold text-slate-900 dark:text-white text-[15px] leading-snug">{ticket.title}</h4>
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1">{ticket.shortIdText} · {ticket.place}</p>
      </div>

      {/* SLA footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100/80 dark:border-slate-700/50">
        <span
          className={`status-badge ${
            ticket.overdue
              ? 'bg-rose-50 text-rose-600 border border-rose-200/60'
              : ticket.step === 4
                ? 'bg-brand-50 text-brand-700 border border-brand-200/60'
                : 'bg-amber-50 text-amber-700 border border-amber-200/60'
          }`}
        >
          {ticket.overdue ? <AlertTriangle className="w-3 h-3" /> : ticket.step === 4 ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
          {ticket.slaText}
        </span>

        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
      </div>
    </motion.div>
  );
}
