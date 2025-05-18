import { Module } from '@nestjs/common';
import { ThreadsService } from './threads.service';
import { ThreadsController } from './threads.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ThreadsGateway } from './threads.gateway';

@Module({
  controllers: [ThreadsController],
  providers: [ThreadsService, PrismaService, ThreadsGateway],
  exports: [ThreadsGateway],
})
export class ThreadsModule {}
