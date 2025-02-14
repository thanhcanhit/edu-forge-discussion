/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { ThreadsService } from './threads.service';
import { PrismaClient, DiscussionType } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';

type MockPrismaClient = {
  thread: {
    findMany: jest.Mock<Promise<any>, any[]>;
    findFirst: jest.Mock<Promise<any>, any[]>;
    create: jest.Mock<Promise<any>, any[]>;
    update: jest.Mock<Promise<any>, any[]>;
    count: jest.Mock<Promise<number>, any[]>;
  };
  post: {
    create: jest.Mock<Promise<any>, any[]>;
  };
  $transaction: jest.Mock<Promise<any>, any[]>;
};

describe('ThreadsService', () => {
  let service: ThreadsService;

  const mockPrisma = {
    thread: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    post: {
      create: jest.fn(),
    },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  } as MockPrismaClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThreadsService,
        {
          provide: PrismaClient,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<ThreadsService>(ThreadsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return threads with pagination', async () => {
      const mockThreads = [{ id: 1, title: 'Test thread' }];
      mockPrisma.thread.findMany.mockResolvedValue(mockThreads);
      mockPrisma.thread.count.mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual({
        threads: mockThreads,
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it('should apply filters correctly', async () => {
      await service.findAll({
        type: DiscussionType.COURSE_REVIEW,
        courseId: '123',
        page: 1,
        limit: 10,
      });

      expect(mockPrisma.thread.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: DiscussionType.COURSE_REVIEW,
            courseId: '123',
          } as Record<string, unknown>),
        } as Record<string, unknown>),
      );
    });
  });

  describe('findOne', () => {
    it('should return a thread when found', async () => {
      const mockThread = { id: 1, title: 'Test thread' };
      mockPrisma.thread.findFirst.mockResolvedValue(mockThread);

      const result = await service.findOne(1);

      expect(result).toEqual(mockThread);
    });

    it('should include posts when requested', async () => {
      await service.findOne(1, true);

      expect(mockPrisma.thread.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            posts: expect.any(Object),
          } as Record<string, unknown>),
        } as Record<string, unknown>),
      );
    });

    it('should throw NotFoundException when thread not found', async () => {
      mockPrisma.thread.findFirst.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a thread with initial post', async () => {
      const mockThread = { id: 1, type: DiscussionType.COURSE_REVIEW };
      mockPrisma.thread.create.mockResolvedValue(mockThread);
      mockPrisma.thread.findFirst.mockResolvedValue({
        ...mockThread,
        posts: [],
      });

      const result = await service.create({
        type: DiscussionType.COURSE_REVIEW,
        initialPost: {
          content: 'Test content',
          authorId: 'user1',
        },
      });

      expect(result).toEqual({ ...mockThread, posts: [] });
    });

    it('should validate course review thread', async () => {
      await expect(
        service.create({
          type: DiscussionType.COURSE_REVIEW,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should validate lesson discussion thread', async () => {
      await expect(
        service.create({
          type: DiscussionType.LESSON_DISCUSSION,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update thread successfully', async () => {
      const mockThread = {
        id: 1,
        type: DiscussionType.COURSE_REVIEW,
        courseId: null,
      };
      mockPrisma.thread.findFirst.mockResolvedValue(mockThread);
      mockPrisma.thread.update.mockResolvedValue({
        ...mockThread,
        type: DiscussionType.COURSE_REVIEW,
        courseId: '123',
      });

      const result = await service.update(1, {
        type: DiscussionType.COURSE_REVIEW,
        courseId: '123',
      });

      expect(result.type).toBe(DiscussionType.COURSE_REVIEW);
      expect(result.courseId).toBe('123');
    });

    it('should validate course review update', async () => {
      mockPrisma.thread.findFirst.mockResolvedValue({
        id: 1,
        type: DiscussionType.COURSE_REVIEW,
      });

      await expect(
        service.update(1, {
          type: DiscussionType.COURSE_REVIEW,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('softDelete', () => {
    it('should soft delete thread', async () => {
      const mockThread = { id: 1, title: 'Test thread' };
      const deletedThread = { ...mockThread, deletedAt: new Date() };
      mockPrisma.thread.update.mockResolvedValue(deletedThread);

      const result = await service.softDelete(1);

      expect(result).toEqual(deletedThread);
      expect(mockPrisma.thread.update).toHaveBeenCalledWith({
        where: { id: 1 },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: expect.objectContaining({
          deletedAt: expect.any(Date),
        } as Record<string, unknown>),
      });
    });
  });
});
