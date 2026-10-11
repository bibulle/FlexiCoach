import axios from 'axios';
import {
  API_URL,
  TestUser,
  authHeaders,
  registerUser,
} from '../support/auth-helper';

describe('Routines API (read, slug, favorites, access control)', () => {
  let owner: TestUser;
  let stranger: TestUser;
  let routine: { id: string; slug: string; name: string };

  beforeAll(async () => {
    owner = await registerUser('routines');
    stranger = await registerUser('routines-stranger');

    const res = await axios.post(
      `${API_URL}/api/routines`,
      {
        name: 'Routine Lecture Test',
        description: 'Routine used by the read/favorites e2e suite',
        difficulty: 'beginner',
        tag: 'quotidien',
        steps: [
          {
            name: 'Respiration',
            seconds: 30,
            mode: 'respiration',
            text: 'Inspire, expire',
          },
        ],
      },
      authHeaders(owner),
    );
    routine = res.data;
  });

  describe('authentication', () => {
    it('should reject unauthenticated listing', async () => {
      await expect(axios.get(`${API_URL}/api/routines`)).rejects.toMatchObject(
        { response: { status: 401 } },
      );
    });
  });

  describe('GET /api/routines/:id', () => {
    it('should return the owner routine', async () => {
      const res = await axios.get(
        `${API_URL}/api/routines/${routine.id}`,
        authHeaders(owner),
      );

      expect(res.status).toBe(200);
      expect(res.data.id).toBe(routine.id);
      expect(res.data.tag).toBe('quotidien');
      expect(res.data.ownerId).toBe(owner.userId);
    });

    it("should forbid access to another user's routine", async () => {
      await expect(
        axios.get(`${API_URL}/api/routines/${routine.id}`, authHeaders(stranger)),
      ).rejects.toMatchObject({ response: { status: 403 } });
    });

    it('should return 404 for a non-existent routine', async () => {
      await expect(
        axios.get(`${API_URL}/api/routines/non-existent`, authHeaders(owner)),
      ).rejects.toMatchObject({ response: { status: 404 } });
    });
  });

  describe('GET /api/routines/slug/:slug', () => {
    it('should generate a slug from the name', () => {
      // A suffix (-1, -2…) is added when the slug already exists in the database
      expect(routine.slug).toMatch(/^routine-lecture-test(-\d+)?$/);
    });

    it('should return a routine by slug', async () => {
      const res = await axios.get(
        `${API_URL}/api/routines/slug/${routine.slug}`,
        authHeaders(owner),
      );

      expect(res.status).toBe(200);
      expect(res.data.id).toBe(routine.id);
    });

    it("should forbid access by slug to another user's routine", async () => {
      await expect(
        axios.get(
          `${API_URL}/api/routines/slug/${routine.slug}`,
          authHeaders(stranger),
        ),
      ).rejects.toMatchObject({ response: { status: 403 } });
    });

    it('should return 404 for an unknown slug', async () => {
      await expect(
        axios.get(`${API_URL}/api/routines/slug/unknown-slug`, authHeaders(owner)),
      ).rejects.toMatchObject({ response: { status: 404 } });
    });
  });

  describe('favorites', () => {
    const isFavorite = async () => {
      const res = await axios.get(`${API_URL}/api/routines`, authHeaders(owner));
      return res.data.find((r: any) => r.id === routine.id)?.isFavorite;
    };

    it('should not be a favorite by default', async () => {
      expect(await isFavorite()).toBe(false);
    });

    it('should add a routine to favorites', async () => {
      const res = await axios.post(
        `${API_URL}/api/routines/${routine.id}/favorite`,
        {},
        authHeaders(owner),
      );

      expect(res.status).toBe(200);
      expect(res.data).toEqual({ success: true });
      expect(await isFavorite()).toBe(true);
    });

    it('should be idempotent when adding twice', async () => {
      await axios.post(
        `${API_URL}/api/routines/${routine.id}/favorite`,
        {},
        authHeaders(owner),
      );

      expect(await isFavorite()).toBe(true);
    });

    it('should remove a routine from favorites', async () => {
      const res = await axios.delete(
        `${API_URL}/api/routines/${routine.id}/favorite`,
        authHeaders(owner),
      );

      expect(res.status).toBe(200);
      expect(await isFavorite()).toBe(false);
    });

    it('should return 404 when favoriting a non-existent routine', async () => {
      await expect(
        axios.post(
          `${API_URL}/api/routines/non-existent/favorite`,
          {},
          authHeaders(owner),
        ),
      ).rejects.toMatchObject({ response: { status: 404 } });
    });
  });
});
