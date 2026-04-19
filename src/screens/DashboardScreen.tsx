import React from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { colors, radii, fonts, shadow } from '../theme/tokens';
import { Icon } from '../components/Icon';
import { BottomNav } from '../components/BottomNav';
import { useApp } from '../state/AppContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export default function DashboardScreen({ navigation }: Props) {
  const { state, dispatch } = useApp();
  const { company, settings, printerStatus, connectedPrinterName, history } = state;
  const accent = settings.accentColor;

  const today = new Date().toLocaleDateString('es-MX', {
    weekday: 'short', day: 'numeric', month: 'short',
  });

  const todayEntries = history.filter((e) => e.date.startsWith(new Date().toLocaleDateString('es-MX')));
  const todayTotal = todayEntries.reduce((sum, e) => sum + parseFloat(e.total.replace('$', '') || '0'), 0);
  const todayAvg = todayEntries.length > 0 ? todayTotal / todayEntries.length : 0;

  const stats = [
    { label: 'Ventas hoy', value: `$${todayTotal.toFixed(2)}`, icon: 'dollar' },
    { label: 'Tickets', value: String(todayEntries.length), icon: 'receipt' },
    { label: 'Promedio', value: `$${todayAvg.toFixed(2)}`, icon: 'chart' },
  ];

  const quickActions = [
    { label: 'Historial', icon: 'history', route: 'History' },
    { label: 'Impresora', icon: 'printer', route: 'Printer' },
    { label: 'Empresa', icon: 'building', route: 'Empresa' },
    { label: 'Ajustes', icon: 'settings', route: 'Settings' },
  ];

  const handleNewTicket = () => {
    dispatch({ type: 'NEW_TICKET' });
    navigation.navigate('NewTicket');
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Buen día,</Text>
          <Text style={styles.name}>{company.USUARIO || 'Usuario'}</Text>
          <Text style={styles.sub}>
            {company.NOMCAJA} · {company.SUCURSAL} · {today}
          </Text>
        </View>

        {/* Printer status */}
        <Pressable
          onPress={() => navigation.navigate('Printer')}
          style={[
            styles.printerPill,
            { borderColor: printerStatus === 'connected' ? accent + '55' : colors.border },
            { backgroundColor: printerStatus === 'connected' ? accent + '12' : colors.surfaceAlt },
          ]}
        >
          <View style={[styles.printerIcon, { backgroundColor: printerStatus === 'connected' ? accent : colors.borderStrong }]}>
            <Icon name="bluetooth" size={18} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.printerName}>
              {printerStatus === 'connected' ? (connectedPrinterName ?? 'Impresora conectada') : 'Sin impresora'}
            </Text>
            <Text style={styles.printerSub}>
              {printerStatus === 'connected' ? 'Térmica 58mm' : 'Toca para emparejar'}
            </Text>
          </View>
          <Icon name="chevron_right" size={20} color={colors.textMuted} />
        </Pressable>

        {/* Primary CTA */}
        <Pressable onPress={handleNewTicket} style={[styles.cta, { backgroundColor: accent }]}>
          <View style={styles.ctaIcon}>
            <Icon name="plus" size={26} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.ctaTitle}>Nueva nota de venta</Text>
            <Text style={styles.ctaSub}>Registrar y imprimir ticket</Text>
          </View>
          <Icon name="arrow_right" size={22} color="#fff" />
        </Pressable>

        {/* Stats */}
        <View style={styles.statsRow}>
          {stats.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
            </View>
          ))}
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Accesos rápidos</Text>
        <View style={styles.quickGrid}>
          {quickActions.map((a, i) => (
            <Pressable
              key={i}
              onPress={() => navigation.navigate(a.route as any)}
              style={({ pressed }) => [styles.quickCard, pressed && { opacity: 0.75 }]}
            >
              <View style={[styles.quickIconBg, { backgroundColor: accent + '18' }]}>
                <Icon name={a.icon as any} size={22} color={accent} />
              </View>
              <Text style={styles.quickLabel}>{a.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Recent tickets */}
        {history.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recientes</Text>
            {history.slice(0, 3).map((entry) => (
              <Pressable
                key={entry.id}
                style={styles.historyRow}
                onPress={() => navigation.navigate('History')}
              >
                <View style={[styles.historyIcon, { backgroundColor: accent + '18' }]}>
                  <Icon name="receipt" size={18} color={accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyTotal}>{entry.total}</Text>
                  <Text style={styles.historyDate}>{entry.date} · {entry.itemCount} art.</Text>
                </View>
                <Icon name="chevron_right" size={18} color={colors.textFaint} />
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>

      <BottomNav active="dashboard" onNavigate={(route) => navigation.navigate(route as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  content: { paddingBottom: 16 },
  header: { padding: 18, paddingBottom: 8 },
  greeting: { fontSize: 13, color: colors.textMuted, fontFamily: fonts.ui },
  name: { fontSize: 24, fontWeight: '700', color: colors.text, letterSpacing: -0.5, fontFamily: fonts.ui },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 4, fontFamily: fonts.ui },
  printerPill: {
    marginHorizontal: 18, marginBottom: 14, borderRadius: radii.lg,
    padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1,
  },
  printerIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  printerName: { fontSize: 14, fontWeight: '600', color: colors.text, fontFamily: fonts.ui },
  printerSub: { fontSize: 12, color: colors.textMuted, fontFamily: fonts.ui },
  cta: {
    marginHorizontal: 18, marginBottom: 16, borderRadius: radii.lg,
    height: 76, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20,
    ...shadow.float,
  },
  ctaIcon: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center',
  },
  ctaTitle: { fontSize: 18, fontWeight: '700', color: '#fff', letterSpacing: -0.2, fontFamily: fonts.ui },
  ctaSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontFamily: fonts.ui },
  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 18, marginBottom: 14 },
  statCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: radii.md,
    borderWidth: 1, borderColor: colors.border, padding: 12,
  },
  statLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '500', fontFamily: fonts.ui },
  statValue: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 4, fontFamily: fonts.mono },
  sectionTitle: {
    fontSize: 12, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase',
    letterSpacing: 0.8, fontFamily: fonts.ui, paddingHorizontal: 18, marginBottom: 8,
  },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 18, marginBottom: 20 },
  quickCard: {
    width: '48%', backgroundColor: colors.surface, borderRadius: radii.md,
    borderWidth: 1, borderColor: colors.border, padding: 14, gap: 10, alignItems: 'flex-start',
  },
  quickIconBg: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 14, fontWeight: '600', color: colors.text, fontFamily: fonts.ui },
  historyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.surface, marginHorizontal: 18, marginBottom: 8,
    borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, padding: 12,
  },
  historyIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  historyTotal: { fontSize: 15, fontWeight: '700', color: colors.text, fontFamily: fonts.mono },
  historyDate: { fontSize: 12, color: colors.textMuted, fontFamily: fonts.ui },
});
