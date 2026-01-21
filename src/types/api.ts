import type { Difficulty } from "./game";

export interface LeaderboardEntry {
  rank: number;
  username: string;
  time: number;
  userId: string;
}

export interface LeaderboardResponse {
  difficulty: Difficulty;
  entries: LeaderboardEntry[];
}

export interface SubmitScoreRequest {
  difficulty: Difficulty;
  time: number;
}

export interface SubmitScoreResponse {
  success: boolean;
  rank?: number;
  leaderboard: LeaderboardEntry[];
}

export interface UserProfile {
  id: string;
  username: string;
}

export interface UserStats {
  userId: string;
  username: string;
  stats: Record<Difficulty, DifficultyStats>;
}

export interface DifficultyStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  bestTime: number | null;
  winRate: number;
}

export interface ApiError {
  message: string;
  code?: string;
}
