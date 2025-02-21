import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(5)
  rating?: number;
}
