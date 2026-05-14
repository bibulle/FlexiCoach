import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthCodeStore } from './auth-code.store';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ExchangeCodeDto } from './dto/exchange-code.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { User } from '../schemas/user.schema';

@Controller('auth')
export class AuthController {
  private readonly frontendUrl: string;
  private readonly adminEmails: string[];

  constructor(
    private authService: AuthService,
    private authCodeStore: AuthCodeStore,
    private configService: ConfigService,
  ) {
    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:4200';
    this.adminEmails = (this.configService.get<string>('ADMIN_EMAILS') || '')
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email.length > 0);
  }

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
    return { isAdmin: this.adminEmails.includes(user.email) };
  }

  @Post('exchange')
  @HttpCode(HttpStatus.OK)
  async exchangeCode(@Body() exchangeCodeDto: ExchangeCodeDto) {
    const result = this.authCodeStore.exchangeCode(exchangeCodeDto.code);
    if (!result) {
      throw new UnauthorizedException('Invalid or expired authorization code');
    }
    return {
      access_token: result.token,
      user: result.user,
    };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Redirection automatique vers Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    try {
      const user = req.user as any;

      // Générer un JWT token via la méthode publique
      const payload = { sub: user._id.toString(), email: user.email };
      const token = this.authService.generateToken(payload);

      // Générer un code d'échange temporaire (single-use, 60s TTL)
      const code = this.authCodeStore.generateCode(token, {
        _id: user._id.toString(),
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
      });

      // Rediriger vers le frontend avec le code (pas le token)
      res.redirect(`${this.frontendUrl}/auth/callback?code=${code}`);
    } catch (error) {
      // En cas d'erreur, rediriger vers login avec message d'erreur
      res.redirect(
        `${this.frontendUrl}/login?error=${encodeURIComponent("Erreur lors de l'authentification Google")}`,
      );
    }
  }
}
