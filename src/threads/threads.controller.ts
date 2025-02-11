import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ThreadsService } from './threads.service';
import { DiscussionType } from '@prisma/client';

@Controller('threads')
export class ThreadsController {
  constructor(private readonly threadsService: ThreadsService) {}

  @Get()
  async findAll(
    @Query('type') type?: DiscussionType,
    @Query('courseId') courseId?: string,
    @Query('lessonId') lessonId?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.threadsService.findAll({
      type,
      courseId,
      lessonId,
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('includePosts') includePosts?: boolean,
  ) {
    return this.threadsService.findOne(id, includePosts);
  }

  @Post()
  async create(
    @Body()
    data: {
      type: DiscussionType;
      courseId?: string;
      lessonId?: string;
      initialPost?: {
        content: string;
        authorId: string;
        rating?: number;
      };
    },
  ) {
    return this.threadsService.create(data);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    data: {
      type?: DiscussionType;
      courseId?: string;
      lessonId?: string;
    },
  ) {
    return this.threadsService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.threadsService.softDelete(id);
  }
}
