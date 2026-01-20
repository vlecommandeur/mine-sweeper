import { http, HttpResponse } from 'msw';
import type { Difficulty } from '../types';
import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  LeaderboardResponse,
  LeaderboardEntry,
  SubmitScoreRequest,
  SubmitScoreResponse,
  UserProfile,
  UserStats,
  DifficultyStats,
} from '../types';
import { LEADERBOARD_SIZE } from '../lib/constants';

// In-memory storage for mock data
const db = {
  users: new Map<string, { id: string; username: string; password: string }>(),
  leaderboards: new Map<Difficulty, LeaderboardEntry[]>(),
  userStats: new Map<string, UserStats>(),
  // Track current logged-in user per session (using token as key)
  sessions: new Map<string, string>(), // token -> userId
  idCounter: 1,
};

// Initialize with some sample leaderboard data
const initSampleData = () => {
  if (db.leaderboards.size === 0) {
    const difficulties: Difficulty[] = ['beginner', 'intermediate', 'expert'];
    difficulties.forEach((difficulty) => {
      db.leaderboards.set(
        difficulty,
        Array.from({ length: 5 }, (_, i) => ({
          rank: i + 1,
          username: `Player${i + 1}`,
          time: 10000 + i * 5000, // 10s, 15s, 20s, etc.
          userId: `sample-user-${i}`,
        }))
      );
    });
  }

  // Add test users for easy login
  if (db.users.size === 0) {
    const testUsers = [
      { id: 'user-test-1', username: 'testuser', password: 'password123' },
      { id: 'user-test-2', username: 'alice', password: 'alice123' },
      { id: 'user-test-3', username: 'bob', password: 'bob123' },
    ];
    testUsers.forEach((user) => db.users.set(user.id, user));

    // Add stats for test users
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

  // Create a persistent session for testuser (token: dev-token-testuser)
  db.sessions.set('dev-token-testuser', 'user-test-1');
};
initSampleData();

// Export seed data info for console logging
export const seedDataInfo = {
  testUsers: [
    { username: 'testuser', password: 'password123' },
    { username: 'alice', password: 'alice123' },
    { username: 'bob', password: 'bob123' },
  ],
  devToken: 'dev-token-testuser', // Use this in localStorage to auto-login as testuser
};

// Helper to generate user ID
const generateUserId = () => `user-${db.idCounter++}`;

// Helper to generate token
const generateToken = () => `token-${Date.now()}-${Math.random()}`;

// Helper to get user from authorization header
const getUserFromAuth = (request: Request): { userId: string } | null => {
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
};

export const handlers = [
  // Auth: Login
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as LoginCredentials;
    const user = Array.from(db.users.values()).find(
      (u) => u.username === body.username && u.password === body.password
    );

    if (!user) {
      return HttpResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = generateToken();
    db.sessions.set(token, user.id);

    const response: AuthResponse = {
      user: { id: user.id, username: user.username },
      token,
    };
    return HttpResponse.json(response);
  }),

  // Auth: Register
  http.post('/api/auth/register', async ({ request }) => {
    const body = (await request.json()) as RegisterCredentials;

    // Check if username already exists
    const existingUser = Array.from(db.users.values()).find(
      (u) => u.username === body.username
    );
    if (existingUser) {
      return HttpResponse.json(
        { message: 'Username already exists' },
        { status: 400 }
      );
    }

    const userId = generateUserId();
    const newUser = {
      id: userId,
      username: body.username,
      password: body.password,
    };
    db.users.set(userId, newUser);

    // Initialize empty stats for new user
    db.userStats.set(userId, {
      userId,
      username: body.username,
      stats: {
        beginner: createEmptyStats(),
        intermediate: createEmptyStats(),
        expert: createEmptyStats(),
      },
    });

    const token = generateToken();
    db.sessions.set(token, userId);

    const response: AuthResponse = {
      user: { id: userId, username: body.username },
      token,
    };
    return HttpResponse.json(response);
  }),

  // Auth: Logout
  http.post('/api/auth/logout', async ({ request }) => {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      db.sessions.delete(token);
    }
    return HttpResponse.json({ success: true });
  }),

  // Auth: Get current user (Me)
  http.get('/api/auth/me', async ({ request }) => {
    const userAuth = getUserFromAuth(request);
    if (!userAuth) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = db.users.get(userAuth.userId);
    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const response: UserProfile = { id: user.id, username: user.username };
    return HttpResponse.json(response);
  }),

  // Leaderboard: Get by difficulty
  http.get('/api/leaderboard/:difficulty', async ({ params }) => {
    const { difficulty } = params as { difficulty: Difficulty };

    if (!['beginner', 'intermediate', 'expert'].includes(difficulty)) {
      return HttpResponse.json(
        { message: 'Invalid difficulty' },
        { status: 400 }
      );
    }

    const entries = db.leaderboards.get(difficulty) || [];

    const response: LeaderboardResponse = {
      difficulty,
      entries: entries.slice(0, LEADERBOARD_SIZE),
    };
    return HttpResponse.json(response);
  }),

  // Scores: Submit score
  http.post('/api/scores', async ({ request }) => {
    const userAuth = getUserFromAuth(request);
    if (!userAuth) {
      return HttpResponse.json(
        { message: 'Must be logged in to submit scores' },
        { status: 401 }
      );
    }

    const user = db.users.get(userAuth.userId);
    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const body = (await request.json()) as SubmitScoreRequest;

    // Get current leaderboard
    const leaderboard = db.leaderboards.get(body.difficulty) || [];

    // Add new entry
    const newEntry: LeaderboardEntry = {
      rank: 0, // Will be calculated
      username: user.username,
      time: body.time,
      userId: user.id,
    };

    leaderboard.push(newEntry);

    // Sort by time (ascending)
    leaderboard.sort((a, b) => a.time - b.time);

    // Update ranks
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Keep only top N entries
    const trimmedLeaderboard = leaderboard.slice(0, LEADERBOARD_SIZE);

    // Save back to db
    db.leaderboards.set(body.difficulty, trimmedLeaderboard);

    // Find the user's rank
    const userRank = trimmedLeaderboard.find((e) => e.userId === user.id);

    // Update user stats
    const stats = db.userStats.get(user.id);
    if (stats) {
      const diffStats = stats.stats[body.difficulty];
      diffStats.gamesPlayed += 1;
      diffStats.wins += 1;
      if (
        !diffStats.bestTime ||
        (body.time > 0 && body.time < diffStats.bestTime)
      ) {
        diffStats.bestTime = body.time;
      }
      diffStats.winRate = (diffStats.wins / diffStats.gamesPlayed) * 100;
    }

    const response: SubmitScoreResponse = {
      success: true,
      rank: userRank?.rank,
      leaderboard: trimmedLeaderboard,
    };
    return HttpResponse.json(response);
  }),

  // User: Get profile
  http.get('/api/users/:userId', async ({ params }) => {
    const { userId } = params as { userId: string };

    const user = db.users.get(userId);
    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const response: UserProfile = { id: user.id, username: user.username };
    return HttpResponse.json(response);
  }),

  // User: Get stats
  http.get('/api/users/:userId/stats', async ({ params }) => {
    const { userId } = params as { userId: string };

    const user = db.users.get(userId);
    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const stats = db.userStats.get(userId);
    if (!stats) {
      // Return empty stats if not initialized
      const response: UserStats = {
        userId,
        username: user.username,
        stats: {
          beginner: createEmptyStats(),
          intermediate: createEmptyStats(),
          expert: createEmptyStats(),
        },
      };
      return HttpResponse.json(response);
    }

    return HttpResponse.json(stats);
  }),
];

function createEmptyStats(): DifficultyStats {
  return {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    bestTime: null,
    winRate: 0,
  };
}
