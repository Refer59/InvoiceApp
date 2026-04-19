import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, radii, fonts } from '../theme/tokens';
import { Icon } from './Icon';
import { useApp } from '../state/AppContext';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent_soft';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  children?: React.ReactNode;
  label?: string;
  variant?: Variant;
  size?: Size;
  icon?: string;
  onPress?: () => void;
  disabled?: boolean;
  full?: boolean;
  style?: ViewStyle;
}

const heights: Record<Size, number> = { sm: 40, md: 52, lg: 60 };
const fontSizes: Record<Size, number> = { sm: 14, md: 16, lg: 18 };
const hPads: Record<Size, number> = { sm: 14, md: 20, lg: 24 };

export function PosButton({
  children,
  label,
  variant = 'primary',
  size = 'md',
  icon,
  onPress,
  disabled = false,
  full = false,
  style,
}: Props) {
  const { state } = useApp();
  const accent = state.settings.accentColor;

  const variantStyle = (v: Variant): { bg: string; fg: string; border?: string } => {
    switch (v) {
      case 'primary': return { bg: accent, fg: '#fff' };
      case 'secondary': return { bg: colors.surfaceAlt, fg: colors.text };
      case 'outline': return { bg: 'transparent', fg: colors.text, border: colors.borderStrong };
      case 'ghost': return { bg: 'transparent', fg: colors.text };
      case 'danger': return { bg: colors.danger, fg: '#fff' };
      case 'accent_soft': return { bg: accent + '22', fg: accent };
    }
  };

  const vs = variantStyle(variant);

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        {
          height: heights[size],
          paddingHorizontal: hPads[size],
          backgroundColor: vs.bg,
          borderRadius: radii.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: disabled ? 0.45 : pressed ? 0.88 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
          width: full ? '100%' : undefined,
          ...(vs.border ? { borderWidth: 1.5, borderColor: vs.border } : {}),
        },
        style,
      ]}
    >
      {icon ? <Icon name={icon as any} size={size === 'lg' ? 22 : 20} color={vs.fg} /> : null}
      <Text
        style={{
          fontFamily: fonts.ui,
          fontWeight: '600',
          fontSize: fontSizes[size],
          color: vs.fg,
          letterSpacing: -0.1,
        }}
      >
        {label ?? children}
      </Text>
    </Pressable>
  );
}
