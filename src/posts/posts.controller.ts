import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseBoolPipe,
  ParseIntPipe,
  Headers,
  BadRequestException,
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
    @Query('courseId') courseId: string,
    @Query('authorId') authorId: string,
  ): Promise<{ hasReviewed: boolean; reviewId?: string }> {
    if (!courseId || !authorId) {
      throw new BadRequestException('Both courseId and authorId are required');
    }
    return this.postsService.hasUserReviewedCourse(courseId, authorId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiQuery({
    name: 'authorId',
    description:
      'Author ID of the post (optional if X-User-Id header is provided)',
    type: 'string',
    required: false,
  })
  @ApiBody({
    type: CreatePostDto,
    description: 'Post creation data',
  })
  @ApiResponse({
    headers: {
      'X-User-Id': {
        description: 'User ID from authentication',
        schema: { type: 'string' },
      },
    },
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
    @Query('authorId') queryAuthorId?: string,
    @Headers('X-User-Id') headerUserId?: string,
  ) {
    // Use the header user ID if available, otherwise fall back to query parameter
    const authorId = headerUserId || queryAuthorId;

    if (!authorId) {
      throw new BadRequestException(
        'Author ID is required. Provide it either via X-User-Id header or authorId query parameter.',
      );
    }

    return this.postsService.create(authorId, createPostDto);
  }

  @Get(':id/replies')
  @ApiOperation({ summary: 'Get replies for a post' })
  @ApiParam({
    name: 'id',
    description: 'Post ID',
    type: 'string',
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
          id: { type: 'string' },
          content: { type: 'string' },
          // Include other post properties
          totalReplies: { type: 'number' },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  findReplies(
    @Param('id') id: string,
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
        id: { type: 'string' },
        content: { type: 'string' },
        title: { type: 'string' },
        // Include other post properties
        totalReplies: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  findOne(
    @Param('id') id: string,
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
    required: true,
  })
  @ApiQuery({
    name: 'authorId',
    description:
      'Author ID for authorization (optional if X-User-Id header is provided)',
    type: 'string',
    required: false,
  })
  @ApiBody({
    type: UpdatePostDto,
    description: 'Post update data',
  })
  @ApiResponse({
    headers: {
      'X-User-Id': {
        description: 'User ID from authentication',
        schema: { type: 'string' },
      },
    },
  })
  @ApiOkResponse({
    description: 'Post has been successfully updated',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
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
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Query('authorId') queryAuthorId?: string,
    @Headers('X-User-Id') headerUserId?: string,
  ): Promise<PostWithTotalReplies> {
    // Use the header user ID if available, otherwise fall back to query parameter
    const authorId = headerUserId || queryAuthorId;

    if (!authorId) {
      throw new BadRequestException(
        'Author ID is required. Provide it either via X-User-Id header or authorId query parameter.',
      );
    }

    return this.postsService.update(id, authorId, updatePostDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a post' })
  @ApiParam({
    name: 'id',
    description: 'Post ID',
    type: 'string',
    required: true,
  })
  @ApiQuery({
    name: 'authorId',
    description:
      'Author ID for authorization (optional if X-User-Id header is provided)',
    type: 'string',
    required: false,
  })
  @ApiResponse({
    headers: {
      'X-User-Id': {
        description: 'User ID from authentication',
        schema: { type: 'string' },
      },
    },
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
    @Param('id') id: string,
    @Query('authorId') queryAuthorId?: string,
    @Headers('X-User-Id') headerUserId?: string,
  ) {
    // Use the header user ID if available, otherwise fall back to query parameter
    const authorId = headerUserId || queryAuthorId;

    if (!authorId) {
      throw new BadRequestException(
        'Author ID is required. Provide it either via X-User-Id header or authorId query parameter.',
      );
    }

    return this.postsService.remove(id, authorId);
  }
}
