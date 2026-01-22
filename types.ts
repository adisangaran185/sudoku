
export interface CellData {
  value: number | null;
  isFixed: boolean;
  isError: boolean;
}

export type SudokuBoard = CellData[][];

export interface HintResponse {
  row: number;
  col: number;
  value: number;
  reason: string;
}

export enum GameStatus {
  PLAYING = 'PLAYING',
  WON = 'WON',
  CHECKING = 'CHECKING'
}
