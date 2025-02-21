import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReactionsModule } from './reactions/reactions.module';
import { ThreadsModule } from './threads/threads.module';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [ReactionsModule, ThreadsModule, PostsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
