import { Module } from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { ReactionsController } from './reactions.controller';
import { ThreadsGateway } from '../threads/threads.gateway';
import { ThreadsService } from 'src/threads/threads.service';
import { PrismaService } from 'src/prisma/prisma.service';
@Module({
  controllers: [ReactionsController],
  providers: [ReactionsService, ThreadsGateway, ThreadsService, PrismaService],
})
export class ReactionsModule {}
