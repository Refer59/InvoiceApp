import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import type {
  CompanyProfile,
  AppSettings,
  TicketDraft,
  HistoryEntry,
  PrinterStatus,
  PrinterDevice,
} from '../types';
import {
  getCompany,
  saveCompany,
  getSettings,
  saveSettings,
  getHistory,
  addHistoryEntry,
} from '../services/storage';

// ─── State shape ─────────────────────────────────────────────────────────────

interface AppState {
  company: CompanyProfile;
  settings: AppSettings;
  currentTicket: TicketDraft | null;
  history: HistoryEntry[];
  printerStatus: PrinterStatus;
  connectedPrinterName: string | null;
  printerDevice: PrinterDevice | null;
  ready: boolean;
}

const initialDraft = (): TicketDraft => ({
  id: String(Date.now()),
  NUMDOCTO: String(Math.floor(Math.random() * 9000) + 1000),
  FECHADOC: new Date().toLocaleDateString('es-MX'),
  HORADOC: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
  items: [],
  payments: [],
  subtotal: 0,
  discount: 0,
  taxes: 0,
  total: 0,
  received: 0,
  change: 0,
});

const initial: AppState = {
  company: {
    RZN_EMPRESA: '',
    DIR_EMPRESA: '',
    RFC_EMPRESA: '',
    SUCURSAL: '',
    NOMCAJA: '',
    USUARIO: '',
  },
  settings: { accentColor: '#3B6AEA', paperWidth: 32 },
  currentTicket: null,
  history: [],
  printerStatus: 'disconnected',
  connectedPrinterName: null,
  printerDevice: null,
  ready: false,
};

// ─── Actions ─────────────────────────────────────────────────────────────────

type Action =
  | { type: 'HYDRATE'; company: CompanyProfile; settings: AppSettings; history: HistoryEntry[] }
  | { type: 'SET_COMPANY'; company: CompanyProfile }
  | { type: 'SET_SETTINGS'; settings: AppSettings }
  | { type: 'NEW_TICKET' }
  | { type: 'UPDATE_TICKET'; ticket: Partial<TicketDraft> }
  | { type: 'CLEAR_TICKET' }
  | { type: 'ADD_HISTORY'; entry: HistoryEntry }
  | { type: 'SET_PRINTER_STATUS'; status: PrinterStatus; name?: string; device?: PrinterDevice };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, company: action.company, settings: action.settings, history: action.history, ready: true };
    case 'SET_COMPANY':
      return { ...state, company: action.company };
    case 'SET_SETTINGS':
      return { ...state, settings: action.settings };
    case 'NEW_TICKET':
      return { ...state, currentTicket: initialDraft() };
    case 'UPDATE_TICKET':
      if (!state.currentTicket) return state;
      return { ...state, currentTicket: { ...state.currentTicket, ...action.ticket } };
    case 'CLEAR_TICKET':
      return { ...state, currentTicket: null };
    case 'ADD_HISTORY':
      return { ...state, history: [action.entry, ...state.history].slice(0, 100) };
    case 'SET_PRINTER_STATUS':
      return {
        ...state,
        printerStatus: action.status,
        connectedPrinterName: action.name ?? state.connectedPrinterName,
        printerDevice: action.device ?? state.printerDevice,
      };
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  updateCompany: (company: CompanyProfile) => Promise<void>;
  updateSettings: (settings: AppSettings) => Promise<void>;
  saveTicketToHistory: (ticket: TicketDraft) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    (async () => {
      const [company, settings, history] = await Promise.all([
        getCompany(),
        getSettings(),
        getHistory(),
      ]);
      dispatch({ type: 'HYDRATE', company, settings, history });
    })();
  }, []);

  const updateCompany = async (company: CompanyProfile) => {
    await saveCompany(company);
    dispatch({ type: 'SET_COMPANY', company });
  };

  const updateSettings = async (settings: AppSettings) => {
    await saveSettings(settings);
    dispatch({ type: 'SET_SETTINGS', settings });
  };

  const saveTicketToHistory = async (ticket: TicketDraft) => {
    const entry: HistoryEntry = {
      id: ticket.id,
      date: `${ticket.FECHADOC} ${ticket.HORADOC}`,
      total: `$${ticket.total.toFixed(2)}`,
      itemCount: ticket.items.length,
      snapshot: ticket,
    };
    await addHistoryEntry(entry);
    dispatch({ type: 'ADD_HISTORY', entry });
  };

  return (
    <AppContext.Provider value={{ state, dispatch, updateCompany, updateSettings, saveTicketToHistory }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
