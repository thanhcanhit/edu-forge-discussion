import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { NotificationService } from './notification.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
