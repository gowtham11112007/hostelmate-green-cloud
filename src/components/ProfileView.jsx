import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Hash, LogOut, Award, Building2, Leaf, Edit2, Check, X } from 'lucide-react';
import firebase, { db, auth, HOSTEL } from '../lib/firebase';

export function ProfileView({ profile, totalTickets, onSignOut }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile?.name || '');
  const [editRegNo, setEditRegNo] = useState(profile?.regNo === '—' ? '' : profile?.regNo || '');
  const [saving, setSaving] = useState(false);

  const name = profile?.name || 'Student';
  const email = profile?.email || '';
  const regNo = profile?.regNo || '—';
  const initials = name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    try {
      const uid = auth.currentUser.uid;
      const snap = await db.collection('students').doc(uid).get();
      if (snap.exists) {
        await db.collection('students').doc(uid).update({
          name: editName.trim(),
          regNo: editRegNo.trim() || '—'
        });
      } else {
        await db.collection('students').doc(uid).set({
          name: editName.trim(),
          regNo: editRegNo.trim() || '—',
          email: auth.currentUser.email,
          role: 'student',
          createdAt: firebase.firestore.Timestamp.now()
        });
      }
      
      // Also update Firebase Auth profile
      await auth.currentUser.updateProfile({
        displayName: editName.trim()
      });
      
      setIsEditing(false);
      // Let the onSnapshot in App.jsx (or auth listener) handle the UI update, 
      // but since auth listener only fires on login, we might need to reload or let the user know.
      window.location.reload(); 
    } catch (e) {
      alert('Failed to update profile: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Avatar Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="clay-card p-8 text-center relative"
      >
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
          className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-400 to-indigo-500 text-white font-extrabold text-2xl flex items-center justify-center mx-auto shadow-xl shadow-brand-500/25 mb-4"
        >
          {initials}
        </motion.div>

        {isEditing ? (
          <div className="space-y-3 mt-4 text-left">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Full Name</label>
              <input 
                type="text" 
                value={editName} 
                onChange={(e) => setEditName(e.target.value)}
                className="clay-input py-2 text-sm"
                placeholder="e.g. John Doe"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Reg Number</label>
              <input 
                type="text" 
                value={editRegNo} 
                onChange={(e) => setEditRegNo(e.target.value)}
                className="clay-input py-2 text-sm font-mono"
                placeholder="e.g. 22CS1043"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2 rounded-xl bg-brand-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md shadow-brand-500/30"
              >
                {saving ? 'Saving...' : <><Check className="w-3.5 h-3.5" /> Save</>}
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{name}</h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold mt-2 border border-brand-200/40">
              <Mail className="w-3 h-3" /> {email}
            </div>
          </>
        )}
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
