// data.jsx — Mock state, ticket template, and ESC/POS mock translator

// Ticket template (subset of the user's example_output.json, kept structurally faithful)
const TICKET_TEMPLATE = [
  { TIPO: 'LOGO' }, // our added block — Aspel doesn't have this
  { TIPO: 'TEXTO', ANCHO: 100, ALINEACION: 'C', VALOR: 'RZN_EMPRESA', BOLD: true, SIZE: 'lg' },
  { TIPO: 'TEXTO', ANCHO: 100, ALINEACION: 'C', VALOR: 'DIR_EMPRESA' },
  { TIPO: 'TEXTO', ANCHO: 100, ALINEACION: 'C', TEXTO: 'RFC: ', VALOR: 'RFC_EMPRESA' },
  { TIPO: 'DIVISION', TEXTO: '-' },
  { TIPO: 'TABLA_INFO', FIELDS: [
    ['Sucursal:', 'SUCURSAL'],
    ['Caja No:', 'NOMCAJA'],
    ['Nota de venta:', 'NUMDOCTO'],
    ['Fecha:', 'FECHADOC'],
    ['Hora:', 'HORADOC'],
    ['Atendido por:', 'USUARIO'],
  ]},
  { TIPO: 'DIVISION', TEXTO: '-' },
  { TIPO: 'TABLA_PARTIDAS' },
  { TIPO: 'DIVISION', TEXTO: '-' },
  { TIPO: 'TOTALES' },
  { TIPO: 'DIVISION', TEXTO: '=' },
  { TIPO: 'GRAN_TOTAL' },
  { TIPO: 'DIVISION', TEXTO: '-' },
  { TIPO: 'FORMAS_PAGO' },
  { TIPO: 'DIVISION', TEXTO: '-' },
  { TIPO: 'IMPUESTOS_DET' },
  { TIPO: 'DIVISION', TEXTO: '-' },
  { TIPO: 'MONTO_LETRAS' },
  { TIPO: 'RETCARRO' },
  { TIPO: 'DIVISION', TEXTO: '-' },
  { TIPO: 'TEXTO', ALINEACION: 'C', TEXTO: 'GRACIAS POR SU COMPRA', BOLD: true },
  { TIPO: 'TEXTO', ALINEACION: 'C', TEXTO: 'Vuelva pronto' },
  { TIPO: 'DIVISION', TEXTO: '-' },
];

// Mock sales data
const MOCK_EMPRESA = {
  RZN_EMPRESA: 'ABARROTES LA MERCED',
  DIR_EMPRESA: 'Av. Hidalgo 142, Col. Centro, Monterrey N.L.',
  RFC_EMPRESA: 'AME210512K3A',
  TEL_EMPRESA: 'Tel. 81 1234 5678',
};

const MOCK_DOC = {
  SUCURSAL: 'Matriz Centro',
  NOMCAJA: 'CAJA-01',
  NUMDOCTO: 'NV-000247',
  FECHADOC: '17/04/2026',
  HORADOC: '14:32',
  USUARIO: 'M. López',
};

const MOCK_PARTIDAS = [
  { CANT: 2, CLAVE: 'A101', DESCRIP: 'Coca-Cola 600ml', PREC: 18.50, IMP: 37.00 },
  { CANT: 1, CLAVE: 'B044', DESCRIP: 'Sabritas Original 45g', PREC: 16.00, IMP: 16.00 },
  { CANT: 3, CLAVE: 'C213', DESCRIP: 'Pan Bimbo Integral', PREC: 42.90, IMP: 128.70 },
  { CANT: 1, CLAVE: 'D008', DESCRIP: 'Leche Lala Entera 1L', PREC: 27.50, IMP: 27.50 },
  { CANT: 2, CLAVE: 'E117', DESCRIP: 'Huevo San Juan 18p', PREC: 68.00, IMP: 136.00 },
];

const calcTotals = (partidas) => {
  const subtotal = partidas.reduce((s, p) => s + p.IMP, 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;
  const recibido = Math.ceil(total / 50) * 50;
  return {
    SUBTOTAL: subtotal, DESCUENTO: 0, IMPUESTOS: iva,
    IVA: iva, PORIVA: 16,
    TOTALDOC: total, RECIBIDO: recibido, CAMBIODOCTO: recibido - total,
    NUM_VENDIDOS: partidas.reduce((s, p) => s + p.CANT, 0),
  };
};

const formatMoney = (n) => '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const numeroALetras = (n) => {
  const entero = Math.floor(n);
  const cents = Math.round((n - entero) * 100);
  // Simplified — a real impl would be much longer
  const aproximado = entero < 100 ? '' : entero < 1000 ? 'Trescientos sesenta y' : 'Trescientos cuarenta y cinco';
  return `${aproximado} pesos ${cents.toString().padStart(2, '0')}/100 M.N.`;
};

const MOCK_MONTO_LETRAS = '(Trescientos cuarenta y cinco pesos 20/100 M.N.)';

const MOCK_HISTORY = [
  { id: 'NV-000247', date: '17/04/2026 14:32', items: 9, total: 400.62, user: 'M. López', status: 'printed' },
  { id: 'NV-000246', date: '17/04/2026 13:05', items: 3, total: 84.50, user: 'M. López', status: 'printed' },
  { id: 'NV-000245', date: '17/04/2026 12:48', items: 12, total: 612.00, user: 'R. Díaz', status: 'printed' },
  { id: 'NV-000244', date: '17/04/2026 11:20', items: 5, total: 237.90, user: 'M. López', status: 'failed' },
  { id: 'NV-000243', date: '17/04/2026 10:15', items: 2, total: 55.00, user: 'R. Díaz', status: 'printed' },
  { id: 'NV-000242', date: '16/04/2026 19:47', items: 7, total: 312.40, user: 'M. López', status: 'printed' },
  { id: 'NV-000241', date: '16/04/2026 18:12', items: 4, total: 178.30, user: 'R. Díaz', status: 'printed' },
];

// ─────────────────────────────────────────────────────────────
// Ticket Renderer (58mm / 32 chars)
// Renders a character-grid visualization of what the printer prints.
// ─────────────────────────────────────────────────────────────
const TICKET_COLS = 32;

const padText = (text, width, align = 'I') => {
  text = String(text ?? '');
  if (text.length >= width) return text.slice(0, width);
  const pad = width - text.length;
  if (align === 'D') return ' '.repeat(pad) + text;
  if (align === 'C') {
    const left = Math.floor(pad / 2);
    return ' '.repeat(left) + text + ' '.repeat(pad - left);
  }
  return text + ' '.repeat(pad);
};

const wrap = (text, width) => {
  const words = String(text).split(' ');
  const lines = []; let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > width) {
      if (cur) lines.push(cur);
      cur = w;
    } else {
      cur = (cur + ' ' + w).trim();
    }
  }
  if (cur) lines.push(cur);
  return lines;
};

// Builds the receipt as an array of rendered line objects with styling
function renderTicketLines({ empresa, doc, partidas, totales, montoLetras, logo, showLogo = true }) {
  const lines = [];
  const push = (text, opts = {}) => lines.push({ text: padText(text, TICKET_COLS, opts.align || 'I'), ...opts });
  const pushRaw = (text, opts = {}) => lines.push({ text, ...opts });

  for (const block of TICKET_TEMPLATE) {
    switch (block.TIPO) {
      case 'LOGO':
        if (showLogo && logo) lines.push({ logo: true, src: logo });
        break;
      case 'TEXTO': {
        const val = block.VALOR ? (empresa[block.VALOR] || doc[block.VALOR] || '') : '';
        const t = (block.TEXTO || '') + val;
        for (const ln of wrap(t, TICKET_COLS)) {
          push(ln, { align: block.ALINEACION, bold: block.BOLD, size: block.SIZE });
        }
        break;
      }
      case 'DIVISION':
        push((block.TEXTO || '-').repeat(TICKET_COLS));
        break;
      case 'RETCARRO':
        push('');
        break;
      case 'TABLA_INFO':
        for (const [label, key] of block.FIELDS) {
          const left = padText(label, 14, 'I');
          const right = padText(doc[key] || '', TICKET_COLS - 14, 'D');
          pushRaw(left + right);
        }
        break;
      case 'TABLA_PARTIDAS': {
        // Header
        pushRaw(
          padText('Cant', 4, 'I') + ' ' +
          padText('Clave', 5, 'I') + ' ' +
          padText('Descrip.', 13, 'I') + ' ' +
          padText('Importe', 7, 'D'),
          { bold: true }
        );
        push('-'.repeat(TICKET_COLS));
        for (const p of partidas) {
          // First line: cant, clave, descrip (truncated), importe
          const descLines = wrap(p.DESCRIP, 13);
          pushRaw(
            padText(p.CANT, 4, 'D') + ' ' +
            padText(p.CLAVE, 5, 'I') + ' ' +
            padText(descLines[0], 13, 'I') + ' ' +
            padText(formatMoney(p.IMP), 7, 'D')
          );
          // Extra desc lines
          for (let i = 1; i < descLines.length; i++) {
            pushRaw(' '.repeat(11) + padText(descLines[i], 13, 'I'));
          }
          // Unit price line
          pushRaw(' '.repeat(11) + padText(`@ ${formatMoney(p.PREC)}`, 21, 'D'), { muted: true });
        }
        break;
      }
      case 'TOTALES':
        pushRaw(padText('Subtotal:', 16, 'I') + padText(formatMoney(totales.SUBTOTAL), 16, 'D'));
        pushRaw(padText('Descuento:', 16, 'I') + padText(formatMoney(totales.DESCUENTO), 16, 'D'));
        pushRaw(padText('Impuestos:', 16, 'I') + padText(formatMoney(totales.IMPUESTOS), 16, 'D'));
        break;
      case 'GRAN_TOTAL':
        pushRaw(padText('TOTAL:', 16, 'I') + padText(formatMoney(totales.TOTALDOC), 16, 'D'), { bold: true, size: 'lg' });
        pushRaw(padText('Recibido:', 16, 'I') + padText(formatMoney(totales.RECIBIDO), 16, 'D'));
        pushRaw(padText('Cambio:', 16, 'I') + padText(formatMoney(totales.CAMBIODOCTO), 16, 'D'));
        break;
      case 'FORMAS_PAGO':
        pushRaw(padText('Efectivo', 16, 'I') + padText(formatMoney(totales.RECIBIDO), 16, 'D'));
        break;
      case 'IMPUESTOS_DET':
        pushRaw(padText('IVA', 10, 'I') + padText('16%', 10, 'C') + padText(formatMoney(totales.IVA), 12, 'D'));
        pushRaw(padText('Artículos vendidos:', 22, 'I') + padText(String(totales.NUM_VENDIDOS), 10, 'D'));
        break;
      case 'MONTO_LETRAS':
        for (const ln of wrap(montoLetras, TICKET_COLS)) {
          pushRaw(padText(ln, TICKET_COLS, 'I'), { italic: true, muted: true });
        }
        break;
    }
  }
  return lines;
}

// ─────────────────────────────────────────────────────────────
// ESC/POS mock translator — turns our template into hex commands
// Real commands (subset of Epson ESC/POS spec). Values are accurate.
// ─────────────────────────────────────────────────────────────
const ESC_POS = {
  INIT: '1B 40',            // ESC @
  ALIGN_L: '1B 61 00',
  ALIGN_C: '1B 61 01',
  ALIGN_R: '1B 61 02',
  BOLD_ON: '1B 45 01',
  BOLD_OFF: '1B 45 00',
  SIZE_NORM: '1D 21 00',
  SIZE_DBL: '1D 21 11',
  LF: '0A',
  CUT: '1D 56 41 10',
  IMG_RASTER: '1D 76 30 00',  // GS v 0 — raster bit image
};

function toEscPos({ empresa, doc, partidas, totales, montoLetras, showLogo, hasLogo }) {
  const out = [];
  out.push({ hex: ESC_POS.INIT, note: 'Inicializar impresora' });
  if (showLogo && hasLogo) {
    out.push({ hex: ESC_POS.ALIGN_C, note: 'Centrar' });
    out.push({ hex: ESC_POS.IMG_RASTER + ' [raster logo 384x96]', note: 'Imprimir logo (GS v 0)', highlight: true });
    out.push({ hex: ESC_POS.LF, note: '' });
  }
  out.push({ hex: ESC_POS.ALIGN_C, note: 'Centrar' });
  out.push({ hex: ESC_POS.SIZE_DBL + ' ' + ESC_POS.BOLD_ON, note: 'Doble tamaño + negrita' });
  out.push({ hex: strToHex(empresa.RZN_EMPRESA) + ' 0A', note: `"${empresa.RZN_EMPRESA}"`, text: true });
  out.push({ hex: ESC_POS.SIZE_NORM + ' ' + ESC_POS.BOLD_OFF, note: 'Tamaño normal' });
  out.push({ hex: strToHex(empresa.DIR_EMPRESA) + ' 0A', note: `"${empresa.DIR_EMPRESA}"`, text: true });
  out.push({ hex: strToHex('RFC: ' + empresa.RFC_EMPRESA) + ' 0A', note: `"RFC: ${empresa.RFC_EMPRESA}"`, text: true });
  out.push({ hex: ESC_POS.ALIGN_L, note: 'Alinear izquierda' });
  out.push({ hex: strToHex('-'.repeat(32)) + ' 0A', note: 'Separador' });
  out.push({ hex: strToHex(`Nota de venta: ${doc.NUMDOCTO}`) + ' 0A', note: 'Cabecera doc', text: true });
  out.push({ hex: strToHex(`Fecha: ${doc.FECHADOC}  ${doc.HORADOC}`) + ' 0A', note: 'Fecha/hora', text: true });
  out.push({ hex: '... [tabla partidas]', note: `${partidas.length} partidas formateadas`, dim: true });
  out.push({ hex: ESC_POS.BOLD_ON, note: 'Negrita' });
  out.push({ hex: strToHex(`TOTAL: ${formatMoney(totales.TOTALDOC)}`) + ' 0A', note: 'Total', text: true });
  out.push({ hex: ESC_POS.BOLD_OFF, note: '' });
  out.push({ hex: '0A 0A 0A', note: 'Espacios previos al corte' });
  out.push({ hex: ESC_POS.CUT, note: 'Corte parcial (GS V 1)', highlight: true });
  return out;
}

function strToHex(s) {
  return Array.from(new TextEncoder().encode(s))
    .map(b => b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');
}

Object.assign(window, {
  TICKET_TEMPLATE, MOCK_EMPRESA, MOCK_DOC, MOCK_PARTIDAS, MOCK_HISTORY, MOCK_MONTO_LETRAS,
  calcTotals, formatMoney, renderTicketLines, toEscPos, strToHex, TICKET_COLS,
});
