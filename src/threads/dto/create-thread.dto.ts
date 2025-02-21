import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { DiscussionType } from '@prisma/client';

export class CreateThreadDto {
  @IsEnum(DiscussionType)
  @IsNotEmpty()
  type: DiscussionType;

  @IsUUID()
  @IsNotEmpty()
  resourceId: string;
}
