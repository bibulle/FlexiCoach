import axios from 'axios';

describe('Routines Editor API (Issue #8)', () => {
  const API_URL = process.env.API_URL || 'http://localhost:3000';
  let accessToken: string;
  let createdRoutineId: string;

  const testUser = {
    email: `routine-editor-test-${Date.now()}@example.com`,
    password: 'password123',
    displayName: 'Routine Editor Test User',
  };

  beforeAll(async () => {
    // Register and login to get access token
    const registerRes = await axios.post(
      `${API_URL}/api/auth/register`,
      testUser,
    );
    accessToken = registerRes.data.access_token;
  });

  describe('POST /api/routines - User Routine Creation', () => {
    it('should create a new user routine with auto-generated ID and slug', async () => {
      const routine = {
        name: 'My Custom Routine',
        description: 'Created via editor',
        difficulty: 'beginner',
        category: 'force',
        steps: [
          {
            name: 'Warm Up',
            seconds: 30,
            mode: 'mouvement',
            text: 'Start with gentle movements',
            cues: [{ at: 15, say: 'Halfway' }],
          },
          {
            name: 'Main Exercise',
            seconds: 60,
            mode: 'statique',
            text: 'Hold the position',
          },
        ],
      };

      const res = await axios.post(`${API_URL}/api/routines`, routine, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      expect(res.status).toBe(201);
      expect(res.data.id).toBeDefined();
      expect(res.data.slug).toBeDefined();
      expect(res.data.name).toBe('My Custom Routine');
      expect(res.data.visibility).toBe('user');
      expect(res.data.ownerId).toBeDefined();
      expect(res.data.totalSeconds).toBe(90);
      expect(res.data.duration).toBe(2); // ceil(90/60)
      expect(res.data.level).toBe('beginner');
      expect(res.data.steps).toHaveLength(2);

      createdRoutineId = res.data.id;
    });

    it('should fail without authentication', async () => {
      try {
        await axios.post(`${API_URL}/api/routines`, {
          name: 'Unauthorized Routine',
          steps: [
            { name: 'Step', seconds: 30, mode: 'mouvement', text: 'Test' },
          ],
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    it('should validate minimum name length', async () => {
      try {
        await axios.post(
          `${API_URL}/api/routines`,
          {
            name: 'Ab', // Too short (min 3)
            steps: [
              { name: 'Step', seconds: 30, mode: 'mouvement', text: 'Test' },
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should validate step duration range', async () => {
      try {
        await axios.post(
          `${API_URL}/api/routines`,
          {
            name: 'Invalid Duration',
            steps: [
              {
                name: 'Step',
                seconds: 3,
                mode: 'mouvement',
                text: 'Too short',
              },
            ], // min 5s
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should require at least one step', async () => {
      try {
        await axios.post(
          `${API_URL}/api/routines`,
          {
            name: 'No Steps Routine',
            steps: [],
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('POST /api/routines/import - Import JSON', () => {
    it('should import routine with version 1.0', async () => {
      const importData = {
        version: '1.0',
        routine: {
          name: 'Imported Routine',
          description: 'Imported from JSON file',
          difficulty: 'intermediate',
          category: 'souplesse',
          icon: 'stretch-icon',
          steps: [
            {
              name: 'Étirement 1',
              seconds: 45,
              mode: 'mouvement',
              text: 'Étirez doucement',
              cues: [
                { at: 0, say: 'Commencez' },
                { at: 22, say: 'Mi-parcours' },
              ],
            },
            {
              name: 'Respiration',
              seconds: 30,
              mode: 'respiration',
              text: 'Respirez profondément',
            },
          ],
        },
      };

      const res = await axios.post(
        `${API_URL}/api/routines/import`,
        importData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      expect(res.status).toBe(201);
      expect(res.data.name).toBe('Imported Routine');
      expect(res.data.visibility).toBe('user');
      expect(res.data.level).toBe('intermediate');
      expect(res.data.totalSeconds).toBe(75);
      expect(res.data.steps).toHaveLength(2);
    });

    it('should reject unsupported version', async () => {
      try {
        await axios.post(
          `${API_URL}/api/routines/import`,
          {
            version: '2.0',
            routine: {
              name: 'Future Version',
              steps: [
                { name: 'Step', seconds: 30, mode: 'mouvement', text: 'Test' },
              ],
            },
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toContain('version');
      }
    });

    it('should validate imported routine data', async () => {
      try {
        await axios.post(
          `${API_URL}/api/routines/import`,
          {
            version: '1.0',
            routine: {
              name: 'X', // Too short
              steps: [],
            },
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('PATCH /api/routines/:id - Update Routine', () => {
    it('should update routine and recalculate duration', async () => {
      const updateData = {
        name: 'Updated Custom Routine',
        description: 'Modified via editor',
        steps: [
          {
            name: 'New Step 1',
            seconds: 40,
            mode: 'mouvement',
            text: 'New instructions',
          },
          {
            name: 'New Step 2',
            seconds: 50,
            mode: 'statique',
            text: 'Hold longer',
          },
          {
            name: 'New Step 3',
            seconds: 30,
            mode: 'respiration',
            text: 'Breathe',
          },
        ],
      };

      const res = await axios.patch(
        `${API_URL}/api/routines/${createdRoutineId}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      expect(res.status).toBe(200);
      expect(res.data.name).toBe('Updated Custom Routine');
      expect(res.data.steps).toHaveLength(3);
      expect(res.data.totalSeconds).toBe(120);
      expect(res.data.duration).toBe(2); // ceil(120/60)
    });

    it('should prevent updating another users routine', async () => {
      // Create another user
      const otherUser = {
        email: `other-user-${Date.now()}@example.com`,
        password: 'password123',
        displayName: 'Other User',
      };
      const otherRegisterRes = await axios.post(
        `${API_URL}/api/auth/register`,
        otherUser,
      );
      const otherToken = otherRegisterRes.data.access_token;

      try {
        await axios.patch(
          `${API_URL}/api/routines/${createdRoutineId}`,
          { name: 'Hacked Update' },
          {
            headers: {
              Authorization: `Bearer ${otherToken}`,
            },
          },
        );
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(403);
      }
    });

    it('should return 404 for non-existent routine', async () => {
      try {
        await axios.patch(
          `${API_URL}/api/routines/non-existent-id`,
          { name: 'Update' },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe('DELETE /api/routines/:id - Delete Routine', () => {
    it('should prevent deleting another users routine', async () => {
      // Use the other user token from previous test
      const otherUser = {
        email: `delete-test-user-${Date.now()}@example.com`,
        password: 'password123',
        displayName: 'Delete Test User',
      };
      const otherRegisterRes = await axios.post(
        `${API_URL}/api/auth/register`,
        otherUser,
      );
      const otherToken = otherRegisterRes.data.access_token;

      try {
        await axios.delete(`${API_URL}/api/routines/${createdRoutineId}`, {
          headers: {
            Authorization: `Bearer ${otherToken}`,
          },
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(403);
      }
    });

    it('should delete own routine', async () => {
      const res = await axios.delete(
        `${API_URL}/api/routines/${createdRoutineId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      expect(res.status).toBe(204);
    });

    it('should return 404 when deleting already deleted routine', async () => {
      try {
        await axios.delete(`${API_URL}/api/routines/${createdRoutineId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe('GET /api/routines - List Routines', () => {
    it('should only return built-in and own routines', async () => {
      // Create a routine for this user
      const myRoutine = await axios.post(
        `${API_URL}/api/routines`,
        {
          name: 'My Visible Routine',
          steps: [
            { name: 'Step', seconds: 30, mode: 'mouvement', text: 'Test' },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      // Create another user and their routine
      const otherUser = {
        email: `visibility-test-${Date.now()}@example.com`,
        password: 'password123',
        displayName: 'Visibility Test User',
      };
      const otherRegisterRes = await axios.post(
        `${API_URL}/api/auth/register`,
        otherUser,
      );
      const otherToken = otherRegisterRes.data.access_token;

      await axios.post(
        `${API_URL}/api/routines`,
        {
          name: 'Other Users Routine',
          steps: [
            { name: 'Step', seconds: 30, mode: 'mouvement', text: 'Private' },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${otherToken}`,
          },
        },
      );

      // Get routines for original user
      const res = await axios.get(`${API_URL}/api/routines`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);

      // Should see own routine
      const hasOwnRoutine = res.data.some(
        (r: any) => r.id === myRoutine.data.id,
      );
      expect(hasOwnRoutine).toBe(true);

      // Should NOT see other user's routine
      const hasOtherRoutine = res.data.some(
        (r: any) => r.name === 'Other Users Routine',
      );
      expect(hasOtherRoutine).toBe(false);
    });
  });
});
