import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { colors, radii, fonts } from '../theme/tokens';
import { Icon } from '../components/Icon';
import { PosButton } from '../components/PosButton';
import { useApp } from '../state/AppContext';
import type { CompanyProfile } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Empresa'>;

export default function EmpresaScreen({ navigation }: Props) {
  const { state, updateCompany } = useApp();
  const accent = state.settings.accentColor;

  const [form, setForm] = useState<CompanyProfile>(state.company);

  useEffect(() => { setForm(state.company); }, [state.company]);

  const set = (key: keyof CompanyProfile) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handlePickLogo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para agregar el logo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [4, 1],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      setForm((f) => ({ ...f, logoBase64: result.assets[0].base64! }));
    }
  };

  const handleSave = async () => {
    if (!form.RZN_EMPRESA.trim()) {
      Alert.alert('Razón social requerida', 'Ingresa el nombre de la empresa.');
      return;
    }
    await updateCompany(form);
    Alert.alert('Guardado', 'Los datos de la empresa fueron actualizados.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const Field = ({ label, value, onChange, placeholder = '', multiline = false }: {
    label: string; value: string; onChange: (v: string) => void;
    placeholder?: string; multiline?: boolean;
  }) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, multiline && { height: 72, textAlignVertical: 'top', paddingTop: 12 }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        multiline={multiline}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow_left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Datos de empresa</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Logo</Text>
          <View style={styles.logoRow}>
            {form.logoBase64 ? (
              <Image
                source={{ uri: `data:image/png;base64,${form.logoBase64}` }}
                style={styles.logoPreview}
                resizeMode="contain"
              />
            ) : (
              <View style={[styles.logoPlaceholder, { backgroundColor: accent + '14', borderColor: accent + '33' }]}>
                <Icon name="image" size={28} color={accent} />
                <Text style={[styles.logoPlaceholderText, { color: accent }]}>Sin logo</Text>
              </View>
            )}
            <View style={{ gap: 8 }}>
              <PosButton size="sm" variant="outline" label="Seleccionar" icon="upload" onPress={handlePickLogo} />
              {form.logoBase64 && (
                <PosButton
                  size="sm"
                  variant="ghost"
                  label="Quitar"
                  icon="trash"
                  onPress={() => setForm((f) => ({ ...f, logoBase64: undefined }))}
                />
              )}
            </View>
          </View>
        </View>

        {/* Company fields */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Información fiscal</Text>
          <Field label="Razón social *" value={form.RZN_EMPRESA} onChange={set('RZN_EMPRESA')} placeholder="Mi Empresa S.A. de C.V." />
          <Field label="RFC" value={form.RFC_EMPRESA} onChange={set('RFC_EMPRESA')} placeholder="XAXX010101000" />
          <Field label="Dirección" value={form.DIR_EMPRESA} onChange={set('DIR_EMPRESA')} placeholder="Av. Principal #100, Col. Centro" multiline />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Punto de venta</Text>
          <Field label="Sucursal" value={form.SUCURSAL} onChange={set('SUCURSAL')} placeholder="Matriz" />
          <Field label="Caja" value={form.NOMCAJA} onChange={set('NOMCAJA')} placeholder="Caja-01" />
          <Field label="Cajero / Usuario" value={form.USUARIO} onChange={set('USUARIO')} placeholder="Nombre del usuario" />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PosButton variant="secondary" label="Cancelar" onPress={() => navigation.goBack()} style={{ flex: 1 }} />
        <PosButton label="Guardar" icon="check" onPress={handleSave} style={{ flex: 2 }} />
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
  content: { padding: 16, gap: 12, paddingBottom: 24 },
  card: {
    backgroundColor: colors.surface, borderRadius: radii.lg,
    borderWidth: 1, borderColor: colors.border, padding: 16, gap: 14,
  },
  sectionTitle: {
    fontSize: 12, fontWeight: '600', color: colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.6, fontFamily: fonts.ui, marginBottom: 2,
  },
  field: { gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: colors.textMuted, fontFamily: fonts.ui, textTransform: 'uppercase', letterSpacing: 0.4 },
  fieldInput: {
    height: 48, borderWidth: 1, borderColor: colors.border, borderRadius: radii.sm,
    paddingHorizontal: 14, fontSize: 15, color: colors.text, fontFamily: fonts.ui,
    backgroundColor: colors.bg,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  logoPreview: { width: 120, height: 50, borderRadius: 6, borderWidth: 1, borderColor: colors.border },
  logoPlaceholder: {
    width: 120, height: 50, borderRadius: 6, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8,
  },
  logoPlaceholderText: { fontSize: 13, fontWeight: '500', fontFamily: fonts.ui },
  footer: {
    flexDirection: 'row', gap: 10, padding: 16,
    backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border,
  },
});
