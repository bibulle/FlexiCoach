import { IsValidPassword } from '../../common/validators/is-valid-password.decorator';

export class ResetPasswordDto {
  @IsValidPassword()
  newPassword: string;
}
