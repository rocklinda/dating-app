import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { SexTypeEnum } from '../../common/enums';
import { UserEntity } from '../../databases/entities';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { LoginInput } from './inputs/login.input';
import { SignUpInput } from './inputs/sign-up.input';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let dataSource: DataSource;
  let queryRunner: QueryRunner;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findOneByAttribute: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('fake-jwt-token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('10'),
          },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue({
              connect: jest.fn(),
              startTransaction: jest.fn(),
              commitTransaction: jest.fn(),
              rollbackTransaction: jest.fn(),
              release: jest.fn(),
              manager: {
                getRepository: jest.fn().mockReturnValue({
                  create: jest.fn(),
                  save: jest.fn(),
                }), // Add getRepository mock
                create: jest.fn(),
                save: jest.fn(),
              },
            }),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    dataSource = module.get<DataSource>(DataSource);
    queryRunner = dataSource.createQueryRunner();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should create a user successfully', async () => {
      const signUpInput: SignUpInput = {
        email: 'test@example.com',
        name: 'Test User',
        phone: '1234567890',
        password: 'password',
        sex: SexTypeEnum.MALE,
      };

      jest.spyOn(userService, 'findOneByAttribute').mockResolvedValue(null);

      const user = { id: '1', ...signUpInput } as UserEntity;

      jest.spyOn(queryRunner.manager, 'getRepository').mockReturnValue({
        create: jest.fn().mockReturnValue(user),
        save: jest.fn().mockResolvedValue(user),
      } as unknown as Repository<UserEntity>);

      const result = await authService.signup(signUpInput);

      expect(userService.findOneByAttribute).toHaveBeenCalledWith({
        where: [{ email: 'test@example.com' }, { phone: '1234567890' }],
      });

      expect(queryRunner.manager.create).toHaveBeenCalledWith(UserEntity, {
        email: 'test@example.com',
        name: 'Test User',
        phone: '1234567890',
        password: expect.any(String), // Ensure password hashing if applicable
        sex: SexTypeEnum.MALE,
      });

      expect(queryRunner.manager.save).toHaveBeenCalledWith(user);

      expect(result).toEqual(user);
    });

    it('should throw BadRequestException if user exists', async () => {
      const signUpInput: SignUpInput = {
        email: 'test@example.com',
        name: 'Test User',
        phone: '1234567890',
        password: 'password',
        sex: SexTypeEnum.MALE,
      };

      jest
        .spyOn(userService, 'findOneByAttribute')
        .mockResolvedValue({} as UserEntity);

      await expect(authService.signup(signUpInput)).rejects.toThrow(
        BadRequestException,
      );
      expect(userService.findOneByAttribute).toHaveBeenCalledWith({
        where: [{ email: 'test@example.com' }, { phone: '1234567890' }],
      });
    });
  });

  describe('login', () => {
    it('should return a JWT token on successful login', async () => {
      const loginInput: LoginInput = {
        email: 'test@example.com',
        password: 'password',
      };

      const user = { id: '1', password: 'hashedpassword' } as UserEntity;

      jest.spyOn(userService, 'findOneByAttribute').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await authService.login(loginInput);

      expect(userService.findOneByAttribute).toHaveBeenCalledWith({
        where: [{ email: 'test@example.com' }],
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedpassword');
      expect(result).toEqual({ accessToken: 'fake-jwt-token' });
    });

    it('should throw NotFoundException if user is not found', async () => {
      const loginInput: LoginInput = {
        email: 'test@example.com',
        password: 'password',
      };

      jest.spyOn(userService, 'findOneByAttribute').mockResolvedValue(null);

      await expect(authService.login(loginInput)).rejects.toThrow(
        NotFoundException,
      );
      expect(userService.findOneByAttribute).toHaveBeenCalledWith({
        where: [{ email: 'test@example.com' }],
      });
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const loginInput: LoginInput = {
        email: 'test@example.com',
        password: 'password',
      };

      const user = { id: '1', password: 'hashedpassword' } as UserEntity;

      jest.spyOn(userService, 'findOneByAttribute').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(authService.login(loginInput)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userService.findOneByAttribute).toHaveBeenCalledWith({
        where: [{ email: 'test@example.com' }],
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedpassword');
    });
  });
});
