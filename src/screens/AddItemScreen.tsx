import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { colors, radii, fonts } from '../theme/tokens';
import { Icon } from '../components/Icon';
import { PosButton } from '../components/PosButton';
import { useApp } from '../state/AppContext';

type Props = NativeStackScreenProps<RootStackParamList, 'AddItem'>;

export default function AddItemScreen({ navigation }: Props) {
  const { state, dispatch } = useApp();
  const accent = state.settings.accentColor;

  const [cant, setCant] = useState('1');
  const [clave, setClave] = useState('');
  const [descrip, setDescrip] = useState('');
  const [precio, setPrecio] = useState('');

  const importe = (parseFloat(cant || '0') * parseFloat(precio || '0')).toFixed(2);

  const handleAdd = () => {
    if (!descrip.trim()) {
      Alert.alert('Descripción requerida', 'Ingresa la descripción del artículo.');
      return;
    }
    if (!precio || parseFloat(precio) <= 0) {
      Alert.alert('Precio inválido', 'Ingresa un precio mayor a cero.');
      return;
    }

    const newItem = {
      CANT: cant,
      CLAVE: clave || '—',
      DESCRIP: descrip.trim(),
      PREC: `$${parseFloat(precio).toFixed(2)}`,
      IMP: importe,
    };

    const currentTicket = state.currentTicket;
    if (!currentTicket) return;

    const items = [...currentTicket.items, newItem];
    const subtotal = items.reduce((s, it) => s + parseFloat(it.IMP || '0'), 0);
    const taxes = subtotal * 0.16;
    const total = subtotal + taxes - currentTicket.discount;

    dispatch({
      type: 'UPDATE_TICKET',
      ticket: { items, subtotal, taxes, total },
    });
    navigation.goBack();
  };

  const Field = ({
    label, value, onChange, keyboardType = 'default', placeholder = '',
  }: {
    label: string; value: string;
    onChange: (v: string) => void;
    keyboardType?: 'default' | 'numeric' | 'decimal-pad';
    placeholder?: string;
  }) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.fieldInput}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="x" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Agregar partida</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Field label="Cantidad" value={cant} onChange={setCant} keyboardType="decimal-pad" placeholder="1" />
          <Field label="Clave / SKU" value={clave} onChange={setClave} placeholder="Opcional" />
          <Field label="Descripción *" value={descrip} onChange={setDescrip} placeholder="Nombre del artículo" />
          <Field label="Precio unitario *" value={precio} onChange={setPrecio} keyboardType="decimal-pad" placeholder="0.00" />

          {/* Importe preview */}
          <View style={[styles.importeRow, { backgroundColor: accent + '12', borderColor: accent + '33' }]}>
            <Text style={[styles.importeLabel, { color: accent }]}>Importe</Text>
            <Text style={[styles.importeValue, { color: accent }]}>${importe}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PosButton variant="secondary" label="Cancelar" onPress={() => navigation.goBack()} style={{ flex: 1 }} />
        <PosButton label="Agregar" icon="plus" onPress={handleAdd} style={{ flex: 2 }} />
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
  content: { padding: 16 },
  card: {
    backgroundColor: colors.surface, borderRadius: radii.lg,
    borderWidth: 1, borderColor: colors.border, padding: 16, gap: 14,
  },
  field: { gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: colors.textMuted, fontFamily: fonts.ui, textTransform: 'uppercase', letterSpacing: 0.4 },
  fieldInput: {
    height: 48, borderWidth: 1, borderColor: colors.border, borderRadius: radii.sm,
    paddingHorizontal: 14, fontSize: 16, color: colors.text, fontFamily: fonts.ui,
    backgroundColor: colors.bg,
  },
  importeRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderRadius: radii.md, padding: 14, marginTop: 4,
  },
  importeLabel: { fontSize: 14, fontWeight: '600', fontFamily: fonts.ui },
  importeValue: { fontSize: 22, fontWeight: '700', fontFamily: fonts.mono },
  footer: {
    flexDirection: 'row', gap: 10, padding: 16,
    backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border,
  },
});
