import { ExecutionContext } from '@nestjs/common';
import { ApiThrottlerGuard } from './api-throttler.guard';

describe('ApiThrottlerGuard', () => {
  let guard: ApiThrottlerGuard;
  const originalEnv = process.env.THROTTLE_DISABLED;

  const contextFor = (url: string) =>
    ({
      switchToHttp: () => ({ getRequest: () => ({ url }) }),
    }) as unknown as ExecutionContext;

  const shouldSkip = (url: string) =>
    (guard as any).shouldSkip(contextFor(url)) as Promise<boolean>;

  beforeEach(() => {
    guard = Object.create(ApiThrottlerGuard.prototype);
    delete process.env.THROTTLE_DISABLED;
  });

  afterAll(() => {
    if (originalEnv === undefined) {
      delete process.env.THROTTLE_DISABLED;
    } else {
      process.env.THROTTLE_DISABLED = originalEnv;
    }
  });

  it('should throttle API routes', async () => {
    await expect(shouldSkip('/api/auth/login')).resolves.toBe(false);
  });

  it('should skip non-API routes (static files, frontend routes)', async () => {
    await expect(shouldSkip('/routines')).resolves.toBe(true);
    await expect(shouldSkip('/main.js')).resolves.toBe(true);
  });

  it('should skip every route when THROTTLE_DISABLED=true', async () => {
    process.env.THROTTLE_DISABLED = 'true';
    await expect(shouldSkip('/api/auth/register')).resolves.toBe(true);
  });

  it('should keep throttling when THROTTLE_DISABLED has any other value', async () => {
    process.env.THROTTLE_DISABLED = 'false';
    await expect(shouldSkip('/api/auth/register')).resolves.toBe(false);
  });
});
