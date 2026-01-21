export type Difficulty = "beginner" | "intermediate" | "expert";

export type CellState = "hidden" | "revealed" | "flagged";

export type CellValue = number | "mine";

export interface Cell {
  state: CellState;
  value: CellValue | null;
  isMine: boolean;
  adjacentMines: number;
}

export interface Board {
  cells: Cell[][];
  rows: number;
  cols: number;
}

export type GameStatus = "idle" | "playing" | "won" | "lost";

export interface GameState {
  board: Board | null;
  status: GameStatus;
  difficulty: Difficulty;
  minesRemaining: number;
  elapsedTime: number;
  isFirstClick: boolean;
}
