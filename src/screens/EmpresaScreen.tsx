import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronLeft } from 'lucide-react-native';
import type { RootStackParamList } from '../../App';
import { useTheme } from '../theme';
import { PosButton } from '../components/PosButton';
import { useApp } from '../state/AppContext';
import type { CompanyProfile } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Empresa'>;

export default function EmpresaScreen({ navigation }: Props) {
  const { state, updateCompany } = useApp();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;
  const sp = theme.spacing;
  const r = theme.radii;
  const fs = theme.typography.fontSizes;

  const [form, setForm] = useState<CompanyProfile>(state.company);
  const [focused, setFocused] = useState<string | null>(null);

  useEffect(() => { setForm(state.company); }, [state.company]);

  const set = (key: keyof CompanyProfile) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handlePickLogo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para agregar el logo.');
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images', aspect: [4, 1], quality: 0.7, base64: true,
      });
      if (!result.canceled && result.assets[0].base64)
        setForm((f) => ({ ...f, logoBase64: result.assets[0].base64! }));
    } catch { /* ignore */ }
  };

  const handleSave = async () => {
    if (!form.RZN_EMPRESA.trim()) {
      Alert.alert('Razón social requerida', 'Ingresá el nombre de la empresa.');
      return;
    }
    await updateCompany(form);
    Alert.alert('Guardado', 'Datos actualizados.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
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
    content: { padding: sp.lg, gap: sp.md, paddingBottom: sp.xl },
    card: {
      backgroundColor: c.bg.surface, borderRadius: r.lg,
      borderWidth: 1, borderColor: c.border.subtle, padding: sp.lg, gap: sp.lg,
    },
    sectionTitle: {
      fontSize: fs.label, fontWeight: '600', color: c.text.secondary,
      textTransform: 'uppercase', letterSpacing: 0.6,
      fontFamily: theme.typography.fonts.uiSemiBold, marginBottom: 2,
    },
    field: { gap: sp.xs },
    fieldLabel: {
      fontSize: fs.label, fontWeight: '600', color: c.text.secondary,
      fontFamily: theme.typography.fonts.uiSemiBold, textTransform: 'uppercase', letterSpacing: 0.6,
    },
    fieldInput: {
      height: 48, borderWidth: 1, borderColor: c.border.subtle, borderRadius: r.sm,
      paddingHorizontal: sp.md, fontSize: fs.body, color: c.text.primary,
      fontFamily: theme.typography.fonts.ui, backgroundColor: c.bg.base,
    },
    fieldInputFocused: { borderColor: c.brand.primary, borderWidth: 1.5 },
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: sp.md },
    logoPreviewContainer: { flex: 3 },
    logoActions: { width: '40%' },
    logoPreview: { width: '100%', height: 72, borderRadius: r.xs, borderWidth: 1, borderColor: c.border.subtle },
    logoPlaceholder: {
      width: '100%', height: 72, borderRadius: r.xs, borderWidth: 1,
      borderColor: c.brand.primary + '44',
      alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: sp.sm,
      backgroundColor: c.brand.primarySoft,
    },
    logoPlaceholderText: { fontSize: fs.caption, fontWeight: '500', fontFamily: theme.typography.fonts.ui, color: c.brand.primaryInk },
    footer: {
      flexDirection: 'row', gap: sp.sm, padding: sp.lg,
      backgroundColor: c.bg.surface, borderTopWidth: 1, borderTopColor: c.border.subtle,
    },
  }), [theme]);

  const Field = ({ id, label, value, onChange, placeholder = '', multiline = false }: {
    id: string; label: string; value: string; onChange: (v: string) => void;
    placeholder?: string; multiline?: boolean;
  }) => (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[
          styles.fieldInput,
          focused === id && styles.fieldInputFocused,
          multiline && { height: 72, textAlignVertical: 'top', paddingTop: sp.md },
        ]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={c.text.muted}
        multiline={multiline}
        onFocus={() => setFocused(id)}
        onBlur={() => setFocused(null)}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={22} color={c.text.primary} strokeWidth={1.75} />
        </Pressable>
        <Text style={styles.title}>Datos de empresa</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Logo</Text>
          <View style={styles.logoRow}>
            <View style={styles.logoPreviewContainer}>
              {form.logoBase64 ? (
                <Image
                  source={{ uri: `data:image/png;base64,${form.logoBase64}` }}
                  style={styles.logoPreview} resizeMode="contain"
                />
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Text style={styles.logoPlaceholderText}>Sin logo</Text>
                </View>
              )}
            </View>
            <View style={styles.logoActions}>
              <PosButton size="sm" variant="outline" label="Seleccionar" icon="upload" onPress={handlePickLogo} full />
              {form.logoBase64 && (
                <PosButton size="sm" variant="ghost" label="Quitar" icon="trash"
                  onPress={() => setForm((f) => ({ ...f, logoBase64: undefined }))} full />
              )}
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Información fiscal</Text>
          <Field id="rznEmpresa" label="Razón social *" value={form.RZN_EMPRESA} onChange={set('RZN_EMPRESA')} placeholder="Mi Empresa S.A." />
          <Field id="rfc" label="RFC" value={form.RFC_EMPRESA} onChange={set('RFC_EMPRESA')} placeholder="XAXX010101000" />
          <Field id="dir" label="Dirección" value={form.DIR_EMPRESA} onChange={set('DIR_EMPRESA')} placeholder="Av. Principal #100" multiline />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Punto de venta</Text>
          <Field id="sucursal" label="Sucursal" value={form.SUCURSAL} onChange={set('SUCURSAL')} placeholder="Matriz" />
          <Field id="caja" label="Caja" value={form.NOMCAJA} onChange={set('NOMCAJA')} placeholder="Caja-01" />
          <Field id="usuario" label="Cajero / Usuario" value={form.USUARIO} onChange={set('USUARIO')} placeholder="Nombre del usuario" />
          <Field id="gracias" label="Mensaje de agradecimiento" value={form.gracias ?? ''} onChange={set('gracias')} placeholder="¡Gracias por tu compra!" />
        </View>
      </ScrollView>

      <View style={[styles.footer]}>
        <PosButton variant="secondary" label="Cancelar" onPress={() => navigation.goBack()} style={{ flex: 1 }} />
        <PosButton label="Guardar" icon="check" onPress={handleSave} style={{ flex: 2 }} />
      </View>
    </SafeAreaView>
  );
}
