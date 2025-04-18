import { Injectable } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ThreadsService } from './threads.service';
import { Post, Reaction } from '@prisma/client';
import { ThreadUser } from './interfaces/thread.interface';

@Injectable()
@WebSocketGateway({
  namespace: '/threads',
  cors: {
    origin: process.env.CLIENT_URL || [
      'http://localhost:3000',
      'https://eduforge.io.vn',
      'https://kong.eduforge.io.vn',
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'Origin',
      'X-Requested-With',
    ],
  },
  allowEIO3: true,
})
export class ThreadsGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private readonly CLEANUP_INTERVAL = 1000 * 60 * 30; // 30 minutes
  private readonly INACTIVE_THRESHOLD = 1000 * 60 * 60; // 1 hour

  // Map to track users in each thread
  private threadUsers: Map<string, Set<ThreadUser>> = new Map();

  // Map to track socket IDs for each user
  private userSockets: Map<string, Set<string>> = new Map();

  constructor(private readonly threadService: ThreadsService) {
    setInterval(() => this.cleanupInactiveThreads(), this.CLEANUP_INTERVAL);
  }

  afterInit(server: Server) {
    console.log('WebSocket Gateway initialized');

    server.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        this.handleDisconnect(socket);
      });
    });
  }

  private cleanupInactiveThreads(): void {
    const now = new Date();
    this.threadUsers.forEach((users, threadId) => {
      users.forEach((user) => {
        if (
          now.getTime() - user.lastActivity.getTime() >
          this.INACTIVE_THRESHOLD
        ) {
          users.delete(user);
          this.userSockets.delete(user.userId);
        }
      });

      if (users.size === 0) {
        this.threadUsers.delete(threadId);
      }
    });
  }

  private handleDisconnect(socket: Socket) {
    const user = socket.handshake.auth?.user as
      | { id: string; name: string }
      | undefined;
    if (!user?.id) return;

    const userSocketIds = this.userSockets.get(user.id);
    if (userSocketIds) {
      userSocketIds.delete(socket.id);
      if (userSocketIds.size === 0) {
        this.userSockets.delete(user.id);
      }
    }

    if (!this.userSockets.has(user.id)) {
      this.threadUsers.forEach((users, threadId) => {
        const userToRemove = Array.from(users).find(
          (u) => u.userId === user.id,
        );
        if (userToRemove) {
          users.delete(userToRemove);
          const threadRoom = `thread-${threadId}`;

          this.server.to(threadRoom).emit('thread-users', {
            threadId,
            users: Array.from(users).map(({ userId, userName }) => ({
              userId,
              userName,
            })),
          });
        }
      });
    }
  }

  @SubscribeMessage('join-thread')
  async handleJoinThread(
    @MessageBody() data: { threadId: string; userId: string; userName: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { threadId, userId, userName } = data;

    try {
      const threadExists = await this.threadService.findOne(threadId);
      if (!threadExists) {
        return { error: 'Thread does not exist' };
      }

      const threadRoom = `thread-${threadId}`;
      await client.join(threadRoom);

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)?.add(client.id);

      if (!this.threadUsers.has(threadId)) {
        this.threadUsers.set(threadId, new Set());
      }

      const threadRoomUsers = this.threadUsers.get(threadId);
      if (threadRoomUsers) {
        const newUser: ThreadUser = {
          userId,
          userName,
          socketId: client.id,
          lastActivity: new Date(),
        };

        const existingUser = Array.from(threadRoomUsers).find(
          (u) => u.userId === userId,
        );
        if (existingUser) {
          threadRoomUsers.delete(existingUser);
        }

        threadRoomUsers.add(newUser);

        // Send current users list to the new user
        client.emit('thread-users', {
          threadId,
          users: Array.from(threadRoomUsers).map(({ userId, userName }) => ({
            userId,
            userName,
          })),
        });

        // Notify others if it's a new user
        if (!existingUser) {
          client.to(threadRoom).emit('user-joined', {
            userId,
            userName,
          });
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error joining thread:', error);
      return { error: 'Failed to join thread' };
    }
  }

  @SubscribeMessage('leave-thread')
  async handleLeaveThread(
    @MessageBody() data: { threadId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { threadId, userId } = data;
    const threadRoom = `thread-${threadId}`;

    await client.leave(threadRoom);

    const userSocketIds = this.userSockets.get(userId);
    if (userSocketIds) {
      userSocketIds.delete(client.id);
      if (userSocketIds.size === 0) {
        this.userSockets.delete(userId);
      }
    }

    if (!this.userSockets.has(userId)) {
      const threadRoomUsers = this.threadUsers.get(threadId);
      if (threadRoomUsers) {
        const userToRemove = Array.from(threadRoomUsers).find(
          (u) => u.userId === userId,
        );
        if (userToRemove) {
          threadRoomUsers.delete(userToRemove);

          this.server.to(threadRoom).emit('thread-users', {
            threadId,
            users: Array.from(threadRoomUsers).map(({ userId, userName }) => ({
              userId,
              userName,
            })),
          });
        }
      }
    }

    return { success: true };
  }

  // Post update methods
  sendNewPostToThread(threadId: string, post: Post): void {
    this.server.to(`thread-${threadId}`).emit('new-post', post);
  }

  sendUpdatedPostToThread(threadId: string, post: Post): void {
    this.server.to(`thread-${threadId}`).emit('update-post', post);
  }

  sendDeletedPostToThread(threadId: string, postId: string): void {
    this.server.to(`thread-${threadId}`).emit('delete-post', { postId });
  }

  // Reaction update methods
  sendNewReactionToPost(threadId: string, reaction: Reaction): void {
    this.server.to(`thread-${threadId}`).emit('new-reaction', reaction);
  }

  sendUpdatedReactionToPost(threadId: string, reaction: Reaction): void {
    this.server.to(`thread-${threadId}`).emit('update-reaction', reaction);
  }

  sendDeletedReactionFromPost(
    threadId: string,
    reactionId: string,
    postId: string,
  ): void {
    this.server
      .to(`thread-${threadId}`)
      .emit('delete-reaction', { reactionId, postId });
  }
}
