import {
  IsString,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  Max,
  IsObject,
} from 'class-validator';

export class CreateSessionDto {
  @IsString()
  routineId!: string;

  @IsDateString({}, { message: 'startAt doit être une date valide' })
  startAt!: Date;

  @IsOptional()
  @IsDateString({}, { message: 'endAt doit être une date valide' })
  endAt?: Date;

  @IsNumber()
  @Min(0)
  durationSec!: number;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  feeling?: number;

  @IsOptional()
  @IsObject()
  device?: {
    ua?: string;
    platform?: string;
  };
}
