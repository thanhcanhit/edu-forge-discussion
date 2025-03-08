import { Module } from '@nestjs/common';
import { ReactionsModule } from './reactions/reactions.module';
import { ThreadsModule } from './threads/threads.module';
import { PostsModule } from './posts/posts.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerInterceptor } from './intercepters/logger.intercepter';

@Module({
  imports: [ReactionsModule, ThreadsModule, PostsModule],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
  ],
})
export class AppModule {}
