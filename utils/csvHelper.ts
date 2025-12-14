import { PhaseData, CellStatus } from '../types';

/**
 * Parses a single CSV line respecting quotes.
 */
const parseCsvLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Double quote inside quotes is a literal quote
        current += '"';
        i++;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of cell
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
};

export const parseCsv = (csvText: string): { headers: string[], rows: PhaseData[], notes: PhaseData[] } => {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length === 0) return { headers: [], rows: [], notes: [] };

  // Parse headers
  const headersRaw = parseCsvLine(lines[0]);
  // Assuming format: ,,Phase 0, Phase 1...
  // We remove the first two empty headers for the phase mapping
  const headers = headersRaw.slice(2).filter(h => h.trim() !== '');

  const rows: PhaseData[] = [];
  const notes: PhaseData[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    
    // Safety check for malformed lines
    if (cols.every(c => !c.trim())) continue;

    const category = cols[0]?.trim() || '';
    const subCategory = cols[1]?.trim() || '';
    const phases = cols.slice(2);

    const dataItem: PhaseData = {
      id: `row-${i}`,
      category,
      subCategory,
      phases
    };

    // Heuristic: If category and subcategory are empty but we have phase data, treat it as a general note
    // Or if it matches the specific "H1p - 1.PP" line pattern from the prompt
    if (!category && !subCategory && phases.some(p => p.trim() !== '')) {
       notes.push(dataItem);
    } else if (category || subCategory) {
       rows.push(dataItem);
    }
  }

  return { headers, rows, notes };
};

export const getCellStatus = (text: string): CellStatus => {
  const t = text.toLowerCase();
  if (!t) return CellStatus.EMPTY;
  
  if (t.includes('bez omezení')) return CellStatus.OK;
  if (t.includes('vystěhování') || t.includes('přestěhování')) return CellStatus.MOVING;
  if (t.includes('stavba') || t.includes('výstavba') || t.includes('realizace') || t.includes('technologie')) return CellStatus.CONSTRUCTION;
  if (t.includes('omezení') || t.includes('hluk') || t.includes('vibrace')) return CellStatus.RESTRICTION;
  
  return CellStatus.UNKNOWN;
};

// Updated colors to be more distinct yet softer
export const getStatusColor = (status: CellStatus): string => {
  switch (status) {
    case CellStatus.OK:
      return 'bg-emerald-50 text-emerald-900 border-emerald-200 shadow-emerald-100/50 hover:border-emerald-400 hover:shadow-emerald-200';
    case CellStatus.CONSTRUCTION:
      return 'bg-blue-50 text-blue-900 border-blue-200 shadow-blue-100/50 hover:border-blue-400 hover:shadow-blue-200';
    case CellStatus.MOVING:
      return 'bg-amber-50 text-amber-900 border-amber-200 shadow-amber-100/50 hover:border-amber-400 hover:shadow-amber-200';
    case CellStatus.RESTRICTION:
      return 'bg-rose-50 text-rose-900 border-rose-200 shadow-rose-100/50 hover:border-rose-400 hover:shadow-rose-200';
    case CellStatus.EMPTY:
      return 'bg-slate-50 text-slate-400 border-slate-100 shadow-none';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100';
  }
};

export const getStatusLabel = (status: CellStatus): string => {
  switch (status) {
    case CellStatus.OK: return "Bez omezení";
    case CellStatus.CONSTRUCTION: return "Výstavba";
    case CellStatus.MOVING: return "Stěhování";
    case CellStatus.RESTRICTION: return "Omezení provozu";
    case CellStatus.EMPTY: return "Žádná data";
    default: return "Info";
  }
};
