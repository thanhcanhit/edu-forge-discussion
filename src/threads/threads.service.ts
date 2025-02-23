import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateThreadDto } from './dto/create-thread.dto';
import { UpdateThreadDto } from './dto/update-thread.dto';
import { PrismaClient, Thread } from '@prisma/client';

@Injectable()
export class ThreadsService {
  constructor(private prisma: PrismaClient) {}

  async create(createThreadDto: CreateThreadDto): Promise<Thread> {
    return this.prisma.thread.create({
      data: createThreadDto,
    });
  }

  async findAll(): Promise<Thread[]> {
    return this.prisma.thread.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<Thread> {
    const thread = await this.prisma.thread.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
        posts: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
    });

    if (!thread || thread.deletedAt) {
      throw new NotFoundException(`Thread with ID ${id} not found`);
    }

    return thread;
  }

  async update(id: string, updateThreadDto: UpdateThreadDto): Promise<Thread> {
    await this.findOne(id); // Verify thread exists and is not deleted

    return this.prisma.thread.update({
      where: { id },
      data: updateThreadDto,
    });
  }

  async remove(id: string): Promise<Thread> {
    await this.findOne(id); // Verify thread exists and is not deleted

    return this.prisma.thread.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async findThreadPosts(threadId: string, page = 1, limit = 10) {
    const thread = await this.findOne(threadId);

    if (!thread) {
      throw new NotFoundException(`Thread with ID ${threadId} not found`);
    }

    return this.prisma.post.findMany({
      where: {
        threadId: thread.id,
        deletedAt: null,
        parentId: null, // Get only top-level posts
      },
      take: limit,
      skip: (page - 1) * limit,
      include: {
        _count: {
          select: {
            replies: true,
          },
        },
        reactions: {
          omit: {
            userId: true,
            type: true,
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
