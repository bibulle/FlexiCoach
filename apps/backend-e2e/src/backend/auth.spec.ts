import axios from 'axios';

describe('Auth API', () => {
  const API_URL = process.env.API_URL || 'http://localhost:3000';
  let accessToken: string;
  let userId: string;

  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
    displayName: 'Test User',
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await axios.post(`${API_URL}/api/auth/register`, testUser);

      expect(res.status).toBe(201);
      expect(res.data.access_token).toBeDefined();
      expect(res.data.user.email).toBe(testUser.email);
      expect(res.data.user.displayName).toBe(testUser.displayName);
      expect(res.data.user._id).toBeDefined();

      accessToken = res.data.access_token;
      userId = res.data.user._id;
    });

    it('should fail to register with existing email', async () => {
      try {
        await axios.post(`${API_URL}/api/auth/register`, testUser);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(409);
        expect(error.response.data.message).toContain('Email already exists');
      }
    });

    it('should fail to register without required fields', async () => {
      try {
        await axios.post(`${API_URL}/api/auth/register`, {
          email: 'incomplete@example.com',
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(500);
      }
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.data.access_token).toBeDefined();
      expect(res.data.user.email).toBe(testUser.email);
      expect(res.data.user._id).toBe(userId);

      accessToken = res.data.access_token;
    });

    it('should fail to login with invalid password', async () => {
      try {
        await axios.post(`${API_URL}/api/auth/login`, {
          email: testUser.email,
          password: 'wrongpassword',
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.message).toContain('Invalid credentials');
      }
    });

    it('should fail to login with non-existent email', async () => {
      try {
        await axios.post(`${API_URL}/api/auth/login`, {
          email: 'nonexistent@example.com',
          password: 'password123',
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.message).toContain('Invalid credentials');
      }
    });
  });

  describe('Protected Routes', () => {
    it('should access protected route with valid token', async () => {
      const res = await axios.get(`${API_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      expect(res.status).toBe(200);
      expect(res.data._id).toBe(userId);
      expect(res.data.email).toBe(testUser.email);
    });

    it('should fail to access protected route without token', async () => {
      try {
        await axios.get(`${API_URL}/api/users/me`);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    it('should fail to access protected route with invalid token', async () => {
      try {
        await axios.get(`${API_URL}/api/users/me`, {
          headers: {
            Authorization: 'Bearer invalid-token',
          },
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    it('should create session with authenticated user', async () => {
      const session = {
        routineId: '507f1f77bcf86cd799439011',
        startAt: new Date().toISOString(),
        durationSec: 600,
        completed: false,
      };

      const res = await axios.post(`${API_URL}/api/sessions`, session, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      expect(res.status).toBe(201);
      expect(res.data.userId).toBe(userId);
      expect(res.data.routineId).toBe(session.routineId);
    });
  });
});
