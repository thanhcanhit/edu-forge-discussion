import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateReactionDto } from './dto/create-reaction.dto';
@Injectable()
export class ReactionsService {
  constructor(private readonly prisma: PrismaClient) {}

  async create(createReactionDto: CreateReactionDto) {
    const post = await this.prisma.post.findUnique({
      where: { id: createReactionDto.postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existingReaction = await this.prisma.reaction.findFirst({
      where: {
        postId: createReactionDto.postId,
        userId: createReactionDto.userId,
      },
    });

    if (existingReaction) {
      throw new BadRequestException('Reaction already exists');
    }

    return this.prisma.reaction.create({
      data: createReactionDto,
    });
  }

  async findOne(reactionId: string) {
    return this.prisma.reaction.findUnique({
      where: { id: reactionId },
    });
  }

  async findByPostId(postId: string) {
    return this.prisma.reaction.findMany({
      where: { postId },
    });
  }

  async remove(reactionId: string) {
    return this.prisma.reaction.delete({
      where: { id: reactionId },
    });
  }
}
