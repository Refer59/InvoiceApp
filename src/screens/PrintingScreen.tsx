import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, withSpring, Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { RootStackParamList } from '../../App';
import { useTheme } from '../theme';
import { PosButton } from '../components/PosButton';
import { NotavoMark } from '../components/NotavoMark';
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
  const { theme } = useTheme();
  const c = theme.colors;
  const sp = theme.spacing;
  const r = theme.radii;
  const fs = theme.typography.fontSizes;
  const { currentTicket, company, settings } = state;

  const [phase, setPhase] = useState<Phase>('sending');
  const [errorMsg, setErrorMsg] = useState('');

  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const markScale = useSharedValue(0.6);
  const markOpacity = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1200, easing: Easing.linear }), -1, false,
    );
    scale.value = withRepeat(
      withTiming(1.05, { duration: 600, easing: Easing.inOut(Easing.ease) }), -1, true,
    );
  }, []);

  useEffect(() => {
    (async () => {
      if (!currentTicket) { navigation.goBack(); return; }
      try {
        if (!isConnected()) throw new Error('No pudimos conectar con la impresora. Revisá que esté encendida.');

        const locale = settings.locale ?? 'es-MX';
        const fmtMoney = (n: number) =>
          new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

        const values: TicketValues = {
          RZN_EMPRESA: company.RZN_EMPRESA, DIR_EMPRESA: company.DIR_EMPRESA,
          RFC_EMPRESA: company.RFC_EMPRESA, SUCURSAL: company.SUCURSAL, NOMCAJA: company.NOMCAJA,
          NUMDOCTO: currentTicket.NUMDOCTO, FECHADOC: currentTicket.FECHADOC, HORADOC: currentTicket.HORADOC,
          USUARIO: company.USUARIO,
          SUBTOTAL: `$${fmtMoney(currentTicket.subtotal)}`, DESCUENTO: `$${fmtMoney(currentTicket.discount)}`,
          IMPUESTOS: `$${fmtMoney(currentTicket.taxes)}`, TOTALDOC: `$${fmtMoney(currentTicket.total)}`,
          RECIBIDO: `$${fmtMoney(currentTicket.received)}`, CAMBIODOCTO: `$${fmtMoney(currentTicket.change)}`,
          NUM_VENDIDOS: String(currentTicket.items.length), MONTOLETRAS: '',
          PARTIDAS: currentTicket.items,
          FORMAPAGO: currentTicket.payments.length > 0
            ? currentTicket.payments
            : [{ CONCEP: 'Efectivo', IMPORTE: `$${fmtMoney(currentTicket.received)}` }],
          IVA: [], IEPS: [], ISR: [],
        };

        const lines = interpretTemplate(defaultTemplate as TemplateNode[], values);
        const job = buildPrintJob(lines, company.logoBase64, {
          gracias: company.gracias,
          showNotavoAttribution: settings.showNotavoAttribution,
          NUMDOCTO: currentTicket.NUMDOCTO,
          FECHADOC: currentTicket.FECHADOC,
          HORADOC: currentTicket.HORADOC,
        });
        await printJob(chunkJob(job), 20);

        await saveTicketToHistory(currentTicket);
        dispatch({ type: 'CLEAR_TICKET' });

        rotation.value = 0;
        scale.value = 1;
        markOpacity.value = withTiming(1, { duration: 200 });
        markScale.value = withSpring(1, { damping: 12, stiffness: 180 });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setPhase('done');
        setTimeout(() => navigation.navigate('Dashboard'), 1800);
      } catch (err: any) {
        setPhase('error');
        setErrorMsg(err?.message ?? 'Error desconocido al imprimir');
      }
    })();
  }, []);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }, { scale: scale.value }],
  }));
  const markEntryStyle = useAnimatedStyle(() => ({
    opacity: markOpacity.value,
    transform: [{ scale: markScale.value }],
  }));

  const styles = useMemo(() => StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg.base },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: sp['2xl'], gap: sp.lg },
    phaseTitle: { fontSize: fs.large, fontWeight: '700', color: c.text.primary, fontFamily: theme.typography.fonts.uiBold, textAlign: 'center' },
    phaseSub: { fontSize: fs.small, color: c.text.secondary, fontFamily: theme.typography.fonts.ui, textAlign: 'center' },
    doneCircle: { width: 96, height: 96, borderRadius: r.full, alignItems: 'center', justifyContent: 'center', backgroundColor: c.semantic.success + '18' },
    errorCircle: { width: 96, height: 96, borderRadius: r.full, alignItems: 'center', justifyContent: 'center', backgroundColor: c.semantic.danger + '18' },
    errorTitle: { fontSize: fs.large, fontWeight: '700', color: c.semantic.danger, fontFamily: theme.typography.fonts.uiBold, textAlign: 'center' },
    doneBtn: { marginTop: sp.sm },
    errorBtns: { flexDirection: 'row', gap: sp.sm, marginTop: sp.sm },
  }), [theme]);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.center}>
        {phase === 'sending' && (
          <>
            <Animated.View style={spinStyle}>
              <NotavoMark size={72} color={c.brand.primary} />
            </Animated.View>
            <Text style={styles.phaseTitle}>Imprimiendo…</Text>
            <Text style={styles.phaseSub}>No apagues la impresora</Text>
          </>
        )}
        {phase === 'done' && (
          <>
            <Animated.View style={[styles.doneCircle, markEntryStyle]}>
              <NotavoMark size={48} color={c.semantic.success} />
            </Animated.View>
            <Text style={styles.phaseTitle}>Listo.</Text>
            <Text style={styles.phaseSub}>Ticket guardado</Text>
            <PosButton label="Inicio" onPress={() => navigation.navigate('Dashboard')} style={styles.doneBtn} />
          </>
        )}
        {phase === 'error' && (
          <>
            <View style={styles.errorCircle}>
              <NotavoMark size={48} color={c.brand.deep} />
            </View>
            <Text style={styles.errorTitle}>No pudimos imprimir.</Text>
            <Text style={styles.phaseSub}>{errorMsg}</Text>
            <View style={styles.errorBtns}>
              <PosButton variant="secondary" label="Volver" onPress={() => navigation.goBack()} style={{ flex: 1 }} />
              <PosButton variant="danger" label="Reintentar" icon="refresh"
                onPress={() => { setPhase('sending'); setErrorMsg(''); }} style={{ flex: 1 }} />
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
