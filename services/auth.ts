import { AuthState } from '../types';

const signedOut = (): AuthState => ({
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
});

const authUnavailable = () => new Error('AUTH_RUNTIME_NOT_CONNECTED');

export const AuthService = {
  login: async (): Promise<AuthState> => {
    throw authUnavailable();
  },

  logout: async (): Promise<AuthState> => signedOut(),

  fetchUserLikedVideos: async (_accessToken?: string): Promise<{ title: string; url: string }[]> => {
    throw authUnavailable();
  },

  postReply: async (_accessToken: string | null, _parentId: string, _text: string): Promise<boolean> => {
    return false;
  },
};
