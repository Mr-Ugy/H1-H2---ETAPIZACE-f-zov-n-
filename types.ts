export interface PhaseData {
  id: string;
  category: string;
  subCategory: string;
  phases: string[]; // Array of strings matching the phases columns
}

export enum CellStatus {
  OK = 'OK',
  CONSTRUCTION = 'CONSTRUCTION',
  RESTRICTION = 'RESTRICTION',
  MOVING = 'MOVING',
  EMPTY = 'EMPTY',
  UNKNOWN = 'UNKNOWN'
}

export interface CsvParseResult {
  headers: string[];
  rows: PhaseData[];
}
