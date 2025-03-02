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
  @ApiCreatedResponse({
    description: 'The thread has been successfully created',
    schema: {
      type: 'object',
      properties: {
        // Define Thread properties here based on your Prisma model
        id: { type: 'string', format: 'uuid' },
        title: { type: 'string' },
        // Add other Thread properties as needed
      },
    },
  })
  create(@Body() createThreadDto: CreateThreadDto): Promise<Thread> {
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
          // Define Thread properties here
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          // Add other Thread properties as needed
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
        // Define Thread properties here
        id: { type: 'string', format: 'uuid' },
        title: { type: 'string' },
        // Add other Thread properties as needed
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
          // Define post properties here
          id: { type: 'string', format: 'uuid' },
          content: { type: 'string' },
          // Add other post properties as needed
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
  @ApiBody({ type: UpdateThreadDto, description: 'Thread update data' })
  @ApiOkResponse({
    description: 'Thread has been successfully updated',
    schema: {
      type: 'object',
      properties: {
        // Define Thread properties here
        id: { type: 'string', format: 'uuid' },
        title: { type: 'string' },
        // Add other Thread properties as needed
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Thread not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateThreadDto: UpdateThreadDto,
  ): Promise<Thread> {
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
  @ApiNoContentResponse({ description: 'Thread has been successfully deleted' })
  @ApiResponse({ status: 404, description: 'Thread not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.threadsService.remove(id);
  }
}
