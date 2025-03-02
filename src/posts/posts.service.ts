import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import {
  DiscussionType,
  PrismaClient,
  ReactionType,
  Reaction,
  Post,
} from '@prisma/client';
import { ThreadsGateway } from 'src/threads/threads.gateway';
import {
  PostWithTotalReplies,
  ReactionCounts,
} from './interfaces/post.interface';

type PostWithReplies = Post & {
  _count: {
    replies: number;
  };
  replies: PostWithReplies[];
};

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaClient,
    private threadGateway: ThreadsGateway,
  ) {}

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

    const result = await this.prisma.post.create({
      data: {
        ...createPostDto,
        authorId,
      },
      include: {
        replies: true,
        reactions: true,
      },
    });

    // Notify thread participants
    this.threadGateway.sendNewPostToThread(createPostDto.threadId, result);

    return result;
  }

  async findOne(
    id: string,
    includeDeleted = false,
  ): Promise<PostWithTotalReplies> {
    const post = await this.prisma.post.findUnique({
      where: { id, deletedAt: includeDeleted ? undefined : null },
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

    // Calculate total replies count for the main post
    const totalRepliesCount = await this.countAllNestedReplies(post.id);
    // Add reaction counts for the main post
    const reactionCounts = this.countReactionsByType(post.reactions);

    // Add total replies count to each direct reply
    const postWithTotalReplies = {
      ...post,
      totalRepliesCount,
      reactionCounts,
      // Also add total replies count to each direct reply
      replies: await Promise.all(
        (post.replies || []).map(async (reply) => {
          const replyTotalCount = await this.countAllNestedReplies(reply.id);
          // Add reaction counts for each reply
          const replyReactionCounts = this.countReactionsByType(
            reply.reactions,
          );
          return {
            ...reply,
            totalRepliesCount: replyTotalCount,
            reactionCounts: replyReactionCounts,
          } as PostWithTotalReplies;
        }),
      ),
    } as PostWithTotalReplies;

    return postWithTotalReplies;
  }

  /**
   * Counts reactions by their type for a post
   * @param reactions Array of reactions for a post
   * @returns Object with counts for each reaction type
   */
  private countReactionsByType(reactions: Reaction[]): ReactionCounts {
    // Initialize counts with zeros for all reaction types
    const counts: ReactionCounts = {
      [ReactionType.LIKE]: 0,
      [ReactionType.LOVE]: 0,
      [ReactionType.CARE]: 0,
      [ReactionType.HAHA]: 0,
      [ReactionType.WOW]: 0,
      [ReactionType.SAD]: 0,
      [ReactionType.ANGRY]: 0,
      total: 0,
    };

    // Count reactions by type
    if (reactions && reactions.length > 0) {
      reactions.forEach((reaction) => {
        const reactionType = reaction.type;
        if (reactionType && counts[reactionType] !== undefined) {
          counts[reactionType]++;
          counts.total++;
        }
      });
    }

    return counts;
  }

  /**
   * Recursively counts all nested replies for a post
   * @param postId The ID of the post to count replies for
   * @returns The total count of all nested replies
   */
  private async countAllNestedReplies(postId: string): Promise<number> {
    const post = (await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        _count: {
          select: {
            replies: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
        replies: {
          where: {
            deletedAt: null,
          },
          include: {
            _count: {
              select: {
                replies: {
                  where: {
                    deletedAt: null,
                  },
                },
              },
            },
            replies: {
              where: {
                deletedAt: null,
              },
              include: {
                _count: {
                  select: {
                    replies: true,
                  },
                },
              },
            },
          },
        },
      },
    })) as PostWithReplies | null;

    if (!post) return 0;

    let totalCount = 0;

    // Count direct replies
    totalCount += post._count.replies;

    // Count nested replies recursively
    const countNestedReplies = (replies: PostWithReplies[]): number => {
      let count = 0;
      for (const reply of replies) {
        count += reply._count.replies;
        if (reply.replies?.length > 0) {
          count += countNestedReplies(reply.replies);
        }
      }
      return count;
    };

    // Add counts from all nested levels
    totalCount += countNestedReplies(post.replies);

    return totalCount;
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

    const updatedPost = await this.prisma.post.update({
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

    // Add total replies count
    const totalRepliesCount = await this.countAllNestedReplies(updatedPost.id);
    // Add reaction counts
    const reactionCounts = this.countReactionsByType(updatedPost.reactions);

    return {
      ...updatedPost,
      totalRepliesCount,
      reactionCounts,
    } as PostWithTotalReplies;
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

    const now = new Date();

    // Soft delete the post and all its nested replies
    await this.prisma.$transaction([
      // Soft delete all nested replies at any depth
      this.prisma.post.updateMany({
        where: {
          OR: [
            { parentId: id }, // Direct replies
            {
              parent: {
                parentId: id, // Replies of replies
              },
            },
            {
              parent: {
                parent: {
                  parentId: id, // Replies of replies of replies
                },
              },
            },
          ],
          deletedAt: null, // Only update non-deleted posts
        },
        data: {
          deletedAt: now,
        },
      }),
      // Soft delete the main post
      this.prisma.post.update({
        where: { id },
        data: {
          deletedAt: now,
        },
      }),
    ]);

    return { success: true };
  }

  async findReplies(
    id: string,
    page = 1,
    limit = 10,
  ): Promise<PostWithTotalReplies[]> {
    const replies = await this.prisma.post.findMany({
      where: {
        parentId: id,
        deletedAt: null,
      },
      take: limit,
      skip: (page - 1) * limit,
      include: {
        replies: true,
        reactions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Add total replies count to each reply
    const repliesWithTotalCounts = await Promise.all(
      replies.map(async (reply) => {
        const totalRepliesCount = await this.countAllNestedReplies(reply.id);
        // Add reaction counts
        const reactionCounts = this.countReactionsByType(reply.reactions);
        return {
          ...reply,
          totalRepliesCount,
          reactionCounts,
        } as PostWithTotalReplies;
      }),
    );

    return repliesWithTotalCounts;
  }

  async hasUserReviewedCourse(
    courseId: string,
    authorId: string,
  ): Promise<{ hasReviewed: boolean; reviewId?: string }> {
    console.log('Checking if user has reviewed course', courseId, authorId);
    // Find thread for this course
    const thread = await this.prisma.thread.findFirst({
      where: {
        id: courseId,
        type: DiscussionType.COURSE_REVIEW,
        deletedAt: null,
      },
    });

    if (!thread) {
      throw new NotFoundException('Course review thread not found');
    }

    // Check if user has a review post in this thread
    const review = await this.prisma.post.findFirst({
      where: {
        threadId: thread.id,
        authorId: authorId,
        parentId: null, // Only main posts can be reviews
        rating: { not: null }, // Must have a rating to be a review
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    return {
      hasReviewed: !!review,
      reviewId: review?.id,
    };
  }
}
