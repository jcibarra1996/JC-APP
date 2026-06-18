import React from 'react';
import type { View } from '../../types';

interface Props {
  current: View;
  onNavigate: (view: View) => void;
}

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const StatsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const ITEMS: { view: View; label: string; Icon: React.FC }[] = [
  { view: 'dashboard', label: 'Inicio', Icon: HomeIcon },
  { view: 'checkin', label: 'Registrar', Icon: CheckIcon },
  { view: 'stats', label: 'Estadísticas', Icon: StatsIcon },
];

export default function BottomNav({ current, onNavigate }: Props) {
  return (
    <nav className="bottom-nav">
      {ITEMS.map(({ view, label, Icon }) => (
        <button
          key={view}
          className={`nav-item ${current === view || (current === 'day-detail' && view === 'stats') ? 'active' : ''}`}
          onClick={() => onNavigate(view)}
          type="button"
        >
          <Icon />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
