import { authHandlers } from './auth';
import { leaderboardHandlers } from './leaderboard';
import { userHandlers } from './users';
import { initDb, seedDataInfo } from './db';

// Initialize database with sample data
initDb();

// Combine all handlers
export const handlers = [...authHandlers, ...leaderboardHandlers, ...userHandlers];

// Export seed data info for console logging
export { seedDataInfo };
