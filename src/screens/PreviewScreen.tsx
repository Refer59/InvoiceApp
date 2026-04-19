import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { colors, radii, fonts } from '../theme/tokens';
import { Icon } from '../components/Icon';
import { PosButton } from '../components/PosButton';
import { TicketPreview } from '../components/TicketPreview';
import { useApp } from '../state/AppContext';
import type { TicketValues } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Preview'>;

export default function PreviewScreen({ navigation }: Props) {
  const { state } = useApp();
  const { currentTicket, company, settings } = state;
  const accent = settings.accentColor;
  const [showLogo, setShowLogo] = useState(!!company.logoBase64);

  if (!currentTicket) {
    navigation.goBack();
    return null;
  }

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
    SUBTOTAL: `$${currentTicket.subtotal.toFixed(2)}`,
    DESCUENTO: `$${currentTicket.discount.toFixed(2)}`,
    IMPUESTOS: `$${currentTicket.taxes.toFixed(2)}`,
    TOTALDOC: `$${currentTicket.total.toFixed(2)}`,
    RECIBIDO: `$${currentTicket.received.toFixed(2)}`,
    CAMBIODOCTO: `$${currentTicket.change.toFixed(2)}`,
    NUM_VENDIDOS: String(currentTicket.items.length),
    MONTOLETRAS: '',
    PARTIDAS: currentTicket.items,
    FORMAPAGO: currentTicket.payments.length > 0 ? currentTicket.payments : [{ CONCEP: 'Efectivo', IMPORTE: `$${currentTicket.received.toFixed(2)}` }],
    IVA: [],
    IEPS: [],
    ISR: [],
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow_left" size={22} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Vista previa</Text>
          <Text style={styles.subtitle}>Nota #{currentTicket.NUMDOCTO}</Text>
        </View>
        {/* Logo toggle */}
        {company.logoBase64 ? (
          <View style={styles.logoToggle}>
            <Text style={styles.logoLabel}>Logo</Text>
            <Switch
              value={showLogo}
              onValueChange={setShowLogo}
              trackColor={{ false: colors.border, true: accent }}
              thumbColor="#fff"
            />
          </View>
        ) : null}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Paper simulation */}
        <View style={styles.paperContainer}>
          <TicketPreview values={values} showLogo={showLogo} logoBase64={company.logoBase64} />
        </View>

        {/* Total summary */}
        <View style={[styles.summaryCard, { borderColor: accent + '33', backgroundColor: accent + '08' }]}>
          <Text style={[styles.summaryLabel, { color: accent }]}>Total a cobrar</Text>
          <Text style={[styles.summaryValue, { color: accent }]}>${currentTicket.total.toFixed(2)}</Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <PosButton
          variant="secondary"
          label="Editar"
          icon="edit"
          onPress={() => navigation.goBack()}
          style={{ flex: 1 }}
        />
        <PosButton
          label="Imprimir"
          icon="printer"
          onPress={() => navigation.navigate('Printing')}
          style={{ flex: 2 }}
        />
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
  logoToggle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoLabel: { fontSize: 13, color: colors.textMuted, fontFamily: fonts.ui },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 24 },
  paperContainer: {
    // simulate 58mm paper on screen
    maxWidth: 300,
    alignSelf: 'center',
    width: '100%',
  },
  summaryCard: {
    borderWidth: 1, borderRadius: radii.lg, padding: 18,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  summaryLabel: { fontSize: 14, fontWeight: '600', fontFamily: fonts.ui },
  summaryValue: { fontSize: 24, fontWeight: '700', fontFamily: fonts.mono },
  footer: {
    flexDirection: 'row', gap: 10, padding: 16,
    backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border,
  },
});
