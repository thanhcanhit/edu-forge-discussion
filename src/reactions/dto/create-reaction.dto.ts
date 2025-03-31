import { ReactionType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsUUID, IsString } from 'class-validator';

export class CreateReactionDto {
  @IsUUID()
  @IsNotEmpty()
  postId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(ReactionType)
  @IsNotEmpty()
  type: ReactionType;
}
