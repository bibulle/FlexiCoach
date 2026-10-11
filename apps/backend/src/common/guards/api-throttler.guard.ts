import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Custom throttler guard that only applies rate limiting to API routes.
 * Static files and frontend routes are excluded from throttling.
 *
 * Throttling can be turned off entirely with THROTTLE_DISABLED=true
 * (used by the e2e test suite only — never set it in production).
 */
@Injectable()
export class ApiThrottlerGuard extends ThrottlerGuard {
  protected async shouldSkip(context: any): Promise<boolean> {
    if (process.env.THROTTLE_DISABLED === 'true') {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    // Skip throttling for non-API routes (static files, frontend routes)
    return !request.url.startsWith('/api');
  }
}
