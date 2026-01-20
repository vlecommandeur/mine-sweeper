import type { Difficulty } from './game';

// Leaderboard
export interface LeaderboardEntry {
  rank: number;
  username: string;
  time: number; // milliseconds
  userId: string;
}

export interface LeaderboardResponse {
  difficulty: Difficulty;
  entries: LeaderboardEntry[];
}

// Score submission
export interface SubmitScoreRequest {
  difficulty: Difficulty;
  time: number; // milliseconds
}

export interface SubmitScoreResponse {
  success: boolean;
  rank?: number;
  leaderboard: LeaderboardEntry[];
}

// User profile
export interface UserProfile {
  id: string;
  username: string;
}

// User stats
export interface UserStats {
  userId: string;
  username: string;
  stats: Record<Difficulty, DifficultyStats>;
}

export interface DifficultyStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  bestTime: number | null; // milliseconds, null if no wins
  winRate: number; // percentage
}

// API error response
export interface ApiError {
  message: string;
  code?: string;
}
