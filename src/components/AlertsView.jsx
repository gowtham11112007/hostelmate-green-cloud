import { motion } from 'framer-motion';
import { Bell, Clock, AlertTriangle, CheckCircle, ShieldCheck } from 'lucide-react';

export function AlertsView({ tickets, onTicketClick }) {
  const active = tickets.filter((t) => t.step < 4);
  const overdue = active.filter((t) => t.overdue);
  const onTrack = active.filter((t) => !t.overdue);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
        <Bell className="w-5 h-5 text-brand-600" />
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Alerts & SLA</h2>
      </motion.div>

      {active.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="p-12 rounded-3xl bg-white/60 border border-slate-200/40 text-center">
          <ShieldCheck className="w-12 h-12 text-brand-400 mx-auto mb-3" />
          <p className="font-extrabold text-slate-900">All clear!</p>
          <p className="text-xs text-slate-500 mt-1">No active alerts or overdue tickets.</p>
        </motion.div>
      ) : (
        <>
          {overdue.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Overdue ({overdue.length})
              </h3>
              {overdue.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => onTicketClick(t)}
                  className="clay-card p-4 cursor-pointer flex items-center gap-4 border-l-4 border-rose-400 hover:-translate-y-1 transition-transform"
                >
                  <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{t.title}</h4>
                    <p className="text-xs text-slate-500 font-medium">{t.shortIdText} · {t.place}</p>
                  </div>
                  <span className="status-badge bg-rose-50 text-rose-700 border border-rose-200/60 shrink-0">Overdue</span>
                </motion.div>
              ))}
            </div>
          )}

          {onTrack.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Active ({onTrack.length})
              </h3>
              {onTrack.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (overdue.length + i) * 0.06 }}
                  onClick={() => onTicketClick(t)}
                  className="clay-card p-4 cursor-pointer flex items-center gap-4 hover:-translate-y-1 transition-transform"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{t.title}</h4>
                    <p className="text-xs text-slate-500 font-medium">{t.shortIdText} · {t.place}</p>
                  </div>
                  <span className="status-badge bg-amber-50 text-amber-700 border border-amber-200/60 shrink-0">{t.slaText}</span>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
