import React, { createContext, useMemo, useState, useCallback, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, lightTheme, darkTheme, ThemeMode } from './theme';

const STORAGE_KEY = 'notavo.themeMode';

type ModeOverride = ThemeMode | 'system';

type Ctx = {
  theme: Theme;
  mode: ThemeMode;
  modeOverride: ModeOverride;
  setMode: (m: ModeOverride) => void;
};

export const ThemeContext = createContext<Ctx | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const system = useColorScheme() ?? 'light';
  const [override, setOverride] = useState<ModeOverride>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setOverride(stored);
      }
    });
  }, []);

  const setMode = useCallback((m: ModeOverride) => {
    setOverride(m);
    AsyncStorage.setItem(STORAGE_KEY, m);
  }, []);

  const mode: ThemeMode = override === 'system' ? (system as ThemeMode) : override;
  const theme = mode === 'dark' ? darkTheme : lightTheme;

  const value = useMemo(
    () => ({ theme, mode, modeOverride: override, setMode }),
    [theme, mode, override, setMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
