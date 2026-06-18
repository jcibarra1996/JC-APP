import React from 'react';
import { AppProvider, useApp, completeSetupAction, navigateAction, completeCheckinAction, selectDateAction } from './context/AppContext';
import type { AppConfig, DailyEntry, View } from './types';
import { getTodayStr } from './utils/dateUtils';
import { calculateScore } from './utils/scoring';
import SetupFlow from './components/Setup/SetupFlow';
import Dashboard from './components/Dashboard/Dashboard';
import DayDetail from './components/Dashboard/DayDetail';
import CheckInFlow from './components/CheckIn/CheckInFlow';
import StatsPage from './components/Stats/StatsPage';
import BottomNav from './components/Navigation/BottomNav';

function AppInner() {
  const { state, dispatch } = useApp();
  const { config, entries, currentView, selectedDate, isLoading } = state;

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '3px solid var(--color-gray-200)',
          borderTopColor: 'var(--color-red)',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!config || !config.setupComplete) {
    return (
      <SetupFlow
        onComplete={(cfg: AppConfig) => dispatch(completeSetupAction(cfg))}
      />
    );
  }

  const navigate = (view: View) => dispatch(navigateAction(view));

  const today = getTodayStr();
  const todayEntry = entries.find((e) => e.date === today) ?? null;

  const handleCompleteCheckIn = (entry: DailyEntry) => {
    const scored = { ...entry, score: calculateScore(entry, config) };
    dispatch(completeCheckinAction(scored));
  };

  const handleDayClick = (date: string) => {
    dispatch(selectDateAction(date));
    dispatch(navigateAction('day-detail'));
  };

  const showNav = currentView !== 'setup' && currentView !== 'checkin';

  return (
    <>
      {currentView === 'dashboard' && (
        <Dashboard
          config={config}
          entries={entries}
          onStartCheckIn={() => navigate('checkin')}
          onDayClick={handleDayClick}
        />
      )}

      {currentView === 'checkin' && (
        <CheckInFlow
          config={config}
          existingEntry={todayEntry}
          onComplete={handleCompleteCheckIn}
          onCancel={() => navigate('dashboard')}
        />
      )}

      {currentView === 'stats' && (
        <StatsPage
          entries={entries}
          config={config}
          onDayClick={handleDayClick}
        />
      )}

      {currentView === 'day-detail' && selectedDate && (() => {
        const entry = entries.find((e) => e.date === selectedDate);
        if (!entry) {
          navigate('dashboard');
          return null;
        }
        return (
          <DayDetail
            entry={entry}
            config={config}
            onBack={() => {
              dispatch(selectDateAction(null));
              navigate('stats');
            }}
          />
        );
      })()}

      {showNav && (
        <BottomNav current={currentView} onNavigate={navigate} />
      )}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
