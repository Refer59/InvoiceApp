import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { colors, radii, fonts } from '../theme/tokens';
import { Icon } from '../components/Icon';
import { BottomNav } from '../components/BottomNav';
import { useApp } from '../state/AppContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const ACCENT_COLORS = [
  '#3B6AEA', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#64748B',
];

export default function SettingsScreen({ navigation }: Props) {
  const { state, updateSettings } = useApp();
  const accent = state.settings.accentColor;

  const handleAccent = async (color: string) => {
    await updateSettings({ ...state.settings, accentColor: color });
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow_left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Ajustes</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Color accent */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Color de acento</Text>
          <View style={styles.swatches}>
            {ACCENT_COLORS.map((c) => (
              <Pressable
                key={c}
                onPress={() => handleAccent(c)}
                style={[
                  styles.swatch,
                  { backgroundColor: c },
                  accent === c && styles.swatchActive,
                ]}
              >
                {accent === c && <Icon name="check" size={16} color="#fff" />}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Quick links */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Configuración</Text>
          {[
            { label: 'Empresa y logo', icon: 'building', route: 'Empresa' },
            { label: 'Impresora Bluetooth', icon: 'printer', route: 'Printer' },
          ].map((item) => (
            <Pressable
              key={item.route}
              onPress={() => navigation.navigate(item.route as any)}
              style={styles.linkRow}
            >
              <View style={[styles.linkIcon, { backgroundColor: accent + '18' }]}>
                <Icon name={item.icon as any} size={18} color={accent} />
              </View>
              <Text style={styles.linkLabel}>{item.label}</Text>
              <Icon name="chevron_right" size={18} color={colors.textFaint} />
            </Pressable>
          ))}
        </View>

        {/* Version */}
        <Text style={styles.version}>TicketPOS v1.0.0 · Expo SDK 54</Text>
      </ScrollView>

      <BottomNav active="settings" onNavigate={(route) => navigation.navigate(route as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 17, fontWeight: '700', color: colors.text, fontFamily: fonts.ui },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  card: {
    backgroundColor: colors.surface, borderRadius: radii.lg,
    borderWidth: 1, borderColor: colors.border, padding: 16, gap: 12,
  },
  sectionTitle: {
    fontSize: 12, fontWeight: '600', color: colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.6, fontFamily: fonts.ui,
  },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'transparent',
  },
  swatchActive: { borderColor: colors.text, borderWidth: 2 },
  linkRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6,
  },
  linkIcon: { width: 36, height: 36, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  linkLabel: { flex: 1, fontSize: 15, color: colors.text, fontWeight: '500', fontFamily: fonts.ui },
  version: { textAlign: 'center', fontSize: 12, color: colors.textFaint, fontFamily: fonts.mono, marginTop: 8 },
});
