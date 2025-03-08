import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { ThreadsGateway } from 'src/threads/threads.gateway';
import { ThreadsService } from 'src/threads/threads.service';
import { PrismaService } from 'src/prisma/prisma.service';
@Module({
  controllers: [PostsController],
  providers: [PostsService, ThreadsGateway, ThreadsService, PrismaService],
})
export class PostsModule {}
