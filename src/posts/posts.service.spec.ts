/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { PrismaClient } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';

type MockPrismaClient = {
  post: {
    findMany: jest.Mock<Promise<any>, any[]>;
    findFirst: jest.Mock<Promise<any>, any[]>;
    findUnique: jest.Mock<Promise<any>, any[]>;
    create: jest.Mock<Promise<any>, any[]>;
    update: jest.Mock<Promise<any>, any[]>;
    count: jest.Mock<Promise<number>, any[]>;
  };
  thread: {
    findUnique: jest.Mock<Promise<any>, any[]>;
  };
};

describe('PostsService', () => {
  let service: PostsService;

  const mockPrisma = {
    post: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    thread: {
      findUnique: jest.fn(),
    },
  } as MockPrismaClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PrismaClient,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPostsByThreadId', () => {
    it('should return posts with pagination', async () => {
      const mockPosts = [{ id: 1, content: 'Test post' }];
      mockPrisma.post.findMany.mockResolvedValue(mockPosts);
      mockPrisma.post.count.mockResolvedValue(1);

      const result = await service.getPostsByThreadId(1, {});

      expect(result).toEqual({
        data: mockPosts,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it('should handle parentId filter', async () => {
      await service.getPostsByThreadId(1, { parentId: 2 });

      expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            parentId: 2,
          } as Record<string, unknown>),
        } as Record<string, unknown>),
      );
    });
  });

  describe('getPostById', () => {
    it('should return a post when found', async () => {
      const mockPost = { id: 1, content: 'Test post' };
      mockPrisma.post.findFirst.mockResolvedValue(mockPost);

      const result = await service.getPostById(1);

      expect(result).toEqual(mockPost);
    });

    it('should throw NotFoundException when post not found', async () => {
      mockPrisma.post.findFirst.mockResolvedValue(null);

      await expect(service.getPostById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createPost', () => {
    const createPostData = {
      content: 'Test content',
      authorId: 'user1',
    };

    it('should create a post successfully', async () => {
      const mockThread = { id: 1, title: 'Test Thread' };
      const mockPost = { id: 1, ...createPostData };

      mockPrisma.thread.findUnique.mockResolvedValue(mockThread);
      mockPrisma.post.create.mockResolvedValue(mockPost);

      const result = await service.createPost(1, createPostData);

      expect(result).toEqual(mockPost);
    });

    it('should throw NotFoundException when thread not found', async () => {
      mockPrisma.thread.findUnique.mockResolvedValue(null);

      await expect(service.createPost(1, createPostData)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should validate parent post when parentId provided', async () => {
      const mockThread = { id: 1, title: 'Test Thread' };
      mockPrisma.thread.findUnique.mockResolvedValue(mockThread);
      mockPrisma.post.findFirst.mockResolvedValue(null);

      await expect(
        service.createPost(1, { ...createPostData, parentId: 999 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updatePost', () => {
    const updateData = { content: 'Updated content' };

    it('should update post successfully', async () => {
      const mockPost = {
        id: 1,
        authorId: 'user1',
        content: 'Original content',
      };
      const updatedPost = { ...mockPost, ...updateData, isEdited: true };

      mockPrisma.post.findFirst.mockResolvedValue(mockPost);
      mockPrisma.post.update.mockResolvedValue(updatedPost);

      const result = await service.updatePost(1, 'user1', updateData);

      expect(result).toEqual(updatedPost);
    });

    it('should throw NotFoundException when post not found', async () => {
      mockPrisma.post.findFirst.mockResolvedValue(null);

      await expect(service.updatePost(1, 'user1', updateData)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when user is not author', async () => {
      const mockPost = {
        id: 1,
        authorId: 'user2',
        content: 'Original content',
      };
      mockPrisma.post.findFirst.mockResolvedValue(mockPost);

      await expect(service.updatePost(1, 'user1', updateData)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deletePost', () => {
    it('should soft delete post successfully', async () => {
      const mockPost = { id: 1, authorId: 'user1', content: 'Test content' };
      const deletedPost = { ...mockPost, deletedAt: new Date() };

      mockPrisma.post.findFirst.mockResolvedValue(mockPost);
      mockPrisma.post.update.mockResolvedValue(deletedPost);

      const result = await service.deletePost(1, 'user1');

      expect(result).toEqual(deletedPost);
      expect(mockPrisma.post.update).toHaveBeenCalledWith({
        where: { id: 1 },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: expect.objectContaining({
          deletedAt: expect.any(Date),
        } as Record<string, unknown>),
      });
    });

    it('should throw NotFoundException when post not found', async () => {
      mockPrisma.post.findFirst.mockResolvedValue(null);

      await expect(service.deletePost(1, 'user1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when user is not author', async () => {
      const mockPost = { id: 1, authorId: 'user2', content: 'Test content' };
      mockPrisma.post.findFirst.mockResolvedValue(mockPost);

      await expect(service.deletePost(1, 'user1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
