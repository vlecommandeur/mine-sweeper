import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Board, GameStatus, Difficulty } from '../types';

interface GameState {
  board: Board | null;
  status: GameStatus;
  difficulty: Difficulty;
  minesRemaining: number;
  elapsedTime: number;
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
    setBoard: (state, action: PayloadAction<Board>) => {
      state.board = action.payload;
    },

    setStatus: (state, action: PayloadAction<GameStatus>) => {
      state.status = action.payload;
    },

    setDifficulty: (state, action: PayloadAction<Difficulty>) => {
      state.difficulty = action.payload;
    },

    setMinesRemaining: (state, action: PayloadAction<number>) => {
      state.minesRemaining = action.payload;
    },

    setElapsedTime: (state, action: PayloadAction<number>) => {
      state.elapsedTime = action.payload;
    },

    setIsFirstClick: (state, action: PayloadAction<boolean>) => {
      state.isFirstClick = action.payload;
    },
  },
});

export const {
  setBoard,
  setStatus,
  setDifficulty,
  setMinesRemaining,
  setElapsedTime,
  setIsFirstClick,
} = gameSlice.actions;

export default gameSlice.reducer;
