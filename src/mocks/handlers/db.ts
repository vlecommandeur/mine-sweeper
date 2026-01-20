import type { Difficulty, LeaderboardEntry, UserStats } from '../../types';

export type DbUser = { id: string; username: string; password: string };

// In-memory storage for mock data
export const db = {
  users: new Map<string, DbUser>(),
  leaderboards: new Map<Difficulty, LeaderboardEntry[]>(),
  userStats: new Map<string, UserStats>(),
  // Track current logged-in user per session (using token as key)
  sessions: new Map<string, string>(), // token -> userId
  idCounter: 1,
};

// Initialize with sample data
export function initDb(): void {
  // Sample leaderboard data
  if (db.leaderboards.size === 0) {
    const difficulties: Difficulty[] = ['beginner', 'intermediate', 'expert'];
    difficulties.forEach((difficulty) => {
      db.leaderboards.set(
        difficulty,
        Array.from({ length: 5 }, (_, i) => ({
          rank: i + 1,
          username: `Player${i + 1}`,
          time: 10000 + i * 5000,
          userId: `sample-user-${i}`,
        }))
      );
    });
  }

  // Test users
  if (db.users.size === 0) {
    const testUsers: DbUser[] = [
      { id: 'user-test-1', username: 'testuser', password: 'password123' },
      { id: 'user-test-2', username: 'alice', password: 'alice123' },
      { id: 'user-test-3', username: 'bob', password: 'bob123' },
    ];
    testUsers.forEach((user) => db.users.set(user.id, user));

    // Stats for test users
    db.userStats.set('user-test-1', {
      userId: 'user-test-1',
      username: 'testuser',
      stats: {
        beginner: { gamesPlayed: 10, wins: 7, losses: 3, bestTime: 8500, winRate: 70 },
        intermediate: { gamesPlayed: 8, wins: 5, losses: 3, bestTime: 45000, winRate: 62.5 },
        expert: { gamesPlayed: 5, wins: 2, losses: 3, bestTime: 120000, winRate: 40 },
      },
    });
    db.userStats.set('user-test-2', {
      userId: 'user-test-2',
      username: 'alice',
      stats: {
        beginner: { gamesPlayed: 15, wins: 12, losses: 3, bestTime: 7200, winRate: 80 },
        intermediate: { gamesPlayed: 10, wins: 8, losses: 2, bestTime: 38000, winRate: 80 },
        expert: { gamesPlayed: 3, wins: 1, losses: 2, bestTime: 95000, winRate: 33.33 },
      },
    });
    db.userStats.set('user-test-3', {
      userId: 'user-test-3',
      username: 'bob',
      stats: {
        beginner: { gamesPlayed: 5, wins: 3, losses: 2, bestTime: 9100, winRate: 60 },
        intermediate: { gamesPlayed: 2, wins: 1, losses: 1, bestTime: 55000, winRate: 50 },
        expert: { gamesPlayed: 1, wins: 0, losses: 1, bestTime: null, winRate: 0 },
      },
    });
  }

  // Persistent dev session
  db.sessions.set('dev-token-testuser', 'user-test-1');
}

// Seed data info for console logging
export const seedDataInfo = {
  testUsers: [
    { username: 'testuser', password: 'password123' },
    { username: 'alice', password: 'alice123' },
    { username: 'bob', password: 'bob123' },
  ],
  devToken: 'dev-token-testuser',
};

// Helpers
export function generateUserId(): string {
  return `user-${db.idCounter++}`;
}

export function generateToken(): string {
  return `token-${Date.now()}-${Math.random()}`;
}

export function getUserFromAuth(request: Request): { userId: string } | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7);
  const userId = db.sessions.get(token);
  if (!userId) {
    return null;
  }
  return { userId };
}

export function createEmptyStats() {
  return {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    bestTime: null,
    winRate: 0,
  };
}
