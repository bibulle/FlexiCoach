import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Custom throttler guard that only applies rate limiting to API routes.
 * Static files and frontend routes are excluded from throttling.
 */
@Injectable()
export class ApiThrottlerGuard extends ThrottlerGuard {
  protected async shouldSkip(context: any): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Skip throttling for non-API routes (static files, frontend routes)
    return !request.url.startsWith('/api');
  }
}
