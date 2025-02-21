import { Module } from '@nestjs/common';
import { ThreadsService } from './threads.service';
import { ThreadsController } from './threads.controller';
import { PrismaClient } from '@prisma/client';
@Module({
  controllers: [ThreadsController],
  providers: [ThreadsService, PrismaClient],
})
export class ThreadsModule {}
