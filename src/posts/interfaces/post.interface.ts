import { Post, ReactionType } from '@prisma/client';

/**
 * Represents a post with its relations as returned by Prisma
 */
export interface PrismaPostWithRelations extends Post {
  _count?: {
    replies: number;
  };
  reactions?: any[];
  replies?: PrismaPostWithRelations[];
  thread?: any;
}

/**
 * Counts of reactions by type
 */
export interface ReactionCounts {
  [ReactionType.LIKE]: number;
  [ReactionType.LOVE]: number;
  [ReactionType.CARE]: number;
  [ReactionType.HAHA]: number;
  [ReactionType.WOW]: number;
  [ReactionType.SAD]: number;
  [ReactionType.ANGRY]: number;
  total: number;
}

/**
 * Extends a post with total count of all nested replies
 */
export interface PostWithTotalReplies extends PrismaPostWithRelations {
  totalRepliesCount: number;
  reactionCounts?: ReactionCounts;
}
