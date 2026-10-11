import { describe, it, expect } from 'vitest';
import { formatApiError } from './api-error';

describe('formatApiError', () => {
  const fallback = 'Message par défaut';

  it('should return the API message when it is a string', () => {
    expect(
      formatApiError({ error: { message: 'Email déjà utilisé' } }, fallback),
    ).toBe('Email déjà utilisé');
  });

  it('should join validation messages (array) one per line', () => {
    expect(
      formatApiError({ error: { message: ['Règle 1', 'Règle 2'] } }, fallback),
    ).toBe('Règle 1\nRègle 2');
  });

  it('should ignore empty or non-string entries of the array', () => {
    expect(
      formatApiError(
        { error: { message: ['Règle 1', '', 42, null, '  '] } },
        fallback,
      ),
    ).toBe('Règle 1');
  });

  it.each([
    ['an empty array', { error: { message: [] } }],
    ['an empty string', { error: { message: '' } }],
    ['a non-string message', { error: { message: { foo: 'bar' } } }],
    ['no message', { error: {} }],
    ['no error body', {}],
    ['null', null],
    ['undefined', undefined],
  ])('should return the fallback for %s', (_label, error) => {
    expect(formatApiError(error, fallback)).toBe(fallback);
  });
});
