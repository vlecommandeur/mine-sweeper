import { http, HttpResponse } from 'msw';
import type { Difficulty, LeaderboardResponse, SubmitScoreRequest, SubmitScoreResponse, LeaderboardEntry } from '../../types';
import { LEADERBOARD_SIZE } from '../../lib/constants';
import { db, getUserFromAuth } from './db';

export const leaderboardHandlers = [
  // Get leaderboard by difficulty
  http.get('/api/leaderboard/:difficulty', async ({ params }) => {
    const { difficulty } = params as { difficulty: Difficulty };

    if (!['beginner', 'intermediate', 'expert'].includes(difficulty)) {
      return HttpResponse.json({ message: 'Invalid difficulty' }, { status: 400 });
    }

    const entries = db.leaderboards.get(difficulty) || [];

    const response: LeaderboardResponse = {
      difficulty,
      entries: entries.slice(0, LEADERBOARD_SIZE),
    };
    return HttpResponse.json(response);
  }),

  // Submit score
  http.post('/api/scores', async ({ request }) => {
    const userAuth = getUserFromAuth(request);
    if (!userAuth) {
      return HttpResponse.json({ message: 'Must be logged in to submit scores' }, { status: 401 });
    }

    const user = db.users.get(userAuth.userId);
    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const body = (await request.json()) as SubmitScoreRequest;
    const leaderboard = db.leaderboards.get(body.difficulty) || [];

    // Add new entry
    const newEntry: LeaderboardEntry = {
      rank: 0,
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

    // Keep only top N
    const trimmedLeaderboard = leaderboard.slice(0, LEADERBOARD_SIZE);
    db.leaderboards.set(body.difficulty, trimmedLeaderboard);

    // Find user's rank
    const userRank = trimmedLeaderboard.find((e) => e.userId === user.id);

    // Update user stats
    const stats = db.userStats.get(user.id);
    if (stats) {
      const diffStats = stats.stats[body.difficulty];
      diffStats.gamesPlayed += 1;
      diffStats.wins += 1;
      if (!diffStats.bestTime || (body.time > 0 && body.time < diffStats.bestTime)) {
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
];
