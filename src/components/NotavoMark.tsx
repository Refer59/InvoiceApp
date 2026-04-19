import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../theme'
import { StyleSheet, Text } from 'react-native'

interface Props {
  size?: number;
  color?: string;
}

// The Notavo mark: a filled arch "n" — two pillars joined by a semicircular arch.
export function NotavoMark({ size = 32, color = '#E8702E' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path
        d="M10 98 L10 44 C10 16 22 8 50 8 C78 8 90 16 90 44 L90 98 L72 98 L72 48 C72 37 65 30 50 30 C35 30 28 37 28 48 L28 98 Z"
        fill={color}
      />
    </Svg>
  );
}

// Horizontal lockup: mark + "Notavo" wordmark, used in wide headers.
export function NotavoLogo({ fontSize = 28, color = '#E8702E' }: { fontSize?: number; color?: string }) {
  const { theme } = useTheme()
  const c = theme.colors
  
  const styles = StyleSheet.create({
    logo: { fontSize, fontFamily: theme.typography.fonts.logo, color }
  })

  return <Text style={styles.logo}>Notavo</Text>
}
