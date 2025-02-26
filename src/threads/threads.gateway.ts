import { Injectable, ParseUUIDPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ThreadsService } from './threads.service';
import { Post, Reaction } from '@prisma/client';

interface TypingEvent {
  threadId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

interface TypingUser {
  userId: string;
  userName: string;
}

@Injectable()
@WebSocketGateway({
  namespace: 'threads',
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  allowEIO3: true,
})
export class ThreadsGateway {
  @WebSocketServer()
  server: Server;

  private typingUsers: Map<string, Set<TypingUser>> = new Map();

  constructor(private readonly threadService: ThreadsService) {}

  @SubscribeMessage('join-thread')
  async handleJoinThread(
    @MessageBody(ParseUUIDPipe) threadId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const threadExists = await this.threadService.findOne(threadId);

    if (!threadExists) {
      return 'Thread does not exist';
    }

    await client.join(`thread-${threadId}`);
    console.log(`Client ${client.id} joined thread ${threadId}`);
    client.emit('joined-thread', threadId);
  }

  @SubscribeMessage('leave-thread')
  async handleLeaveThread(
    @MessageBody(ParseUUIDPipe) threadId: string,
    @ConnectedSocket() client: Socket,
  ) {
    await client.leave(`thread-${threadId}`);
    console.log(`Client ${client.id} left thread ${threadId}`);
    client.emit('left-thread', threadId);
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: TypingEvent,
    @ConnectedSocket() client: Socket,
  ) {
    const { threadId, userId, userName, isTyping } = data;
    const threadRoom = `thread-${threadId}`;

    // Update typing users for this thread
    if (!this.typingUsers.has(threadId)) {
      this.typingUsers.set(threadId, new Set());
    }

    const threadTypingUsers = this.typingUsers.get(threadId);
    if (!threadTypingUsers) return;

    const typingUser: TypingUser = { userId, userName };

    if (isTyping) {
      threadTypingUsers.add(typingUser);
    } else {
      threadTypingUsers.delete(typingUser);
    }

    // Emit typing status to all users in thread except sender
    client.to(threadRoom).emit('user-typing', {
      threadId,
      typingUsers: Array.from(threadTypingUsers),
    });
  }

  // Send new post to thread
  sendNewPostToThread(threadId: string, post: Post): void {
    this.server.to(`thread-${threadId}`).emit('new-post', post);
    // Clear typing indicator for the user who posted
    this.clearTypingIndicator(threadId, post.authorId);
  }

  // Send updated post to thread
  sendUpdatedPostToThread(threadId: string, post: Post): void {
    this.server.to(`thread-${threadId}`).emit('update-post', post);
  }

  // Send deleted post to thread
  sendDeletedPostToThread(threadId: string, postId: string): void {
    this.server.to(`thread-${threadId}`).emit('delete-post', { postId });
  }

  // Send new reaction to thread
  sendNewReactionToThread(threadId: string, reaction: Reaction): void {
    this.server.to(`thread-${threadId}`).emit('new-reaction', reaction);
  }

  // Send updated reaction to thread
  sendUpdatedReactionToThread(threadId: string, reaction: Reaction): void {
    this.server.to(`thread-${threadId}`).emit('update-reaction', reaction);
  }

  // Send deleted reaction to thread
  sendDeletedReactionToThread(threadId: string, reactionId: string): void {
    this.server
      .to(`thread-${threadId}`)
      .emit('delete-reaction', { reactionId });
  }

  private clearTypingIndicator(threadId: string, userId: string): void {
    const threadTypingUsers = this.typingUsers.get(threadId);
    if (!threadTypingUsers) return;

    const userToRemove = Array.from(threadTypingUsers).find(
      (u) => u.userId === userId,
    );

    if (userToRemove) {
      threadTypingUsers.delete(userToRemove);
      this.server.to(`thread-${threadId}`).emit('user-typing', {
        threadId,
        typingUsers: Array.from(threadTypingUsers),
      });
    }
  }
}
