import {
  IsDateString,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  Max,
  IsObject,
} from 'class-validator';

export class UpdateSessionDto {
  @IsOptional()
  @IsDateString({}, { message: 'endAt doit être une date valide' })
  endAt?: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  durationSec?: number;

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
