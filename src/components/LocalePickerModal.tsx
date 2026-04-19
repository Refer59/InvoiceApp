import React from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, X } from 'lucide-react-native';
import { useTheme } from '../theme';

interface LocaleOption {
  label: string;
  sublabel: string;
  value: string | undefined;
}

const OPTIONS: LocaleOption[] = [
  { label: 'Automático', sublabel: 'Usa la configuración del dispositivo', value: undefined },
  { label: 'Español · Argentina', sublabel: 'es-AR — $ 1.234,56', value: 'es-AR' },
  { label: 'Español · España', sublabel: 'es-ES — 1.234,56 €', value: 'es-ES' },
  { label: 'Español · México', sublabel: 'es-MX — $1,234.56', value: 'es-MX' },
  { label: 'Español · Colombia', sublabel: 'es-CO — $ 1.234,56', value: 'es-CO' },
];

interface Props {
  visible: boolean;
  current: string | undefined;
  onSelect: (locale: string | undefined) => void;
  onClose: () => void;
}

export function LocalePickerModal({ visible, current, onSelect, onClose }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const c = theme.colors;
  const sp = theme.spacing;
  const r = theme.radii;
  const fs = theme.typography.fontSizes;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: c.bg.surface,
            paddingBottom: insets.bottom + sp.lg,
            borderTopLeftRadius: r.xl,
            borderTopRightRadius: r.xl,
          },
        ]}
      >
        {/* handle pill — 2px is intentionally below radii.xs; it's a 4px-tall drag indicator */}
        <View style={[styles.handle, { backgroundColor: c.border.strong }]} />
        <View style={[styles.header, { borderBottomColor: c.border.subtle, paddingHorizontal: sp.xl, paddingVertical: sp.lg }]}>
          <Text style={[styles.title, { color: c.text.primary, fontFamily: theme.typography.fonts.uiBold, fontSize: fs.h3 }]}>
            Formato de números
          </Text>
          <Pressable onPress={onClose} style={{ padding: sp.xs }}>
            <X size={20} color={c.text.secondary} strokeWidth={2} />
          </Pressable>
        </View>

        {OPTIONS.map((opt) => {
          const isSelected = opt.value === current;
          return (
            <Pressable
              key={opt.value ?? 'auto'}
              onPress={() => { onSelect(opt.value); onClose(); }}
              style={({ pressed }) => [
                styles.row,
                {
                  backgroundColor: isSelected ? c.brand.primarySoft : pressed ? c.bg.surfaceAlt : 'transparent',
                  paddingHorizontal: sp.xl,
                  paddingVertical: sp.md,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[
                  styles.optLabel,
                  {
                    color: isSelected ? c.brand.primaryInk : c.text.primary,
                    fontFamily: isSelected ? theme.typography.fonts.uiSemiBold : theme.typography.fonts.ui,
                    fontSize: fs.body,
                  },
                ]}>
                  {opt.label}
                </Text>
                <Text style={[styles.optSub, { color: c.text.muted, fontFamily: theme.typography.fonts.mono, fontSize: fs.label }]}>
                  {opt.sublabel}
                </Text>
              </View>
              {isSelected && <Check size={18} color={c.brand.primary} strokeWidth={2.25} />}
            </Pressable>
          );
        })}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  // 4px height drag handle pill — below radii.xs by design
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1 },
  title: {},
  row: { flexDirection: 'row', alignItems: 'center' },
  optLabel: { marginBottom: 2 },
  optSub: {},
});
