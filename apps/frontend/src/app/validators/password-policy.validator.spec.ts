import { FormControl } from '@angular/forms';
import { describe, it, expect } from 'vitest';
import { passwordPolicyValidator } from './password-policy.validator';

describe('passwordPolicyValidator', () => {
  const validate = (value: unknown) =>
    passwordPolicyValidator(new FormControl(value));

  it.each(['Password123', 'Abcdefg1', 'ÉtéChaud2026x'])(
    'should accept the valid password "%s"',
    (password) => {
      expect(validate(password)).toBeNull();
    },
  );

  it.each(['', null, undefined])(
    'should leave the empty value %s to Validators.required',
    (value) => {
      expect(validate(value)).toBeNull();
    },
  );

  it('should reject a password shorter than 8 characters', () => {
    expect(validate('Abc1234')).toEqual({ passwordMinLength: true });
  });

  it('should accept a password of exactly 8 characters', () => {
    expect(validate('Abc12345')).toBeNull();
  });

  it.each([
    ['sans majuscule', 'motdepasse1'],
    ['sans minuscule', 'MOTDEPASSE1'],
    ['sans chiffre', 'MotDePasse'],
  ])('should reject a password %s', (_label, password) => {
    expect(validate(password)).toEqual({ passwordComplexity: true });
  });

  it('should report both errors for a short and simple password', () => {
    expect(validate('abc123')).toEqual({
      passwordMinLength: true,
      passwordComplexity: true,
    });
  });
});
