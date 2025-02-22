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
import { Post } from '@prisma/client';

@Injectable()
@WebSocketGateway({ cors: true })
export class ThreadsGateway {
  @WebSocketServer()
  server: Server;

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

  sendNewPostToThread(threadId: string, message: Post): void {
    this.server.to(`thread-${threadId}`).emit('newPost', message);
  }
}
