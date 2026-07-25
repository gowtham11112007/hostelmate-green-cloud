import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ListFilter } from 'lucide-react';
import { TicketCard } from './TicketCard';

const filters = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'progress', label: 'In Progress' },
  { id: 'resolved', label: 'Resolved' },
];

export function TicketsView({ tickets, onTicketClick }) {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const filtered = tickets.filter((t) => {
    if (filter === 'open' && t.step >= 4) return false;
    if (filter === 'progress' && t.step !== 3) return false;
    if (filter === 'resolved' && t.step !== 4) return false;
    if (query) {
      const q = query.toLowerCase();
      if (![t.shortIdText, t.title, t.place, t.cat?.label].some((v) => String(v || '').toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const openCount = tickets.filter((t) => t.step < 4).length;

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <ListFilter className="w-5 h-5 text-brand-600" />
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">All Complaints</h2>
        </div>
        <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200/60 text-xs font-bold text-slate-600">
          {openCount} Open
        </span>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="relative">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tickets…"
          className="clay-input pl-11"
        />
      </motion.div>

      {/* Filter Tabs */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex p-1 rounded-2xl bg-slate-100 border border-slate-200/60">
        {filters.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
              filter === tab.id ? 'bg-white text-brand-700 shadow-md shadow-slate-200/60' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* List */}
      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 rounded-3xl bg-white/60 border border-slate-200/40 text-center">
          <p className="font-extrabold text-slate-700">No complaints found</p>
          <p className="text-xs text-slate-500 mt-1">Try a different search or filter.</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket, i) => (
            <TicketCard key={ticket.id} ticket={ticket} index={i} onClick={() => onTicketClick(ticket)} />
          ))}
        </div>
      )}
    </div>
  );
}
