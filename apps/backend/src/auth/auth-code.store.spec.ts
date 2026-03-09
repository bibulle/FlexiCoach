import { AuthCodeStore } from './auth-code.store';

describe('AuthCodeStore', () => {
  let store: AuthCodeStore;

  beforeEach(() => {
    store = new AuthCodeStore();
  });

  describe('generateCode', () => {
    it('should generate a unique code', () => {
      const code = store.generateCode('token1', {
        _id: 'user1',
        email: 'test@example.com',
      });

      expect(code).toBeDefined();
      expect(typeof code).toBe('string');
      expect(code.length).toBe(64); // 32 bytes in hex = 64 chars
    });

    it('should generate different codes each time', () => {
      const code1 = store.generateCode('token1', {
        _id: 'user1',
        email: 'test@example.com',
      });
      const code2 = store.generateCode('token2', {
        _id: 'user2',
        email: 'test2@example.com',
      });

      expect(code1).not.toBe(code2);
    });
  });

  describe('exchangeCode', () => {
    it('should return token and user for a valid code', () => {
      const user = {
        _id: 'user1',
        email: 'test@example.com',
        displayName: 'Test User',
      };

      const code = store.generateCode('jwt-token', user);
      const result = store.exchangeCode(code);

      expect(result).toBeDefined();
      expect(result!.token).toBe('jwt-token');
      expect(result!.user).toEqual(user);
    });

    it('should return null for an invalid code', () => {
      const result = store.exchangeCode('non-existent-code');

      expect(result).toBeNull();
    });

    it('should only allow single-use (exchange once then invalidate)', () => {
      const code = store.generateCode('jwt-token', {
        _id: 'user1',
        email: 'test@example.com',
      });

      const firstExchange = store.exchangeCode(code);
      const secondExchange = store.exchangeCode(code);

      expect(firstExchange).toBeDefined();
      expect(secondExchange).toBeNull();
    });

    it('should return null for expired code', () => {
      // Access private property for testing
      const code = store.generateCode('jwt-token', {
        _id: 'user1',
        email: 'test@example.com',
      });

      // Manually expire the code by modifying the stored data
      const codesMap = (store as any).codes as Map<string, any>;
      const storedData = codesMap.get(code);
      storedData.expiresAt = Date.now() - 1000; // Set to past

      const result = store.exchangeCode(code);

      expect(result).toBeNull();
    });

    it('should preserve user data with avatar', () => {
      const user = {
        _id: 'user1',
        email: 'test@example.com',
        displayName: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
      };

      const code = store.generateCode('jwt-token', user);
      const result = store.exchangeCode(code);

      expect(result!.user.avatar).toBe('https://example.com/avatar.jpg');
    });
  });
});
