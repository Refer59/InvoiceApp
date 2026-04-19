import { Platform } from 'react-native';

export const colors = {
  bg: '#F6F7F9',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF0F3',
  border: '#E4E7EB',
  borderStrong: '#CDD2D8',
  text: '#0F1419',
  textMuted: '#5A6270',
  textFaint: '#8A919C',
  success: '#1F9D55',
  danger: '#D64545',
  warning: '#C69026',
  // default accent — overridden by AppContext settings
  accent: '#3B6AEA',
  accentSoft: '#EBF0FD',
  accentInk: '#1E3FA8',
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
} as const;

export const hit = 48; // minimum touch target

export const fonts = {
  ui: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  mono: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
} as const;

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  float: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
  },
} as const;
