import axios from 'axios';
import {
  API_URL,
  TestUser,
  authHeaders,
  registerUser,
} from '../support/auth-helper';

describe('Users API (/api/users/me)', () => {
  let user: TestUser;

  beforeAll(async () => {
    user = await registerUser('users');
  });

  describe('GET /api/users/me', () => {
    it('should return the current user profile', async () => {
      const res = await axios.get(`${API_URL}/api/users/me`, authHeaders(user));

      expect(res.status).toBe(200);
      expect(res.data._id).toBe(user.userId);
      expect(res.data.email).toBe(user.email);
      expect(res.data.displayName).toBe(user.displayName);
    });

    it('should never expose the password hash', async () => {
      const res = await axios.get(`${API_URL}/api/users/me`, authHeaders(user));

      expect(res.data.password).toBeUndefined();
    });

    it('should fail without authentication', async () => {
      await expect(axios.get(`${API_URL}/api/users/me`)).rejects.toMatchObject({
        response: { status: 401 },
      });
    });
  });

  describe('PATCH /api/users/me', () => {
    it('should update the display name and timezone', async () => {
      const res = await axios.patch(
        `${API_URL}/api/users/me`,
        { displayName: 'Updated User', tz: 'Europe/Paris' },
        authHeaders(user),
      );

      expect(res.status).toBe(200);
      expect(res.data.displayName).toBe('Updated User');
      expect(res.data.tz).toBe('Europe/Paris');
    });

    it('should reject unknown properties', async () => {
      await expect(
        axios.patch(
          `${API_URL}/api/users/me`,
          { email: 'hacker@example.com' },
          authHeaders(user),
        ),
      ).rejects.toMatchObject({ response: { status: 400 } });
    });

    it('should reject a display name longer than 100 characters', async () => {
      await expect(
        axios.patch(
          `${API_URL}/api/users/me`,
          { displayName: 'x'.repeat(101) },
          authHeaders(user),
        ),
      ).rejects.toMatchObject({ response: { status: 400 } });
    });
  });

  describe('PATCH /api/users/me/settings', () => {
    it('should update user settings', async () => {
      const res = await axios.patch(
        `${API_URL}/api/users/me/settings`,
        { theme: 'dark', voiceRate: 1.2, notifications: true },
        authHeaders(user),
      );

      expect(res.status).toBe(200);
      expect(res.data.settings.theme).toBe('dark');
      expect(res.data.settings.voiceRate).toBe(1.2);
      expect(res.data.settings.notifications).toBe(true);
    });

    it('should persist settings for the next profile read', async () => {
      const res = await axios.get(`${API_URL}/api/users/me`, authHeaders(user));

      expect(res.data.settings.theme).toBe('dark');
    });
  });

  describe('PATCH /api/users/me/password', () => {
    it('should reject a wrong current password', async () => {
      await expect(
        axios.patch(
          `${API_URL}/api/users/me/password`,
          { currentPassword: 'WrongPassword1', newPassword: 'NewPassword456' },
          authHeaders(user),
        ),
      ).rejects.toMatchObject({ response: { status: 401 } });
    });

    it('should reject a new password that is too short', async () => {
      await expect(
        axios.patch(
          `${API_URL}/api/users/me/password`,
          { currentPassword: user.password, newPassword: '123' },
          authHeaders(user),
        ),
      ).rejects.toMatchObject({ response: { status: 400 } });
    });

    it('should change the password and allow login with the new one', async () => {
      const res = await axios.patch(
        `${API_URL}/api/users/me/password`,
        { currentPassword: user.password, newPassword: 'NewPassword456' },
        authHeaders(user),
      );
      expect(res.status).toBe(200);

      const login = await axios.post(`${API_URL}/api/auth/login`, {
        email: user.email,
        password: 'NewPassword456',
      });
      expect(login.status).toBe(200);
      expect(login.data.user._id).toBe(user.userId);

      await expect(
        axios.post(`${API_URL}/api/auth/login`, {
          email: user.email,
          password: user.password,
        }),
      ).rejects.toMatchObject({ response: { status: 401 } });
    });
  });
});
