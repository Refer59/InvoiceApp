import type {
  TemplateNode,
  TextNode,
  TableNode,
  DivisionNode,
  TicketValues,
  TicketItem,
  PaymentItem,
  TaxItem,
  CellNode,
} from '../../types';
import {
  padLine,
  repeatChar,
  colWidths,
  buildTableRow,
} from './formatter';

const LINE_WIDTH = 32;

function resolveValue(node: { TEXTO?: string; VALOR?: string }, values: TicketValues): string {
  const literal = node.TEXTO ?? '';
  const key = node.VALOR ?? '';
  if (!key) return literal;
  const val = values[key];
  if (val === undefined || val === null) return literal;
  if (typeof val === 'string') return literal + val;
  return literal;
}

function renderText(node: TextNode, values: TicketValues): string[] {
  const text = resolveValue(node, values);
  const width = Math.round((node.ANCHO / 100) * LINE_WIDTH);
  return [padLine(text, node.ALINEACION, width)];
}

function renderDivision(node: DivisionNode): string[] {
  const char = node.TEXTO || '-';
  return [repeatChar(char, LINE_WIDTH)];
}

function renderTable(node: TableNode, values: TicketValues): string[] {
  const percents = node.COL.map((c) => c.ANCHO);
  const widths = colWidths(percents, LINE_WIDTH);
  const alignments = node.COL.map((c) => c.ALINEACION);
  const colKeys = node.COL.map((c) => c.REG);
  const lines: string[] = [];

  // Header row (column label row, if any col has TEXTO)
  const hasHeader = node.COL.some((c) => c.TEXTO);
  if (hasHeader) {
    const headerCells = node.COL.map((c) => c.TEXTO ?? '');
    lines.push(buildTableRow(headerCells, widths, alignments));
    if (node.DIVISIONCABECERA) {
      lines.push(repeatChar(node.DIVISIONCABECERA.TEXTO || '-', LINE_WIDTH));
    }
  }

  for (const rowDef of node.REG) {
    const repeatKey = typeof rowDef['REPETIDO'] === 'string' ? (rowDef['REPETIDO'] as string) : null;

    if (repeatKey) {
      const arr = values[repeatKey] as Array<TicketItem | PaymentItem | TaxItem> | undefined;
      if (arr && arr.length > 0) {
        for (const item of arr) {
          const cells = colKeys.map((key) => {
            const cellDef = rowDef[key] as CellNode | undefined;
            if (!cellDef) return '';
            const literal = cellDef.TEXTO ?? '';
            const valKey = cellDef.VALOR ?? '';
            const valRecord = item as Record<string, string>;
            return valKey ? literal + (valRecord[valKey] ?? '') : literal;
          });
          lines.push(buildTableRow(cells, widths, alignments));
        }
      }
    } else {
      const cells = colKeys.map((key) => {
        const cellDef = rowDef[key] as CellNode | undefined;
        if (!cellDef) return '';
        return resolveValue(cellDef, values);
      });
      lines.push(buildTableRow(cells, widths, alignments));
    }
  }

  return lines;
}

// Returns an array of plain-text lines (each 32 chars wide).
export function interpretTemplate(nodes: TemplateNode[], values: TicketValues): string[] {
  const lines: string[] = [];

  for (const node of nodes) {
    switch (node.TIPO) {
      case 'TEXTO':
        lines.push(...renderText(node, values));
        break;
      case 'DIVISION':
        lines.push(...renderDivision(node));
        break;
      case 'TABLA':
        lines.push(...renderTable(node, values));
        break;
      case 'RETCARRO':
        lines.push('');
        break;
    }
  }

  return lines;
}
