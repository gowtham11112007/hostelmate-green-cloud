import { motion } from 'framer-motion';
import { Megaphone, CalendarDays, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function AnnouncementsView({ announcements, profile }) {
  // Filter announcements relevant to this student (All floors, or matching student's floor)
  const relevant = announcements.filter(
    (a) => a.floor === 'All' || a.floor === String(profile?.floor)
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0">
          <Megaphone className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Announcements</h2>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Hostel notices and updates</p>
        </div>
      </motion.div>

      {relevant.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="p-12 rounded-3xl glass-panel text-center">
          <Megaphone className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="font-extrabold text-slate-900 dark:text-slate-200">No new announcements</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">You're all caught up!</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {relevant.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`clay-card p-5 relative overflow-hidden ${
                a.important ? 'border-l-4 border-l-rose-500' : 'border-l-4 border-l-brand-500'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {a.important && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 text-[10px] font-extrabold uppercase tracking-wider animate-pulse">
                        Important
                      </span>
                    )}
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {a.createdAt ? formatDistanceToNow(a.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 ml-2">
                      <MapPin className="w-3 h-3" />
                      {a.floor === 'All' ? 'All Floors' : `Floor ${a.floor}`}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {a.message}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-3 uppercase tracking-wider">
                    Posted by {a.author}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
