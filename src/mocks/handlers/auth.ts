import { http, HttpResponse } from 'msw';
import type { LoginCredentials, RegisterCredentials, AuthResponse, UserProfile } from '../../types';
import { db, generateUserId, generateToken, getUserFromAuth, createEmptyStats } from './db';

export const authHandlers = [
  // Login
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as LoginCredentials;
    const user = Array.from(db.users.values()).find(
      (u) => u.username === body.username && u.password === body.password
    );

    if (!user) {
      return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = generateToken();
    db.sessions.set(token, user.id);

    const response: AuthResponse = {
      user: { id: user.id, username: user.username },
      token,
    };
    return HttpResponse.json(response);
  }),

  // Register
  http.post('/api/auth/register', async ({ request }) => {
    const body = (await request.json()) as RegisterCredentials;

    const existingUser = Array.from(db.users.values()).find(
      (u) => u.username === body.username
    );
    if (existingUser) {
      return HttpResponse.json({ message: 'Username already exists' }, { status: 400 });
    }

    const userId = generateUserId();
    const newUser = { id: userId, username: body.username, password: body.password };
    db.users.set(userId, newUser);

    // Initialize empty stats
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

  // Logout
  http.post('/api/auth/logout', async ({ request }) => {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      db.sessions.delete(token);
    }
    return HttpResponse.json({ success: true });
  }),

  // Get current user
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
];
