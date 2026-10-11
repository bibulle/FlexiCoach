import { IsEmail, IsString, IsOptional } from 'class-validator';
import { IsValidPassword } from '../../common/validators/is-valid-password.decorator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email invalide' })
  email!: string;

  @IsValidPassword()
  password!: string;

  @IsOptional()
  @IsString()
  displayName?: string;
}
