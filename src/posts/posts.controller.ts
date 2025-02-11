import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('thread/:threadId')
  async getPostsByThreadId(
    @Param('threadId', ParseIntPipe) threadId: number,
    @Query('parentId') parentId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.postsService.getPostsByThreadId(threadId, {
      parentId: parentId ? parseInt(parentId, 10) : undefined,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':id')
  async getPostById(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostById(id);
  }

  @Post('thread/:threadId')
  async createPost(
    @Param('threadId', ParseIntPipe) threadId: number,
    @Body()
    data: {
      content: string;
      authorId: string;
      parentId?: number;
      rating?: number;
    },
  ) {
    return this.postsService.createPost(threadId, data);
  }

  @Put(':id')
  async updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { content: string; authorId: string; rating?: number },
  ) {
    return this.postsService.updatePost(id, data.authorId, {
      content: data.content,
      rating: data.rating,
    });
  }

  @Delete(':id')
  async deletePost(
    @Param('id', ParseIntPipe) id: number,
    @Body('authorId') authorId: string,
  ) {
    return this.postsService.deletePost(id, authorId);
  }
}
