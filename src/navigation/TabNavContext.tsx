import React, { createContext, useContext, useState, useCallback, useRef, useMemo } from 'react';
import { createNavigationContainerRef } from '@react-navigation/native';

export const TAB_ORDER = ['dashboard', 'history', 'printer', 'settings'] as const;
export type TabKey = typeof TAB_ORDER[number];

export const TAB_ROUTE: Record<TabKey, string> = {
  dashboard: 'Dashboard',
  history: 'History',
  printer: 'Printer',
  settings: 'Settings',
};

export const ROUTE_TO_TAB: Record<string, TabKey> = {
  Dashboard: 'dashboard',
  History: 'history',
  Printer: 'printer',
  Settings: 'settings',
};

type Anim = 'slide_from_right' | 'slide_from_left';

export const navigationRef = createNavigationContainerRef();

interface Ctx {
  prev: TabKey;
  current: TabKey;
  goToTab: (key: TabKey) => void;
  animationFor: (key: TabKey) => Anim;
  navHeight: number;
  setNavHeight: (h: number) => void;
}

const TabNavContext = createContext<Ctx | null>(null);

export function TabNavProvider({ children }: { children: React.ReactNode }) {
  const [prev, setPrev] = useState<TabKey>('dashboard');
  const [current, setCurrent] = useState<TabKey>('dashboard');
  const [navHeight, setNavHeight] = useState(0);
  const currentRef = useRef<TabKey>('dashboard');

  const goToTab = useCallback((key: TabKey) => {
    if (key === currentRef.current) return;
    const prevKey = currentRef.current;
    currentRef.current = key;
    setPrev(prevKey);
    setCurrent(key);
    if (navigationRef.isReady()) {
      navigationRef.navigate(TAB_ROUTE[key] as never);
    }
  }, []);

  const animationFor = useCallback(
    (key: TabKey): Anim => {
      const from = TAB_ORDER.indexOf(prev);
      const to = TAB_ORDER.indexOf(key);
      if (from < 0 || to < 0) return 'slide_from_right';
      return to >= from ? 'slide_from_right' : 'slide_from_left';
    },
    [prev]
  );

  const value = useMemo(
    () => ({ prev, current, goToTab, animationFor, navHeight, setNavHeight }),
    [prev, current, goToTab, animationFor, navHeight]
  );

  return <TabNavContext.Provider value={value}>{children}</TabNavContext.Provider>;
}

export function useTabNav() {
  const ctx = useContext(TabNavContext);
  if (!ctx) throw new Error('useTabNav must be used inside TabNavProvider');
  return ctx;
}
