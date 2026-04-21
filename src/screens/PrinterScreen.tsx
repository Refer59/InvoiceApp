import React, { useEffect, useMemo, useState, useRef } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronLeft, Check, ChevronRight, RefreshCw, Bluetooth } from 'lucide-react-native';
import type { RootStackParamList } from '../../App';
import { useTheme } from '../theme';
import { PosButton } from '../components/PosButton';
import { NotavoMark } from '../components/NotavoMark';
import { useApp } from '../state/AppContext';
import { useTabNav } from '../navigation/TabNavContext';
import {
  scanDevices, connectToDevice, disconnectDevice,
  isConnected, getConnectedId, checkBleState,
} from '../services/bluetooth/connection';
import type { PrinterDevice } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Printer'>;

export default function PrinterScreen({ navigation }: Props) {
  const { state, dispatch } = useApp();
  const { navHeight } = useTabNav();
  const { theme } = useTheme();
  const c = theme.colors;
  const sp = theme.spacing;
  const r = theme.radii;
  const fs = theme.typography.fontSizes;

  const [devices, setDevices] = useState<PrinterDevice[]>([]);
  const [scanning, setScanning] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const stopScanRef = useRef<(() => void) | null>(null);

  const connectedId = getConnectedId();
  const connected = isConnected();

  const startScan = async () => {
    const bleOn = await checkBleState();
    if (!bleOn) { Alert.alert('Bluetooth apagado', 'Activá Bluetooth e intentá de nuevo.'); return; }
    setDevices([]);
    setScanning(true);
    stopScanRef.current = scanDevices(
      (d) => setDevices((prev) => prev.some((x) => x.id === d.id) ? prev : [...prev, d]),
      (err) => { setScanning(false); Alert.alert('Error de escaneo', err.message); },
    );
    setTimeout(() => { stopScanRef.current?.(); setScanning(false); }, 15000);
  };

  const stopScan = () => { stopScanRef.current?.(); setScanning(false); };
  useEffect(() => () => stopScanRef.current?.(), []);

  const handleConnect = async (device: PrinterDevice) => {
    if (connected) { await disconnectDevice(); dispatch({ type: 'SET_PRINTER_STATUS', status: 'disconnected' }); }
    setConnecting(device.id);
    dispatch({ type: 'SET_PRINTER_STATUS', status: 'connecting' });
    try {
      await connectToDevice(device.id);
      dispatch({ type: 'SET_PRINTER_STATUS', status: 'connected', name: device.name, device });
      stopScan();
    } catch (err: any) {
      dispatch({ type: 'SET_PRINTER_STATUS', status: 'error' });
      Alert.alert('No pudimos conectar', err?.message ?? 'Revisá que la impresora esté encendida.');
    } finally { setConnecting(null); }
  };

  const handleDisconnect = async () => {
    await disconnectDevice();
    dispatch({ type: 'SET_PRINTER_STATUS', status: 'disconnected' });
  };

  const statusColor = {
    connected: c.semantic.success, disconnected: c.text.muted,
    scanning: c.brand.primary, connecting: c.brand.primary, error: c.semantic.danger,
  }[state.printerStatus];

  const styles = useMemo(() => StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg.base },
    header: {
      flexDirection: 'row', alignItems: 'center', gap: sp.md,
      paddingHorizontal: sp.lg, paddingVertical: sp.md,
      backgroundColor: c.bg.surface, borderBottomWidth: 1, borderBottomColor: c.border.subtle,
    },
    backBtn: { padding: sp.xs },
    title: { fontSize: fs.h3, fontWeight: '700', color: c.text.primary, fontFamily: theme.typography.fonts.uiBold },
    statusCard: {
      margin: sp.lg, backgroundColor: c.bg.surface, borderRadius: r.lg,
      borderWidth: 1, borderColor: c.border.subtle, padding: sp.md,
      flexDirection: 'row', alignItems: 'center', gap: sp.md,
    },
    statusDot: { width: 10, height: 10, borderRadius: r.full },
    statusTitle: { fontSize: fs.small, fontWeight: '600', color: c.text.primary, fontFamily: theme.typography.fonts.uiSemiBold },
    statusSub: { fontSize: fs.label, color: c.text.secondary, fontFamily: theme.typography.fonts.ui },
    disconnectText: { fontSize: fs.caption, fontWeight: '600', fontFamily: theme.typography.fonts.uiSemiBold, color: c.semantic.danger },
    scanRow: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: sp.xl, marginBottom: sp.sm,
    },
    sectionTitle: {
      fontSize: fs.label, fontWeight: '600', color: c.text.secondary,
      textTransform: 'uppercase', letterSpacing: 0.6, fontFamily: theme.typography.fonts.uiSemiBold,
    },
    scanBtn: { flexDirection: 'row', alignItems: 'center', gap: sp.xs, paddingVertical: sp.xs, paddingHorizontal: sp.xs },
    scanBtnText: { fontSize: fs.caption, fontWeight: '600', fontFamily: theme.typography.fonts.uiSemiBold, color: c.brand.primary },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: sp.sm, paddingBottom: sp['4xl'] },
    emptyText: { fontSize: fs.small, color: c.text.muted, fontFamily: theme.typography.fonts.ui },
    list: { paddingHorizontal: sp.lg, paddingBottom: sp.lg + navHeight, gap: sp.sm },
    deviceRow: {
      flexDirection: 'row', alignItems: 'center', gap: sp.md,
      backgroundColor: c.bg.surface, borderRadius: r.md,
      borderWidth: 1, borderColor: c.border.subtle, padding: sp.md,
    },
    deviceIcon: { width: 40, height: 40, borderRadius: r.sm, alignItems: 'center', justifyContent: 'center' },
    deviceName: { fontSize: fs.small, fontWeight: '600', color: c.text.primary, fontFamily: theme.typography.fonts.uiSemiBold },
    deviceId: { fontSize: fs.micro, color: c.text.muted, fontFamily: theme.typography.fonts.mono },
  }), [theme, navHeight]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={22} color={c.text.primary} strokeWidth={1.75} />
        </Pressable>
        <Text style={styles.title}>Impresora Bluetooth</Text>
      </View>

      <View style={styles.statusCard}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.statusTitle}>
            {state.printerStatus === 'connected' ? `Conectado: ${state.connectedPrinterName}`
              : state.printerStatus === 'connecting' ? 'Conectando…'
              : state.printerStatus === 'error' ? 'Error de conexión'
              : 'Sin impresora'}
          </Text>
          <Text style={styles.statusSub}>Térmica 58mm · ESC/POS</Text>
        </View>
        {connected && (
          <Pressable onPress={handleDisconnect} style={{ paddingHorizontal: sp.sm, paddingVertical: sp.xs }}>
            <Text style={styles.disconnectText}>Desconectar</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.scanRow}>
        <Text style={styles.sectionTitle}>Dispositivos encontrados</Text>
        {scanning ? (
          <Pressable onPress={stopScan} style={styles.scanBtn}>
            <ActivityIndicator size="small" color={c.brand.primary} />
            <Text style={styles.scanBtnText}>Detener</Text>
          </Pressable>
        ) : (
          <Pressable onPress={startScan} style={styles.scanBtn}>
            <RefreshCw size={16} color={c.brand.primary} strokeWidth={2} />
            <Text style={styles.scanBtnText}>Buscar</Text>
          </Pressable>
        )}
      </View>

      {devices.length === 0 && !scanning && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Toca "Buscar" para escanear</Text>
          <PosButton label="Buscar impresoras" icon="bluetooth" onPress={startScan} />
        </View>
      )}

      <FlatList
        data={devices}
        keyExtractor={(d) => d.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isCurrent = item.id === connectedId;
          const isConnecting = connecting === item.id;
          return (
            <Pressable
              onPress={() => !isConnecting && handleConnect(item)}
              style={[styles.deviceRow, isCurrent && { borderColor: c.brand.primary }]}
            >
              <View style={[styles.deviceIcon, { backgroundColor: isCurrent ? c.brand.primarySoft : c.bg.surfaceAlt }]}>
                <Bluetooth size={20} color={isCurrent ? c.brand.primary : c.text.secondary} strokeWidth={1.75} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.deviceName}>{item.name}</Text>
                <Text style={styles.deviceId}>{item.id.slice(0, 17)}</Text>
              </View>
              {isConnecting ? <ActivityIndicator size="small" color={c.brand.primary} />
                : isCurrent ? <Check size={18} color={c.brand.primary} strokeWidth={2.25} />
                : <ChevronRight size={18} color={c.text.muted} strokeWidth={1.75} />}
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}
