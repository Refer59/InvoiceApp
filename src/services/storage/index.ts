import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CompanyProfile, AppSettings, HistoryEntry } from '../../types';

const KEYS = {
  COMPANY: '@pos/company',
  SETTINGS: '@pos/settings',
  HISTORY: '@pos/history',
  TEMPLATE: '@pos/template',
};

// ─── Company ─────────────────────────────────────────────────────────────────

const DEFAULT_COMPANY: CompanyProfile = {
  RZN_EMPRESA: 'Mi Empresa S.A.',
  DIR_EMPRESA: 'Av. Principal #100, Col. Centro',
  RFC_EMPRESA: 'XAXX010101000',
  SUCURSAL: 'Matriz',
  NOMCAJA: 'Caja-01',
  USUARIO: 'Usuario',
};

export async function getCompany(): Promise<CompanyProfile> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.COMPANY);
    return raw ? { ...DEFAULT_COMPANY, ...JSON.parse(raw) } : DEFAULT_COMPANY;
  } catch {
    return DEFAULT_COMPANY;
  }
}

export async function saveCompany(company: CompanyProfile): Promise<void> {
  await AsyncStorage.setItem(KEYS.COMPANY, JSON.stringify(company));
}

// ─── Settings ─────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: AppSettings = {
  accentColor: '#3B6AEA',
  paperWidth: 32,
};

export async function getSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

// ─── History ─────────────────────────────────────────────────────────────────

export async function getHistory(): Promise<HistoryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function addHistoryEntry(entry: HistoryEntry): Promise<void> {
  const history = await getHistory();
  history.unshift(entry);
  // Keep only last 100 entries
  await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(history.slice(0, 100)));
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.HISTORY);
}

// ─── Template ─────────────────────────────────────────────────────────────────

export async function getTemplate(): Promise<object[] | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.TEMPLATE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveTemplate(template: object[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.TEMPLATE, JSON.stringify(template));
}
