import axios from 'axios';

describe('Users API', () => {
  const API_URL = process.env.API_URL || 'http://localhost:3000';
  let userId: string;

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const user = {
        email: 'test@example.com',
        displayName: 'Test User',
        tz: 'Europe/Paris',
        settings: {
          theme: 'light',
          sound: true,
        },
      };

      const res = await axios.post(`${API_URL}/api/users`, user);

      expect(res.status).toBe(201);
      expect(res.data.email).toBe('test@example.com');
      expect(res.data.displayName).toBe('Test User');
      userId = res.data._id;
    });
  });

  describe('GET /api/users', () => {
    it('should return all users', async () => {
      const res = await axios.get(`${API_URL}/api/users`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a specific user', async () => {
      const res = await axios.get(`${API_URL}/api/users/${userId}`);

      expect(res.status).toBe(200);
      expect(res.data._id).toBe(userId);
      expect(res.data.email).toBe('test@example.com');
    });

    it('should return null for non-existent user', async () => {
      const res = await axios.get(
        `${API_URL}/api/users/507f1f77bcf86cd799439011`
      );

      expect(res.status).toBe(200);
      expect(res.data).toBeFalsy(); // null or empty string
    });
  });

  describe('PATCH /api/users/:id', () => {
    it('should update a user', async () => {
      const res = await axios.patch(`${API_URL}/api/users/${userId}`, {
        displayName: 'Updated User',
      });

      expect(res.status).toBe(200);
      expect(res.data.displayName).toBe('Updated User');
    });
  });

  describe('PATCH /api/users/:id/settings', () => {
    it('should update user settings', async () => {
      const res = await axios.patch(`${API_URL}/api/users/${userId}/settings`, {
        theme: 'dark',
        voiceRate: 1.2,
        notifications: true,
      });

      expect(res.status).toBe(200);
      expect(res.data.settings.theme).toBe('dark');
      expect(res.data.settings.voiceRate).toBe(1.2);
      expect(res.data.settings.notifications).toBe(true);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete a user', async () => {
      const res = await axios.delete(`${API_URL}/api/users/${userId}`);

      expect(res.status).toBe(200);
      expect(res.data._id).toBe(userId);
    });

    it('should return null when deleting non-existent user', async () => {
      const res = await axios.delete(`${API_URL}/api/users/${userId}`);

      expect(res.status).toBe(200);
      expect(res.data).toBeFalsy(); // null or empty string
    });
  });
});
