import { IsMongoId, IsOptional, IsTimeZone } from 'class-validator';

export class SummaryQueryDto {
  @IsOptional()
  @IsMongoId({ message: 'userId doit être un ID MongoDB valide' })
  userId?: string;

  /** IANA time zone of the client (ex: Europe/Paris), used to split sessions by weekday. */
  @IsOptional()
  @IsTimeZone({ message: 'tz doit être un fuseau horaire IANA valide' })
  tz?: string;
}
