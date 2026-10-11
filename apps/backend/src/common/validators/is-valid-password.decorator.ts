import { applyDecorators } from '@nestjs/common';
import { IsString, Matches, MinLength } from 'class-validator';
import {
  PASSWORD_COMPLEXITY_MESSAGE,
  PASSWORD_COMPLEXITY_REGEX,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MIN_LENGTH_MESSAGE,
} from '@flexicoach/shared';

/**
 * Applique la règle de mot de passe unique de l'application (définie dans
 * `@flexicoach/shared`) : inscription, changement de mot de passe et
 * réinitialisation par un administrateur.
 */
export function IsValidPassword(): PropertyDecorator {
  return applyDecorators(
    IsString({ message: 'Le mot de passe est requis' }),
    MinLength(PASSWORD_MIN_LENGTH, { message: PASSWORD_MIN_LENGTH_MESSAGE }),
    Matches(PASSWORD_COMPLEXITY_REGEX, {
      message: PASSWORD_COMPLEXITY_MESSAGE,
    }),
  );
}
