import { Module } from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { ReactionsController } from './reactions.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ThreadsModule } from 'src/threads/threads.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [PrismaModule, ThreadsModule, NotificationModule],
  controllers: [ReactionsController],
  providers: [ReactionsService],
  exports: [ReactionsService],
})
export class ReactionsModule {}
