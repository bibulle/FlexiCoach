import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(email => email.trim());

    if (!adminEmails.includes(user.email)) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
