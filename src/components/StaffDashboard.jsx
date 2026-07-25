import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Search, AlertTriangle, Download } from 'lucide-react';
import firebase, { db, HOSTEL, CATS } from '../lib/firebase';
import { EmergencyBanner } from './EmergencyBanner';

export function StaffDashboard({ onOpenLightbox, onSignOut }) {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('queue');
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [announcementFloor, setAnnouncementFloor] = useState('All');
  const [isImportant, setIsImportant] = useState(false);

  useEffect(() => {
    const unsub = db.collection('tickets').orderBy('createdAt', 'desc').onSnapshot((snap) => {
      setTickets(snap.docs.map((d) => {
        const data = d.data();
        const cat = CATS[data.category] || CATS['Other'];
        const created = data.createdAt ? data.createdAt.toMillis() : Date.now();
        const deadline = data.slaDeadline ? data.slaDeadline.toMillis() : created + cat.sla * 3600000;
        const overdue = data.status !== 'resolved' && Date.now() > deadline;
        return { id: d.id, ...data, cat, created, deadline, overdue, title: (data.description || '').split('\n')[0].slice(0, 50) || `${cat.label} issue` };
      }));
    });
    return () => unsub();
  }, []);

  const handleStatus = async (id, status) => {
    const patch = { status };
    const now = firebase.firestore.Timestamp.now();
    if (status === 'resolved') patch.resolvedAt = now;
    if (status === 'assigned') patch.assignedAt = now;
    try { await db.collection('tickets').doc(id).update(patch); } catch (e) { alert(e.message); }
  };

  const handleExport = () => {
    const rows = [['Name', 'Reg No', 'Category', 'Room', 'Status', 'Overdue'].join(',')];
    tickets.forEach((t) => rows.push([t.studentName || 'Student', t.regNo || '—', t.category, t.room, t.status, t.overdue ? 'YES' : 'NO'].join(',')));
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'sla_report.csv'; a.click();
  };

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementMsg.trim()) return;
    try {
      await db.collection('announcements').add({
        message: announcementMsg.trim(),
        floor: announcementFloor,
        important: isImportant,
        author: 'Hostel Admin',
        createdAt: firebase.firestore.Timestamp.now()
      });
      setAnnouncementMsg('');
      setAnnouncementFloor('All');
      setIsImportant(false);
      alert('Announcement posted successfully!');
    } catch (e) {
      alert(e.message);
    }
  };

  const filtered = tickets.filter((t) => {
    if (filter === 'open' && t.status === 'resolved') return false;
    if (filter === 'resolved' && t.status !== 'resolved') return false;
    if (filter === 'breach' && !t.overdue) return false;
    if (query) {
      const q = query.toLowerCase();
      if (![t.id, t.room, t.description, t.category, t.studentName].some((v) => String(v || '').toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const stats = {
    open: tickets.filter((t) => t.status !== 'resolved').length,
    breach: tickets.filter((t) => t.overdue).length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
    total: tickets.length,
  };

  return (
    <div className="min-h-dvh relative">
      <div className="app-bg" />

      {/* Header */}
      <header className="sticky top-0 z-40 glass-panel shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight">Staff Console</h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{HOSTEL.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onSignOut} className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm">Sign Out</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Emergency Banner */}
        <AnimatePresence>
          <EmergencyBanner />
        </AnimatePresence>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Open', value: stats.open, color: 'text-slate-900 dark:text-white' },
            { label: 'SLA Breached', value: stats.breach, color: 'text-rose-600 dark:text-rose-400' },
            { label: 'Resolved', value: stats.resolved, color: 'text-brand-600 dark:text-brand-400' },
            { label: 'Total', value: stats.total, color: 'text-slate-900 dark:text-white' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="clay-card p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{s.label}</p>
              <p className={`text-3xl font-extrabold mt-1 ${s.color}`}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs + Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex p-1 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
            {['queue', 'sla', 'announcements'].map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-xl text-xs font-bold capitalize transition-all ${tab === t ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                {t === 'sla' ? 'SLA Breaches' : t === 'announcements' ? 'Post Notice' : 'Live Queue'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="clay-input pl-9 py-2 text-xs w-48" />
            </div>
            <div className="flex p-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
              {['all', 'open', 'breach', 'resolved'].map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${filter === f ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 dark:text-slate-500'}`}>
                  {f}
                </button>
              ))}
            </div>
            <button onClick={handleExport} className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 shadow-sm">
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          </div>
        </div>

        {/* Queue Table */}
        {tab === 'queue' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="clay-card overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700/50">
                  <th className="px-5 py-4">Student</th>
                  <th className="px-5 py-4">Photo</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Room</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60 dark:divide-slate-700/50">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white">{t.studentName || 'Student'}</p>
                      <p className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 mt-0.5">{t.regNo || '—'}</p>
                    </td>
                    <td className="px-5 py-4">
                      {t.imageUrl ? (
                        <img src={t.imageUrl} alt="" onClick={() => onOpenLightbox(t.imageUrl)} className="w-9 h-9 object-cover rounded-xl cursor-pointer shadow-sm border border-slate-200/60 hover:scale-110 transition-transform" />
                      ) : <span className="text-xs text-slate-300 dark:text-slate-600">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      <span className="status-badge shadow-sm" style={{ backgroundColor: t.cat?.bg, color: t.cat?.fg }}>{t.category}</span>
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-900 dark:text-white">Room {t.room}</td>
                    <td className="px-5 py-4">
                      <span className={`status-badge ${t.overdue ? 'bg-rose-50 text-rose-700' : t.status === 'resolved' ? 'bg-brand-50 text-brand-700' : 'bg-amber-50 text-amber-700'}`}>
                        {t.overdue ? 'Overdue' : t.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => handleStatus(t.id, 'assigned')} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors">Assign</button>
                        <button onClick={() => handleStatus(t.id, 'in progress')} className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold hover:bg-amber-100 transition-colors">Progress</button>
                        <button onClick={() => handleStatus(t.id, 'resolved')} className="px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 text-xs font-bold hover:bg-brand-100 transition-colors">Resolve</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan="6" className="px-5 py-12 text-center text-sm font-medium text-slate-400">No tickets match your filter.</td></tr>
                )}
              </tbody>
            </table>
          </motion.div>
        )}

        {/* SLA Tab */}
        {tab === 'sla' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {tickets.filter((t) => t.overdue).length === 0 ? (
              <div className="clay-card p-12 text-center">
                <p className="font-extrabold text-slate-700 dark:text-slate-300">No SLA breaches</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">All tickets are within their deadlines.</p>
              </div>
            ) : (
              tickets.filter((t) => t.overdue).map((t, i) => (
                <motion.div key={t.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="clay-card p-5 flex items-center justify-between border-l-4 border-rose-400">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{t.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Room {t.room} · {t.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="status-badge bg-rose-50 text-rose-700"><AlertTriangle className="w-3 h-3" /> Breached</span>
                    <button onClick={() => handleStatus(t.id, 'resolved')} className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 text-xs font-bold hover:bg-brand-100">Resolve</button>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* Announcements Tab */}
        {tab === 'announcements' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="clay-card p-6 max-w-2xl">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">Post an Announcement</h2>
            <form onSubmit={handlePostAnnouncement} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5">Message</label>
                <textarea 
                  value={announcementMsg}
                  onChange={(e) => setAnnouncementMsg(e.target.value)}
                  placeholder="e.g. Water maintenance on Floor 3 today from 2 PM to 4 PM."
                  className="clay-input min-h-[100px] resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5">Target Floor</label>
                  <select value={announcementFloor} onChange={(e) => setAnnouncementFloor(e.target.value)} className="clay-input py-2.5">
                    <option value="All">All Floors</option>
                    {Array.from({ length: HOSTEL.floors }, (_, i) => i + 1).map((f) => (
                      <option key={f} value={f}>Floor {f}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isImportant}
                      onChange={(e) => setIsImportant(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500"
                    />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Mark as Important (Red)</span>
                  </label>
                </div>
              </div>
              <button type="submit" className="clay-btn w-full py-3 mt-2">
                Broadcast Notice
              </button>
            </form>
          </motion.div>
        )}
      </main>
    </div>
  );
}
