import axios from 'axios';

describe('Sessions API', () => {
  const API_URL = process.env.API_URL || 'http://localhost:3000';
  let sessionId: string;

  describe('POST /api/sessions', () => {
    it('should create a new session', async () => {
      const session = {
        routineId: 'douce-10min',
        startAt: new Date().toISOString(),
        durationSec: 631,
        completed: false,
      };

      const res = await axios.post(`${API_URL}/api/sessions`, session);

      expect(res.status).toBe(201);
      expect(res.data.routineId).toBe('douce-10min');
      expect(res.data.completed).toBe(false);
      sessionId = res.data._id;
    });
  });

  describe('GET /api/sessions', () => {
    it('should return all sessions', async () => {
      const res = await axios.get(`${API_URL}/api/sessions`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });

    it('should filter sessions by userId', async () => {
      const res = await axios.get(`${API_URL}/api/sessions?userId=test-user`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });
  });

  describe('GET /api/sessions/stats', () => {
    it('should return session statistics', async () => {
      const res = await axios.get(`${API_URL}/api/sessions/stats`);

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('totalSessions');
      expect(res.data).toHaveProperty('completedSessions');
      expect(res.data).toHaveProperty('totalMinutes');
    });
  });

  describe('GET /api/sessions/stats/summary', () => {
    it('should return summary statistics', async () => {
      const res = await axios.get(`${API_URL}/api/sessions/stats/summary`);

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('currentStreak');
      expect(res.data).toHaveProperty('longestStreak');
      expect(res.data).toHaveProperty('totalSessions');
      expect(res.data).toHaveProperty('totalMinutes');
      expect(res.data).toHaveProperty('adherenceRate');
      expect(res.data).toHaveProperty('favoriteRoutine');

      expect(typeof res.data.currentStreak).toBe('number');
      expect(typeof res.data.longestStreak).toBe('number');
      expect(typeof res.data.totalSessions).toBe('number');
      expect(typeof res.data.totalMinutes).toBe('number');
      expect(typeof res.data.adherenceRate).toBe('number');
      
      expect(res.data.adherenceRate).toBeGreaterThanOrEqual(0);
      expect(res.data.adherenceRate).toBeLessThanOrEqual(100);
    });

    it('should filter summary by userId', async () => {
      const res = await axios.get(
        `${API_URL}/api/sessions/stats/summary?userId=test-user`
      );

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('currentStreak');
    });
  });

  describe('GET /api/sessions/calendar', () => {
    it('should return calendar data', async () => {
      const res = await axios.get(`${API_URL}/api/sessions/calendar`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });

    it('should filter calendar by date range', async () => {
      const from = '2025-11-01';
      const to = '2025-11-30';
      const res = await axios.get(
        `${API_URL}/api/sessions/calendar?from=${from}&to=${to}`
      );

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);

      // Verify all returned dates are within range
      res.data.forEach((item: { date: string; completionRate: number }) => {
        expect(item).toHaveProperty('date');
        expect(item).toHaveProperty('completionRate');
        expect(item.date >= from).toBe(true);
        expect(item.date <= to).toBe(true);
        expect(item.completionRate).toBeGreaterThanOrEqual(0);
        expect(item.completionRate).toBeLessThanOrEqual(100);
      });
    });

    it('should filter calendar by userId', async () => {
      const res = await axios.get(
        `${API_URL}/api/sessions/calendar?userId=test-user`
      );

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });
  });

  describe('GET /api/sessions/:id', () => {
    it('should return a specific session', async () => {
      const res = await axios.get(`${API_URL}/api/sessions/${sessionId}`);

      expect(res.status).toBe(200);
      expect(res.data._id).toBe(sessionId);
    });
  });

  describe('PATCH /api/sessions/:id/complete', () => {
    it('should mark session as completed', async () => {
      const res = await axios.patch(
        `${API_URL}/api/sessions/${sessionId}/complete`,
        {
          completed: true,
          feeling: 4,
        }
      );

      expect(res.status).toBe(200);
      expect(res.data.completed).toBe(true);
      expect(res.data.feeling).toBe(4);
      expect(res.data.endAt).toBeDefined();
    });
  });

  describe('PATCH /api/sessions/:id', () => {
    it('should update a session', async () => {
      const res = await axios.patch(`${API_URL}/api/sessions/${sessionId}`, {
        progress: 100,
      });

      expect(res.status).toBe(200);
      expect(res.data.progress).toBe(100);
    });
  });
});
