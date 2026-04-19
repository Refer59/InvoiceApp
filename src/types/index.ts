export type Alignment = 'I' | 'C' | 'D'; // left / center / right

// ─── Template DSL (matches example_data.json) ───────────────────────────────

export interface TextNode {
  TIPO: 'TEXTO';
  ANCHO: number;
  ALINEACION: Alignment;
  TEXTO?: string;
  VALOR?: string;
}

export interface DivisionNode {
  TIPO: 'DIVISION';
  ANCHO: number;
  ALINEACION: Alignment;
  TEXTO: string;
  VALOR?: string;
}

export interface RetCarroNode {
  TIPO: 'RETCARRO';
}

export interface ColumnDef {
  ALINEACION: Alignment;
  ANCHO: number;
  TEXTO?: string;
  VALOR?: string;
  REG: string;
}

export interface CellNode {
  TIPO: 'TEXTO';
  TEXTO?: string;
  VALOR?: string;
}

export type RowDef = Record<string, CellNode | string>; // key = col REG, 'REPETIDO' = array key

export interface TableNode {
  TIPO: 'TABLA';
  ANCHO: number;
  ID?: string;
  ALINEACION: Alignment;
  COL: ColumnDef[];
  REG: RowDef[];
  DIVISIONCABECERA?: DivisionNode;
}

export type TemplateNode = TextNode | DivisionNode | RetCarroNode | TableNode;

// ─── Runtime values ───────────────────────────────────────────────────────────

export type TicketValues = Record<string, string | TicketItem[] | PaymentItem[] | TaxItem[]>;

export interface TicketItem {
  CANT: string;
  CLAVE: string;
  DESCRIP: string;
  PREC: string;
  IMP: string;
}

export interface PaymentItem {
  CONCEP: string;
  IMPORTE: string;
}

export interface TaxItem {
  PORIEPS?: string;
  IEPS?: string;
  PORIVA?: string;
  IVA?: string;
  PORISR?: string;
  ISR?: string;
}

// ─── Company & Settings ───────────────────────────────────────────────────────

export interface CompanyProfile {
  RZN_EMPRESA: string;
  DIR_EMPRESA: string;
  RFC_EMPRESA: string;
  SUCURSAL: string;
  NOMCAJA: string;
  USUARIO: string;
  logoBase64?: string;
}

export interface AppSettings {
  accentColor: string;
  paperWidth: 32 | 42;
}

// ─── Ticket draft ─────────────────────────────────────────────────────────────

export interface TicketDraft {
  id: string;
  NUMDOCTO: string;
  FECHADOC: string;
  HORADOC: string;
  items: TicketItem[];
  payments: PaymentItem[];
  subtotal: number;
  discount: number;
  taxes: number;
  total: number;
  received: number;
  change: number;
}

// ─── History ──────────────────────────────────────────────────────────────────

export interface HistoryEntry {
  id: string;
  date: string;
  total: string;
  itemCount: number;
  snapshot: TicketDraft;
}

// ─── Bluetooth ────────────────────────────────────────────────────────────────

export type PrinterStatus = 'disconnected' | 'scanning' | 'connecting' | 'connected' | 'error';

export interface PrinterDevice {
  id: string;
  name: string;
  rssi?: number;
}
