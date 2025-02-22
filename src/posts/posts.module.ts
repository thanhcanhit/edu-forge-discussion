import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaClient } from '@prisma/client';
import { ThreadsGateway } from 'src/threads/threads.gateway';
import { ThreadsService } from 'src/threads/threads.service';

@Module({
  controllers: [PostsController],
  providers: [PostsService, PrismaClient, ThreadsGateway, ThreadsService],
})
export class PostsModule {}
