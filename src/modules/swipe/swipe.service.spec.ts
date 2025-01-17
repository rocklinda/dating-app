import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AccountTypeEnum, SwipeTypeEnum } from '../../common/enums';
import { UserEntity, UserSwipeActivityEntity } from '../../databases/entities';
import { UserService } from '../user/user.service';
import { SwipeInput } from './inputs/swipe.input';
import { SwipeService } from './swipe.service';

describe('SwipeService', () => {
  let swipeService: SwipeService;
  let userService: UserService;
  let userRepository;
  let userSwipeActivityRepository;
  let dataSource;

  const mockUserService = {
    findOneByAttribute: jest.fn(),
  };

  const mockUserRepository = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockUserSwipeActivityRepository = {
    find: jest.fn(),
    save: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        create: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
      },
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SwipeService,
        { provide: UserService, useValue: mockUserService },
        {
          provide: getRepositoryToken(UserSwipeActivityEntity),
          useValue: mockUserSwipeActivityRepository,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    swipeService = module.get<SwipeService>(SwipeService);
    userService = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(UserEntity));
    userSwipeActivityRepository = module.get(
      getRepositoryToken(UserSwipeActivityEntity),
    );
    dataSource = module.get(DataSource);
  });

  describe('swipe', () => {
    it('should throw NotFoundException if user is not found', async () => {
      const swipeInput: SwipeInput = {
        swipedUserId: '2',
        swipeType: SwipeTypeEnum.LIKE,
      };
      mockUserService.findOneByAttribute.mockResolvedValue(null); // User not found

      await expect(swipeService.swipe('1', swipeInput)).rejects.toThrowError(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if free account exceeds daily swipe limit', async () => {
      const swipeInput: SwipeInput = {
        swipedUserId: '2',
        swipeType: SwipeTypeEnum.LIKE,
      };
      const user = {
        id: '1',
        accountType: AccountTypeEnum.BASIC,
        dailySwipeCount: 10,
        lastSwipeDate: new Date(),
      };
      mockUserService.findOneByAttribute.mockResolvedValue(user); // User found

      await expect(swipeService.swipe('1', swipeInput)).rejects.toThrowError(
        new BadRequestException(
          'You have reached the daily swipe limit of 10 swipes for free accounts.',
        ),
      );
    });

    it('should return success message when swipe is recorded', async () => {
      const swipeInput: SwipeInput = {
        swipedUserId: '2',
        swipeType: SwipeTypeEnum.LIKE,
      };
      const user = {
        id: '1',
        accountType: AccountTypeEnum.PREMIUM,
        dailySwipeCount: 1,
        lastSwipeDate: new Date(),
      };
      const swipedUser = { id: '2', accountType: AccountTypeEnum.BASIC };

      mockUserService.findOneByAttribute.mockResolvedValue(user); // User found
      mockUserRepository.findOne.mockResolvedValue(swipedUser); // Swiped user found
      mockDataSource.createQueryRunner.mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
          create: jest.fn().mockReturnValue({}),
          save: jest.fn().mockResolvedValue({}),
          update: jest.fn().mockResolvedValue({}),
        },
      });

      const result = await swipeService.swipe('1', swipeInput);
      expect(result.message).toBe('Swipe recorded successfully.');
      expect(result.isMatch).toBe(false);
    });

    it('should return match message when both users like each other', async () => {
      const swipeInput: SwipeInput = {
        swipedUserId: '2',
        swipeType: SwipeTypeEnum.LIKE,
      };
      const user = {
        id: '1',
        accountType: AccountTypeEnum.PREMIUM,
        dailySwipeCount: 1,
        lastSwipeDate: new Date(),
      };
      const swipedUser = { id: '2', accountType: AccountTypeEnum.PREMIUM };
      mockUserService.findOneByAttribute.mockResolvedValue(user); // User found
      mockUserRepository.findOne.mockResolvedValue(swipedUser); // Swiped user found
      mockDataSource.createQueryRunner.mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
          create: jest.fn().mockReturnValue({}),
          save: jest.fn().mockResolvedValue({}),
          update: jest.fn().mockResolvedValue({}),
        },
      });

      const swipedUserLike = {
        userId: '2',
        swipedUserId: '1',
        swipeType: SwipeTypeEnum.LIKE,
      };
      mockUserSwipeActivityRepository.find.mockResolvedValue([swipedUserLike]); // Simulating mutual like

      const result = await swipeService.swipe('1', swipeInput);
      expect(result.message).toBe('It’s a match! Both users liked each other.');
      expect(result.isMatch).toBe(true);
    });

    it('should throw InternalServerErrorException when transaction fails', async () => {
      const swipeInput: SwipeInput = {
        swipedUserId: '2',
        swipeType: SwipeTypeEnum.LIKE,
      };
      const user = {
        id: '1',
        accountType: AccountTypeEnum.PREMIUM,
        dailySwipeCount: 1,
        lastSwipeDate: new Date(),
      };
      mockUserService.findOneByAttribute.mockResolvedValue(user); // User found

      const queryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
          create: jest.fn(),
          save: jest.fn().mockRejectedValue(new Error('Transaction failed')), // Simulating an error
        },
      };

      mockDataSource.createQueryRunner.mockReturnValue(queryRunner);

      await expect(swipeService.swipe('1', swipeInput)).rejects.toThrowError(
        InternalServerErrorException,
      );
    });
  });
});
