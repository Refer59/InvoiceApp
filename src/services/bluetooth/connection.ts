/**
 * BLE connection manager for thermal printer.
 *
 * SETUP REQUIRED in app.json (do not modify without asking):
 *   "plugins": [["react-native-ble-plx", { ... }]]
 *   iOS: NSBluetoothAlwaysUsageDescription in Info.plist
 *   Android: BLUETOOTH_CONNECT + BLUETOOTH_SCAN permissions
 *
 * Common thermal printer BLE service/char UUIDs:
 *   Service:   49535343-FE7D-4AE5-8FA9-9FAFD205E455
 *   Write Char: 49535343-8841-43F4-A8D4-ECBE34729BB3
 *   Or: FFE0 / FFE1 (cheaper printers)
 */

import { BleManager, Device, State } from 'react-native-ble-plx';
import { Platform } from 'react-native';
import type { PrinterDevice } from '../../types';

const PRINTER_SERVICE_UUIDS = [
  '49535343-FE7D-4AE5-8FA9-9FAFD205E455',
  '0000FFE0-0000-1000-8000-00805F9B34FB',
];

const WRITE_CHAR_UUIDS = [
  '49535343-8841-43F4-A8D4-ECBE34729BB3',
  '0000FFE1-0000-1000-8000-00805F9B34FB',
];

let manager: BleManager | null = null;

function getManager(): BleManager {
  if (!manager) manager = new BleManager();
  return manager;
}

export async function checkBleState(): Promise<boolean> {
  const m = getManager();
  const state = await m.state();
  return state === State.PoweredOn;
}

export function scanDevices(
  onFound: (device: PrinterDevice) => void,
  onError: (err: Error) => void
): () => void {
  const m = getManager();
  const seen = new Set<string>();

  m.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
    if (error) {
      onError(error);
      return;
    }
    if (!device || seen.has(device.id)) return;
    seen.add(device.id);
    onFound({ id: device.id, name: device.name ?? device.localName ?? device.id, rssi: device.rssi ?? undefined });
  });

  return () => m.stopDeviceScan();
}

let connectedDevice: Device | null = null;

export async function connectToDevice(deviceId: string): Promise<void> {
  const m = getManager();
  m.stopDeviceScan();

  const device = await m.connectToDevice(deviceId, { autoConnect: false });
  await device.discoverAllServicesAndCharacteristics();
  connectedDevice = device;
}

export async function disconnectDevice(): Promise<void> {
  if (connectedDevice) {
    await connectedDevice.cancelConnection();
    connectedDevice = null;
  }
}

export async function writeBytes(data: Uint8Array): Promise<void> {
  if (!connectedDevice) throw new Error('No printer connected');

  const services = await connectedDevice.services();
  let serviceUuid: string | null = null;
  let charUuid: string | null = null;

  for (const s of services) {
    const upperUuid = s.uuid.toUpperCase();
    if (PRINTER_SERVICE_UUIDS.some((u) => upperUuid.includes(u.slice(4, 8)))) {
      serviceUuid = s.uuid;
      break;
    }
  }
  if (!serviceUuid) serviceUuid = services[0]?.uuid ?? null;
  if (!serviceUuid) throw new Error('Printer service not found');

  const chars = await connectedDevice.characteristicsForService(serviceUuid);
  for (const c of chars) {
    if (c.isWritableWithoutResponse || c.isWritableWithResponse) {
      charUuid = c.uuid;
      break;
    }
  }
  if (!charUuid) throw new Error('Writable characteristic not found');

  // Encode Uint8Array → base64 for ble-plx API
  const base64 = Buffer.from(data).toString('base64');
  const withResponse = chars.find((c) => c.uuid === charUuid)?.isWritableWithResponse ?? false;

  if (withResponse) {
    await connectedDevice.writeCharacteristicWithResponseForService(serviceUuid, charUuid, base64);
  } else {
    await connectedDevice.writeCharacteristicWithoutResponseForService(serviceUuid, charUuid, base64);
  }
}

export async function printJob(chunks: Uint8Array[], delayMs = 20): Promise<void> {
  for (const chunk of chunks) {
    await writeBytes(chunk);
    if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
  }
}

export function isConnected(): boolean {
  return connectedDevice !== null;
}

export function getConnectedId(): string | null {
  return connectedDevice?.id ?? null;
}
