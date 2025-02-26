import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { ReactionType } from '@prisma/client';

@Controller('reactions')
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @Post()
  create(@Body() createReactionDto: CreateReactionDto) {
    return this.reactionsService.create(createReactionDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reactionsService.findOne(id);
  }

  @Get('post/:id')
  findByPostId(@Param('id') id: string) {
    return this.reactionsService.findByPostId(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body('type') type: ReactionType) {
    return this.reactionsService.update(id, type);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reactionsService.remove(id);
  }
}
