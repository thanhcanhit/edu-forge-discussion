import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaClient) {}

  async getPostsByThreadId(
    threadId: number,
    {
      parentId,
      page = 1,
      limit = 10,
    }: { parentId?: number; page?: number; limit?: number },
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.PostWhereInput = {
      threadId,
      deletedAt: null,
      ...(parentId !== undefined && { parentId }),
    };

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: {
          replies: {
            where: { deletedAt: null },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data: posts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPostById(id: number) {
    const post = await this.prisma.post.findFirst({
      where: { id, deletedAt: null },
      include: {
        replies: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }

  async createPost(
    threadId: number,
    data: {
      content: string;
      authorId: string;
      parentId?: number;
      rating?: number;
    },
  ) {
    // Validate thread exists
    const thread = await this.prisma.thread.findUnique({
      where: { id: threadId },
    });

    if (!thread) {
      throw new NotFoundException(`Thread with ID ${threadId} not found`);
    }

    // If parentId is provided, validate parent post exists and belongs to same thread
    if (data.parentId) {
      const parentPost = await this.prisma.post.findFirst({
        where: { id: data.parentId, threadId, deletedAt: null },
      });

      if (!parentPost) {
        throw new BadRequestException(
          `Parent post with ID ${data.parentId} not found in thread ${threadId}`,
        );
      }
    }

    return this.prisma.post.create({
      data: {
        threadId,
        content: data.content,
        authorId: data.authorId,
        parentId: data.parentId,
        rating: data.rating,
      },
      include: {
        thread: true,
      },
    });
  }

  async updatePost(
    id: number,
    authorId: string,
    data: { content: string; rating?: number },
  ) {
    const post = await this.prisma.post.findFirst({
      where: { id, deletedAt: null },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    if (post.authorId !== authorId) {
      throw new BadRequestException('You can only edit your own posts');
    }

    return this.prisma.post.update({
      where: { id },
      data: {
        ...data,
        isEdited: true,
      },
    });
  }

  async deletePost(id: number, authorId: string) {
    const post = await this.prisma.post.findFirst({
      where: { id, deletedAt: null },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    if (post.authorId !== authorId) {
      throw new BadRequestException('You can only delete your own posts');
    }

    return this.prisma.post.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
