import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  ParseBoolPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostWithTotalReplies } from './interfaces/post.interface';
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

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('check-review')
  @ApiOperation({ summary: 'Check if a user has reviewed a specific course' })
  @ApiQuery({
    name: 'courseId',
    description: 'Course ID to check for review',
    type: 'string',
    format: 'uuid',
    required: true,
  })
  @ApiQuery({
    name: 'authorId',
    description: 'User ID to check for review',
    type: 'string',
    required: true,
  })
  @ApiOkResponse({
    description: 'Successfully checked if user has reviewed the course',
    schema: {
      type: 'object',
      properties: {
        hasReviewed: { type: 'boolean' },
        reviewId: {
          type: 'string',
          format: 'uuid',
          nullable: true,
        },
      },
    },
  })
  hasUserReviewedCourse(
    @Query('courseId', ParseUUIDPipe) courseId: string,
    @Query('authorId') authorId: string,
  ): Promise<{ hasReviewed: boolean; reviewId?: string }> {
    return this.postsService.hasUserReviewedCourse(courseId, authorId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiQuery({
    name: 'authorId',
    description: 'Author ID of the post',
    type: 'string',
    required: true,
  })
  @ApiBody({
    type: CreatePostDto,
    description: 'Post creation data',
  })
  @ApiCreatedResponse({
    description: 'The post has been successfully created',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        content: { type: 'string' },
        title: { type: 'string' },
        // Add other post properties as needed
      },
    },
  })
  create(
    @Body() createPostDto: CreatePostDto,
    @Query('authorId') authorId: string,
  ) {
    return this.postsService.create(authorId, createPostDto);
  }

  @Get(':id/replies')
  @ApiOperation({ summary: 'Get replies for a post' })
  @ApiParam({
    name: 'id',
    description: 'Post ID',
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
    description: 'Number of replies per page',
    type: 'number',
    required: false,
  })
  @ApiOkResponse({
    description: 'Post replies retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          content: { type: 'string' },
          // Include other post properties
          totalReplies: { type: 'number' },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  findReplies(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page', ParseIntPipe) page?: number,
    @Query('limit', ParseIntPipe) limit?: number,
  ): Promise<PostWithTotalReplies[]> {
    return this.postsService.findReplies(id, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a post by ID' })
  @ApiParam({
    name: 'id',
    description: 'Post ID',
    type: 'string',
    format: 'uuid',
    required: true,
  })
  @ApiQuery({
    name: 'includeDeleted',
    description: 'Whether to include deleted posts',
    type: 'boolean',
    required: false,
  })
  @ApiOkResponse({
    description: 'Post details retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        content: { type: 'string' },
        title: { type: 'string' },
        // Include other post properties
        totalReplies: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includeDeleted', new ParseBoolPipe({ optional: true }))
    includeDeleted = false,
  ): Promise<PostWithTotalReplies> {
    return this.postsService.findOne(id, includeDeleted);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a post' })
  @ApiParam({
    name: 'id',
    description: 'Post ID',
    type: 'string',
    format: 'uuid',
    required: true,
  })
  @ApiQuery({
    name: 'authorId',
    description: 'Author ID for authorization',
    type: 'string',
    required: true,
  })
  @ApiBody({
    type: UpdatePostDto,
    description: 'Post update data',
  })
  @ApiOkResponse({
    description: 'Post has been successfully updated',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        content: { type: 'string' },
        title: { type: 'string' },
        // Include other post properties
        totalReplies: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not the author',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Query('authorId') authorId: string,
  ): Promise<PostWithTotalReplies> {
    return this.postsService.update(id, authorId, updatePostDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a post' })
  @ApiParam({
    name: 'id',
    description: 'Post ID',
    type: 'string',
    format: 'uuid',
    required: true,
  })
  @ApiQuery({
    name: 'authorId',
    description: 'Author ID for authorization',
    type: 'string',
    required: true,
  })
  @ApiNoContentResponse({
    description: 'Post has been successfully deleted',
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not the author',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('authorId') authorId: string,
  ) {
    return this.postsService.remove(id, authorId);
  }
}
