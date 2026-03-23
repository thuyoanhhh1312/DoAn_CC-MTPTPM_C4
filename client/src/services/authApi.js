import { apiClient, publicApi } from '@/services/apiClient';

const useMockAuth = (import.meta.env.VITE_USE_MOCK_AUTH || 'false') === 'true';

const mockUsers = [
  {
    id: 'u-admin',
    name: 'Admin Operator',
    email: 'admin@jewel.local',
    password: 'Admin@123',
    roles: ['admin'],
  },
  {
    id: 'u-staff',
    name: 'Staff Operator',
    email: 'staff@jewel.local',
    password: 'Staff@123',
    roles: ['staff'],
  },
  {
    id: 'u-customer',
    name: 'Customer Demo',
    email: 'customer@jewel.local',
    password: 'Customer@123',
    roles: ['customer'],
  },
];

let mockRefreshSubjectId = null;

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  roles: user.roles,
  role: user.roles[0],
});

const buildToken = (user) => `mock-${user.roles[0]}-${Date.now()}`;

const toError = (error, fallbackMessage) => {
  const apiMessage = error.response?.data?.message;
  return new Error(apiMessage || fallbackMessage);
};

export const authApi = {
  async signIn(payload) {
    if (useMockAuth) {
      await delay();

      const user = mockUsers.find(
        (candidate) =>
          candidate.email.toLowerCase() === payload.email.toLowerCase() &&
          candidate.password === payload.password,
      );

      if (!user) {
        throw new Error('Invalid email or password');
      }

      mockRefreshSubjectId = user.id;
      return {
        user: sanitizeUser(user),
        accessToken: buildToken(user),
      };
    }

    try {
      const { data } = await publicApi.post('/auth/signin', payload);
      return data;
    } catch (error) {
      throw toError(error, 'Unable to sign in');
    }
  },

  async signUp(payload) {
    if (useMockAuth) {
      await delay();
      return {
        message: `Mock signup successful for ${payload.email}`,
      };
    }

    try {
      const { data } = await publicApi.post('/auth/signup', payload);
      return data;
    } catch (error) {
      throw toError(error, 'Unable to sign up');
    }
  },

  async forgotPassword(payload) {
    if (useMockAuth) {
      await delay();
      return {
        message: `Password reset instructions sent to ${payload.email}`,
      };
    }

    try {
      const { data } = await publicApi.post('/auth/forgot-password', payload);
      return data;
    } catch (error) {
      throw toError(error, 'Unable to request password reset');
    }
  },

  async resetPassword(payload) {
    if (useMockAuth) {
      await delay();
      return {
        message: 'Password updated successfully',
      };
    }

    try {
      const { data } = await publicApi.post('/auth/reset-password', payload);
      return data;
    } catch (error) {
      throw toError(error, 'Unable to reset password');
    }
  },

  async refresh() {
    if (useMockAuth) {
      await delay(180);

      if (!mockRefreshSubjectId) {
        throw new Error('No active refresh session');
      }

      const user = mockUsers.find((candidate) => candidate.id === mockRefreshSubjectId);

      if (!user) {
        throw new Error('Session not found');
      }

      return {
        user: sanitizeUser(user),
        accessToken: buildToken(user),
      };
    }

    try {
      const { data } = await publicApi.post('/auth/refresh', null, {
        skipAuthRefresh: true,
      });
      return data;
    } catch (error) {
      throw toError(error, 'Unable to refresh session');
    }
  },

  async me() {
    if (useMockAuth) {
      await delay(120);

      if (!mockRefreshSubjectId) {
        throw new Error('No active session');
      }

      const user = mockUsers.find((candidate) => candidate.id === mockRefreshSubjectId);

      if (!user) {
        throw new Error('User not found');
      }

      return {
        user: sanitizeUser(user),
      };
    }

    try {
      const { data } = await apiClient.get('/auth/me');
      return data;
    } catch (error) {
      throw toError(error, 'Unable to load profile');
    }
  },

  async signOut() {
    if (useMockAuth) {
      await delay(100);
      mockRefreshSubjectId = null;
      return { message: 'Signed out' };
    }

    try {
      const { data } = await publicApi.post('/auth/signout', null, {
        skipAuthRefresh: true,
      });
      return data;
    } catch {
      return { message: 'Signed out locally' };
    }
  },
};
