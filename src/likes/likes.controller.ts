import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  Body,
} from '@nestjs/common';
import { LikesService } from './likes.service';

@Controller('posts/:postId/likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Get()
  async getLikesForPost(
    @Param('postId', ParseIntPipe) postId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.likesService.getLikesForPost(postId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('count')
  async getLikeCount(@Param('postId', ParseIntPipe) postId: number) {
    return this.likesService.getLikeCount(postId);
  }

  @Post()
  async createLike(
    @Param('postId', ParseIntPipe) postId: number,
    @Body('userId') userId: string,
  ) {
    return this.likesService.createLike(postId, userId);
  }

  @Delete()
  async deleteLike(
    @Param('postId', ParseIntPipe) postId: number,
    @Body('userId') userId: string,
  ) {
    return this.likesService.deleteLike(postId, userId);
  }

  @Get('check')
  async checkUserLike(
    @Param('postId', ParseIntPipe) postId: number,
    @Query('userId') userId: string,
  ) {
    return {
      hasLiked: await this.likesService.hasUserLikedPost(postId, userId),
    };
  }
}
