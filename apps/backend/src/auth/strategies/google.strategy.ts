import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;

    // Vérification de sécurité : email vérifié requis
    if (!emails || !emails[0]?.value || !emails[0]?.verified) {
      return done(
        new UnauthorizedException('Email non vérifié par Google'),
        false,
      );
    }

    // Vérification de sécurité : providerId non vide
    if (!profile.id) {
      return done(new UnauthorizedException('ID Google invalide'), false);
    }

    try {
      const user = await this.authService.validateOAuthUser({
        email: emails[0].value,
        displayName:
          `${name?.givenName || ''} ${name?.familyName || ''}`.trim(),
        avatar: photos && photos[0]?.value,
        provider: 'google',
        providerId: profile.id,
      });

      done(null, user);
    } catch (error) {
      done(error as Error, false);
    }
  }
}
