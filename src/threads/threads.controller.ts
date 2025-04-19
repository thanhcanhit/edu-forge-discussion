import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Query,
  ParseIntPipe,
  Headers,
} from '@nestjs/common';
import { ThreadsService } from './threads.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import { UpdateThreadDto } from './dto/update-thread.dto';
import { Thread } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';

@ApiTags('threads')
@Controller('threads')
export class ThreadsController {
  constructor(private readonly threadsService: ThreadsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new thread' })
  @ApiBody({ type: CreateThreadDto, description: 'Thread creation data' })
  @ApiResponse({
    headers: {
      'X-User-Id': {
        description: 'User ID from authentication',
        schema: { type: 'string' },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'The thread has been successfully created',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        type: { type: 'string', enum: ['COURSE_REVIEW', 'LESSON_DISCUSSION'] },
        resourceId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        deletedAt: { type: 'string', format: 'date-time', nullable: true },
        overallRating: { type: 'number', nullable: true },
      },
    },
  })
  create(
    @Body() createThreadDto: CreateThreadDto,
    @Headers('X-User-Id') requestUserId?: string, // Capture user ID from headers for future authorization/auditing
  ): Promise<Thread> {
    // Hiện tại chưa sử dụng requestUserId, nhưng trong tương lai có thể cần:
    // 1. Lưu trữ người tạo thread
    // 2. Kiểm tra quyền tạo thread
    // 3. Ghi log hoạt động của người dùng

    // Có thể mở rộng createThreadDto để bao gồm creatorId trong tương lai
    return this.threadsService.create(createThreadDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all threads' })
  @ApiOkResponse({
    description: 'List of all threads retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          type: {
            type: 'string',
            enum: ['COURSE_REVIEW', 'LESSON_DISCUSSION'],
          },
          resourceId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          deletedAt: { type: 'string', format: 'date-time', nullable: true },
          overallRating: { type: 'number', nullable: true },
        },
      },
    },
  })
  findAll(): Promise<Thread[]> {
    return this.threadsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a thread by ID' })
  @ApiParam({
    name: 'id',
    description: 'Thread ID',
    type: 'string',
    format: 'uuid',
    required: true,
  })
  @ApiOkResponse({
    description: 'Thread details retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        type: { type: 'string', enum: ['COURSE_REVIEW', 'LESSON_DISCUSSION'] },
        resourceId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        deletedAt: { type: 'string', format: 'date-time', nullable: true },
        overallRating: { type: 'number', nullable: true },
        posts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              threadId: { type: 'string', format: 'uuid' },
              parentId: { type: 'string', format: 'uuid', nullable: true },
              authorId: { type: 'string' },
              content: { type: 'string' },
              rating: { type: 'number', nullable: true },
              isEdited: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              deletedAt: {
                type: 'string',
                format: 'date-time',
                nullable: true,
              },
              totalRepliesCount: { type: 'number' },
              reactionCounts: {
                type: 'object',
                properties: {
                  LIKE: { type: 'number' },
                  LOVE: { type: 'number' },
                  CARE: { type: 'number' },
                  HAHA: { type: 'number' },
                  WOW: { type: 'number' },
                  SAD: { type: 'number' },
                  ANGRY: { type: 'number' },
                },
              },
            },
          },
        },
        _count: {
          type: 'object',
          properties: {
            posts: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Thread not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Thread> {
    return this.threadsService.findOne(id);
  }

  @Get(':id/posts')
  @ApiOperation({ summary: 'Get posts for a thread' })
  @ApiParam({
    name: 'id',
    description: 'Thread ID',
    type: 'string',
    format: 'uuid',
    required: true,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number',
    type: 'number',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of posts per page',
    type: 'number',
    required: false,
  })
  @ApiOkResponse({
    description: 'Thread posts retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          threadId: { type: 'string', format: 'uuid' },
          parentId: { type: 'string', format: 'uuid', nullable: true },
          authorId: { type: 'string' },
          content: { type: 'string' },
          rating: { type: 'number', nullable: true },
          isEdited: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          deletedAt: { type: 'string', format: 'date-time', nullable: true },
          totalRepliesCount: { type: 'number' },
          reactionCounts: {
            type: 'object',
            properties: {
              LIKE: { type: 'number' },
              LOVE: { type: 'number' },
              CARE: { type: 'number' },
              HAHA: { type: 'number' },
              WOW: { type: 'number' },
              SAD: { type: 'number' },
              ANGRY: { type: 'number' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Thread not found' })
  findThreadPosts(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page', ParseIntPipe) page?: number,
    @Query('limit', ParseIntPipe) limit?: number,
  ) {
    return this.threadsService.findThreadPosts(id, page, limit);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a thread' })
  @ApiParam({
    name: 'id',
    description: 'Thread ID',
    type: 'string',
    format: 'uuid',
    required: true,
  })
  @ApiResponse({
    headers: {
      'X-User-Id': {
        description: 'User ID from authentication',
        schema: { type: 'string' },
      },
    },
  })
  @ApiBody({ type: UpdateThreadDto, description: 'Thread update data' })
  @ApiOkResponse({
    description: 'Thread has been successfully updated',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        type: { type: 'string', enum: ['COURSE_REVIEW', 'LESSON_DISCUSSION'] },
        resourceId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        deletedAt: { type: 'string', format: 'date-time', nullable: true },
        overallRating: { type: 'number', nullable: true },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Thread not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateThreadDto: UpdateThreadDto,
    @Headers('X-User-Id') requestUserId?: string, // Capture user ID from headers for future authorization/auditing
  ): Promise<Thread> {
    // Hiện tại chưa sử dụng requestUserId, nhưng trong tương lai có thể cần:
    // 1. Kiểm tra xem người dùng có quyền cập nhật thread này không
    // 2. Ghi log hoạt động của người dùng
    // 3. Thực hiện các kiểm tra bảo mật khác

    return this.threadsService.update(id, updateThreadDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a thread' })
  @ApiParam({
    name: 'id',
    description: 'Thread ID',
    type: 'string',
    format: 'uuid',
    required: true,
  })
  @ApiResponse({
    headers: {
      'X-User-Id': {
        description: 'User ID from authentication',
        schema: { type: 'string' },
      },
    },
  })
  @ApiNoContentResponse({ description: 'Thread has been successfully deleted' })
  @ApiResponse({ status: 404, description: 'Thread not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-User-Id') requestUserId?: string, // Capture user ID from headers for future authorization/auditing
  ): Promise<void> {
    // Hiện tại chưa sử dụng requestUserId, nhưng trong tương lai có thể cần:
    // 1. Kiểm tra xem người dùng có quyền xóa thread này không
    // 2. Ghi log hoạt động của người dùng
    // 3. Thực hiện các kiểm tra bảo mật khác

    await this.threadsService.remove(id);
  }
}
