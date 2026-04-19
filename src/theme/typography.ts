import { Platform } from 'react-native';

// Flat font-size map — every screen/component must reference these instead of literals.
export const fontSizes = {
  micro: 11,
  label: 12,
  caption: 13,
  small: 14,
  body: 15,
  input: 16,
  h3: 17,
  mono2: 18,
  h2: 20,
  large: 22,
  h1: 24,
  display: 32,
} as const;

export const typography = {
  fontSizes,
  fonts: {
    logo: 'OpenSans_700Bold',
    ui: 'Inter_400Regular',
    uiMedium: 'Inter_500Medium',
    uiSemiBold: 'Inter_600SemiBold',
    uiBold: 'Inter_700Bold',
    uiExtraBold: 'Inter_800ExtraBold',
    mono: 'JetBrainsMono_400Regular',
    monoSemiBold: 'JetBrainsMono_600SemiBold',
    fallbackUi: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    fallbackMono: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  scale: {
    display: { fontSize: 32, lineHeight: 38, fontWeight: '800' as const, letterSpacing: -0.5 },
    h1: { fontSize: 24, lineHeight: 30, fontWeight: '700' as const, letterSpacing: -0.3 },
    h2: { fontSize: 20, lineHeight: 26, fontWeight: '700' as const, letterSpacing: -0.2 },
    h3: { fontSize: 17, lineHeight: 24, fontWeight: '600' as const, letterSpacing: 0 },
    body: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const, letterSpacing: 0 },
    bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '600' as const, letterSpacing: 0 },
    caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const, letterSpacing: 0.1 },
    label: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const, letterSpacing: 0.6 },
    mono: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const, letterSpacing: 0 },
    monoTotal: { fontSize: 18, lineHeight: 24, fontWeight: '600' as const, letterSpacing: 0 },
  },
} as const;
