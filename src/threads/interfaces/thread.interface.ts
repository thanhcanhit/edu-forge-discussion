import { Thread } from '@prisma/client';
import { PostWithTotalReplies } from '../../posts/interfaces/post.interface';

/**
 * Extended Thread interface with typed posts
 */
export interface ThreadWithPosts extends Thread {
  posts: PostWithTotalReplies[];
  _count?: {
    posts: number;
  };
}
