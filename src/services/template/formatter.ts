import type { Alignment } from '../../types';

const LINE_WIDTH = 32;

export function padLine(text: string, alignment: Alignment, width: number): string {
  const t = String(text ?? '').slice(0, width);
  const pad = width - t.length;
  if (pad <= 0) return t;
  if (alignment === 'I') return t + ' '.repeat(pad);
  if (alignment === 'D') return ' '.repeat(pad) + t;
  // Center
  const left = Math.floor(pad / 2);
  const right = pad - left;
  return ' '.repeat(left) + t + ' '.repeat(right);
}

export function repeatChar(char: string, width: number): string {
  return (char || '-').repeat(width);
}

export function colWidths(percents: number[], totalChars = LINE_WIDTH): number[] {
  const widths = percents.map((p) => Math.floor((p / 100) * totalChars));
  // distribute rounding remainder to last column
  const sum = widths.reduce((a, b) => a + b, 0);
  widths[widths.length - 1] += totalChars - sum;
  return widths;
}

// Word-wrap a string to fit within `width` characters.
export function wrapText(text: string, width: number): string[] {
  if (!text || width <= 0) return [''];
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (current.length === 0) {
      current = word.slice(0, width);
    } else if (current.length + 1 + word.length <= width) {
      current += ' ' + word;
    } else {
      lines.push(current);
      current = word.slice(0, width);
    }
  }
  if (current.length > 0) lines.push(current);
  return lines.length > 0 ? lines : [''];
}

// Build a single joined line from column cells.
export function buildTableRow(
  cells: string[],
  widths: number[],
  alignments: Alignment[]
): string {
  return cells.map((cell, i) => padLine(cell, alignments[i] ?? 'I', widths[i] ?? 0)).join('');
}
