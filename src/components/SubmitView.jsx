import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Camera, MapPin, X, AlertCircle, CheckCircle, Zap, Droplet, Armchair, Sparkles, Wifi, MoreHorizontal, Wrench } from 'lucide-react';
import firebase, { CATS, HOSTEL, db, auth } from '../lib/firebase';
import { uploadPhoto } from '../lib/cloudinary';

const catIcons = { Zap, Droplet, Armchair, Sparkles, Wifi, MoreHorizontal };

export function SubmitView({ profile, onSubmitted, onBack }) {
  const [category, setCategory] = useState('Electrical');
  const [floor, setFloor] = useState(profile?.floor || 1);
  const [room, setRoom] = useState(profile?.room || '');
  const [description, setDescription] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  // ── Duplicate detection state ──
  const [duplicateTicket, setDuplicateTicket] = useState(null);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [duplicateDismissed, setDuplicateDismissed] = useState(false);
  const [confirmedSameIssue, setConfirmedSameIssue] = useState(false);

  const cat = CATS[category] || CATS['Other'];

  // ── Check for existing active ticket when category or room changes ──
  useEffect(() => {
    if (!room.trim() || !category) {
      setDuplicateTicket(null);
      return;
    }

    const block = `Floor ${floor} · ${room.trim()}`;
    setCheckingDuplicate(true);
    setDuplicateDismissed(false);
    setConfirmedSameIssue(false);

    db.collection('tickets')
      .where('category', '==', category)
      .where('block', '==', block)
      .where('status', 'in', ['assigned', 'in progress'])
      .limit(1)
      .get()
      .then((snap) => {
        if (!snap.empty) {
          setDuplicateTicket({ id: snap.docs[0].id, ...snap.docs[0].data() });
        } else {
          setDuplicateTicket(null);
        }
      })
      .catch(() => setDuplicateTicket(null))
      .finally(() => setCheckingDuplicate(false));
  }, [category, floor, room]);

  const handlePhoto = (e) => {
    const f = e.target.files[0];
    if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)); }
  };

  const handleGPS = () => {
    if (!navigator.geolocation) { setError('Geolocation not supported'); return; }
    setStatus('Getting GPS…');
    navigator.geolocation.getCurrentPosition(
      (p) => { setLocation({ lat: p.coords.latitude, lng: p.coords.longitude }); setStatus(`GPS: ${p.coords.latitude.toFixed(4)}, ${p.coords.longitude.toFixed(4)}`); },
      (e) => setError('GPS error: ' + e.message),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) { setError('Session expired.'); return; }
    if (!room || !description.trim()) { setError('Room and description are required.'); return; }

    setLoading(true); setError(''); setStatus('Submitting…');
    try {
      let imageUrl = null;
      if (photoFile) { setStatus('Uploading photo…'); imageUrl = await uploadPhoto(photoFile); }

      const now = firebase.firestore.Timestamp.now();
      await db.collection('tickets').add({
        studentId: auth.currentUser.uid,
        studentEmail: auth.currentUser.email,
        studentName: profile?.name || 'Student',
        regNo: profile?.regNo || '—',
        category, floor: Number(floor), room: String(room).trim(),
        block: `Floor ${floor} · ${room.trim()}`,
        description: description.trim(),
        imageUrl, geoPoint: location,
        priorityScore: 60, status: 'submitted',
        assignedStaffId: null, vendorId: 'woodline', vendorName: 'Woodline Furnishing',
        rating: null,
        slaDeadline: firebase.firestore.Timestamp.fromMillis(now.toMillis() + cat.sla * 3600000),
        createdAt: now, assignedAt: null, resolvedAt: null,
      });
      onSubmitted();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); setStatus(''); }
  };

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.95 }} onClick={onBack} className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">New Complaint</h2>
      </motion.div>

      {/* ── "Already being fixed" interstitial ── */}
      <AnimatePresence>
        {duplicateTicket && !duplicateDismissed && !confirmedSameIssue && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            className="clay-card p-6 border-l-4 border-l-amber-400 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
                <Wrench className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Already Being Fixed</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">A matching issue is currently being handled</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800/40">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="status-badge shadow-sm" style={{ backgroundColor: cat.bg, color: cat.fg }}>
                  {cat.label}
                </span>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-500/20 px-2 py-0.5 rounded-full">Being fixed</span>
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-2">
                Floor {duplicateTicket.floor} · Room {duplicateTicket.room}
              </p>
            </div>

            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Is this the same issue you wanted to report?</p>

            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setConfirmedSameIssue(true)}
                className="flex-1 py-3 rounded-xl bg-brand-50 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400 text-xs font-bold border border-brand-200/60 dark:border-brand-500/30 hover:bg-brand-100 dark:hover:bg-brand-500/30 transition-colors"
              >
                Yes, same issue
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setDuplicateDismissed(true)}
                className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200/60 dark:border-slate-600/60 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                No, different issue
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Confirmed same issue ── */}
      <AnimatePresence>
        {confirmedSameIssue && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="clay-card p-8 text-center space-y-4"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-14 h-14 rounded-2xl bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center mx-auto"
            >
              <CheckCircle className="w-7 h-7 text-brand-600 dark:text-brand-400" />
            </motion.div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Already Being Handled</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              The maintenance team is already working on this {cat.label.toLowerCase()} issue. No need to submit again!
            </p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onBack}
              className="clay-btn w-full py-3 text-sm mt-2"
            >
              Back to Home
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Normal submission form (hidden when duplicate is shown or confirmed same) ── */}
      {!confirmedSameIssue && (duplicateDismissed || !duplicateTicket) && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-3">Category</label>
            <div className="grid grid-cols-3 gap-2.5">
              {Object.entries(CATS).map(([key, c]) => {
                const Icon = catIcons[c.icon] || MoreHorizontal;
                const sel = key === category;
                return (
                  <motion.button
                    type="button"
                    key={key}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCategory(key)}
                    className={`p-3.5 rounded-2xl flex flex-col items-center gap-2 text-xs font-bold transition-all duration-200 ${
                      sel
                        ? 'bg-brand-50 dark:bg-brand-500/20 text-brand-800 dark:text-brand-300 border-2 border-brand-500 shadow-md shadow-brand-500/15'
                        : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${sel ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    {c.label}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Location */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-3">Location</label>
            <div className="clay-card p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Floor</span>
                  <select value={floor} onChange={(e) => setFloor(e.target.value)} className="clay-input">
                    {Array.from({ length: HOSTEL.floors }, (_, i) => i + 1).map((f) => (
                      <option key={f} value={f}>Floor {f}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Room</span>
                  <input type="text" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="512" className="clay-input font-mono" />
                </div>
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={handleGPS}
                className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm"
              >
                <div className="w-8 h-8 rounded-xl bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{location ? `GPS Pinned` : 'Pin GPS Location'}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Attach exact coordinates'}</p>
                </div>
                {location && <CheckCircle className="w-4 h-4 text-brand-500" />}
              </motion.button>
            </div>
          </motion.div>

          {/* Duplicate check loading indicator */}
          {checkingDuplicate && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold text-center border border-slate-200/60 dark:border-slate-700/60">
              Checking for existing reports…
            </div>
          )}

          {/* Description */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-3">Description</label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what is broken or malfunctioning…"
              className="clay-input resize-none text-sm"
            />
          </motion.div>

          {/* Photo */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-3">Photo Evidence</label>
            {photoPreview ? (
              <div className="relative rounded-2xl overflow-hidden shadow-md">
                <img src={photoPreview} alt="Preview" className="w-full h-44 object-cover" />
                <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null); }} className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/70 text-white backdrop-blur-sm">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="clay-card p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center gap-2 cursor-pointer text-slate-400 dark:text-slate-500 hover:text-brand-500 hover:border-brand-300 transition-colors">
                <Camera className="w-7 h-7" />
                <span className="text-xs font-bold">Tap to upload photo</span>
                <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
              </label>
            )}
          </motion.div>

          {/* SLA Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-xs font-semibold border border-amber-200/60 dark:border-amber-800/40 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{cat.label} faults have a <strong>{cat.sla}-hour</strong> SLA deadline.</span>
          </div>

          {error && <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 text-xs font-bold border border-rose-200/60 dark:border-rose-800/40">{error}</div>}
          {status && <div className="p-3.5 rounded-2xl bg-brand-50 dark:bg-brand-900/20 text-brand-800 dark:text-brand-300 text-xs font-bold border border-brand-200/60 dark:border-brand-800/40">{status}</div>}

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="clay-btn w-full py-4 text-sm"
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white" style={{ animation: 'spin-slow 0.8s linear infinite' }} />
            ) : (
              'Submit Complaint'
            )}
          </motion.button>
        </form>
      )}
    </div>
  );
}
