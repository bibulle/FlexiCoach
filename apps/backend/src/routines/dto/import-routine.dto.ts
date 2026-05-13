import { Type } from 'class-transformer';
import { IsString, IsObject, ValidateNested, IsEnum } from 'class-validator';
import { CreateRoutineDto } from './create-routine.dto';

export class ImportRoutineDto {
  @IsString()
  @IsEnum(['1.0'])
  version!: string;

  @IsObject()
  @ValidateNested()
  @Type(() => CreateRoutineDto)
  routine!: CreateRoutineDto;
}
