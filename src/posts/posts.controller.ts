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

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('check-review')
  hasUserReviewedCourse(
    @Query('courseId', ParseUUIDPipe) courseId: string,
    @Query('authorId', ParseUUIDPipe) authorId: string,
  ): Promise<{ hasReviewed: boolean; reviewId?: string }> {
    return this.postsService.hasUserReviewedCourse(courseId, authorId);
  }

  @Post()
  create(
    @Body() createPostDto: CreatePostDto,
    @Query('authorId', ParseUUIDPipe) authorId: string,
  ) {
    return this.postsService.create(authorId, createPostDto);
  }

  @Get(':id/replies')
  findReplies(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page', ParseIntPipe) page?: number,
    @Query('limit', ParseIntPipe) limit?: number,
  ): Promise<PostWithTotalReplies[]> {
    return this.postsService.findReplies(id, page, limit);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includeDeleted', new ParseBoolPipe({ optional: true }))
    includeDeleted = false,
  ): Promise<PostWithTotalReplies> {
    return this.postsService.findOne(id, includeDeleted);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Query('authorId', ParseUUIDPipe) authorId: string,
  ): Promise<PostWithTotalReplies> {
    return this.postsService.update(id, authorId, updatePostDto);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('authorId', ParseUUIDPipe) authorId: string,
  ) {
    return this.postsService.remove(id, authorId);
  }
}
