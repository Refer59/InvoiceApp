import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronLeft, ChevronRight, Sun, Moon, Smartphone, Globe } from 'lucide-react-native';
import type { RootStackParamList } from '../../App';
import { useTheme } from '../theme';
import type { ThemeMode } from '../theme';
import { NotavoLogo } from '../components/NotavoMark';
import { BottomNav } from '../components/BottomNav';
import { LocalePickerModal } from '../components/LocalePickerModal';
import { useApp } from '../state/AppContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const LOCALE_LABELS: Record<string, string> = {
  'es-AR': 'Español · Argentina',
  'es-ES': 'Español · España',
  'es-MX': 'Español · México',
  'es-CO': 'Español · Colombia',
};

export default function SettingsScreen({ navigation }: Props) {
  const { state, updateSettings } = useApp();
  const { theme, modeOverride, setMode } = useTheme();
  const c = theme.colors;
  const sp = theme.spacing;
  const r = theme.radii;
  const fs = theme.typography.fontSizes;
  const [localeModal, setLocaleModal] = useState(false);

  const handleThemeMode = (m: ThemeMode | 'system') => setMode(m);

  const handleToggleAttribution = async (val: boolean) => {
    await updateSettings({ ...state.settings, showNotavoAttribution: val });
  };

  const handleLocale = async (locale: string | undefined) => {
    await updateSettings({ ...state.settings, locale });
  };

  const MODES: { key: ThemeMode | 'system'; label: string; Icon: any }[] = [
    { key: 'light', label: 'Claro', Icon: Sun },
    { key: 'dark', label: 'Oscuro', Icon: Moon },
    { key: 'system', label: 'Sistema', Icon: Smartphone },
  ];

  const styles = useMemo(() => StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg.base },
    header: {
      flexDirection: 'row', alignItems: 'center', gap: sp.md,
      paddingHorizontal: sp.lg, paddingVertical: sp.md,
      backgroundColor: c.bg.surface, borderBottomWidth: 1, borderBottomColor: c.border.subtle,
    },
    backBtn: { padding: sp.xs },
    title: { fontSize: fs.h3, fontWeight: '700', color: c.text.primary, fontFamily: theme.typography.fonts.uiBold },
    content: { padding: sp.lg, gap: sp.md, paddingBottom: sp['2xl'] },
    card: {
      backgroundColor: c.bg.surface, borderRadius: r.lg,
      borderWidth: 1, borderColor: c.border.subtle, padding: sp.lg, gap: sp.md,
    },
    sectionTitle: {
      fontSize: fs.label, fontWeight: '600', color: c.text.secondary,
      textTransform: 'uppercase', letterSpacing: 0.6, fontFamily: theme.typography.fonts.uiSemiBold,
    },
    modeRow: { flexDirection: 'row', gap: sp.sm },
    modeBtn: {
      flex: 1, alignItems: 'center', gap: sp.xs, paddingVertical: sp.md,
      borderRadius: r.sm, borderWidth: 1.5,
    },
    modeBtnLabel: { fontSize: fs.label, fontWeight: '600', fontFamily: theme.typography.fonts.uiSemiBold },
    linkRow: { flexDirection: 'row', alignItems: 'center', gap: sp.md, paddingVertical: sp.xs },
    linkIcon: { width: 36, height: 36, borderRadius: r.sm, alignItems: 'center', justifyContent: 'center', backgroundColor: c.brand.primarySoft },
    linkLabel: { flex: 1, fontSize: fs.body, color: c.text.primary, fontWeight: '500', fontFamily: theme.typography.fonts.ui },
    linkValue: { fontSize: fs.caption, color: c.text.muted, fontFamily: theme.typography.fonts.ui, marginRight: sp.xs },
    toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: sp.xs },
    toggleLabel: { fontSize: fs.body, color: c.text.primary, fontWeight: '500', fontFamily: theme.typography.fonts.ui, flex: 1 },
    toggleSub: { fontSize: fs.label, color: c.text.muted, fontFamily: theme.typography.fonts.ui, marginTop: 2 },
    footer: { alignItems: 'center', gap: sp.xs, marginTop: sp.lg },
    footerVersion: { fontSize: fs.label, color: c.text.muted, fontFamily: theme.typography.fonts.mono, textAlign: 'center' },
  }), [theme]);

  const localeLabel = state.settings.locale
    ? (LOCALE_LABELS[state.settings.locale] ?? state.settings.locale)
    : 'Automático';

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={22} color={c.text.primary} strokeWidth={1.75} />
        </Pressable>
        <Text style={styles.title}>Ajustes</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Apariencia</Text>
          <View style={styles.modeRow}>
            {MODES.map(({ key, label, Icon }) => {
              const active = modeOverride === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => handleThemeMode(key)}
                  style={[
                    styles.modeBtn,
                    {
                      borderColor: active ? c.brand.primary : c.border.subtle,
                      backgroundColor: active ? c.brand.primarySoft : c.bg.surfaceAlt,
                    },
                  ]}
                >
                  <Icon size={20} color={active ? c.brand.primary : c.text.secondary} strokeWidth={1.75} />
                  <Text style={[styles.modeBtnLabel, { color: active ? c.brand.primaryInk : c.text.secondary }]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Formato de números</Text>
          <Pressable style={styles.linkRow} onPress={() => setLocaleModal(true)}>
            <View style={styles.linkIcon}>
              <Globe size={18} color={c.brand.primary} strokeWidth={1.75} />
            </View>
            <Text style={styles.linkLabel}>Idioma regional</Text>
            <Text style={styles.linkValue}>{localeLabel}</Text>
            <ChevronRight size={18} color={c.text.muted} strokeWidth={1.75} />
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ticket impreso</Text>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Mostrar "Hecho con Notavo"</Text>
              <Text style={styles.toggleSub}>Aparece al pie del ticket</Text>
            </View>
            <Switch
              value={state.settings.showNotavoAttribution}
              onValueChange={handleToggleAttribution}
              trackColor={{ false: c.border.subtle, true: c.brand.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

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
              <View style={styles.linkIcon}>
                <ChevronRight size={18} color={c.brand.primary} strokeWidth={1.75} />
              </View>
              <Text style={styles.linkLabel}>{item.label}</Text>
              <ChevronRight size={18} color={c.text.muted} strokeWidth={1.75} />
            </Pressable>
          ))}
        </View>

        <View style={styles.footer}>
          <NotavoLogo fontSize={20} color={c.text.muted} />
          <Text style={styles.footerVersion}>v1.0.0</Text>
        </View>
      </ScrollView>

      <BottomNav active="settings" onNavigate={(route) => navigation.navigate(route as any)} />

      <LocalePickerModal
        visible={localeModal}
        current={state.settings.locale}
        onSelect={handleLocale}
        onClose={() => setLocaleModal(false)}
      />
    </SafeAreaView>
  );
}
