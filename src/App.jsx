import { useState, useEffect } from 'react';
import firebase, { auth, db, HOSTEL, CATS, STEP_META } from './lib/firebase';
import { AnimatePresence, motion } from 'framer-motion';
import { AppleDock } from './components/AppleDock';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { TicketsView } from './components/TicketsView';
import { SubmitView } from './components/SubmitView';
import { AlertsView } from './components/AlertsView';
import { ProfileView } from './components/ProfileView';
import { TicketDetailView } from './components/TicketDetailView';
import { LightboxModal } from './components/LightboxModal';
import { StaffDashboard } from './components/StaffDashboard';
import { LoginScreen } from './components/LoginScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { EmergencyAlert } from './components/EmergencyAlert';

const pageVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -12, scale: 0.98, transition: { duration: 0.2 } },
};

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roleMode, setRoleMode] = useState('student');
  const [activeTab, setActiveTab] = useState('home');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [eco, setEco] = useState({ closed: 0, water: 0, power: 0 });
  const [showEmergency, setShowEmergency] = useState(false);

  // ── Auth listener ──
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setProfile(null);
        setTickets([]);
        setLoading(false);
        return;
      }
      try {
        const snap = await db.collection('students').doc(currentUser.uid).get();
        const pData = snap.exists ? snap.data() : null;
        let cleanName = 'Student';
        if (pData?.name) {
          cleanName = pData.name;
        } else if (currentUser.displayName) {
          cleanName = currentUser.displayName;
        }

        const finalProfile = {
          name: cleanName,
          email: currentUser.email || '',
          regNo: pData?.regNo || '—',
          floor: pData?.floor || null,
          room: pData?.room || '',
          role: pData?.role || roleMode,
        };
        setProfile(finalProfile);
        if (finalProfile.role === 'staff') setRoleMode('staff');
      } catch {
        setProfile({
          name: currentUser.displayName || 'Student',
          email: currentUser.email || '',
          regNo: '—',
          floor: null,
          room: '',
          role: 'student',
        });
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  // ── Tickets + Eco watcher ──
  useEffect(() => {
    if (!user || profile?.role === 'staff') return;
    const unsubTickets = db
      .collection('tickets')
      .where('studentId', '==', user.uid)
      .orderBy('createdAt', 'desc')
      .onSnapshot((snap) => {
        const docs = snap.docs.map((d) => {
          const t = d.data();
          const cat = CATS[t.category] || CATS['Other'];
          const step =
            t.status === 'resolved' ? 4 : t.status === 'in progress' ? 3 : t.status === 'assigned' ? 2 : 1;
          const meta = STEP_META[t.status] || STEP_META['submitted'];
          const created = t.createdAt ? t.createdAt.toMillis() : Date.now();
          const deadline = t.slaDeadline ? t.slaDeadline.toMillis() : created + cat.sla * 3600000;
          const overdue = step < 4 && Date.now() > deadline;
          return {
            id: d.id,
            ...t,
            cat,
            step,
            meta,
            overdue,
            shortIdText: 'KH-' + d.id.slice(-4).toUpperCase(),
            place: t.room ? `Room ${t.room} · Floor ${t.floor || '?'}` : t.block || 'Location',
            title: (t.description || '').split('\n')[0].slice(0, 60) || `${cat.label} issue`,
            slaText:
              step === 4
                ? 'Resolved'
                : overdue
                  ? 'Overdue'
                  : `${Math.max(1, Math.round((deadline - Date.now()) / 3600000))}h left`,
            stepLabel: `${step}/4 · ${meta.label}`,
          };
        });
        setTickets(docs);
      });

    const unsubEco = db
      .collection('tickets')
      .where('status', '==', 'resolved')
      .onSnapshot((snap) => {
        let w = 0,
          p = 0;
        snap.forEach((d) => {
          const c = d.data().category;
          if (c === 'Plumbing') w += 933;
          if (c === 'Electrical') p += 3.83;
        });
        setEco({ closed: snap.size, water: w, power: p });
      });

    return () => { unsubTickets(); unsubEco(); };
  }, [user, profile]);

  const handleSignOut = () => auth.signOut();

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setActiveTab('detail');
  };

  // ── Loading ──
  if (loading) return <LoadingScreen />;

  // ── Auth ──
  if (!user) {
    return (
      <LoginScreen
        roleMode={roleMode}
        setRoleMode={setRoleMode}
      />
    );
  }

  // ── Staff ──
  if (roleMode === 'staff' || profile?.role === 'staff') {
    return (
      <>
        <StaffDashboard onOpenLightbox={setLightboxUrl} onSignOut={handleSignOut} />
        <LightboxModal url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
      </>
    );
  }

  // ── Student Portal ──
  const hasAlerts = tickets.some((t) => t.overdue);

  const renderView = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView eco={eco} tickets={tickets} onNavigate={setActiveTab} onTicketClick={handleTicketClick} onEmergency={() => setShowEmergency(true)} />;
      case 'tickets':
        return <TicketsView tickets={tickets} onTicketClick={handleTicketClick} />;
      case 'submit':
        return <SubmitView profile={profile} onSubmitted={() => setActiveTab('tickets')} onBack={() => setActiveTab('home')} />;
      case 'alerts':
        return <AlertsView tickets={tickets} onTicketClick={handleTicketClick} />;
      case 'profile':
        return <ProfileView profile={profile} totalTickets={tickets.length} onSignOut={handleSignOut} />;
      case 'detail':
        return <TicketDetailView ticket={selectedTicket} onBack={() => setActiveTab('tickets')} onOpenLightbox={setLightboxUrl} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-dvh relative">
      <div className="app-bg" />
      <Header profile={profile} hostelName={HOSTEL.name} />

      <main className="px-5 pt-3 pb-28 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} variants={pageVariants} initial="initial" animate="animate" exit="exit">
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      <AppleDock activeTab={activeTab} onSelect={setActiveTab} hasAlerts={hasAlerts} />
      <LightboxModal url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
      
      <AnimatePresence>
        {showEmergency && <EmergencyAlert profile={profile} onClose={() => setShowEmergency(false)} />}
      </AnimatePresence>
    </div>
  );
}
