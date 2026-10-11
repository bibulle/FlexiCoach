/**
 * Règle de mot de passe unique, partagée entre le frontend (validation des
 * formulaires) et le backend (validation des DTO) : inscription, changement
 * de mot de passe et réinitialisation par un administrateur.
 */
export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

export const PASSWORD_MIN_LENGTH_MESSAGE = `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères`;

export const PASSWORD_COMPLEXITY_MESSAGE =
  'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre';

/** Résumé de la règle, affiché comme aide sous les champs de saisie. */
export const PASSWORD_POLICY_HINT = `${PASSWORD_MIN_LENGTH} caractères minimum, avec une majuscule, une minuscule et un chiffre`;

/**
 * Retourne les messages des règles non respectées (tableau vide si le mot de
 * passe est conforme).
 */
export function getPasswordPolicyErrors(
  password: string | null | undefined,
): string[] {
  const value = password ?? '';
  const errors: string[] = [];
  if (value.length < PASSWORD_MIN_LENGTH) {
    errors.push(PASSWORD_MIN_LENGTH_MESSAGE);
  }
  if (!PASSWORD_COMPLEXITY_REGEX.test(value)) {
    errors.push(PASSWORD_COMPLEXITY_MESSAGE);
  }
  return errors;
}
