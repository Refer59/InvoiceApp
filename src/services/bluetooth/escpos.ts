// ESC/POS byte builder for 58mm thermal printer (32 chars/line, 203dpi)

const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;
const NUL = 0x00;

function bytes(...args: number[]): number[] {
  return args;
}

export const CMD = {
  INIT: bytes(ESC, 0x40),
  ALIGN_LEFT: bytes(ESC, 0x61, 0x00),
  ALIGN_CENTER: bytes(ESC, 0x61, 0x01),
  ALIGN_RIGHT: bytes(ESC, 0x61, 0x02),
  BOLD_ON: bytes(ESC, 0x45, 0x01),
  BOLD_OFF: bytes(ESC, 0x45, 0x00),
  FONT_A: bytes(ESC, 0x4d, 0x00), // 12x24, 32 chars/line
  FONT_B: bytes(ESC, 0x4d, 0x01), // 9x17, 42 chars/line
  FEED_LINE: bytes(LF),
  FEED_LINES: (n: number) => bytes(ESC, 0x64, n),
  CUT_FULL: bytes(GS, 0x56, 0x00),
  CUT_PARTIAL: bytes(GS, 0x56, 0x01),
};

function strToBytes(str: string): number[] {
  return Array.from(str).map((c) => {
    const code = c.charCodeAt(0);
    return code < 256 ? code : 0x3f; // replace non-Latin with '?'
  });
}

// Build a complete ESC/POS byte array from interpreted template lines
export function buildPrintJob(lines: string[], logoBase64?: string): Uint8Array {
  const out: number[] = [];

  const push = (...chunks: number[][]) => {
    for (const chunk of chunks) out.push(...chunk);
  };

  push(CMD.INIT);
  push(CMD.FONT_A);
  push(CMD.ALIGN_LEFT);

  // Logo (1-bit raster GS v 0) — skipped if not provided or too complex to decode at runtime
  // TODO: implement logo raster when running in a dev build with canvas access
  if (logoBase64) {
    // Logo placeholder: just feed a blank line
    push(CMD.FEED_LINE);
  }

  for (const line of lines) {
    push(strToBytes(line));
    push(CMD.FEED_LINE);
  }

  push(CMD.FEED_LINES(4));
  push(CMD.CUT_PARTIAL);

  return new Uint8Array(out);
}

// Split into chunks safe for BLE write (most stacks need ≤ 512 bytes; 100 is conservative)
export function chunkJob(job: Uint8Array, chunkSize = 100): Uint8Array[] {
  const chunks: Uint8Array[] = [];
  for (let i = 0; i < job.length; i += chunkSize) {
    chunks.push(job.slice(i, i + chunkSize));
  }
  return chunks;
}
