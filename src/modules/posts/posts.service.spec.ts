import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { PostsRepository } from './posts.repository';
import { PostsMapperService } from './posts-mapper.service';
import { DataSource } from 'typeorm';
import { AssetsService } from '../assets/assets.service';
import { CatalogsService } from '../catalogs/catalogs.service';
import { PostStatusEnum } from './posts.entity';

describe('PostsService', () => {
   let service: PostsService;
   const mockPostsRepository = {
      findAll: jest.fn(),
   };
   const mockPostsMapperService = {
      mapToPostCardDto: jest.fn(),
   };
   const mockCatalogsService = {
      findAllCategories: jest.fn(),
   };
   const mockAssetsService = {
      findById: jest.fn(),
   };
   const mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
   };

   const mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
   };

   beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
         providers: [
            PostsService,
            { provide: PostsRepository, useValue: mockPostsRepository },
            { provide: PostsMapperService, useValue: mockPostsMapperService },
            { provide: CatalogsService, useValue: mockCatalogsService },
            { provide: AssetsService, useValue: mockAssetsService },
            { provide: DataSource, useValue: mockDataSource },
         ],
      }).compile();

      service = module.get<PostsService>(PostsService);
   });

   it('should throw ForbiddenException for unauthorized access to unapproved posts', async () => {
      await expect(
         service.findAll('Editor', PostStatusEnum.Rejected),
      ).rejects.toThrow(ForbiddenException);
   });

   it('should allow authorized roles to access all posts', async () => {
      const mockPosts = [{ id: 1 }, { id: 2 }];
      const mockPostCardDto = [
         { id: 1, cardInfo: 'info' },
         { id: 2, cardInfo: 'info' },
      ];

      mockPostsRepository.findAll.mockReturnValue(Promise.resolve(mockPosts));
      mockPostsMapperService.mapToPostCardDto.mockReturnValue(mockPostCardDto);

      const result = await service.findAll('Admin', PostStatusEnum.Rejected);
      console.log(mockPostsMapperService);
      expect(result).toEqual(mockPostCardDto);
      expect(mockPostsRepository.findAll).toHaveBeenCalledWith(false);
      expect(mockPostsMapperService.mapToPostCardDto).toHaveBeenCalledWith(
         mockPosts,
      );
   });
});
