import React, { useMemo } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { interpretTemplate } from '../services/template/interpreter';
import type { TemplateNode, TicketValues } from '../types';
import defaultTemplate from '../../example_data.json';

interface Props {
  values: TicketValues;
  showLogo?: boolean;
  logoBase64?: string;
}

export function TicketPreview({ values, showLogo, logoBase64 }: Props) {
  const { theme } = useTheme();
  const c = theme.colors;

  const lines = useMemo(
    () => interpretTemplate(defaultTemplate as TemplateNode[], values),
    [values],
  );

  const styles = useMemo(() => StyleSheet.create({
    paper: {
      backgroundColor: '#FFFFFF', // thermal paper is always white regardless of app theme
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radii.xs,
      ...theme.shadows.float,
    },
    logoPlaceholder: {
      height: 60,
      backgroundColor: c.bg.surfaceAlt,
      marginBottom: theme.spacing.sm,
      borderRadius: theme.radii.xs,
    },
    line: {
      fontFamily: theme.typography.fonts.mono,
      // 11px matches 58mm thermal Font A density at ~1× screen scale — ESC/POS character math
      fontSize: theme.typography.fontSizes.micro,
      lineHeight: 16, // fixed thermal line pitch: (dot height 17 × screen density) ≈ 16dp
      color: '#1a1a1a', // near-black printer ink simulation, not UI chrome
      letterSpacing: 0,
    },
  }), [theme, c]);

  return (
    <View style={styles.paper}>
      {showLogo && logoBase64 ? <View style={styles.logoPlaceholder} /> : null}
      {lines.map((line, i) => (
        <Text key={i} style={styles.line}>{line || ' '}</Text>
      ))}
    </View>
  );
}
