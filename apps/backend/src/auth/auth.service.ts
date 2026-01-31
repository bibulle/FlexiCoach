import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './jwt.strategy';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface AuthResponse {
  access_token: string;
  user: {
    _id: string;
    email: string;
    displayName?: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.usersService.create({
      email: registerDto.email,
      password: hashedPassword,
      displayName: registerDto.displayName,
    });

    const payload: JwtPayload = { sub: user._id.toString(), email: user.email };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        _id: user._id.toString(),
        email: user.email,
        displayName: user.displayName,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmailWithPassword(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Vérifier que l'utilisateur a un mot de passe (pas un compte OAuth pur)
    if (!user.password) {
      throw new UnauthorizedException('This account uses OAuth authentication. Please login with Google.');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = { sub: user._id.toString(), email: user.email };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        _id: user._id.toString(),
        email: user.email,
        displayName: user.displayName,
      },
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...result} = user;
      return result;
    }
    return null;
  }

  async validateOAuthUser(oauthData: {
    email: string;
    displayName: string;
    avatar?: string;
    provider: string;
    providerId: string;
  }): Promise<any> {
    let user = await this.usersService.findByEmail(oauthData.email);

    if (!user) {
      // Créer un nouveau compte sans mot de passe
      user = await this.usersService.create({
        email: oauthData.email,
        displayName: oauthData.displayName,
        avatar: oauthData.avatar,
        provider: oauthData.provider,
        providerId: oauthData.providerId,
      });
    } else {
      // Mettre à jour les informations OAuth (liaison automatique)
      const updateData: any = {
        avatar: oauthData.avatar,
      };

      // Si l'utilisateur n'a pas encore de providerId, lier le compte Google
      if (!user.providerId) {
        updateData.provider = oauthData.provider;
        updateData.providerId = oauthData.providerId;
      }

      user = await this.usersService.update(user._id, updateData);
    }

    return user;
  }
}
