import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreatePostDto {
  @IsUUID()
  @IsNotEmpty()
  threadId: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(5)
  rating?: number;
}
