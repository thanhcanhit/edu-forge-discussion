import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DiscussionType } from '@prisma/client';

export class CreateThreadDto {
  @IsEnum(DiscussionType)
  @IsNotEmpty()
  type: DiscussionType;

  @IsString()
  @IsNotEmpty()
  resourceId: string;
}
