/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

describe('PostsController', () => {
  let controller: PostsController;
  let service: PostsService;

  const mockPostsService = {
    getPostsByThreadId: jest.fn(),
    getPostById: jest.fn(),
    createPost: jest.fn(),
    updatePost: jest.fn(),
    deletePost: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: mockPostsService,
        },
      ],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    service = module.get<PostsService>(PostsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPostsByThreadId', () => {
    it('should return posts for a thread', async () => {
      const mockResult = {
        data: [{ id: 1, content: 'Test post' }],
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      mockPostsService.getPostsByThreadId.mockResolvedValue(mockResult);

      const result = await controller.getPostsByThreadId(1, '1', '1', '10');

      expect(result).toEqual(mockResult);
      expect(service.getPostsByThreadId).toHaveBeenCalledWith(1, {
        parentId: 1,
        page: 1,
        limit: 10,
      });
    });
  });

  describe('getPostById', () => {
    it('should return a single post', async () => {
      const mockPost = { id: 1, content: 'Test post' };
      mockPostsService.getPostById.mockResolvedValue(mockPost);

      const result = await controller.getPostById(1);

      expect(result).toEqual(mockPost);
      expect(service.getPostById).toHaveBeenCalledWith(1);
    });
  });

  describe('createPost', () => {
    it('should create a new post', async () => {
      const createPostDto = {
        content: 'Test content',
        authorId: 'user1',
        parentId: 1,
        rating: 5,
      };
      const mockPost = { id: 1, ...createPostDto };
      mockPostsService.createPost.mockResolvedValue(mockPost);

      const result = await controller.createPost(1, createPostDto);

      expect(result).toEqual(mockPost);
      expect(service.createPost).toHaveBeenCalledWith(1, createPostDto);
    });
  });

  describe('updatePost', () => {
    it('should update a post', async () => {
      const updateData = {
        content: 'Updated content',
        authorId: 'user1',
        rating: 5,
      };
      const mockUpdatedPost = { id: 1, ...updateData };
      mockPostsService.updatePost.mockResolvedValue(mockUpdatedPost);

      const result = await controller.updatePost(1, updateData);

      expect(result).toEqual(mockUpdatedPost);
      expect(service.updatePost).toHaveBeenCalledWith(1, 'user1', {
        content: 'Updated content',
        rating: 5,
      });
    });
  });

  describe('deletePost', () => {
    it('should delete a post', async () => {
      const mockDeletedPost = {
        id: 1,
        content: 'Test post',
        deletedAt: new Date(),
      };
      mockPostsService.deletePost.mockResolvedValue(mockDeletedPost);

      const result = await controller.deletePost(1, 'user1');

      expect(result).toEqual(mockDeletedPost);
      expect(service.deletePost).toHaveBeenCalledWith(1, 'user1');
    });
  });
});
