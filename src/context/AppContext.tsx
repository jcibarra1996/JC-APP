import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { AppConfig, DailyEntry, View, CheckInProgress } from '../types';
import { loadData, saveData } from '../utils/storage';
import { getTodayStr } from '../utils/dateUtils';

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

export interface AppStateShape {
  config: AppConfig | null;
  entries: DailyEntry[];
  currentView: View;
  checkInProgress: CheckInProgress | null;
  selectedDate: string | null;
  isLoading: boolean;
}

const initialState: AppStateShape = {
  config: null,
  entries: [],
  currentView: 'setup',
  checkInProgress: null,
  selectedDate: null,
  isLoading: true,
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type AppAction =
  | { type: 'LOAD_DATA'; payload: { config: AppConfig | null; entries: DailyEntry[] } }
  | { type: 'SET_CONFIG'; payload: AppConfig }
  | { type: 'COMPLETE_SETUP'; payload: AppConfig }
  | { type: 'ADD_OR_UPDATE_ENTRY'; payload: DailyEntry }
  | { type: 'START_CHECKIN'; payload: CheckInProgress }
  | { type: 'UPDATE_CHECKIN'; payload: Partial<CheckInProgress> }
  | { type: 'COMPLETE_CHECKIN'; payload: DailyEntry }
  | { type: 'NAVIGATE'; payload: View }
  | { type: 'SELECT_DATE'; payload: string | null };

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function appReducer(state: AppStateShape, action: AppAction): AppStateShape {
  switch (action.type) {
    case 'LOAD_DATA':
      return {
        ...state,
        config: action.payload.config,
        entries: action.payload.entries,
        currentView: action.payload.config?.setupComplete ? 'dashboard' : 'setup',
        isLoading: false,
      };

    case 'SET_CONFIG':
      return {
        ...state,
        config: action.payload,
      };

    case 'COMPLETE_SETUP':
      return {
        ...state,
        config: action.payload,
        currentView: 'dashboard',
      };

    case 'ADD_OR_UPDATE_ENTRY': {
      const existing = state.entries.findIndex((e) => e.date === action.payload.date);
      const newEntries =
        existing >= 0
          ? state.entries.map((e, i) => (i === existing ? action.payload : e))
          : [...state.entries, action.payload];
      return {
        ...state,
        entries: newEntries,
      };
    }

    case 'START_CHECKIN':
      return {
        ...state,
        checkInProgress: action.payload,
        currentView: 'checkin',
      };

    case 'UPDATE_CHECKIN':
      if (!state.checkInProgress) return state;
      return {
        ...state,
        checkInProgress: {
          ...state.checkInProgress,
          ...action.payload,
          data: {
            ...state.checkInProgress.data,
            ...(action.payload.data ?? {}),
          },
        },
      };

    case 'COMPLETE_CHECKIN': {
      const existing = state.entries.findIndex((e) => e.date === action.payload.date);
      const newEntries =
        existing >= 0
          ? state.entries.map((e, i) => (i === existing ? action.payload : e))
          : [...state.entries, action.payload];
      return {
        ...state,
        entries: newEntries,
        checkInProgress: null,
        currentView: 'dashboard',
      };
    }

    case 'NAVIGATE':
      return {
        ...state,
        currentView: action.payload,
      };

    case 'SELECT_DATE':
      return {
        ...state,
        selectedDate: action.payload,
      };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface AppContextValue {
  state: AppStateShape;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = loadData();
    dispatch({
      type: 'LOAD_DATA',
      payload: { config: stored.config, entries: stored.entries },
    });
  }, []);

  // Persist to localStorage whenever config or entries change (skip loading state)
  useEffect(() => {
    if (state.isLoading) return;
    saveData({
      config: state.config,
      entries: state.entries,
      lastVisit: getTodayStr(),
    });
  }, [state.config, state.entries, state.isLoading]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Action creators
// ---------------------------------------------------------------------------

export function loadDataAction(
  config: AppConfig | null,
  entries: DailyEntry[]
): AppAction {
  return { type: 'LOAD_DATA', payload: { config, entries } };
}

export function setConfigAction(config: AppConfig): AppAction {
  return { type: 'SET_CONFIG', payload: config };
}

export function completeSetupAction(config: AppConfig): AppAction {
  return { type: 'COMPLETE_SETUP', payload: config };
}

export function addOrUpdateEntryAction(entry: DailyEntry): AppAction {
  return { type: 'ADD_OR_UPDATE_ENTRY', payload: entry };
}

export function startCheckinAction(progress: CheckInProgress): AppAction {
  return { type: 'START_CHECKIN', payload: progress };
}

export function updateCheckinAction(partial: Partial<CheckInProgress>): AppAction {
  return { type: 'UPDATE_CHECKIN', payload: partial };
}

export function completeCheckinAction(entry: DailyEntry): AppAction {
  return { type: 'COMPLETE_CHECKIN', payload: entry };
}

export function navigateAction(view: View): AppAction {
  return { type: 'NAVIGATE', payload: view };
}

export function selectDateAction(date: string | null): AppAction {
  return { type: 'SELECT_DATE', payload: date };
}

// ---------------------------------------------------------------------------
// Convenience selector hooks
// ---------------------------------------------------------------------------

export function useTodayEntry(): DailyEntry | null {
  const { state } = useApp();
  const today = getTodayStr();
  return state.entries.find((e) => e.date === today) ?? null;
}

export function useConfig(): AppConfig | null {
  const { state } = useApp();
  return state.config;
}

export function useCurrentView(): View {
  const { state } = useApp();
  return state.currentView;
}

export function useNavigate() {
  const { dispatch } = useApp();
  return useCallback(
    (view: View) => dispatch(navigateAction(view)),
    [dispatch]
  );
}
