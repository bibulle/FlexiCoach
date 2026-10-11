import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SummaryQueryDto } from './summary-query.dto';

describe('SummaryQueryDto', () => {
  const errorsFor = async (payload: Record<string, unknown>) =>
    (await validate(plainToInstance(SummaryQueryDto, payload))).map(
      (e) => e.property,
    );

  it('should accept an empty query', async () => {
    expect(await errorsFor({})).toEqual([]);
  });

  it.each(['Europe/Paris', 'America/New_York', 'UTC', 'Asia/Kolkata'])(
    'should accept the time zone %s',
    async (tz) => {
      expect(await errorsFor({ tz })).toEqual([]);
    },
  );

  it.each(['Paris', 'Not/AZone', 'GMT+25', '', 42])(
    'should reject the invalid time zone %p',
    async (tz) => {
      expect(await errorsFor({ tz })).toEqual(['tz']);
    },
  );

  it('should reject an invalid userId', async () => {
    expect(await errorsFor({ userId: 'not-an-id' })).toEqual(['userId']);
  });
});
