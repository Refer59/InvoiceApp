import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Settings2, PlusCircle, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import type { RootStackParamList } from '../../App';
import { useTheme } from '../theme';
import { NotavoLogo, NotavoMark } from '../components/NotavoMark';
import { Icon } from '../components/Icon';
import { BottomNav } from '../components/BottomNav';
import { useApp } from '../state/AppContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export default function DashboardScreen({ navigation }: Props) {
  const { state, dispatch } = useApp();
  const { theme } = useTheme();
  const c = theme.colors;
  const sp = theme.spacing;
  const r = theme.radii;
  const fs = theme.typography.fontSizes;
  const { company, settings, printerStatus, connectedPrinterName, history } = state;

  const today = new Date().toLocaleDateString('es-MX', {
    weekday: 'short', day: 'numeric', month: 'short',
  });

  const todayStr = new Date().toLocaleDateString('es-MX');
  const todayEntries = history.filter((e) => e.date.startsWith(todayStr));
  const todayTotal = todayEntries.reduce((sum, e) => sum + parseFloat(e.total.replace('$', '') || '0'), 0);
  const locale = settings.locale ?? 'es-MX';
  const fmtMoney = (n: number) =>
    new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  const quickActions = [
    { label: 'Historial', icon: 'history', route: 'History' },
    { label: 'Impresora', icon: 'printer', route: 'Printer' },
    { label: 'Empresa', icon: 'building', route: 'Empresa' },
    { label: 'Ajustes', icon: 'settings', route: 'Settings' },
  ];

  const handleNewTicket = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dispatch({ type: 'NEW_TICKET' });
    navigation.navigate('NewTicket');
  };

  const styles = useMemo(() => StyleSheet.create({
    logo: { fontSize: theme.typography.fontSizes.h1, fontFamily: theme.typography.fonts.logo, color: c.brand.primary },
    root: { flex: 1, backgroundColor: c.bg.base },
    scroll: { flex: 1 },
    content: { paddingBottom: sp.lg },
    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: sp.xl, paddingVertical: sp.lg,
    },
    settingsBtn: { padding: sp.xs },
    printerPill: {
      marginHorizontal: sp.xl, marginBottom: sp.md,
      borderRadius: r.lg, padding: sp.md,
      flexDirection: 'row', alignItems: 'center', gap: sp.md, borderWidth: 1,
    },
    printerIcon: { width: 36, height: 36, borderRadius: r.sm, alignItems: 'center', justifyContent: 'center' },
    printerName: { fontSize: fs.small, fontWeight: '600', color: c.text.primary, fontFamily: theme.typography.fonts.uiSemiBold },
    printerSub: { fontSize: fs.label, color: c.text.secondary, fontFamily: theme.typography.fonts.ui },
    heroCard: {
      marginHorizontal: sp.xl, marginBottom: sp.lg,
      backgroundColor: c.brand.tint, borderRadius: r.lg,
      padding: sp.xl, ...theme.shadows.card,
    },
    heroGreeting: { fontSize: fs.body, color: c.text.secondary, fontFamily: theme.typography.fonts.ui, marginBottom: sp.xs },
    heroTotal: {
      fontSize: fs.display, lineHeight: 38, fontFamily: theme.typography.fonts.monoSemiBold,
      color: c.text.primary, letterSpacing: -0.5, marginBottom: sp.xs,
    },
    heroSub: { fontSize: fs.caption, color: c.text.muted, fontFamily: theme.typography.fonts.ui },
    cta: {
      marginHorizontal: sp.xl, marginBottom: sp.lg,
      borderRadius: r.md, height: 56,
      flexDirection: 'row', alignItems: 'center', gap: sp.md, paddingHorizontal: sp.xl,
      backgroundColor: c.brand.primary, ...theme.shadows.float,
    },
    ctaTitle: { flex: 1, fontSize: fs.h3, fontWeight: '700', color: c.text.onPrimary, fontFamily: theme.typography.fonts.uiBold },
    sectionTitle: {
      fontSize: fs.label, fontWeight: '600', color: c.text.muted,
      textTransform: 'uppercase', letterSpacing: 0.8,
      fontFamily: theme.typography.fonts.uiSemiBold,
      paddingHorizontal: sp.xl, marginBottom: sp.sm,
    },
    quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: sp.sm, paddingHorizontal: sp.xl, marginBottom: sp.xl },
    quickCard: {
      width: '48%', backgroundColor: c.bg.surface, borderRadius: r.md,
      borderWidth: 1, borderColor: c.border.subtle, padding: sp.lg, gap: sp.sm, alignItems: 'flex-start',
    },
    quickIconBg: { width: 40, height: 40, borderRadius: r.sm, alignItems: 'center', justifyContent: 'center' },
    quickLabel: { fontSize: fs.small, fontWeight: '600', color: c.text.primary, fontFamily: theme.typography.fonts.uiSemiBold },
    historyRow: {
      flexDirection: 'row', alignItems: 'center', gap: sp.md,
      backgroundColor: c.bg.surface, marginHorizontal: sp.xl, marginBottom: sp.sm,
      borderRadius: r.md, borderWidth: 1, borderColor: c.border.subtle, padding: sp.md,
    },
    historyIcon: { width: 36, height: 36, borderRadius: r.sm, alignItems: 'center', justifyContent: 'center' },
    historyTotal: { fontSize: fs.body, fontWeight: '700', color: c.text.primary, fontFamily: theme.typography.fonts.monoSemiBold },
    historyDate: { fontSize: fs.label, color: c.text.secondary, fontFamily: theme.typography.fonts.ui },
    emptyHero: {
      marginHorizontal: sp.xl, marginBottom: sp.lg,
      backgroundColor: c.brand.tint, borderRadius: r.lg,
      padding: sp.xl, alignItems: 'center', gap: sp.md, ...theme.shadows.card,
    },
    emptyText: { paddingBottom: 10, paddingTop: 5, fontSize: fs.small, color: c.text.secondary, fontFamily: theme.typography.fonts.ui, textAlign: 'center' },
  }), [theme]);

  const connected = printerStatus === 'connected';
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <NotavoLogo fontSize={theme.typography.fontSizes.h1} color={theme.colors.brand.logo} />
          <Pressable onPress={() => navigation.navigate('Settings')} style={styles.settingsBtn}>
            <Settings2 size={22} color={c.text.secondary} strokeWidth={1.75} />
          </Pressable>
        </View>

        <Pressable
          onPress={() => navigation.navigate('Printer')}
          style={[
            styles.printerPill,
            {
              borderColor: connected ? c.brand.primary + '55' : c.border.subtle,
              backgroundColor: connected ? c.brand.primarySoft : c.bg.surfaceAlt,
            },
          ]}
        >
          <View style={[styles.printerIcon, { backgroundColor: connected ? c.brand.primary : c.border.strong }]}>
            <Icon name="bluetooth" size={18} color={c.text.onPrimary} strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.printerName}>
              {connected ? (connectedPrinterName ?? 'Impresora conectada') : 'Sin impresora'}
            </Text>
            <Text style={styles.printerSub}>
              {connected ? 'Térmica 58mm' : 'Toca para conectar'}
            </Text>
          </View>
          <ChevronRight size={20} color={c.text.muted} strokeWidth={1.75} />
        </Pressable>

        {todayEntries.length === 0 ? (
          <View style={styles.emptyHero}>
            <Text style={styles.emptyText}>Todavía no vendiste hoy.{'\n'}Creá la primera nota.</Text>
            <Pressable
              onPress={handleNewTicket}
              style={({ pressed }) => [styles.cta, { marginHorizontal: 0, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
            >
              <PlusCircle size={20} color={c.text.onPrimary} strokeWidth={2} />
              <Text style={styles.ctaTitle}>Nueva nota</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.heroCard}>
            <Text style={styles.heroGreeting}>Hola 👋 {company.USUARIO || 'Hola'}</Text>
            <Text style={styles.heroTotal}>${fmtMoney(todayTotal)}</Text>
            <Text style={styles.heroSub}>{todayEntries.length} ticket{todayEntries.length !== 1 ? 's' : ''} hoy · {today}</Text>
          </View>
        )}

        {todayEntries.length > 0 && (
          <Pressable
            onPress={handleNewTicket}
            style={({ pressed }) => [styles.cta, { transform: [{ scale: pressed ? 0.97 : 1 }] }]}
          >
            <PlusCircle size={20} color={c.text.onPrimary} strokeWidth={2} />
            <Text style={styles.ctaTitle}>Nueva nota</Text>
          </Pressable>
        )}

        <Text style={styles.sectionTitle}>Accesos rápidos</Text>
        <View style={styles.quickGrid}>
          {quickActions.map((a) => (
            <Pressable
              key={a.route}
              onPress={() => navigation.navigate(a.route as any)}
              style={({ pressed }) => [styles.quickCard, pressed && { opacity: 0.75 }]}
            >
              <View style={[styles.quickIconBg, { backgroundColor: c.brand.primarySoft }]}>
                <Icon name={a.icon as any} size={22} color={c.brand.primary} strokeWidth={1.75} />
              </View>
              <Text style={styles.quickLabel}>{a.label}</Text>
            </Pressable>
          ))}
        </View>

        {history.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recientes</Text>
            {history.slice(0, 3).map((entry) => (
              <Pressable
                key={entry.id}
                style={styles.historyRow}
                onPress={() => navigation.navigate('History')}
              >
                <View style={[styles.historyIcon, { backgroundColor: c.brand.primarySoft }]}>
                  <Icon name="receipt" size={18} color={c.brand.primary} strokeWidth={1.75} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyTotal}>{entry.total}</Text>
                  <Text style={styles.historyDate}>{entry.date} · {entry.itemCount} art.</Text>
                </View>
                <ChevronRight size={18} color={c.text.muted} strokeWidth={1.75} />
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>

      <BottomNav active="dashboard" onNavigate={(route) => navigation.navigate(route as any)} />
    </SafeAreaView>
  );
}
