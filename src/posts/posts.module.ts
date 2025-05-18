import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ThreadsModule } from 'src/threads/threads.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [PrismaModule, ThreadsModule, NotificationModule],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
