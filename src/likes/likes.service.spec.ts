import { Test, TestingModule } from '@nestjs/testing';
import { LikesService } from './likes.service';
import { PrismaClient } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('LikesService', () => {
  let service: LikesService;

  const mockPrisma = {
    like: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    post: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikesService,
        {
          provide: PrismaClient,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<LikesService>(LikesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getLikesForPost', () => {
    it('should return likes with pagination', async () => {
      const mockLikes = [{ id: 1, postId: 1, userId: 'user1' }];
      mockPrisma.like.findMany.mockResolvedValue(mockLikes);
      mockPrisma.like.count.mockResolvedValue(1);

      const result = await service.getLikesForPost(1, { page: 1, limit: 10 });

      expect(result).toEqual({
        data: mockLikes,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });
  });

  describe('getLikeCount', () => {
    it('should return like count', async () => {
      mockPrisma.like.count.mockResolvedValue(5);

      const result = await service.getLikeCount(1);

      expect(result).toEqual({ count: 5 });
    });
  });

  describe('createLike', () => {
    it('should create a like', async () => {
      const mockPost = { id: 1, title: 'Test Post' };
      const mockLike = { id: 1, postId: 1, userId: 'user1' };

      mockPrisma.post.findFirst.mockResolvedValue(mockPost);
      mockPrisma.like.findUnique.mockResolvedValue(null);
      mockPrisma.like.create.mockResolvedValue(mockLike);

      const result = await service.createLike(1, 'user1');

      expect(result).toEqual(mockLike);
    });

    it('should throw NotFoundException if post not found', async () => {
      mockPrisma.post.findFirst.mockResolvedValue(null);

      await expect(service.createLike(1, 'user1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if like already exists', async () => {
      const mockPost = { id: 1, title: 'Test Post' };
      const existingLike = { id: 1, postId: 1, userId: 'user1' };

      mockPrisma.post.findFirst.mockResolvedValue(mockPost);
      mockPrisma.like.findUnique.mockResolvedValue(existingLike);

      await expect(service.createLike(1, 'user1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deleteLike', () => {
    it('should delete a like', async () => {
      const mockLike = { id: 1, postId: 1, userId: 'user1' };
      mockPrisma.like.findUnique.mockResolvedValue(mockLike);
      mockPrisma.like.delete.mockResolvedValue(mockLike);

      const result = await service.deleteLike(1, 'user1');

      expect(result).toEqual(mockLike);
    });

    it('should throw NotFoundException if like not found', async () => {
      mockPrisma.like.findUnique.mockResolvedValue(null);

      await expect(service.deleteLike(1, 'user1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('hasUserLikedPost', () => {
    it('should return true if user liked post', async () => {
      const mockLike = { id: 1, postId: 1, userId: 'user1' };
      mockPrisma.like.findUnique.mockResolvedValue(mockLike);

      const result = await service.hasUserLikedPost(1, 'user1');

      expect(result).toBe(true);
    });

    it('should return false if user has not liked post', async () => {
      mockPrisma.like.findUnique.mockResolvedValue(null);

      const result = await service.hasUserLikedPost(1, 'user1');

      expect(result).toBe(false);
    });
  });
});
