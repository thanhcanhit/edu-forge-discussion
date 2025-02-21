import { Module } from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { ReactionsController } from './reactions.controller';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [ReactionsController],
  providers: [ReactionsService, PrismaClient],
})
export class ReactionsModule {}
