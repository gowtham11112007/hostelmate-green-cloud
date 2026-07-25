import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDnySXsbrffGXFlH7eMjFHTfxH-YmttvRk",
  authDomain: "hostelmate-cloud-sla-optimizer.firebaseapp.com",
  projectId: "hostelmate-cloud-sla-optimizer",
  storageBucket: "hostelmate-cloud-sla-optimizer.firebasestorage.app",
  messagingSenderId: "595607083443",
  appId: "1:595607083443:web:9d1695c1f2c9bd861813c6",
  measurementId: "G-LYQEN56G72"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const db = firebase.firestore();
export const HOSTEL = { name: 'Krishna Hostel', floors: 8, roomsPerFloor: 30 };

export const CATS = {
  'Electrical':   { label: 'Electrical', icon: 'Zap',       sla: 12, bg: '#FEF3C7', fg: '#B45309', weight: 60 },
  'Plumbing':     { label: 'Plumbing',   icon: 'Droplet',   sla: 24, bg: '#DBEAFE', fg: '#1D4ED8', weight: 55 },
  'Furniture':    { label: 'Furniture',  icon: 'Armchair',  sla: 48, bg: '#F1F5F9', fg: '#475569', weight: 25 },
  'Cleaning':     { label: 'Cleaning',   icon: 'Sparkles',  sla: 24, bg: '#D1FAE5', fg: '#065F46', weight: 20 },
  'WiFi/Network': { label: 'WiFi',       icon: 'Wifi',      sla: 12, bg: '#EDE9FE', fg: '#6D28D9', weight: 30 },
  'Other':        { label: 'Other',      icon: 'MoreHorizontal', sla: 48, bg: '#F1F5F9', fg: '#475569', weight: 35 }
};

export const STEPS = ['submitted', 'assigned', 'in progress', 'resolved'];
export const STEP_META = {
  'submitted':   { label: 'Submitted',   bg: '#F1F5F9', fg: '#475569' },
  'assigned':    { label: 'Assigned',    bg: '#DBEAFE', fg: '#1D4ED8' },
  'in progress': { label: 'In progress', bg: '#FEF3C7', fg: '#B45309' },
  'resolved':    { label: 'Resolved',    bg: '#D1FAE5', fg: '#059669' }
};

export default firebase;
