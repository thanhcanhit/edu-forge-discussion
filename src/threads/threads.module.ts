import { Module } from '@nestjs/common';
import { ThreadsController } from './threads.controller';
import { ThreadsService } from './threads.service';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [ThreadsController],
  providers: [ThreadsService, PrismaClient],
  exports: [ThreadsService],
})
export class ThreadsModule {}
