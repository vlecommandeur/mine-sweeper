import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Board, GameStatus, Difficulty } from '../types';

interface GameState {
  board: Board | null;
  status: GameStatus;
  difficulty: Difficulty;
  minesRemaining: number;
  elapsedTime: number; // milliseconds
  isFirstClick: boolean;
}

const initialState: GameState = {
  board: null,
  status: 'idle',
  difficulty: 'beginner',
  minesRemaining: 0,
  elapsedTime: 0,
  isFirstClick: true,
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    initGame: (
      state,
      action: PayloadAction<{
        board: Board;
        difficulty: Difficulty;
        totalMines: number;
      }>
    ) => {
      state.board = action.payload.board;
      state.difficulty = action.payload.difficulty;
      state.minesRemaining = action.payload.totalMines;
      state.status = 'idle';
      state.elapsedTime = 0;
      state.isFirstClick = true;
    },

    startGame: (state) => {
      state.status = 'playing';
    },

    revealCell: (
      state,
      action: PayloadAction<{ row: number; col: number; newBoard: Board }>
    ) => {
      state.board = action.payload.newBoard;
      if (state.status === 'idle') {
        state.status = 'playing';
        state.isFirstClick = false;
      }
    },

    toggleFlag: (
      state,
      action: PayloadAction<{ row: number; col: number; newBoard: Board }>
    ) => {
      state.board = action.payload.newBoard;
    },

    updateMinesRemaining: (state, action: PayloadAction<number>) => {
      state.minesRemaining = action.payload;
    },

    updateTimer: (state, action: PayloadAction<number>) => {
      state.elapsedTime = action.payload;
    },

    winGame: (state) => {
      state.status = 'won';
    },

    loseGame: (state) => {
      state.status = 'lost';
    },

    resetGame: (state) => {
      state.status = 'idle';
      state.elapsedTime = 0;
      state.isFirstClick = true;
      // Note: board is reset by initGame
    },
  },
});

export const {
  initGame,
  startGame,
  revealCell,
  toggleFlag,
  updateMinesRemaining,
  updateTimer,
  winGame,
  loseGame,
  resetGame,
} = gameSlice.actions;

export default gameSlice.reducer;
