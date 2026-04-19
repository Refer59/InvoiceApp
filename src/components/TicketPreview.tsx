import React, { useMemo } from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme/tokens';
import { interpretTemplate } from '../services/template/interpreter';
import type { TemplateNode, TicketValues } from '../types';
import defaultTemplate from '../../example_data.json';

interface Props {
  values: TicketValues;
  showLogo?: boolean;
  logoBase64?: string;
}

export function TicketPreview({ values, showLogo, logoBase64 }: Props) {
  const lines = useMemo(
    () => interpretTemplate(defaultTemplate as TemplateNode[], values),
    [values]
  );

  return (
    <View style={styles.paper}>
      {showLogo && logoBase64 ? (
        // Logo would render here with expo-image or Image component
        <View style={styles.logoPlaceholder} />
      ) : null}
      {lines.map((line, i) => (
        <Text key={i} style={styles.line}>
          {line || ' '}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  paper: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 4,
    // simulate paper shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  logoPlaceholder: {
    height: 60,
    backgroundColor: colors.surfaceAlt,
    marginBottom: 8,
    borderRadius: 4,
  },
  line: {
    fontFamily: fonts.mono,
    fontSize: 11,
    lineHeight: 16,
    color: '#1a1a1a',
    letterSpacing: 0,
  },
});
