import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThreadsModule } from './threads/threads.module';
import { PostsModule } from './posts/posts.module';
import { LikesModule } from './likes/likes.module';

@Module({
  imports: [ThreadsModule, PostsModule, LikesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
