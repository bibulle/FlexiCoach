import axios from 'axios';

describe('Routines API', () => {
  const API_URL = process.env.API_URL || 'http://localhost:3000';

  describe('POST /api/routines', () => {
    it('should create a new routine', async () => {
      const routine = {
        id: 'test-routine-1',
        slug: 'test-routine-1',
        name: 'Test Routine',
        description: 'A test routine',
        duration: 10,
        level: 'débutant',
        steps: [
          {
            name: 'Test Exercise',
            seconds: 60,
            mode: 'mouvement',
            text: 'Test instructions',
            cues: [{ at: 30, say: 'Halfway there' }],
          },
        ],
        totalSeconds: 60,
        restSeconds: 10,
        visibility: 'builtIn',
      };

      const res = await axios.post(`${API_URL}/api/routines`, routine);

      expect(res.status).toBe(201);
      expect(res.data.id).toBe('test-routine-1');
      expect(res.data.name).toBe('Test Routine');
    });
  });

  describe('GET /api/routines', () => {
    it('should return all built-in routines', async () => {
      const res = await axios.get(`${API_URL}/api/routines`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });
  });

  describe('GET /api/routines/:id', () => {
    it('should return a specific routine by id', async () => {
      const res = await axios.get(`${API_URL}/api/routines/test-routine-1`);

      expect(res.status).toBe(200);
      expect(res.data.id).toBe('test-routine-1');
    });

    it('should return null for non-existent routine', async () => {
      const res = await axios.get(`${API_URL}/api/routines/non-existent`);

      expect(res.status).toBe(200);
      expect(res.data).toBeFalsy(); // null or empty string
    });
  });

  describe('GET /api/routines/slug/:slug', () => {
    it('should return a routine by slug', async () => {
      const res = await axios.get(
        `${API_URL}/api/routines/slug/test-routine-1`
      );

      expect(res.status).toBe(200);
      expect(res.data.slug).toBe('test-routine-1');
    });
  });

  describe('PATCH /api/routines/:id', () => {
    it('should update a routine', async () => {
      const res = await axios.patch(`${API_URL}/api/routines/test-routine-1`, {
        name: 'Updated Test Routine',
      });

      expect(res.status).toBe(200);
      expect(res.data.name).toBe('Updated Test Routine');
    });
  });

  describe('DELETE /api/routines/:id', () => {
    it('should delete a routine', async () => {
      const res = await axios.delete(`${API_URL}/api/routines/test-routine-1`);

      expect(res.status).toBe(200);
      expect(res.data.id).toBe('test-routine-1');
    });
  });
});
