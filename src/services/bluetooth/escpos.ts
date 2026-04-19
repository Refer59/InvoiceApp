// ESC/POS byte builder for 58mm thermal printer
// 48mm effective width = 384 dots at 203dpi
// Font A: 32 chars/line  |  Font B: 42 chars/line

const ESC = 0x1b;
const GS  = 0x1d;
const LF  = 0x0a;

function bytes(...args: number[]): number[] { return args; }

export const CMD = {
  INIT:         bytes(ESC, 0x40),
  ALIGN_LEFT:   bytes(ESC, 0x61, 0x00),
  ALIGN_CENTER: bytes(ESC, 0x61, 0x01),
  ALIGN_RIGHT:  bytes(ESC, 0x61, 0x02),
  BOLD_ON:      bytes(ESC, 0x45, 0x01),
  BOLD_OFF:     bytes(ESC, 0x45, 0x00),
  // double-height for grand total (ESC ! 0x10)
  DOUBLE_HEIGHT_ON:  bytes(ESC, 0x21, 0x10),
  DOUBLE_HEIGHT_OFF: bytes(ESC, 0x21, 0x00),
  FONT_A:       bytes(ESC, 0x4d, 0x00), // 12×24, 32 chars/line
  FONT_B:       bytes(ESC, 0x4d, 0x01), // 9×17, 42 chars/line
  FEED_LINE:    bytes(LF),
  FEED_LINES:   (n: number) => bytes(ESC, 0x64, n),
  CUT_FULL:     bytes(GS, 0x56, 0x00),
  CUT_PARTIAL:  bytes(GS, 0x56, 0x01),
  // CP858 code page covers Spanish accented chars and ñ
  CODE_PAGE_858: bytes(ESC, 0x74, 0x13),
};

// Replace characters outside CP858 with safe ASCII equivalents
const CP858_MAP: Record<string, string> = {
  'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
  'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U',
  'ñ': 'n', 'Ñ': 'N', 'ü': 'u', 'Ü': 'U', '¿': '?', '¡': '!',
};

function strToBytes(str: string): number[] {
  return Array.from(str).map((c) => {
    const mapped = CP858_MAP[c];
    if (mapped) return mapped.charCodeAt(0);
    const code = c.charCodeAt(0);
    return code < 256 ? code : 0x3f; // '?'
  });
}

function center32(text: string): string {
  const pad = Math.max(0, Math.floor((32 - text.length) / 2));
  return ' '.repeat(pad) + text;
}

const DIV32 = '--------------------------------';

interface PrintOptions {
  gracias?: string;
  showNotavoAttribution?: boolean;
  NUMDOCTO?: string;
  FECHADOC?: string;
  HORADOC?: string;
}

export function buildPrintJob(
  lines: string[],
  logoBase64?: string,
  opts: PrintOptions = {},
): Uint8Array {
  const out: number[] = [];
  const push = (...chunks: number[][]) => { for (const c of chunks) out.push(...c); };

  push(CMD.INIT);
  push(CMD.CODE_PAGE_858);
  push(CMD.FONT_A);
  push(CMD.ALIGN_LEFT);

  // Logo: pre-rendered notavo-mark-mono.png bitmap would go here via GS v 0 raster command.
  // Until the asset is built at compile time, emit one blank line as placeholder.
  if (logoBase64) {
    push(CMD.FEED_LINE);
  }

  // Document header
  if (opts.NUMDOCTO) {
    push(CMD.ALIGN_CENTER);
    push(CMD.BOLD_ON);
    push(strToBytes(center32(`Nota #${opts.NUMDOCTO}`)));
    push(CMD.FEED_LINE);
    push(CMD.BOLD_OFF);
    if (opts.FECHADOC && opts.HORADOC) {
      push(strToBytes(center32(`${opts.FECHADOC} ${opts.HORADOC}`)));
      push(CMD.FEED_LINE);
    }
    push(strToBytes(DIV32));
    push(CMD.FEED_LINE);
    push(CMD.ALIGN_LEFT);
  }

  // Body lines from template interpreter
  for (const line of lines) {
    push(strToBytes(line));
    push(CMD.FEED_LINE);
  }

  // Footer
  push(strToBytes(DIV32));
  push(CMD.FEED_LINE);
  push(CMD.ALIGN_CENTER);

  const gracias = opts.gracias ?? '¡Gracias por tu compra!';
  push(strToBytes(center32(gracias)));
  push(CMD.FEED_LINE);

  if (opts.showNotavoAttribution) {
    push(strToBytes(center32('Hecho con Notavo')));
    push(CMD.FEED_LINE);
  }

  push(strToBytes(DIV32));
  push(CMD.FEED_LINE);

  // 3 blank lines + partial cut — low-end printers lose last line without trailing feeds
  push(CMD.FEED_LINES(3));
  push(CMD.CUT_PARTIAL);

  return new Uint8Array(out);
}

// Split into BLE-safe chunks (≤512 bytes; 100 is conservative)
export function chunkJob(job: Uint8Array, chunkSize = 100): Uint8Array[] {
  const chunks: Uint8Array[] = [];
  for (let i = 0; i < job.length; i += chunkSize) {
    chunks.push(job.slice(i, i + chunkSize));
  }
  return chunks;
}
