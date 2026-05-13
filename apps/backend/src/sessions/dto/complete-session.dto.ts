import { IsBoolean, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CompleteSessionDto {
  @IsBoolean()
  completed!: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  feeling?: number;
}
