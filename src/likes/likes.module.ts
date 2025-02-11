import { Module } from '@nestjs/common';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [LikesController],
  providers: [LikesService, PrismaClient],
  exports: [LikesService],
})
export class LikesModule {}
