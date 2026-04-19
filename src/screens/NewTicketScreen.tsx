import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, Pressable, TextInput, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronLeft, X } from 'lucide-react-native';
import type { RootStackParamList } from '../../App';
import { useTheme } from '../theme';
import { PosButton } from '../components/PosButton';
import { useApp } from '../state/AppContext';

type Props = NativeStackScreenProps<RootStackParamList, 'NewTicket'>;

export default function NewTicketScreen({ navigation }: Props) {
  const { state, dispatch } = useApp();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const c = theme.colors;
  const sp = theme.spacing;
  const r = theme.radii;
  const fs = theme.typography.fontSizes;
  const { currentTicket, settings } = state;

  const locale = settings.locale ?? 'es-MX';
  const fmtMoney = (n: number) =>
    new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  const [receivedInput, setReceivedInput] = useState('');

  if (!currentTicket) {
    navigation.goBack();
    return null;
  }

  const handleRemoveItem = (index: number) => {
    const items = currentTicket.items.filter((_, i) => i !== index);
    const subtotal = items.reduce((s, it) => s + parseFloat(it.IMP || '0'), 0);
    const taxes = subtotal * 0.16;
    const total = subtotal + taxes - currentTicket.discount;
    dispatch({ type: 'UPDATE_TICKET', ticket: { items, subtotal, taxes, total } });
  };

  const handleReceivedChange = (val: string) => {
    setReceivedInput(val);
    const received = parseFloat(val || '0');
    const change = Math.max(0, received - currentTicket.total);
    dispatch({ type: 'UPDATE_TICKET', ticket: { received, change } });
  };

  const handlePreview = () => {
    if (currentTicket.items.length === 0) {
      Alert.alert('Sin partidas', 'Agregá al menos un artículo antes de continuar.');
      return;
    }
    navigation.navigate('Preview');
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
    scroll: { flex: 1 },
    content: { padding: sp.lg, gap: sp.md, paddingBottom: sp.xl },
    section: {
      backgroundColor: c.bg.surface, borderRadius: r.lg,
      borderWidth: 1, borderColor: c.border.subtle, padding: sp.md,
    },
    sectionTitle: {
      fontSize: fs.label, fontWeight: '600', color: c.text.secondary,
      textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: sp.sm,
      fontFamily: theme.typography.fonts.uiSemiBold,
    },
    sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: sp.sm },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: sp.xs },
    infoLabel: { fontSize: fs.caption, color: c.text.secondary, fontFamily: theme.typography.fonts.ui },
    infoValue: { fontSize: fs.caption, fontWeight: '500', color: c.text.primary, fontFamily: theme.typography.fonts.ui, maxWidth: '60%', textAlign: 'right' },
    addBtn: {
      flexDirection: 'row', alignItems: 'center', gap: sp.xs,
      paddingHorizontal: sp.md, paddingVertical: sp.xs,
      borderRadius: r.sm, backgroundColor: c.brand.primary,
    },
    addBtnText: { color: c.text.onPrimary, fontSize: fs.caption, fontWeight: '600', fontFamily: theme.typography.fonts.uiSemiBold },
    emptyItems: { alignItems: 'center', paddingVertical: sp.xl, gap: sp.sm },
    emptyText: { fontSize: fs.small, color: c.text.muted, fontFamily: theme.typography.fonts.ui },
    tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: c.border.subtle, paddingBottom: sp.xs, marginBottom: sp.xs },
    tableHead: { flex: 1, fontSize: fs.micro, fontWeight: '600', color: c.text.secondary, fontFamily: theme.typography.fonts.uiSemiBold, textTransform: 'uppercase' },
    tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: sp.xs, borderBottomWidth: 1, borderBottomColor: c.border.subtle },
    tableCell: { flex: 1, fontSize: fs.label, color: c.text.primary, fontFamily: theme.typography.fonts.mono },
    removeBtn: { width: 32, alignItems: 'center' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: sp.xs },
    totalLabel: { fontSize: fs.caption, color: c.text.secondary, fontFamily: theme.typography.fonts.ui },
    totalValue: { fontSize: fs.caption, fontWeight: '500', color: c.text.primary, fontFamily: theme.typography.fonts.mono },
    grandTotal: { borderTopWidth: 1, borderTopColor: c.border.subtle, marginTop: sp.xs, paddingTop: sp.sm, marginBottom: sp.xs },
    grandLabel: { fontSize: fs.input, fontWeight: '700', color: c.text.primary, fontFamily: theme.typography.fonts.uiBold },
    grandValue: { fontSize: fs.mono2, fontWeight: '700', color: c.brand.primary, fontFamily: theme.typography.fonts.monoSemiBold },
    receivedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: sp.xs },
    receivedInput: {
      fontSize: fs.small, fontFamily: theme.typography.fonts.mono, color: c.text.primary,
      borderWidth: 1, borderColor: c.border.subtle, borderRadius: r.sm,
      paddingHorizontal: sp.md, paddingVertical: sp.xs, minWidth: 100, textAlign: 'right',
      backgroundColor: c.bg.base,
    },
    changeValue: { fontSize: fs.caption, fontWeight: '500', color: c.semantic.success, fontFamily: theme.typography.fonts.mono },
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
        <View>
          <Text style={styles.title}>Nueva nota</Text>
          <Text style={styles.subtitle}>#{currentTicket.NUMDOCTO}</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Empresa</Text>
          {[
            ['Razón social', state.company.RZN_EMPRESA],
            ['RFC', state.company.RFC_EMPRESA],
            ['Sucursal', state.company.SUCURSAL],
          ].map(([lbl, val]) => (
            <View key={lbl} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{lbl}</Text>
              <Text style={styles.infoValue}>{val || '—'}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Partidas</Text>
            <Pressable onPress={() => navigation.navigate('AddItem')} style={styles.addBtn}>
              <X size={14} color={c.text.onPrimary} strokeWidth={2} style={{ transform: [{ rotate: '45deg' }] }} />
              <Text style={styles.addBtnText}>Agregar</Text>
            </Pressable>
          </View>
          {currentTicket.items.length === 0 ? (
            <View style={styles.emptyItems}>
              <Text style={styles.emptyText}>Sin partidas aún</Text>
            </View>
          ) : (
            <>
              <View style={styles.tableHeader}>
                {['Cant.', 'Clave', 'Descripción', 'Precio', 'Importe'].map((h, i) => (
                  <Text key={i} style={[styles.tableHead, i === 2 && { flex: 2 }]}>{h}</Text>
                ))}
                <View style={{ width: 32 }} />
              </View>
              {currentTicket.items.map((item, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{item.CANT}</Text>
                  <Text style={styles.tableCell}>{item.CLAVE}</Text>
                  <Text style={[styles.tableCell, { flex: 2 }]} numberOfLines={2}>{item.DESCRIP}</Text>
                  <Text style={styles.tableCell}>{item.PREC}</Text>
                  <Text style={[styles.tableCell, { fontWeight: '600' }]}>{item.IMP}</Text>
                  <Pressable onPress={() => handleRemoveItem(idx)} style={styles.removeBtn}>
                    <X size={16} color={c.semantic.danger} strokeWidth={2} />
                  </Pressable>
                </View>
              ))}
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Totales</Text>
          {[
            { label: 'Subtotal', value: `$${fmtMoney(currentTicket.subtotal)}` },
            { label: 'Descuento', value: `$${fmtMoney(currentTicket.discount)}` },
            { label: 'Impuestos (16%)', value: `$${fmtMoney(currentTicket.taxes)}` },
          ].map((row) => (
            <View key={row.label} style={styles.totalRow}>
              <Text style={styles.totalLabel}>{row.label}</Text>
              <Text style={styles.totalValue}>{row.value}</Text>
            </View>
          ))}
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.grandLabel}>Total</Text>
            <Text style={styles.grandValue}>${fmtMoney(currentTicket.total)}</Text>
          </View>
          <View style={styles.receivedRow}>
            <Text style={styles.totalLabel}>Recibido</Text>
            <TextInput
              style={styles.receivedInput}
              value={receivedInput}
              onChangeText={handleReceivedChange}
              keyboardType="decimal-pad"
              placeholder="$0.00"
              placeholderTextColor={c.text.muted}
            />
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Cambio</Text>
            <Text style={styles.changeValue}>${fmtMoney(currentTicket.change)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + sp.xs }]}>
        <PosButton variant="secondary" label="Cancelar" onPress={() => navigation.goBack()} style={{ flex: 1 }} />
        <PosButton label="Vista previa" icon="eye" onPress={handlePreview} style={{ flex: 2 }} />
      </View>
    </SafeAreaView>
  );
}
