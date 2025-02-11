import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DiscussionType, Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class ThreadsService {
  constructor(private prisma: PrismaClient) {}

  async findAll({
    type,
    courseId,
    lessonId,
    page,
    limit,
  }: {
    type?: DiscussionType;
    courseId?: string;
    lessonId?: string;
    page: number;
    limit: number;
  }) {
    const where: Prisma.ThreadWhereInput = {
      deletedAt: null,
      ...(type && { type }),
      ...(courseId && { courseId }),
      ...(lessonId && { lessonId }),
    };

    const [threads, total] = await Promise.all([
      this.prisma.thread.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: { posts: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.thread.count({ where }),
    ]);

    return {
      threads,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, includePosts = false) {
    const thread = await this.prisma.thread.findFirst({
      where: { id, deletedAt: null },
      include: {
        ...(includePosts && {
          posts: {
            where: { deletedAt: null },
            orderBy: { createdAt: 'asc' },
          },
        }),
      },
    });

    if (!thread) {
      throw new NotFoundException(`Thread #${id} not found`);
    }

    return thread;
  }

  async create({
    type,
    courseId,
    lessonId,
    initialPost,
  }: {
    type: DiscussionType;
    courseId?: string;
    lessonId?: string;
    initialPost?: {
      content: string;
      authorId: string;
      rating?: number;
    };
  }) {
    // Validate input based on thread type
    if (type === DiscussionType.COURSE_REVIEW && !courseId) {
      throw new BadRequestException('courseId is required for course reviews');
    }
    if (type === DiscussionType.LESSON_DISCUSSION && !lessonId) {
      throw new BadRequestException(
        'lessonId is required for lesson discussions',
      );
    }

    // Create thread and initial post in a transaction
    return this.prisma.$transaction(async (tx) => {
      const thread = await tx.thread.create({
        data: {
          type,
          courseId,
          lessonId,
        },
      });

      if (initialPost) {
        await tx.post.create({
          data: {
            threadId: thread.id,
            content: initialPost.content,
            authorId: initialPost.authorId,
            rating:
              type === DiscussionType.COURSE_REVIEW
                ? initialPost.rating
                : undefined,
          },
        });
      }

      return this.findOne(thread.id, true);
    });
  }

  async update(
    id: number,
    data: {
      type?: DiscussionType;
      courseId?: string;
      lessonId?: string;
    },
  ) {
    const thread = await this.findOne(id);

    // Validate update data based on thread type
    if (
      data.type === DiscussionType.COURSE_REVIEW &&
      !data.courseId &&
      !thread.courseId
    ) {
      throw new BadRequestException('courseId is required for course reviews');
    }
    if (
      data.type === DiscussionType.LESSON_DISCUSSION &&
      !data.lessonId &&
      !thread.lessonId
    ) {
      throw new BadRequestException(
        'lessonId is required for lesson discussions',
      );
    }

    return this.prisma.thread.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: number) {
    return this.prisma.thread.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
