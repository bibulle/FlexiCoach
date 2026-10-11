import axios from 'axios';
import {
  API_URL,
  TestUser,
  authHeaders,
  registerUser,
} from '../support/auth-helper';

describe('Sessions API', () => {
  let user: TestUser;
  let otherUser: TestUser;
  let sessionId: string;

  const today = new Date().toISOString().slice(0, 10);

  beforeAll(async () => {
    user = await registerUser('sessions');
    otherUser = await registerUser('sessions-other');
  });

  describe('authentication', () => {
    it('should reject unauthenticated requests', async () => {
      await expect(axios.get(`${API_URL}/api/sessions`)).rejects.toMatchObject(
        { response: { status: 401 } },
      );
    });
  });

  describe('POST /api/sessions', () => {
    it('should create a session owned by the current user', async () => {
      const res = await axios.post(
        `${API_URL}/api/sessions`,
        {
          routineId: 'douce-10min',
          startAt: new Date().toISOString(),
          durationSec: 631,
          completed: false,
        },
        authHeaders(user),
      );

      expect(res.status).toBe(201);
      expect(res.data.routineId).toBe('douce-10min');
      expect(res.data.completed).toBe(false);
      expect(res.data.userId).toBe(user.userId);
      sessionId = res.data._id;
    });

    it('should reject a userId sent in the body', async () => {
      await expect(
        axios.post(
          `${API_URL}/api/sessions`,
          {
            routineId: 'douce-10min',
            startAt: new Date().toISOString(),
            durationSec: 10,
            userId: otherUser.userId,
          },
          authHeaders(user),
        ),
      ).rejects.toMatchObject({ response: { status: 400 } });
    });

    it('should validate the payload', async () => {
      await expect(
        axios.post(
          `${API_URL}/api/sessions`,
          { routineId: 'douce-10min', startAt: 'not-a-date', durationSec: -1 },
          authHeaders(user),
        ),
      ).rejects.toMatchObject({ response: { status: 400 } });
    });
  });

  describe('GET /api/sessions', () => {
    it('should only return the sessions of the current user', async () => {
      const mine = await axios.get(`${API_URL}/api/sessions`, authHeaders(user));
      expect(mine.status).toBe(200);
      expect(Array.isArray(mine.data)).toBe(true);
      expect(mine.data.some((s: any) => s._id === sessionId)).toBe(true);

      const theirs = await axios.get(
        `${API_URL}/api/sessions`,
        authHeaders(otherUser),
      );
      expect(theirs.data.some((s: any) => s._id === sessionId)).toBe(false);
    });
  });

  describe('GET /api/sessions/:id', () => {
    it('should return a specific session', async () => {
      const res = await axios.get(
        `${API_URL}/api/sessions/${sessionId}`,
        authHeaders(user),
      );

      expect(res.status).toBe(200);
      expect(res.data._id).toBe(sessionId);
    });

    it("should forbid reading another user's session", async () => {
      await expect(
        axios.get(`${API_URL}/api/sessions/${sessionId}`, authHeaders(otherUser)),
      ).rejects.toMatchObject({ response: { status: 403 } });
    });

    it('should return 404 for a non-existent session', async () => {
      await expect(
        axios.get(
          `${API_URL}/api/sessions/507f1f77bcf86cd799439011`,
          authHeaders(user),
        ),
      ).rejects.toMatchObject({ response: { status: 404 } });
    });
  });

  describe('PATCH /api/sessions/:id/complete', () => {
    it('should mark the session as completed with a feeling', async () => {
      const res = await axios.patch(
        `${API_URL}/api/sessions/${sessionId}/complete`,
        { completed: true, feeling: 4 },
        authHeaders(user),
      );

      expect(res.status).toBe(200);
      expect(res.data.completed).toBe(true);
      expect(res.data.feeling).toBe(4);
      expect(res.data.endAt).toBeDefined();
    });

    it('should reject a feeling outside 1..5', async () => {
      await expect(
        axios.patch(
          `${API_URL}/api/sessions/${sessionId}/complete`,
          { completed: true, feeling: 9 },
          authHeaders(user),
        ),
      ).rejects.toMatchObject({ response: { status: 400 } });
    });

    it("should forbid completing another user's session", async () => {
      await expect(
        axios.patch(
          `${API_URL}/api/sessions/${sessionId}/complete`,
          { completed: true },
          authHeaders(otherUser),
        ),
      ).rejects.toMatchObject({ response: { status: 403 } });
    });
  });

  describe('PATCH /api/sessions/:id', () => {
    it('should update a session', async () => {
      const res = await axios.patch(
        `${API_URL}/api/sessions/${sessionId}`,
        { progress: 100 },
        authHeaders(user),
      );

      expect(res.status).toBe(200);
      expect(res.data.progress).toBe(100);
    });

    it("should forbid updating another user's session", async () => {
      await expect(
        axios.patch(
          `${API_URL}/api/sessions/${sessionId}`,
          { progress: 0 },
          authHeaders(otherUser),
        ),
      ).rejects.toMatchObject({ response: { status: 403 } });
    });
  });

  describe('GET /api/sessions/stats', () => {
    it("should return the current user's statistics", async () => {
      const res = await axios.get(
        `${API_URL}/api/sessions/stats`,
        authHeaders(user),
      );

      expect(res.status).toBe(200);
      expect(res.data.totalSessions).toBe(1);
      expect(res.data.completedSessions).toBe(1);
      expect(res.data).toHaveProperty('totalMinutes');
    });

    it('should not count sessions of other users', async () => {
      const res = await axios.get(
        `${API_URL}/api/sessions/stats`,
        authHeaders(otherUser),
      );

      expect(res.data.totalSessions).toBe(0);
    });
  });

  describe('GET /api/sessions/stats/summary', () => {
    it('should return summary statistics', async () => {
      const res = await axios.get(
        `${API_URL}/api/sessions/stats/summary`,
        authHeaders(user),
      );

      expect(res.status).toBe(200);
      expect(typeof res.data.currentStreak).toBe('number');
      expect(typeof res.data.longestStreak).toBe('number');
      expect(res.data.totalSessions).toBe(1);
      expect(typeof res.data.totalMinutes).toBe('number');
      expect(res.data.adherenceRate).toBeGreaterThanOrEqual(0);
      expect(res.data.adherenceRate).toBeLessThanOrEqual(100);
      expect(res.data).toHaveProperty('favoriteRoutine');
    });
  });

  describe('GET /api/sessions/calendar', () => {
    it('should return calendar data including today', async () => {
      const res = await axios.get(
        `${API_URL}/api/sessions/calendar`,
        authHeaders(user),
      );

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });

    it('should only return dates within the requested range', async () => {
      const from = '2025-11-01';
      const to = '2025-11-30';
      const res = await axios.get(
        `${API_URL}/api/sessions/calendar?from=${from}&to=${to}`,
        authHeaders(user),
      );

      expect(res.status).toBe(200);
      res.data.forEach((item: { date: string; completionRate: number }) => {
        expect(item.date >= from).toBe(true);
        expect(item.date <= to).toBe(true);
        expect(item.completionRate).toBeGreaterThanOrEqual(0);
        expect(item.completionRate).toBeLessThanOrEqual(100);
      });
      expect(res.data.some((item: { date: string }) => item.date === today)).toBe(
        false,
      );
    });

    it('should reject an invalid date', async () => {
      await expect(
        axios.get(
          `${API_URL}/api/sessions/calendar?from=not-a-date`,
          authHeaders(user),
        ),
      ).rejects.toMatchObject({ response: { status: 400 } });
    });
  });
});
