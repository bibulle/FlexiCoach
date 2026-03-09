import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

interface StoredCode {
  token: string;
  user: {
    _id: string;
    email: string;
    displayName?: string;
    avatar?: string;
  };
  expiresAt: number;
}

@Injectable()
export class AuthCodeStore {
  private codes = new Map<string, StoredCode>();
  private readonly TTL_MS = 60_000; // 60 seconds

  generateCode(
    token: string,
    user: { _id: string; email: string; displayName?: string; avatar?: string }
  ): string {
    this.cleanup();
    const code = randomBytes(32).toString('hex');
    this.codes.set(code, {
      token,
      user,
      expiresAt: Date.now() + this.TTL_MS,
    });
    return code;
  }

  exchangeCode(code: string): { token: string; user: StoredCode['user'] } | null {
    this.cleanup();
    const stored = this.codes.get(code);
    if (!stored) {
      return null;
    }
    if (stored.expiresAt < Date.now()) {
      this.codes.delete(code);
      return null;
    }
    // Single-use: delete after exchange
    this.codes.delete(code);
    return { token: stored.token, user: stored.user };
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [code, stored] of this.codes.entries()) {
      if (stored.expiresAt < now) {
        this.codes.delete(code);
      }
    }
  }
}
