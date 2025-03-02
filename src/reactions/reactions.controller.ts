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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';

@ApiTags('reactions')
@Controller('reactions')
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new reaction' })
  @ApiBody({
    type: CreateReactionDto,
    description: 'Reaction creation data',
  })
  @ApiCreatedResponse({
    description: 'The reaction has been successfully created',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        type: {
          type: 'string',
          enum: Object.values(ReactionType),
        },
        userId: { type: 'string', format: 'uuid' },
        postId: { type: 'string', format: 'uuid' },
        // Add other reaction properties as needed
      },
    },
  })
  create(@Body() createReactionDto: CreateReactionDto) {
    return this.reactionsService.create(createReactionDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a reaction by ID' })
  @ApiParam({
    name: 'id',
    description: 'Reaction ID',
    type: 'string',
    format: 'uuid',
    required: true,
  })
  @ApiOkResponse({
    description: 'Reaction details retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        type: {
          type: 'string',
          enum: Object.values(ReactionType),
        },
        userId: { type: 'string', format: 'uuid' },
        postId: { type: 'string', format: 'uuid' },
        // Add other reaction properties as needed
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Reaction not found' })
  findOne(@Param('id') id: string) {
    return this.reactionsService.findOne(id);
  }

  @Get('post/:id')
  @ApiOperation({ summary: 'Get all reactions for a post' })
  @ApiParam({
    name: 'id',
    description: 'Post ID',
    type: 'string',
    format: 'uuid',
    required: true,
  })
  @ApiOkResponse({
    description: 'Reactions for the post retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          type: {
            type: 'string',
            enum: Object.values(ReactionType),
          },
          userId: { type: 'string', format: 'uuid' },
          postId: { type: 'string', format: 'uuid' },
          // Add other reaction properties as needed
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  findByPostId(@Param('id') id: string) {
    return this.reactionsService.findByPostId(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a reaction' })
  @ApiParam({
    name: 'id',
    description: 'Reaction ID',
    type: 'string',
    format: 'uuid',
    required: true,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: Object.values(ReactionType),
        },
      },
      required: ['type'],
    },
  })
  @ApiOkResponse({
    description: 'Reaction has been successfully updated',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        type: {
          type: 'string',
          enum: Object.values(ReactionType),
        },
        userId: { type: 'string', format: 'uuid' },
        postId: { type: 'string', format: 'uuid' },
        // Add other reaction properties as needed
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Reaction not found' })
  update(@Param('id') id: string, @Body('type') type: ReactionType) {
    return this.reactionsService.update(id, type);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a reaction' })
  @ApiParam({
    name: 'id',
    description: 'Reaction ID',
    type: 'string',
    format: 'uuid',
    required: true,
  })
  @ApiNoContentResponse({
    description: 'Reaction has been successfully deleted',
  })
  @ApiResponse({ status: 404, description: 'Reaction not found' })
  remove(@Param('id') id: string) {
    return this.reactionsService.remove(id);
  }
}
