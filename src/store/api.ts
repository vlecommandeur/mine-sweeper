import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Difficulty } from '../types';
import type {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  LeaderboardResponse,
  SubmitScoreRequest,
  SubmitScoreResponse,
  UserProfile,
  UserStats,
} from '../types';
import { API_ENDPOINTS, STORAGE_KEYS } from '../lib/constants';

// Base query with auth header handling
const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Auth', 'Leaderboard', 'User', 'UserStats'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: API_ENDPOINTS.AUTH.LOGIN,
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),

    register: builder.mutation<AuthResponse, RegisterCredentials>({
      query: (credentials) => ({
        url: API_ENDPOINTS.AUTH.REGISTER,
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: API_ENDPOINTS.AUTH.LOGOUT,
        method: 'POST',
      }),
      invalidatesTags: ['Auth', 'User', 'UserStats'],
    }),

    getMe: builder.query<UserProfile, void>({
      query: () => API_ENDPOINTS.AUTH.ME,
      providesTags: ['Auth'],
    }),

    // Leaderboard endpoints
    getLeaderboard: builder.query<LeaderboardResponse, Difficulty>({
      query: (difficulty) => API_ENDPOINTS.LEADERBOARD(difficulty),
      providesTags: (_result, _error, difficulty) => [
        { type: 'Leaderboard', id: difficulty },
      ],
    }),

    // Score endpoints
    submitScore: builder.mutation<SubmitScoreResponse, SubmitScoreRequest>({
      query: (data) => ({
        url: API_ENDPOINTS.SCORES,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: 'Leaderboard', id: arg.difficulty },
        'UserStats',
      ],
    }),

    // User endpoints
    getUserProfile: builder.query<UserProfile, string>({
      query: (userId) => API_ENDPOINTS.USER(userId),
      providesTags: (_result, _error, userId) => [{ type: 'User', id: userId }],
    }),

    getUserStats: builder.query<UserStats, string>({
      query: (userId) => API_ENDPOINTS.USER_STATS(userId),
      providesTags: (_result, _error, userId) => [
        { type: 'UserStats', id: userId },
      ],
    }),
  }),
});

// Export hooks
export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetMeQuery,
  useGetLeaderboardQuery,
  useSubmitScoreMutation,
  useGetUserProfileQuery,
  useGetUserStatsQuery,
} = api;

export default api;
