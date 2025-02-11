import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class LikesService {
  constructor(private prisma: PrismaClient) {}

  async getLikesForPost(
    postId: number,
    { page = 1, limit = 10 }: { page?: number; limit?: number },
  ) {
    const skip = (page - 1) * limit;

    const [likes, total] = await Promise.all([
      this.prisma.like.findMany({
        where: { postId },
        include: { post: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.like.count({
        where: { postId },
      }),
    ]);

    return {
      data: likes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getLikeCount(postId: number) {
    const count = await this.prisma.like.count({
      where: { postId },
    });

    return { count };
  }

  async createLike(postId: number, userId: string) {
    // Verify post exists and is not deleted
    const post = await this.prisma.post.findFirst({
      where: { id: postId, deletedAt: null },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    // Check if like already exists
    const existingLike = await this.prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existingLike) {
      throw new BadRequestException('User has already liked this post');
    }

    // Create new like
    return this.prisma.like.create({
      data: {
        postId,
        userId,
      },
      include: {
        post: true,
      },
    });
  }

  async deleteLike(postId: number, userId: string) {
    const like = await this.prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (!like) {
      throw new NotFoundException('Like not found');
    }

    return this.prisma.like.delete({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });
  }

  async hasUserLikedPost(postId: number, userId: string): Promise<boolean> {
    const like = await this.prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    return !!like;
  }
}
