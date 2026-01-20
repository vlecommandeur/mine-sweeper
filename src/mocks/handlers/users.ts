import { http, HttpResponse } from 'msw';
import type { UserProfile, UserStats } from '../../types';
import { db, createEmptyStats } from './db';

export const userHandlers = [
  // Get user profile
  http.get('/api/users/:userId', async ({ params }) => {
    const { userId } = params as { userId: string };

    const user = db.users.get(userId);
    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const response: UserProfile = { id: user.id, username: user.username };
    return HttpResponse.json(response);
  }),

  // Get user stats
  http.get('/api/users/:userId/stats', async ({ params }) => {
    const { userId } = params as { userId: string };

    const user = db.users.get(userId);
    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const stats = db.userStats.get(userId);
    if (!stats) {
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
