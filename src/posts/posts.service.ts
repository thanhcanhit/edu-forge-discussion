import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { DiscussionType, PrismaClient } from '@prisma/client';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaClient) {}

  async create(authorId: string, createPostDto: CreatePostDto) {
    // Validate thread exists and get its type
    const thread = await this.prisma.thread.findUnique({
      where: { id: createPostDto.threadId },
    });

    if (!thread) {
      throw new NotFoundException('Thread not found');
    }

    // Validate parent post if specified
    if (createPostDto.parentId) {
      const parentPost = await this.prisma.post.findUnique({
        where: { id: createPostDto.parentId },
      });

      if (!parentPost) {
        throw new NotFoundException('Parent post not found');
      }

      if (parentPost.threadId !== createPostDto.threadId) {
        throw new BadRequestException(
          'Parent post must belong to the same thread',
        );
      }

      // Replies cannot have ratings
      if (createPostDto.rating) {
        throw new BadRequestException('Reply posts cannot have ratings');
      }
    }

    // Only allow ratings for main posts in COURSE_REVIEW threads
    if (
      createPostDto.rating &&
      !createPostDto.parentId &&
      thread.type !== DiscussionType.COURSE_REVIEW
    ) {
      throw new BadRequestException(
        'Ratings are only allowed for main posts in course review threads',
      );
    }

    // Update thread overall rating
    const threadPosts = await this.prisma.post.findMany({
      where: { threadId: createPostDto.threadId },
    });

    const overallRating =
      threadPosts.reduce((sum, post) => sum + (post.rating ?? 0), 0) /
      threadPosts.length;

    await this.prisma.thread.update({
      where: { id: createPostDto.threadId },
      data: { overallRating },
    });

    return this.prisma.post.create({
      data: {
        ...createPostDto,
        authorId,
      },
      include: {
        replies: true,
        reactions: true,
      },
    });
  }

  async findAll(includeDeleted = false) {
    return this.prisma.post.findMany({
      where: includeDeleted ? {} : { deletedAt: null },
      include: {
        replies: true,
        reactions: true,
      },
    });
  }

  async findOne(id: string, includeDeleted = false) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        replies: {
          include: {
            replies: true,
            reactions: true,
          },
        },
        reactions: true,
      },
    });

    if (!post || (!includeDeleted && post.deletedAt)) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async update(id: string, authorId: string, updatePostDto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { thread: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== authorId) {
      throw new BadRequestException('You can only update your own posts');
    }

    // Validate rating updates
    if (updatePostDto.rating !== undefined) {
      // Check if this is a main post in a course review thread
      if (post.parentId || post.thread.type !== DiscussionType.COURSE_REVIEW) {
        throw new BadRequestException(
          'Ratings are only allowed for main posts in course review threads',
        );
      }
    }

    return this.prisma.post.update({
      where: { id },
      data: {
        ...updatePostDto,
        isEdited: true,
      },
      include: {
        replies: true,
        reactions: true,
      },
    });
  }

  async remove(id: string, authorId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== authorId) {
      throw new BadRequestException('You can only delete your own posts');
    }

    // Soft delete
    return this.prisma.post.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
