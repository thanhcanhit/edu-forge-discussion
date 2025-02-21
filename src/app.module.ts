import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { ReactionsModule } from './reactions/reactions.module';
import { ThreadsModule } from './threads/threads.module';

@Module({
  imports: [PostsModule, ReactionsModule, ThreadsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
