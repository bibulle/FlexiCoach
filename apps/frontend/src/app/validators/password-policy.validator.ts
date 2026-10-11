import { AbstractControl, ValidationErrors } from '@angular/forms';
import {
  PASSWORD_COMPLEXITY_REGEX,
  PASSWORD_MIN_LENGTH,
} from '@flexicoach/shared';

/**
 * Validator Angular appliquant la règle de mot de passe de l'application
 * (la même que celle du backend, définie dans `@flexicoach/shared`).
 * Un champ vide est laissé à `Validators.required`.
 */
export function passwordPolicyValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const value: string = control.value ?? '';
  if (!value) return null;

  const errors: ValidationErrors = {};
  if (value.length < PASSWORD_MIN_LENGTH) {
    errors['passwordMinLength'] = true;
  }
  if (!PASSWORD_COMPLEXITY_REGEX.test(value)) {
    errors['passwordComplexity'] = true;
  }
  return Object.keys(errors).length ? errors : null;
}
