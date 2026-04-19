import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { colors, radii, fonts } from '../theme/tokens';
import { PosButton } from '../components/PosButton';
import { Icon } from '../components/Icon';
import { useApp } from '../state/AppContext';
import { buildPrintJob, chunkJob } from '../services/bluetooth/escpos';
import { printJob, isConnected } from '../services/bluetooth/connection';
import { interpretTemplate } from '../services/template/interpreter';
import type { TemplateNode, TicketValues } from '../types';
import defaultTemplate from '../../example_data.json';

type Phase = 'sending' | 'done' | 'error';
type Props = NativeStackScreenProps<RootStackParamList, 'Printing'>;

export default function PrintingScreen({ navigation }: Props) {
  const { state, saveTicketToHistory, dispatch } = useApp();
  const { currentTicket, company, settings } = state;
  const accent = settings.accentColor;

  const [phase, setPhase] = useState<Phase>('sending');
  const [errorMsg, setErrorMsg] = useState('');
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 900, useNativeDriver: true })
    );
    spin.start();
    return () => spin.stop();
  }, []);

  useEffect(() => {
    (async () => {
      if (!currentTicket) {
        navigation.goBack();
        return;
      }

      try {
        if (!isConnected()) {
          throw new Error('No hay impresora conectada. Ve a Impresora para emparejar.');
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
          FORMAPAGO: currentTicket.payments.length > 0
            ? currentTicket.payments
            : [{ CONCEP: 'Efectivo', IMPORTE: `$${currentTicket.received.toFixed(2)}` }],
          IVA: [],
          IEPS: [],
          ISR: [],
        };

        const lines = interpretTemplate(defaultTemplate as TemplateNode[], values);
        const job = buildPrintJob(lines, company.logoBase64);
        const chunks = chunkJob(job);

        await printJob(chunks, 20);

        await saveTicketToHistory(currentTicket);
        dispatch({ type: 'CLEAR_TICKET' });
        setPhase('done');
      } catch (err: any) {
        setPhase('error');
        setErrorMsg(err?.message ?? 'Error desconocido al imprimir');
      }
    })();
  }, []);

  const spinDeg = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.center}>
        {phase === 'sending' && (
          <>
            <Animated.View style={{ transform: [{ rotate: spinDeg }] }}>
              <Icon name="printer" size={56} color={accent} />
            </Animated.View>
            <Text style={styles.phaseTitle}>Enviando a impresora…</Text>
            <Text style={styles.phaseSub}>No apagues la impresora</Text>
          </>
        )}

        {phase === 'done' && (
          <>
            <View style={[styles.doneCircle, { backgroundColor: colors.success + '18' }]}>
              <Icon name="check" size={48} color={colors.success} />
            </View>
            <Text style={styles.phaseTitle}>¡Impresión exitosa!</Text>
            <Text style={styles.phaseSub}>El ticket fue enviado y guardado</Text>
            <PosButton
              label="Listo"
              icon="check"
              onPress={() => navigation.navigate('Dashboard')}
              style={styles.doneBtn}
            />
          </>
        )}

        {phase === 'error' && (
          <>
            <View style={[styles.doneCircle, { backgroundColor: colors.danger + '18' }]}>
              <Icon name="x" size={48} color={colors.danger} />
            </View>
            <Text style={[styles.phaseTitle, { color: colors.danger }]}>Error al imprimir</Text>
            <Text style={styles.phaseSub}>{errorMsg}</Text>
            <View style={styles.errorBtns}>
              <PosButton
                variant="secondary"
                label="Cancelar"
                onPress={() => navigation.goBack()}
                style={{ flex: 1 }}
              />
              <PosButton
                variant="danger"
                label="Reintentar"
                icon="refresh"
                onPress={() => {
                  setPhase('sending');
                  setErrorMsg('');
                }}
                style={{ flex: 1 }}
              />
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  phaseTitle: { fontSize: 22, fontWeight: '700', color: colors.text, fontFamily: fonts.ui, textAlign: 'center' },
  phaseSub: { fontSize: 14, color: colors.textMuted, fontFamily: fonts.ui, textAlign: 'center' },
  doneCircle: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  doneBtn: { marginTop: 8, paddingHorizontal: 40 },
  errorBtns: { flexDirection: 'row', gap: 10, marginTop: 8 },
});
