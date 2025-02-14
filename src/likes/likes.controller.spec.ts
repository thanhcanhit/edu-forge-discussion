/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';

describe('LikesController', () => {
  let controller: LikesController;
  let service: LikesService;

  const mockLikesService = {
    getLikesForPost: jest.fn().mockImplementation(() => {}),
    getLikeCount: jest.fn().mockImplementation(() => {}),
    createLike: jest.fn().mockImplementation(() => {}),
    deleteLike: jest.fn().mockImplementation(() => {}),
    hasUserLikedPost: jest.fn().mockImplementation(() => {}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LikesController],
      providers: [
        {
          provide: LikesService,
          useValue: mockLikesService,
        },
      ],
    }).compile();

    controller = module.get<LikesController>(LikesController);
    service = module.get<LikesService>(LikesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getLikesForPost', () => {
    it('should return likes for a post', async () => {
      const mockResult = {
        data: [{ id: 1, postId: 1, userId: 'user1' }],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      mockLikesService.getLikesForPost.mockResolvedValue(mockResult);

      const result = await controller.getLikesForPost(1, '1', '10');

      expect(result).toEqual(mockResult);
      expect(service.getLikesForPost).toHaveBeenCalledWith(1, {
        page: 1,
        limit: 10,
      });
    });
  });

  describe('getLikeCount', () => {
    it('should return like count', async () => {
      const mockCount = { count: 5 };
      mockLikesService.getLikeCount.mockResolvedValue(mockCount);

      const result = await controller.getLikeCount(1);

      expect(result).toEqual(mockCount);
      expect(service.getLikeCount).toHaveBeenCalledWith(1);
    });
  });

  describe('createLike', () => {
    it('should create a like', async () => {
      const mockLike = { id: 1, postId: 1, userId: 'user1' };
      mockLikesService.createLike.mockResolvedValue(mockLike);

      const result = await controller.createLike(1, 'user1');

      expect(result).toEqual(mockLike);
      expect(service.createLike).toHaveBeenCalledWith(1, 'user1');
    });
  });

  describe('deleteLike', () => {
    it('should delete a like', async () => {
      const mockLike = { id: 1, postId: 1, userId: 'user1' };
      mockLikesService.deleteLike.mockResolvedValue(mockLike);

      const result = await controller.deleteLike(1, 'user1');

      expect(result).toEqual(mockLike);
      expect(service.deleteLike).toHaveBeenCalledWith(1, 'user1');
    });
  });

  describe('checkUserLike', () => {
    it('should check if user liked post', async () => {
      mockLikesService.hasUserLikedPost.mockResolvedValue(true);

      const result = await controller.checkUserLike(1, 'user1');

      expect(result).toEqual({ hasLiked: true });
      expect(service.hasUserLikedPost).toHaveBeenCalledWith(1, 'user1');
    });
  });
});
