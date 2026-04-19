import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronLeft } from 'lucide-react-native';
import type { RootStackParamList } from '../../App';
import { useTheme } from '../theme';
import { PosButton } from '../components/PosButton';
import { TicketPreview } from '../components/TicketPreview';
import { useApp } from '../state/AppContext';
import type { TicketValues } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Preview'>;

export default function PreviewScreen({ navigation }: Props) {
  const { state } = useApp();
  const { theme } = useTheme();
  const c = theme.colors;
  const sp = theme.spacing;
  const r = theme.radii;
  const fs = theme.typography.fontSizes;
  const { currentTicket, company, settings } = state;
  const [showLogo, setShowLogo] = useState(!!company.logoBase64);

  const locale = settings.locale ?? 'es-MX';
  const fmtMoney = (n: number) =>
    new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  if (!currentTicket) { navigation.goBack(); return null; }

  const values: TicketValues = {
    RZN_EMPRESA: company.RZN_EMPRESA,
    DIR_EMPRESA: company.DIR_EMPRESA,
    RFC_EMPRESA: company.RFC_EMPRESA,
    SUCURSAL: company.SUCURSAL,
    NOMCAJA: company.NOMCAJA,
    NUMDOCTO: currentTicket.NUMDOCTO,
    FECHADOC: currentTicket.FECHADOC,
    HORADOC: currentTicket.HORADOC,
    USUARIO: company.USUARIO,
    SUBTOTAL: `$${fmtMoney(currentTicket.subtotal)}`,
    DESCUENTO: `$${fmtMoney(currentTicket.discount)}`,
    IMPUESTOS: `$${fmtMoney(currentTicket.taxes)}`,
    TOTALDOC: `$${fmtMoney(currentTicket.total)}`,
    RECIBIDO: `$${fmtMoney(currentTicket.received)}`,
    CAMBIODOCTO: `$${fmtMoney(currentTicket.change)}`,
    NUM_VENDIDOS: String(currentTicket.items.length),
    MONTOLETRAS: '',
    PARTIDAS: currentTicket.items,
    FORMAPAGO: currentTicket.payments.length > 0
      ? currentTicket.payments
      : [{ CONCEP: 'Efectivo', IMPORTE: `$${fmtMoney(currentTicket.received)}` }],
    IVA: [], IEPS: [], ISR: [],
  };

  const styles = useMemo(() => StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg.base },
    header: {
      flexDirection: 'row', alignItems: 'center', gap: sp.md,
      paddingHorizontal: sp.lg, paddingVertical: sp.md,
      backgroundColor: c.bg.surface, borderBottomWidth: 1, borderBottomColor: c.border.subtle,
    },
    backBtn: { padding: sp.xs },
    title: { fontSize: fs.h3, fontWeight: '700', color: c.text.primary, fontFamily: theme.typography.fonts.uiBold },
    subtitle: { fontSize: fs.caption, color: c.text.secondary, fontFamily: theme.typography.fonts.ui },
    logoToggle: { flexDirection: 'row', alignItems: 'center', gap: sp.sm },
    logoLabel: { fontSize: fs.caption, color: c.text.secondary, fontFamily: theme.typography.fonts.ui },
    scroll: { flex: 1 },
    content: { padding: sp.lg, gap: sp.lg, paddingBottom: sp.xl },
    paperContainer: { maxWidth: 300, alignSelf: 'center', width: '100%' },
    summaryCard: {
      borderWidth: 1, borderRadius: r.lg, padding: sp.xl,
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      borderColor: c.brand.primary + '33', backgroundColor: c.brand.primarySoft,
    },
    summaryLabel: { fontSize: fs.small, fontWeight: '600', fontFamily: theme.typography.fonts.uiSemiBold, color: c.brand.primaryInk },
    summaryValue: { fontSize: fs.h1, fontWeight: '700', fontFamily: theme.typography.fonts.monoSemiBold, color: c.brand.primary },
    footer: {
      flexDirection: 'row', gap: sp.sm, padding: sp.lg,
      backgroundColor: c.bg.surface, borderTopWidth: 1, borderTopColor: c.border.subtle,
    },
  }), [theme]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={22} color={c.text.primary} strokeWidth={1.75} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Vista previa</Text>
          <Text style={styles.subtitle}>Nota #{currentTicket.NUMDOCTO}</Text>
        </View>
        {company.logoBase64 ? (
          <View style={styles.logoToggle}>
            <Text style={styles.logoLabel}>Logo</Text>
            <Switch
              value={showLogo}
              onValueChange={setShowLogo}
              trackColor={{ false: c.border.subtle, true: c.brand.primary }}
              thumbColor="#fff"
            />
          </View>
        ) : null}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.paperContainer}>
          <TicketPreview values={values} showLogo={showLogo} logoBase64={company.logoBase64} />
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total a cobrar</Text>
          <Text style={styles.summaryValue}>${fmtMoney(currentTicket.total)}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PosButton variant="secondary" label="Editar" icon="edit" onPress={() => navigation.goBack()} style={{ flex: 1 }} />
        <PosButton label="Imprimir ticket" icon="printer" onPress={() => navigation.navigate('Printing')} style={{ flex: 2 }} />
      </View>
    </SafeAreaView>
  );
}
