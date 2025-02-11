import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [PostsController],
  providers: [PostsService, PrismaClient],
  exports: [PostsService],
})
export class PostsModule {}
