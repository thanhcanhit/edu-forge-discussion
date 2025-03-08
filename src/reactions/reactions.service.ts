import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReactionType } from '@prisma/client';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { ThreadsGateway } from '../threads/threads.gateway';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReactionsService {
  constructor(
    private prisma: PrismaService,
    private readonly threadsGateway: ThreadsGateway,
  ) {}

  async create(createReactionDto: CreateReactionDto) {
    const post = await this.prisma.post.findUnique({
      where: { id: createReactionDto.postId },
      include: { thread: true },
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

    const reaction = await this.prisma.reaction.create({
      data: createReactionDto,
    });

    // Send real-time notification
    this.threadsGateway.sendNewReactionToPost(post.thread.id, reaction);

    return reaction;
  }

  async update(reactionId: string, reactionType: ReactionType) {
    const reaction = await this.prisma.reaction.findUnique({
      where: { id: reactionId },
      include: { post: { include: { thread: true } } },
    });

    if (!reaction) {
      throw new NotFoundException('Reaction not found');
    }

    const updatedReaction = await this.prisma.reaction.update({
      where: { id: reactionId },
      data: { type: reactionType },
    });

    // Send real-time notification
    this.threadsGateway.sendUpdatedReactionToPost(
      reaction.post.thread.id,
      updatedReaction,
    );

    return updatedReaction;
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
    const reaction = await this.prisma.reaction.findUnique({
      where: { id: reactionId },
      include: { post: { include: { thread: true } } },
    });

    if (!reaction) {
      throw new NotFoundException('Reaction not found');
    }

    await this.prisma.reaction.delete({
      where: { id: reactionId },
    });

    // Send real-time notification
    this.threadsGateway.sendDeletedReactionFromPost(
      reaction.post.thread.id,
      reactionId,
      reaction.postId,
    );

    return { id: reactionId };
  }
}
