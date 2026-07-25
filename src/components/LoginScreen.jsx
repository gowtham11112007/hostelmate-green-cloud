import { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, GraduationCap, Wrench, Eye, EyeOff, ArrowRight, UserPlus, LogIn, KeyRound } from 'lucide-react';
import firebase, { auth, db, HOSTEL, STAFF_CODE } from '../lib/firebase';

export function LoginScreen({ roleMode, setRoleMode }) {
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [fullName, setFullName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [floor, setFloor] = useState(1);
  const [room, setRoom] = useState('');
  const [staffCode, setStaffCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Email and password are required.'); return; }

    setLoading(true);
    try {
      if (authMode === 'login') {
        await auth.signInWithEmailAndPassword(email, password);
      } else {
        // ── Signup validations ──
        if (roleMode === 'student') {
          if (!fullName.trim() || !regNo.trim()) { setError('Name and register number are required.'); setLoading(false); return; }
        }
        if (roleMode === 'staff') {
          if (staffCode.trim() !== STAFF_CODE) {
            setError('Invalid staff access code. Contact hostel admin for the correct code.');
            setLoading(false);
            return;
          }
        }

        const cred = await auth.createUserWithEmailAndPassword(email, password);

        // ── Store in `users` collection ──
        const userData = {
          uid: cred.user.uid,
          email: email.trim(),
          role: roleMode,
          createdAt: firebase.firestore.Timestamp.now(),
        };

        // Student-specific fields
        if (roleMode === 'student') {
          userData.name = fullName.trim();
          userData.regNo = regNo.trim();
          userData.floor = Number(floor);
          userData.room = String(room).trim();
          userData.hostel = HOSTEL.name;
        } else {
          userData.name = fullName.trim() || 'Staff';
        }

        await db.collection('users').doc(cred.user.uid).set(userData);
      }
    } catch (err) {
      const msg = err.code === 'auth/user-not-found' ? 'No account found with this email.'
        : err.code === 'auth/wrong-password' ? 'Incorrect password.'
        : err.code === 'auth/email-already-in-use' ? 'Email already registered. Try logging in.'
        : err.code === 'auth/weak-password' ? 'Password must be at least 6 characters.'
        : err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-5 relative overflow-hidden">
      <div className="app-bg" />

      {/* Decorative floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-brand-300/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-56 h-56 bg-indigo-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
          className="w-18 h-18 rounded-3xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-brand-500/30"
        >
          <Leaf className="w-9 h-9 text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">HostelMate</h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Smart Hostel Maintenance System</p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="clay-card p-7 space-y-6"
        >
          {/* Role Toggle */}
          <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
            {[
              { id: 'student', label: 'Student', icon: GraduationCap, color: 'text-brand-700' },
              { id: 'staff', label: 'Staff', icon: Wrench, color: 'text-indigo-700' },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRoleMode(r.id)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                  roleMode === r.id
                    ? `bg-white dark:bg-slate-700 ${r.color} shadow-md shadow-slate-200/50 dark:shadow-none`
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <r.icon className="w-4 h-4" />
                <span>{r.label}</span>
              </button>
            ))}
          </div>

          {/* Auth Mode Toggle */}
          <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
            {[
              { id: 'login', label: 'Log in', icon: LogIn },
              { id: 'signup', label: 'Sign up', icon: UserPlus },
            ].map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => { setAuthMode(a.id); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-[13px] font-bold flex items-center justify-center gap-2 transition-all ${
                  authMode === a.id
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <a.icon className="w-3.5 h-3.5" />
                <span>{a.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'signup' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 overflow-hidden"
              >
                {/* Name field — shown for both student and staff */}
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5 ml-1">Full Name</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={roleMode === 'staff' ? 'Admin Name' : 'Ananya Rao'} className="clay-input" />
                </div>

                {/* Student-only fields */}
                {roleMode === 'student' && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5 ml-1">Register Number</label>
                      <input type="text" value={regNo} onChange={(e) => setRegNo(e.target.value)} placeholder="22CS1043" className="clay-input font-mono" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5 ml-1">Floor</label>
                        <select value={floor} onChange={(e) => setFloor(e.target.value)} className="clay-input">
                          {Array.from({ length: HOSTEL.floors }, (_, i) => i + 1).map((f) => (
                            <option key={f} value={f}>Floor {f}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5 ml-1">Room No.</label>
                        <input type="text" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="512" className="clay-input font-mono" />
                      </div>
                    </div>
                  </>
                )}

                {/* Staff Access Code — only shown for staff signup */}
                {roleMode === 'staff' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-1.5"
                  >
                    <label className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block mb-1.5 ml-1 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5" />
                      Staff Access Code
                    </label>
                    <input
                      type="password"
                      value={staffCode}
                      onChange={(e) => setStaffCode(e.target.value)}
                      placeholder="Enter the access code"
                      className="clay-input font-mono tracking-widest"
                    />
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 ml-1">Contact hostel admin if you don't have the code.</p>
                  </motion.div>
                )}
              </motion.div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5 ml-1">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" className="clay-input" />
            </div>

            <div className="relative">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1.5 ml-1">Password</label>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="clay-input pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 bottom-3.5 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/60 text-rose-700 text-xs font-bold"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`clay-btn w-full py-4 text-sm ${
                roleMode === 'staff'
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-indigo-500/30'
                  : ''
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white" style={{ animation: 'spin-slow 0.8s linear infinite' }} />
              ) : (
                <>
                  <span>{authMode === 'login' ? 'Log In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-xs font-medium text-slate-400 mt-6">
          {HOSTEL.name} · SDG 11 &amp; 12 Aligned
        </p>
      </motion.div>
    </div>
  );
}
