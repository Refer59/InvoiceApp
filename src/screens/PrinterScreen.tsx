import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { colors, radii, fonts } from '../theme/tokens';
import { Icon } from '../components/Icon';
import { PosButton } from '../components/PosButton';
import { BottomNav } from '../components/BottomNav';
import { useApp } from '../state/AppContext';
import {
  scanDevices,
  connectToDevice,
  disconnectDevice,
  isConnected,
  getConnectedId,
  checkBleState,
} from '../services/bluetooth/connection';
import type { PrinterDevice } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Printer'>;

export default function PrinterScreen({ navigation }: Props) {
  const { state, dispatch } = useApp();
  const accent = state.settings.accentColor;

  const [devices, setDevices] = useState<PrinterDevice[]>([]);
  const [scanning, setScanning] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const stopScanRef = useRef<(() => void) | null>(null);

  const connectedId = getConnectedId();
  const connected = isConnected();

  const startScan = async () => {
    const bleOn = await checkBleState();
    if (!bleOn) {
      Alert.alert('Bluetooth apagado', 'Activa Bluetooth e intenta de nuevo.');
      return;
    }
    setDevices([]);
    setScanning(true);

    stopScanRef.current = scanDevices(
      (device) => setDevices((prev) => {
        if (prev.some((d) => d.id === device.id)) return prev;
        return [...prev, device];
      }),
      (err) => {
        setScanning(false);
        Alert.alert('Error de escaneo', err.message);
      }
    );

    // Auto-stop after 15s
    setTimeout(() => {
      stopScanRef.current?.();
      setScanning(false);
    }, 15000);
  };

  const stopScan = () => {
    stopScanRef.current?.();
    setScanning(false);
  };

  useEffect(() => () => stopScanRef.current?.(), []);

  const handleConnect = async (device: PrinterDevice) => {
    if (connected) {
      await disconnectDevice();
      dispatch({ type: 'SET_PRINTER_STATUS', status: 'disconnected' });
    }

    setConnecting(device.id);
    dispatch({ type: 'SET_PRINTER_STATUS', status: 'connecting' });

    try {
      await connectToDevice(device.id);
      dispatch({ type: 'SET_PRINTER_STATUS', status: 'connected', name: device.name, device });
      stopScan();
    } catch (err: any) {
      dispatch({ type: 'SET_PRINTER_STATUS', status: 'error' });
      Alert.alert('Error al conectar', err?.message ?? 'No se pudo conectar con la impresora.');
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async () => {
    await disconnectDevice();
    dispatch({ type: 'SET_PRINTER_STATUS', status: 'disconnected' });
  };

  const statusColor = {
    connected: colors.success,
    disconnected: colors.textFaint,
    scanning: accent,
    connecting: accent,
    error: colors.danger,
  }[state.printerStatus];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow_left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Impresora Bluetooth</Text>
      </View>

      {/* Connection status card */}
      <View style={styles.statusCard}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.statusTitle}>
            {state.printerStatus === 'connected'
              ? `Conectado: ${state.connectedPrinterName}`
              : state.printerStatus === 'connecting' ? 'Conectando…'
              : state.printerStatus === 'error' ? 'Error de conexión'
              : 'Sin impresora'}
          </Text>
          <Text style={styles.statusSub}>Térmica 58mm · ESC/POS</Text>
        </View>
        {connected && (
          <Pressable onPress={handleDisconnect} style={styles.disconnectBtn}>
            <Text style={[styles.disconnectText, { color: colors.danger }]}>Desconectar</Text>
          </Pressable>
        )}
      </View>

      {/* Scan controls */}
      <View style={styles.scanRow}>
        <Text style={styles.sectionTitle}>Dispositivos encontrados</Text>
        {scanning ? (
          <Pressable onPress={stopScan} style={styles.scanBtn}>
            <ActivityIndicator size="small" color={accent} />
            <Text style={[styles.scanBtnText, { color: accent }]}>Detener</Text>
          </Pressable>
        ) : (
          <Pressable onPress={startScan} style={styles.scanBtn}>
            <Icon name="refresh" size={16} color={accent} />
            <Text style={[styles.scanBtnText, { color: accent }]}>Buscar</Text>
          </Pressable>
        )}
      </View>

      {devices.length === 0 && !scanning && (
        <View style={styles.empty}>
          <Icon name="bluetooth" size={40} color={colors.textFaint} />
          <Text style={styles.emptyText}>Toca "Buscar" para escanear</Text>
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
              style={[styles.deviceRow, isCurrent && { borderColor: accent }]}
            >
              <View style={[styles.deviceIcon, { backgroundColor: isCurrent ? accent + '18' : colors.surfaceAlt }]}>
                <Icon name="printer" size={20} color={isCurrent ? accent : colors.textMuted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.deviceName}>{item.name}</Text>
                <Text style={styles.deviceId}>{item.id.slice(0, 17)}</Text>
              </View>
              {isConnecting
                ? <ActivityIndicator size="small" color={accent} />
                : isCurrent
                ? <Icon name="check" size={18} color={accent} />
                : <Icon name="chevron_right" size={18} color={colors.textFaint} />}
            </Pressable>
          );
        }}
      />

      <BottomNav active="printer" onNavigate={(route) => navigation.navigate(route as any)} />
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
  statusCard: {
    margin: 16, backgroundColor: colors.surface, borderRadius: radii.lg,
    borderWidth: 1, borderColor: colors.border, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusTitle: { fontSize: 14, fontWeight: '600', color: colors.text, fontFamily: fonts.ui },
  statusSub: { fontSize: 12, color: colors.textMuted, fontFamily: fonts.ui },
  disconnectBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  disconnectText: { fontSize: 13, fontWeight: '600', fontFamily: fonts.ui },
  scanRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, marginBottom: 8,
  },
  sectionTitle: { fontSize: 12, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, fontFamily: fonts.ui },
  scanBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 4 },
  scanBtnText: { fontSize: 13, fontWeight: '600', fontFamily: fonts.ui },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingBottom: 80 },
  emptyText: { fontSize: 14, color: colors.textFaint, fontFamily: fonts.ui },
  list: { paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
  deviceRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.surface, borderRadius: radii.md,
    borderWidth: 1, borderColor: colors.border, padding: 12,
  },
  deviceIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  deviceName: { fontSize: 14, fontWeight: '600', color: colors.text, fontFamily: fonts.ui },
  deviceId: { fontSize: 11, color: colors.textFaint, fontFamily: fonts.mono },
});
