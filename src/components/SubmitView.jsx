import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, MapPin, X, AlertCircle, CheckCircle, Zap, Droplet, Armchair, Sparkles, Wifi, MoreHorizontal } from 'lucide-react';
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

  const cat = CATS[category] || CATS['Other'];

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
        block: `Floor ${floor} · ${room}`,
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
        <motion.button whileTap={{ scale: 0.95 }} onClick={onBack} className="w-10 h-10 rounded-2xl bg-white border border-slate-200/60 flex items-center justify-center text-slate-600 shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">New Complaint</h2>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Category */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">Category</label>
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
                      ? 'bg-brand-50 text-brand-800 border-2 border-brand-500 shadow-md shadow-brand-500/15'
                      : 'bg-white text-slate-500 border border-slate-200/60 hover:bg-slate-50 shadow-sm'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${sel ? 'text-brand-600' : 'text-slate-400'}`} />
                  {c.label}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Location */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">Location</label>
          <div className="clay-card p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs font-bold text-slate-500 block mb-1">Floor</span>
                <select value={floor} onChange={(e) => setFloor(e.target.value)} className="clay-input">
                  {Array.from({ length: HOSTEL.floors }, (_, i) => i + 1).map((f) => (
                    <option key={f} value={f}>Floor {f}</option>
                  ))}
                </select>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 block mb-1">Room</span>
                <input type="text" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="512" className="clay-input font-mono" />
              </div>
            </div>

            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={handleGPS}
              className="w-full p-3 rounded-xl bg-white border border-slate-200/60 flex items-center gap-3 hover:bg-slate-50 shadow-sm"
            >
              <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="text-left flex-1">
                <p className="text-xs font-bold text-slate-800">{location ? `GPS Pinned` : 'Pin GPS Location'}</p>
                <p className="text-[11px] text-slate-500">{location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Attach exact coordinates'}</p>
              </div>
              {location && <CheckCircle className="w-4 h-4 text-brand-500" />}
            </motion.button>
          </div>
        </motion.div>

        {/* Description */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">Description</label>
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
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">Photo Evidence</label>
          {photoPreview ? (
            <div className="relative rounded-2xl overflow-hidden shadow-md">
              <img src={photoPreview} alt="Preview" className="w-full h-44 object-cover" />
              <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null); }} className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/70 text-white backdrop-blur-sm">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="clay-card p-8 border-2 border-dashed border-slate-200 flex flex-col items-center gap-2 cursor-pointer text-slate-400 hover:text-brand-500 hover:border-brand-300 transition-colors">
              <Camera className="w-7 h-7" />
              <span className="text-xs font-bold">Tap to upload photo</span>
              <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
            </label>
          )}
        </motion.div>

        {/* SLA Notice */}
        <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200/60 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{cat.label} faults have a <strong>{cat.sla}-hour</strong> SLA deadline.</span>
        </div>

        {error && <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200/60">{error}</div>}
        {status && <div className="p-3.5 rounded-2xl bg-brand-50 text-brand-800 text-xs font-bold border border-brand-200/60">{status}</div>}

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
    </div>
  );
}
