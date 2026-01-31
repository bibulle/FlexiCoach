import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards, Req, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { User } from '../schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 requests per hour
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('is-admin')
  @UseGuards(JwtAuthGuard)
  async isAdmin(@CurrentUser() user: User) {
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map(email => email.trim());
    return { isAdmin: adminEmails.includes(user.email) };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Redirection automatique vers Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    try {
      const user = req.user;

      // Générer un JWT token
      const payload = { sub: user._id.toString(), email: user.email };
      const token = this.authService['jwtService'].sign(payload);

      // URL du frontend (dev ou prod)
      const frontendUrl = process.env.NODE_ENV === 'production'
        ? 'https://coach.bibulle.fr'
        : 'http://localhost:4200';

      // Encoder les données utilisateur pour les passer en query param
      const userJson = encodeURIComponent(JSON.stringify({
        _id: user._id.toString(),
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
      }));

      // Rediriger vers le frontend avec le token et les données utilisateur
      res.redirect(`${frontendUrl}/auth/callback?token=${token}&user=${userJson}`);
    } catch (error) {
      // En cas d'erreur, rediriger vers login avec message d'erreur
      const frontendUrl = process.env.NODE_ENV === 'production'
        ? 'https://coach.bibulle.fr'
        : 'http://localhost:4200';

      res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('Erreur lors de l\'authentification Google')}`);
    }
  }
}
