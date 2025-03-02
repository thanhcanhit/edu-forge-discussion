import { Module } from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { ReactionsController } from './reactions.controller';
import { PrismaClient } from '@prisma/client';
import { ThreadsGateway } from '../threads/threads.gateway';
import { ThreadsService } from 'src/threads/threads.service';

@Module({
  controllers: [ReactionsController],
  providers: [ReactionsService, PrismaClient, ThreadsGateway, ThreadsService],
})
export class ReactionsModule {}
