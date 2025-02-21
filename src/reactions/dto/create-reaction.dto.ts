import { ReactionType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateReactionDto {
  @IsUUID()
  @IsNotEmpty()
  postId: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsEnum(ReactionType)
  @IsNotEmpty()
  type: ReactionType;
}
