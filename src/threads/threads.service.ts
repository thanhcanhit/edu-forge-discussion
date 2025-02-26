import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateThreadDto } from './dto/create-thread.dto';
import { UpdateThreadDto } from './dto/update-thread.dto';
import {
  PrismaClient,
  Thread,
  ReactionType,
  Reaction,
  Post,
} from '@prisma/client';
import { ThreadWithPosts } from './interfaces/thread.interface';
import {
  PostWithTotalReplies,
  ReactionCounts,
} from '../posts/interfaces/post.interface';

type PostWithReplies = Post & {
  _count: {
    replies: number;
  };
  replies: PostWithReplies[];
};

@Injectable()
export class ThreadsService {
  constructor(private prisma: PrismaClient) {}

  async create(createThreadDto: CreateThreadDto): Promise<Thread> {
    return this.prisma.thread.create({
      data: createThreadDto,
    });
  }

  async findAll(): Promise<Thread[]> {
    return this.prisma.thread.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<ThreadWithPosts> {
    const thread = await this.prisma.thread.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            posts: {
              where: {
                deletedAt: null,
                parentId: null,
              },
            },
          },
        },
        posts: {
          where: {
            deletedAt: null,
            parentId: null,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
          include: {
            _count: {
              select: {
                replies: true,
              },
            },
            reactions: true,
          },
        },
      },
    });

    if (!thread || thread.deletedAt) {
      throw new NotFoundException(`Thread with ID ${id} not found`);
    }

    // Create a new thread object with properly typed posts
    const threadWithTotalReplies = {
      ...thread,
      posts: await Promise.all(
        thread.posts.map(async (post) => {
          const totalRepliesCount = await this.countAllNestedReplies(post.id);
          // Add reaction counts by type
          const reactionCounts = this.countReactionsByType(post.reactions);
          return {
            ...post,
            totalRepliesCount,
            reactionCounts,
          } as PostWithTotalReplies;
        }),
      ),
    } as ThreadWithPosts;

    return threadWithTotalReplies;
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

  async update(id: string, updateThreadDto: UpdateThreadDto): Promise<Thread> {
    await this.findOne(id); // Verify thread exists and is not deleted

    return this.prisma.thread.update({
      where: { id },
      data: updateThreadDto,
    });
  }

  async remove(id: string): Promise<Thread> {
    await this.findOne(id); // Verify thread exists and is not deleted

    return this.prisma.thread.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async findThreadPosts(
    threadId: string,
    page = 1,
    limit = 10,
  ): Promise<PostWithTotalReplies[]> {
    const thread = await this.prisma.thread.findUnique({
      where: { id: threadId },
    });

    if (!thread || thread.deletedAt) {
      throw new NotFoundException(`Thread with ID ${threadId} not found`);
    }

    const posts = await this.prisma.post.findMany({
      where: {
        threadId: thread.id,
        deletedAt: null,
        parentId: null, // Get only top-level posts
      },
      take: limit,
      skip: (page - 1) * limit,
      include: {
        _count: {
          select: {
            replies: true,
          },
        },
        reactions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Add total replies count to each post
    const postsWithTotalReplies = await Promise.all(
      posts.map(async (post) => {
        const totalRepliesCount = await this.countAllNestedReplies(post.id);
        // Add reaction counts by type
        const reactionCounts = this.countReactionsByType(post.reactions);
        return {
          ...post,
          totalRepliesCount,
          reactionCounts,
        } as PostWithTotalReplies;
      }),
    );

    return postsWithTotalReplies;
  }
}
