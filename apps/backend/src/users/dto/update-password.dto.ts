import { IsString } from 'class-validator';
import { IsValidPassword } from '../../common/validators/is-valid-password.decorator';

export class UpdatePasswordDto {
  @IsString()
  currentPassword: string;

  @IsValidPassword()
  newPassword: string;
}
