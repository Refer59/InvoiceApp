import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, TextInput, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { colors, radii, fonts } from '../theme/tokens';
import { Icon } from '../components/Icon';
import { PosButton } from '../components/PosButton';
import { useApp } from '../state/AppContext';
import type { TicketItem } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'NewTicket'>;

export default function NewTicketScreen({ navigation }: Props) {
  const { state, dispatch } = useApp();
  const insets = useSafeAreaInsets()
  const { currentTicket, settings } = state;
  const accent = settings.accentColor;

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
      Alert.alert('Sin partidas', 'Agrega al menos un artículo antes de continuar.');
      return;
    }
    navigation.navigate('Preview');
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow_left" size={22} color={colors.text} />
        </Pressable>
        <View>
          <Text style={styles.title}>Nueva nota de venta</Text>
          <Text style={styles.subtitle}>Nota #{currentTicket.NUMDOCTO}</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Company info summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Empresa</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Razón social</Text>
            <Text style={styles.infoValue}>{state.company.RZN_EMPRESA || '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>RFC</Text>
            <Text style={styles.infoValue}>{state.company.RFC_EMPRESA || '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Sucursal</Text>
            <Text style={styles.infoValue}>{state.company.SUCURSAL || '—'}</Text>
          </View>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Partidas</Text>
            <Pressable
              onPress={() => navigation.navigate('AddItem')}
              style={[styles.addBtn, { backgroundColor: accent }]}
            >
              <Icon name="plus" size={16} color="#fff" />
              <Text style={styles.addBtnText}>Agregar</Text>
            </Pressable>
          </View>

          {currentTicket.items.length === 0 ? (
            <View style={styles.emptyItems}>
              <Icon name="receipt" size={32} color={colors.textFaint} />
              <Text style={styles.emptyText}>Sin partidas aún</Text>
            </View>
          ) : (
            <>
              {/* Table header */}
              <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
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
                    <Icon name="x" size={16} color={colors.danger} />
                  </Pressable>
                </View>
              ))}
            </>
          )}
        </View>

        {/* Totals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Totales</Text>
          {[
            { label: 'Subtotal', value: `$${currentTicket.subtotal.toFixed(2)}` },
            { label: 'Descuento', value: `$${currentTicket.discount.toFixed(2)}` },
            { label: 'Impuestos (16%)', value: `$${currentTicket.taxes.toFixed(2)}` },
          ].map((row) => (
            <View key={row.label} style={styles.totalRow}>
              <Text style={styles.totalLabel}>{row.label}</Text>
              <Text style={styles.totalValue}>{row.value}</Text>
            </View>
          ))}
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.grandLabel}>Total</Text>
            <Text style={[styles.grandValue, { color: accent }]}>${currentTicket.total.toFixed(2)}</Text>
          </View>

          <View style={styles.receivedRow}>
            <Text style={styles.totalLabel}>Recibido</Text>
            <TextInput
              style={styles.receivedInput}
              value={receivedInput}
              onChangeText={handleReceivedChange}
              keyboardType="decimal-pad"
              placeholder="$0.00"
              placeholderTextColor={colors.textFaint}
            />
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Cambio</Text>
            <Text style={[styles.totalValue, { color: colors.success }]}>
              ${currentTicket.change.toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[ styles.footer, { paddingBottom: insets.bottom + 4 } ]}>
        <PosButton variant="secondary" label="Cancelar" onPress={() => navigation.goBack()} style={{ flex: 1 }} />
        <PosButton label="Vista previa" icon="eye" onPress={handlePreview} style={{ flex: 2 }} />
      </View>
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
  subtitle: { fontSize: 13, color: colors.textMuted, fontFamily: fonts.ui },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 24 },
  section: {
    backgroundColor: colors.surface, borderRadius: radii.lg,
    borderWidth: 1, borderColor: colors.border, padding: 14,
  },
  sectionTitle: {
    fontSize: 12, fontWeight: '600', color: colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10, fontFamily: fonts.ui,
  },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  infoLabel: { fontSize: 13, color: colors.textMuted, fontFamily: fonts.ui },
  infoValue: { fontSize: 13, fontWeight: '500', color: colors.text, fontFamily: fonts.ui, maxWidth: '60%', textAlign: 'right' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: radii.sm,
  },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '600', fontFamily: fonts.ui },
  emptyItems: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyText: { fontSize: 14, color: colors.textFaint, fontFamily: fonts.ui },
  tableHeader: {
    flexDirection: 'row', borderBottomWidth: 1, paddingBottom: 6, marginBottom: 4,
  },
  tableHead: {
    flex: 1, fontSize: 11, fontWeight: '600', color: colors.textMuted,
    fontFamily: fonts.ui, textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 6,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  tableCell: { flex: 1, fontSize: 12, color: colors.text, fontFamily: fonts.mono },
  removeBtn: { width: 32, alignItems: 'center' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  totalLabel: { fontSize: 13, color: colors.textMuted, fontFamily: fonts.ui },
  totalValue: { fontSize: 13, fontWeight: '500', color: colors.text, fontFamily: fonts.mono },
  grandTotal: {
    borderTopWidth: 1, borderTopColor: colors.border,
    marginTop: 6, paddingTop: 10, marginBottom: 4,
  },
  grandLabel: { fontSize: 16, fontWeight: '700', color: colors.text, fontFamily: fonts.ui },
  grandValue: { fontSize: 18, fontWeight: '700', fontFamily: fonts.mono },
  receivedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 5 },
  receivedInput: {
    fontSize: 14, fontFamily: fonts.mono, color: colors.text,
    borderWidth: 1, borderColor: colors.border, borderRadius: radii.sm,
    paddingHorizontal: 10, paddingVertical: 6, minWidth: 100, textAlign: 'right',
  },
  footer: {
    flexDirection: 'row', gap: 10, padding: 16,
    backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border,
  },
});
