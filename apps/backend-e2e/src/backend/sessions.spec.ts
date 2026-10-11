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

  describe('GET /api/sessions/stats/summary - recent activity (issue #148)', () => {
    const DAY = 24 * 3600 * 1000;
    let active: TestUser;
    let ownRoutineId: string;

    /** Noon UTC, `days` days ago: the same weekday in every time zone but the extreme ones. */
    const noonDaysAgo = (days: number) => {
      const date = new Date(Date.now() - days * DAY);
      date.setUTCHours(12, 0, 0, 0);
      return date;
    };
    const weekdayOf = (date: Date) => (date.getUTCDay() + 6) % 7; // 0 = Monday
    const record = (owner: TestUser, routineId: string, startAt: Date) =>
      axios.post(
        `${API_URL}/api/sessions`,
        { routineId, startAt: startAt.toISOString(), durationSec: 300, completed: true },
        authHeaders(owner),
      );
    const summaryOf = (owner: TestUser, query = '') =>
      axios.get(
        `${API_URL}/api/sessions/stats/summary${query}`,
        authHeaders(owner),
      );

    beforeAll(async () => {
      active = await registerUser('sessions-activity');
      const routine = await axios.post(
        `${API_URL}/api/routines`,
        {
          name: 'Routine du top',
          difficulty: 'beginner',
          steps: [{ name: 'Étape', seconds: 30, mode: 'mouvement', text: 'Go' }],
        },
        authHeaders(active),
      );
      ownRoutineId = routine.data.id;

      // 3 sessions of the user's own routine, 2 of a routine that no longer
      // exists, 1 too old to count
      await record(active, ownRoutineId, noonDaysAgo(2));
      await record(active, ownRoutineId, noonDaysAgo(2));
      await record(active, ownRoutineId, noonDaysAgo(9));
      await record(active, 'routine-disparue', noonDaysAgo(3));
      await record(active, 'routine-disparue', noonDaysAgo(4));
      await record(active, 'routine-ancienne', noonDaysAgo(45));
    });

    it('should return an empty activity for a user without sessions', async () => {
      const newcomer = await registerUser('sessions-newcomer');

      const res = await summaryOf(newcomer);

      expect(res.status).toBe(200);
      expect(res.data.recentSessions).toBe(0);
      expect(res.data.weekdayActivity).toEqual([0, 0, 0, 0, 0, 0, 0]);
      expect(res.data.topRoutines).toEqual([]);
    });

    it('should split the sessions of the last 30 days by weekday', async () => {
      const res = await summaryOf(active);

      const expected = [0, 0, 0, 0, 0, 0, 0];
      [2, 2, 9, 3, 4].forEach((d) => expected[weekdayOf(noonDaysAgo(d))]++);
      expect(res.data.weekdayActivity).toEqual(expected);
      expect(res.data.recentSessions).toBe(5);
      // All-time figures still include the old session
      expect(res.data.totalSessions).toBe(6);
    });

    it('should rank the most practised routines with their names', async () => {
      const res = await summaryOf(active);

      expect(res.data.topRoutines).toEqual([
        { routineId: ownRoutineId, name: 'Routine du top', count: 3 },
        { routineId: 'routine-disparue', name: 'Routine supprimée', count: 2 },
      ]);
    });

    it('should not include the sessions of other users', async () => {
      const res = await summaryOf(otherUser);

      expect(
        res.data.topRoutines.map((r: any) => r.routineId),
      ).not.toContain(ownRoutineId);
    });

    it("should use the client's time zone to pick the weekday", async () => {
      const traveller = await registerUser('sessions-tz');
      // 23:30 UTC, 5 days ago: already the next day in Paris and in Tokyo
      const lateEvening = new Date(Date.now() - 5 * DAY);
      lateEvening.setUTCHours(23, 30, 0, 0);
      await record(traveller, 'routine-tz', lateEvening);
      const utcDay = weekdayOf(lateEvening);

      const utc = await summaryOf(traveller, '?tz=UTC');
      const tokyo = await summaryOf(traveller, '?tz=Asia/Tokyo');
      const byDefault = await summaryOf(traveller);

      expect(utc.data.weekdayActivity[utcDay]).toBe(1);
      expect(tokyo.data.weekdayActivity[(utcDay + 1) % 7]).toBe(1);
      expect(tokyo.data.weekdayActivity[utcDay]).toBe(0);
      // Without tz the split is done in UTC
      expect(byDefault.data.weekdayActivity).toEqual(utc.data.weekdayActivity);
    });

    it('should reject an invalid time zone', async () => {
      await expect(summaryOf(active, '?tz=Not/AZone')).rejects.toMatchObject({
        response: { status: 400 },
      });
    });

    it('should reject an unknown query parameter', async () => {
      await expect(summaryOf(active, '?foo=bar')).rejects.toMatchObject({
        response: { status: 400 },
      });
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
