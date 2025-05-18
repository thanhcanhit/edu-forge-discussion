import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NotificationService {
  private readonly notificationBaseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const url = this.configService.get<string>('NOTIFICATION_SERVICE_URL');
    if (!url) {
      throw new Error(
        'NOTIFICATION_SERVICE_URL environment variable is not set',
      );
    }
    this.notificationBaseUrl = url;
  }

  async createNotification(data: {
    type: string;
    title: string;
    content: string;
    link: string;
    isGlobal: boolean;
    priority: number;
    metadata?: Record<string, any>;
    recipients: string[];
  }) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.notificationBaseUrl}/notifications`,
          data,
        ),
      );
      return response.data;
    } catch (error) {
      console.error('Failed to create notification:', error);
      // Don't throw error to prevent breaking the main flow
      return null;
    }
  }

  async createCommentNotification(data: {
    postId: string;
    postTitle: string;
    commentId: string;
    commentContent: string;
    commentAuthor: string;
    commentAuthorId: string;
    recipientId: string;
  }) {
    return this.createNotification({
      type: 'SOCIAL_COMMENT',
      title: 'Bình luận mới',
      content: `${data.commentAuthor} đã bình luận về bài viết của bạn`,
      link: `/forum/posts/${data.postId}/comments`,
      isGlobal: false,
      priority: 2,
      metadata: {
        postId: data.postId,
        postTitle: data.postTitle,
        commentId: data.commentId,
        commentContent: data.commentContent,
        commentAuthor: data.commentAuthor,
        commentAuthorId: data.commentAuthorId,
      },
      recipients: [data.recipientId],
    });
  }

  async createReactionNotification(data: {
    postId: string;
    postTitle: string;
    reactionType: string;
    reactorName: string;
    reactorId: string;
    recipientId: string;
    threadId: string;
    postContent: string;
  }) {
    return this.createNotification({
      type: 'SOCIAL_LIKE',
      title: 'Lượt thích mới',
      content: `${data.reactorName} đã thích bài viết của bạn`,
      link: `/forum/posts/${data.postId}`,
      isGlobal: false,
      priority: 2,
      metadata: {
        postId: data.postId,
        postTitle: data.postTitle,
        reactionType: data.reactionType,
        reactorName: data.reactorName,
        reactorId: data.reactorId,
        threadId: data.threadId,
        postContent: data.postContent,
      },
      recipients: [data.recipientId],
    });
  }

  async createMentionNotification(data: {
    postId: string;
    postTitle: string;
    commentId: string;
    commentContent: string;
    mentionedBy: string;
    mentionedById: string;
    recipientId: string;
  }) {
    return this.createNotification({
      type: 'SOCIAL_MENTION',
      title: 'Bạn được nhắc đến',
      content: `${data.mentionedBy} đã nhắc đến bạn trong một bình luận`,
      link: `/forum/posts/${data.postId}/comments/${data.commentId}`,
      isGlobal: false,
      priority: 2,
      metadata: {
        postId: data.postId,
        postTitle: data.postTitle,
        commentId: data.commentId,
        commentContent: data.commentContent,
        mentionedBy: data.mentionedBy,
        mentionedById: data.mentionedById,
      },
      recipients: [data.recipientId],
    });
  }
}
