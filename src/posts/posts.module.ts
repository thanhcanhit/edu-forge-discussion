import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [PostsController],
  providers: [PostsService, PrismaClient],
})
export class PostsModule {}
