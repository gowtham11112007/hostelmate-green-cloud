import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Clock, Wrench, Image } from 'lucide-react';
import { STEPS, STEP_META } from '../lib/firebase';

export function TicketDetailView({ ticket, onBack, onOpenLightbox }) {
  if (!ticket) return null;

  return (
    <div className="space-y-5">
      {/* Back + ID */}
      <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="w-10 h-10 rounded-2xl bg-white border border-slate-200/60 flex items-center justify-center text-slate-600 hover:bg-slate-50 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        <div>
          <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">{ticket.shortIdText}</h3>
          <p className="text-xs font-semibold text-slate-400">{ticket.place}</p>
        </div>
      </motion.div>

      {/* Info Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="clay-card p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <span className="status-badge shadow-sm" style={{ backgroundColor: ticket.cat?.bg, color: ticket.cat?.fg }}>
            {ticket.cat?.label}
          </span>
          <span className="status-badge" style={{ backgroundColor: ticket.meta?.bg, color: ticket.meta?.fg }}>
            {ticket.meta?.label}
          </span>
        </div>

        <div>
          <h2 className="text-lg font-extrabold text-slate-900 leading-snug">{ticket.title}</h2>
          <p className="text-sm font-medium text-slate-600 leading-relaxed mt-2">{ticket.description}</p>
        </div>

        {ticket.imageUrl && (
          <div className="pt-3 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1"><Image className="w-3 h-3" /> Photo Evidence</p>
            <motion.img
              whileHover={{ scale: 1.03 }}
              src={ticket.imageUrl}
              alt="Evidence"
              onClick={() => onOpenLightbox(ticket.imageUrl)}
              className="w-full h-40 object-cover rounded-2xl cursor-pointer shadow-md border border-slate-200/60"
            />
          </div>
        )}
      </motion.div>

      {/* Timeline */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="clay-card p-6 space-y-5">
        <h4 className="font-extrabold text-slate-900 text-sm">Ticket Lifecycle</h4>

        <div className="relative pl-8 space-y-6">
          {/* Vertical line */}
          <div className="absolute left-[13px] top-1 bottom-1 w-0.5 bg-slate-200 rounded-full" />

          {STEPS.map((stepKey, idx) => {
            const stepNum = idx + 1;
            const isDone = stepNum < ticket.step || (ticket.step === 4 && stepNum === 4);
            const isNow = stepNum === ticket.step && ticket.step < 4;

            return (
              <motion.div
                key={stepKey}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.08 }}
                className="relative flex items-start gap-3"
              >
                {/* Dot on timeline */}
                <div
                  className={`absolute -left-8 w-7 h-7 rounded-full text-xs font-extrabold flex items-center justify-center z-10 ${
                    isDone
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                      : isNow
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 animate-pulse-glow'
                        : 'bg-slate-200 text-slate-500'
                  }`}
                  style={isNow ? { boxShadow: '0 0 12px rgba(245, 158, 11, 0.4)' } : {}}
                >
                  {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : isNow ? <Wrench className="w-3.5 h-3.5" /> : stepNum}
                </div>

                <div className={`pt-0.5 ${!isDone && !isNow ? 'opacity-40' : ''}`}>
                  <p className="text-sm font-extrabold text-slate-900">{STEP_META[stepKey].label}</p>
                  <p className="text-xs text-slate-500 font-medium">
                    {isDone ? 'Completed' : isNow ? 'Currently active' : 'Pending'}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
