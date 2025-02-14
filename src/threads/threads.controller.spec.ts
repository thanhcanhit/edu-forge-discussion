/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ThreadsController } from './threads.controller';
import { ThreadsService } from './threads.service';
import { DiscussionType } from '@prisma/client';

describe('ThreadsController', () => {
  let controller: ThreadsController;
  let service: ThreadsService;

  const mockThreadsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ThreadsController],
      providers: [
        {
          provide: ThreadsService,
          useValue: mockThreadsService,
        },
      ],
    }).compile();

    controller = module.get<ThreadsController>(ThreadsController);
    service = module.get<ThreadsService>(ThreadsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return threads with pagination', async () => {
      const mockResult = {
        threads: [{ id: 1, title: 'Test thread' }],
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      mockThreadsService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(
        DiscussionType.COURSE_REVIEW,
        '123',
        '456',
        1,
        10,
      );

      expect(result).toEqual(mockResult);
      expect(service.findAll).toHaveBeenCalledWith({
        type: DiscussionType.COURSE_REVIEW,
        courseId: '123',
        lessonId: '456',
        page: 1,
        limit: 10,
      });
    });
  });

  describe('findOne', () => {
    it('should return a single thread', async () => {
      const mockThread = { id: 1, title: 'Test thread' };
      mockThreadsService.findOne.mockResolvedValue(mockThread);

      const result = await controller.findOne(1, true);

      expect(result).toEqual(mockThread);
      expect(service.findOne).toHaveBeenCalledWith(1, true);
    });
  });

  describe('create', () => {
    it('should create a new thread', async () => {
      const createThreadDto = {
        type: DiscussionType.COURSE_REVIEW,
        initialPost: {
          content: 'Test content',
          authorId: 'user1',
        },
      };
      const mockThread = { id: 1, ...createThreadDto };
      mockThreadsService.create.mockResolvedValue(mockThread);

      const result = await controller.create(createThreadDto);

      expect(result).toEqual(mockThread);
      expect(service.create).toHaveBeenCalledWith(createThreadDto);
    });
  });

  describe('update', () => {
    it('should update a thread', async () => {
      const updateData = {
        type: DiscussionType.COURSE_REVIEW,
        courseId: '123',
      };
      const mockThread = { id: 1, ...updateData };
      mockThreadsService.update.mockResolvedValue(mockThread);

      const result = await controller.update(1, updateData);

      expect(result).toEqual(mockThread);
      expect(service.update).toHaveBeenCalledWith(1, updateData);
    });
  });

  describe('remove', () => {
    it('should remove a thread', async () => {
      const mockThread = {
        id: 1,
        title: 'Test thread',
        deletedAt: new Date(),
      };
      mockThreadsService.softDelete.mockResolvedValue(mockThread);

      const result = await controller.remove(1);

      expect(result).toEqual(mockThread);
      expect(service.softDelete).toHaveBeenCalledWith(1);
    });
  });
});
