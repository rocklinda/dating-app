import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountTypeEnum } from '../../common/enums';
import { UserEntity } from '../../databases/entities';
import { UserService } from './user.service';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<UserEntity>;

  const mockUserRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
  });

  describe('upgradeToPremium', () => {
    it('should throw NotFoundException if user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null); // Simulating user not found
      await expect(
        userService.upgradeToPremium('1', { phone: '12345' }),
      ).rejects.toThrowError(NotFoundException);
    });

    it('should throw BadRequestException if user is already premium', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        accountType: AccountTypeEnum.PREMIUM,
        id: '1',
      } as UserEntity);
      await expect(
        userService.upgradeToPremium('1', { phone: '12345' }),
      ).rejects.toThrowError(BadRequestException);
    });

    it('should successfully upgrade user to premium', async () => {
      const user = {
        id: '1',
        accountType: AccountTypeEnum.FREE,
        phone: '',
        upgradeAt: null,
      } as UserEntity;
      mockUserRepository.findOne.mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue({
        ...user,
        accountType: AccountTypeEnum.PREMIUM,
        phone: '12345',
      });

      const result = await userService.upgradeToPremium('1', {
        phone: '12345',
      });
      expect(result.accountType).toBe(AccountTypeEnum.PREMIUM);
      expect(result.phone).toBe('12345');
      expect(result.upgradeAt).toBeDefined();
    });
  });

  describe('findByAttribute', () => {
    it('should return an array of users', async () => {
      const users = [
        { id: '1', accountType: AccountTypeEnum.FREE, phone: '' },
      ] as UserEntity[];
      mockUserRepository.find.mockResolvedValue(users);

      const result = await userService.findByAttribute({});
      expect(result).toEqual(users);
    });
  });

  describe('findOneByAttribute', () => {
    it('should return a user', async () => {
      const user = {
        id: '1',
        accountType: AccountTypeEnum.FREE,
        phone: '',
      } as UserEntity;
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await userService.findOneByAttribute({
        where: { id: '1' },
      });
      expect(result).toEqual(user);
    });
  });
});
