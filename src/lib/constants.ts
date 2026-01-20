import type { Difficulty } from '../types';

export interface DifficultyConfig {
  label: string;
  rows: number;
  cols: number;
  mines: number;
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  beginner: {
    label: 'Beginner',
    rows: 9,
    cols: 9,
    mines: 10,
  },
  intermediate: {
    label: 'Intermediate',
    rows: 16,
    cols: 16,
    mines: 40,
  },
  expert: {
    label: 'Expert',
    rows: 16,
    cols: 30,
    mines: 99,
  },
};

export const DIFFICULTIES: Difficulty[] = ['beginner', 'intermediate', 'expert'];

export const LEADERBOARD_SIZE = 10;

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  LEADERBOARD: (difficulty: Difficulty) => `/api/leaderboard/${difficulty}`,
  SCORES: '/api/scores',
  USER: (userId: string) => `/api/users/${userId}`,
  USER_STATS: (userId: string) => `/api/users/${userId}/stats`,
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'minesweeper_auth_token',
  AUTH_USER: 'minesweeper_auth_user',
} as const;
