import React, { useMemo, useState, useCallback, memo } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import type { RootStackParamList } from '../../App';
import { useTheme } from '../theme';
import { PosButton } from '../components/PosButton';
import { useApp } from '../state/AppContext';

type Props = NativeStackScreenProps<RootStackParamList, 'AddItem'>;

const Field = memo(({
  id, label, value, onChange, onFocus, onBlur, keyboardType = 'default', placeholder = '', focused, c, sp, r, fs, uiFont, uiSemiBold,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void; onFocus: () => void; onBlur: () => void;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad'; placeholder?: string;
  focused: string | null; c: any; sp: any; r: any; fs: any; uiFont: string; uiSemiBold: string;
}) => (
  <View style={{ gap: sp.xs }}>
    <Text style={{ fontSize: fs.label, fontWeight: '600', color: c.text.secondary, fontFamily: uiSemiBold, textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</Text>
    <TextInput
      style={[
        { height: 48, borderWidth: 1, borderColor: c.border.subtle, borderRadius: r.sm, paddingHorizontal: sp.md, fontSize: fs.input, color: c.text.primary, fontFamily: uiFont, backgroundColor: c.bg.base },
        focused === id && { borderColor: c.brand.primary, borderWidth: 1.5 },
      ]}
      value={value}
      onChangeText={onChange}
      keyboardType={keyboardType}
      placeholder={placeholder}
      placeholderTextColor={c.text.muted}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  </View>
));

export default function AddItemScreen({ navigation }: Props) {
  const { state, dispatch } = useApp();
  const { theme } = useTheme();
   const insets = useSafeAreaInsets()
  const c = theme.colors;
  const sp = theme.spacing;
  const r = theme.radii;
  const fs = theme.typography.fontSizes;

  const [cant, setCant] = useState('1');
  const [clave, setClave] = useState('');
  const [descrip, setDescrip] = useState('');
  const [precio, setPrecio] = useState('');
  const [focused, setFocused] = useState<string | null>(null);

  const handleSetCant = useCallback((v: string) => setCant(v), []);
  const handleSetClave = useCallback((v: string) => setClave(v), []);
  const handleSetDescrip = useCallback((v: string) => setDescrip(v), []);
  const handleSetPrecio = useCallback((v: string) => setPrecio(v), []);
  const handleFocus = useCallback((id: string) => () => setFocused(id), []);
  const handleBlur = useCallback(() => setFocused(null), []);

  const locale = state.settings.locale ?? 'es-MX';
  const fmtMoney = (n: number) =>
    new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  const importe = parseFloat(cant || '0') * parseFloat(precio || '0');

  const handleAdd = () => {
    if (!descrip.trim()) {
      Alert.alert('Descripción requerida', 'Ingresá la descripción del artículo.');
      return;
    }
    if (!precio || parseFloat(precio) <= 0) {
      Alert.alert('Precio inválido', 'Ingresá un precio mayor a cero.');
      return;
    }

    const newItem = {
      CANT: cant,
      CLAVE: clave || '—',
      DESCRIP: descrip.trim(),
      PREC: `$${fmtMoney(parseFloat(precio))}`,
      IMP: fmtMoney(importe),
    };

    const currentTicket = state.currentTicket;
    if (!currentTicket) return;

    const items = [...currentTicket.items, newItem];
    const subtotal = items.reduce((s, it) => s + parseFloat(it.IMP.replace(/[^0-9.,]/g, '').replace(',', '.') || '0'), 0);
    const taxes = subtotal * 0.16;
    const total = subtotal + taxes - currentTicket.discount;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dispatch({ type: 'UPDATE_TICKET', ticket: { items, subtotal, taxes, total } });
    navigation.goBack();
  };

  const styles = useMemo(() => StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg.base },
    header: {
      flexDirection: 'row', alignItems: 'center', gap: sp.md,
      paddingHorizontal: sp.lg, paddingVertical: sp.md,
      backgroundColor: c.bg.surface, borderBottomWidth: 1, borderBottomColor: c.border.subtle,
    },
    closeBtn: { padding: sp.xs },
    title: { fontSize: fs.h3, fontWeight: '700', color: c.text.primary, fontFamily: theme.typography.fonts.uiBold },
    content: { padding: sp.lg },
    card: {
      backgroundColor: c.bg.surface, borderRadius: r.lg,
      borderWidth: 1, borderColor: c.border.subtle, padding: sp.lg, gap: sp.lg,
    },
    importeRow: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      borderWidth: 1, borderColor: c.brand.primary + '55',
      borderRadius: r.md, padding: sp.md, marginTop: sp.xs,
      backgroundColor: c.brand.primarySoft,
    },
    importeLabel: { fontSize: fs.small, fontWeight: '600', fontFamily: theme.typography.fonts.uiSemiBold, color: c.brand.primaryInk },
    importeValue: { fontSize: fs.large, fontWeight: '700', fontFamily: theme.typography.fonts.monoSemiBold, color: c.brand.primary },
    footer: {
      flexDirection: 'row', gap: sp.sm, padding: sp.lg,
      backgroundColor: c.bg.surface, borderTopWidth: 1, borderTopColor: c.border.subtle,
    },
  }), [theme]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <X size={22} color={c.text.primary} strokeWidth={1.75} />
        </Pressable>
        <Text style={styles.title}>Agregar partida</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Field id="cant" label="Cantidad" value={cant} onChange={handleSetCant} onFocus={handleFocus('cant')} onBlur={handleBlur} keyboardType="decimal-pad" placeholder="1" focused={focused} c={c} sp={sp} r={r} fs={fs} uiFont={theme.typography.fonts.ui} uiSemiBold={theme.typography.fonts.uiSemiBold} />
          <Field id="clave" label="Clave / SKU" value={clave} onChange={handleSetClave} onFocus={handleFocus('clave')} onBlur={handleBlur} placeholder="Opcional" focused={focused} c={c} sp={sp} r={r} fs={fs} uiFont={theme.typography.fonts.ui} uiSemiBold={theme.typography.fonts.uiSemiBold} />
          <Field id="descrip" label="Descripción *" value={descrip} onChange={handleSetDescrip} onFocus={handleFocus('descrip')} onBlur={handleBlur} placeholder="Nombre del artículo" focused={focused} c={c} sp={sp} r={r} fs={fs} uiFont={theme.typography.fonts.ui} uiSemiBold={theme.typography.fonts.uiSemiBold} />
          <Field id="precio" label="Precio unitario *" value={precio} onChange={handleSetPrecio} onFocus={handleFocus('precio')} onBlur={handleBlur} keyboardType="decimal-pad" placeholder="0.00" focused={focused} c={c} sp={sp} r={r} fs={fs} uiFont={theme.typography.fonts.ui} uiSemiBold={theme.typography.fonts.uiSemiBold} />
          <View style={styles.importeRow}>
            <Text style={styles.importeLabel}>Importe</Text>
            <Text style={styles.importeValue}>${fmtMoney(importe)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 4}]}>
        <PosButton variant="secondary" label="Cancelar" onPress={() => navigation.goBack()} style={{ flex: 1 }} />
        <PosButton label="Agregar" icon="plus" onPress={handleAdd} style={{ flex: 2 }} />
      </View>
    </SafeAreaView>
  );
}
