import { colorsLight, colorsDark } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { radii } from './radii';
import { shadowsLight, shadowsDark } from './shadows';

export type ThemeMode = 'light' | 'dark';

export type Theme = {
  mode: ThemeMode;
  colors: typeof colorsLight;
  typography: typeof typography;
  spacing: typeof spacing;
  radii: typeof radii;
  shadows: typeof shadowsLight;
};

export const lightTheme: Theme = {
  mode: 'light',
  colors: colorsLight,
  typography,
  spacing,
  radii,
  shadows: shadowsLight,
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: colorsDark,
  typography,
  spacing,
  radii,
  shadows: shadowsDark,
};
