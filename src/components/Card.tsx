import React, { useMemo } from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
}

export function Card({ children, style, elevated = false }: Props) {
  const { theme } = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    base: {
      backgroundColor: theme.colors.bg.surface,
      borderRadius: theme.radii.md,
      borderWidth: 1,
      borderColor: theme.colors.border.subtle,
      ...(elevated ? theme.shadows.card : {}),
    },
  }), [theme]);

  return <View style={[styles.base, style]}>{children}</View>;
}
