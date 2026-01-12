import { IsOptional, IsDateString, IsMongoId } from 'class-validator';

export class CalendarQueryDto {
  @IsOptional()
  @IsMongoId({ message: 'userId doit être un ID MongoDB valide' })
  userId?: string;

  @IsOptional()
  @IsDateString({}, { message: 'from doit être une date valide' })
  from?: string;

  @IsOptional()
  @IsDateString({}, { message: 'to doit être une date valide' })
  to?: string;
}
