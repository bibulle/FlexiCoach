import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { IsValidPassword } from './is-valid-password.decorator';
import { RegisterDto } from '../../auth/dto/register.dto';
import { UpdatePasswordDto } from '../../users/dto/update-password.dto';
import { ResetPasswordDto } from '../../admin/dto/reset-password.dto';

const MIN_LENGTH_MESSAGE =
  'Le mot de passe doit contenir au moins 8 caractères';
const COMPLEXITY_MESSAGE =
  'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre';

class PasswordHolder {
  @IsValidPassword()
  password: unknown;
}

async function messagesFor<T extends object>(
  dto: new () => T,
  payload: Record<string, unknown>,
  property: string,
): Promise<string[]> {
  const errors = await validate(plainToInstance(dto, payload));
  const error = errors.find((e) => e.property === property);
  return Object.values(error?.constraints ?? {});
}

describe('IsValidPassword', () => {
  const messages = (password: unknown) =>
    messagesFor(PasswordHolder, { password }, 'password');

  it.each(['Password123', 'Abcdefg1', 'ÉtéChaud2026x'])(
    'should accept the valid password "%s"',
    async (password) => {
      expect(await messages(password)).toEqual([]);
    },
  );

  it('should reject a password shorter than 8 characters', async () => {
    expect(await messages('Abc1234')).toEqual([MIN_LENGTH_MESSAGE]);
  });

  it('should accept a password of exactly 8 characters', async () => {
    expect(await messages('Abc12345')).toEqual([]);
  });

  it.each([
    ['sans majuscule', 'motdepasse1'],
    ['sans minuscule', 'MOTDEPASSE1'],
    ['sans chiffre', 'MotDePasse'],
  ])('should reject a password %s', async (_label, password) => {
    expect(await messages(password)).toEqual([COMPLEXITY_MESSAGE]);
  });

  it('should report both rules for a short and simple password', async () => {
    const result = await messages('abc123');
    expect(result).toHaveLength(2);
    expect(result).toEqual(
      expect.arrayContaining([MIN_LENGTH_MESSAGE, COMPLEXITY_MESSAGE]),
    );
  });

  it.each([undefined, null, 12345678, '', {}])(
    'should reject the missing or non-string value %p',
    async (password) => {
      expect((await messages(password)).length).toBeGreaterThan(0);
    },
  );
});

describe('password rule shared by all DTOs', () => {
  const cases: Array<{
    name: string;
    dto: new () => object;
    property: string;
    payload: (password: string) => Record<string, unknown>;
  }> = [
    {
      name: 'RegisterDto (inscription)',
      dto: RegisterDto,
      property: 'password',
      payload: (password) => ({ email: 'user@example.com', password }),
    },
    {
      name: 'UpdatePasswordDto (changement de mot de passe)',
      dto: UpdatePasswordDto,
      property: 'newPassword',
      payload: (newPassword) => ({ currentPassword: 'whatever', newPassword }),
    },
    {
      name: 'ResetPasswordDto (réinitialisation admin)',
      dto: ResetPasswordDto,
      property: 'newPassword',
      payload: (newPassword) => ({ newPassword }),
    },
  ];

  describe.each(cases)('$name', ({ dto, property, payload }) => {
    it('should accept a compliant password', async () => {
      expect(
        await validate(plainToInstance(dto, payload('Password123'))),
      ).toEqual([]);
    });

    it('should reject a 6-character password (old frontend rule)', async () => {
      expect(await messagesFor(dto, payload('Abc123'), property)).toEqual([
        MIN_LENGTH_MESSAGE,
      ]);
    });

    it('should reject a long password without uppercase or digit', async () => {
      expect(await messagesFor(dto, payload('motdepasse'), property)).toEqual([
        COMPLEXITY_MESSAGE,
      ]);
    });

    it('should reject a missing password', async () => {
      const withoutPassword = payload('Password123');
      delete withoutPassword[property];
      expect(
        (await messagesFor(dto, withoutPassword, property)).length,
      ).toBeGreaterThan(0);
    });
  });
});
