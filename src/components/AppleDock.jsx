import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Home, ListFilter, PlusCircle, Megaphone, User } from 'lucide-react';

const items = [
  { id: 'home', title: 'Home', Icon: Home },
  { id: 'tickets', title: 'Tickets', Icon: ListFilter },
  { id: 'submit', title: 'New', Icon: PlusCircle, accent: true },
  { id: 'alerts', title: 'Notices', Icon: Megaphone },
  { id: 'profile', title: 'Profile', Icon: User },
];

export function AppleDock({ activeTab, onSelect, hasAlerts }) {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 160, damping: 18, delay: 0.4 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
    >
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="flex items-end gap-2 px-4 py-3 rounded-[28px] glass-panel shadow-[0_8px_32px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]"
      >
        {items.map((item) => (
          <DockItem
            key={item.id}
            item={item}
            mouseX={mouseX}
            isActive={activeTab === item.id}
            hasNotif={item.id === 'alerts' && hasAlerts}
            onClick={() => onSelect(item.id)}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

function DockItem({ item, mouseX, isActive, hasNotif, onClick }) {
  const ref = useRef(null);
  const { Icon, accent } = item;

  const distance = useTransform(mouseX, (val) => {
    const el = ref.current;
    if (!el) return 150;
    const rect = el.getBoundingClientRect();
    return val - rect.x - rect.width / 2;
  });

  const size = useTransform(distance, [-130, 0, 130], [44, 64, 44]);
  const springSize = useSpring(size, { mass: 0.08, stiffness: 200, damping: 14 });

  return (
    <motion.button
      ref={ref}
      style={{ width: springSize, height: springSize }}
      onClick={onClick}
      className="relative flex items-center justify-center cursor-pointer group"
      whileTap={{ scale: 0.85 }}
    >
      {/* Tooltip */}
      <span className="absolute -top-9 px-2.5 py-1 rounded-lg bg-slate-800 text-white text-[10px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">
        {item.title}
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45" />
      </span>

      {/* Icon Container */}
      <div
        className={`w-full h-full rounded-[14px] flex items-center justify-center transition-all duration-200 ${
          accent
            ? 'bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-lg shadow-brand-500/30'
            : isActive
              ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/25'
              : 'bg-white/80 text-slate-500 hover:text-slate-700 hover:bg-white shadow-sm border border-slate-200/50'
        }`}
      >
        <Icon className="w-[42%] h-[42%]" strokeWidth={2.2} />

        {/* Notification dot */}
        {hasNotif && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white animate-pulse-glow" style={{ boxShadow: '0 0 6px #f43f5e' }} />
        )}
      </div>

      {/* Active indicator dot */}
      {isActive && !accent && (
        <motion.span
          layoutId="dock-active"
          className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-brand-500"
          style={{ boxShadow: '0 0 6px #10b981' }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
      )}
    </motion.button>
  );
}
