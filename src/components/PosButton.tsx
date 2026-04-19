import React from 'react';
import { Pressable, Text, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Icon } from './Icon';
import { useTheme } from '../theme';

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

const HEIGHTS: Record<Size, number> = { sm: 40, md: 52, lg: 60 };
const FONT_SIZES: Record<Size, number> = { sm: 14, md: 16, lg: 18 };
const H_PADS: Record<Size, number> = { sm: 14, md: 20, lg: 24 };

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
  const { theme } = useTheme();
  const c = theme.colors;

  const vs = (v: Variant): { bg: string; fg: string; border?: string } => {
    switch (v) {
      case 'primary':     return { bg: c.brand.primary, fg: c.text.onPrimary };
      case 'secondary':   return { bg: c.bg.surfaceAlt, fg: c.text.primary };
      case 'outline':     return { bg: 'transparent', fg: c.text.primary, border: c.border.strong };
      case 'ghost':       return { bg: 'transparent', fg: c.text.primary };
      case 'danger':      return { bg: c.semantic.danger, fg: '#fff' };
      case 'accent_soft': return { bg: c.brand.primarySoft, fg: c.brand.primary };
    }
  };

  const s = vs(variant);

  const handlePress = () => {
    if (disabled || !onPress) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        {
          height: HEIGHTS[size],
          paddingHorizontal: H_PADS[size],
          backgroundColor: s.bg,
          borderRadius: theme.radii.md,
          flexDirection: 'row' as const,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
          gap: theme.spacing.sm,
          opacity: disabled ? 0.45 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
          width: full ? '100%' : undefined,
          ...(s.border ? { borderWidth: 1.5, borderColor: s.border } : {}),
        },
        style,
      ]}
    >
      {icon ? <Icon name={icon as any} size={size === 'lg' ? 22 : 20} color={s.fg} strokeWidth={2} /> : null}
      <Text
        style={{
          fontFamily: theme.typography.fonts.uiSemiBold,
          fontWeight: '600',
          fontSize: FONT_SIZES[size],
          color: s.fg,
          letterSpacing: -0.1,
        }}
      >
        {label ?? children}
      </Text>
    </Pressable>
  );
}
