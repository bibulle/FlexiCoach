import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsEnum,
  ValidateNested,
  Min,
  MinLength,
  MaxLength,
  ArrayMinSize,
} from 'class-validator';

class CueDto {
  @IsNumber()
  @Min(0)
  at!: number;

  @IsString()
  @MinLength(1)
  say!: string;
}

class StepDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @IsNumber()
  @Min(5)
  seconds!: number;

  @IsEnum(['mouvement', 'statique', 'respiration'])
  mode!: 'mouvement' | 'statique' | 'respiration';

  @IsString()
  @MinLength(1)
  text!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CueDto)
  cues?: CueDto[];
}

export class UpdateRoutineDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  tag?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @IsOptional()
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  difficulty?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => StepDto)
  steps?: StepDto[];
}
