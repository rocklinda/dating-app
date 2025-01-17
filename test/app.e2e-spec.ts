import {
  BadRequestException,
  INestApplication,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AccountTypeEnum } from '../src/common/enums';
import { UserEntity } from '../src/databases/entities';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import { UserPremiumInput } from '../src/modules/user/inputs/user-premium.input';
import { UserController } from '../src/modules/user/user.controller';
import { UserService } from '../src/modules/user/user.service';
import { AppModule } from './../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // Import your main AppModule
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get(DataSource); // Access the database connection
  });

  afterAll(async () => {
    await dataSource.destroy(); // Close database connection
    await app.close();
  });

  describe('POST /auth/signup', () => {
    it('should create a new user and return the user entity', async () => {
      const signUpDto = {
        email: 'test@example.com',
        name: 'Test User',
        phone: '1234567890',
        password: 'password123',
        sex: 'M',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(signUpDto)
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          email: signUpDto.email,
          name: signUpDto.name,
          phone: signUpDto.phone,
        }),
      );
    });

    it('should return 400 if the email already exists', async () => {
      const signUpDto = {
        email: 'test@example.com', // Duplicate email
        name: 'Another User',
        phone: '9876543210',
        password: 'password123',
        sex: 'F',
      };

      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(signUpDto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe('Email is already in use');
        });
    });
  });

  describe('POST /auth/login', () => {
    it('should log in an existing user and return a JWT token', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          accessToken: expect.any(String),
        }),
      );
    });

    it('should return 404 if the user does not exist', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe('User not found');
        });
    });

    it('should return 401 if the password is incorrect', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toBe('Login failed, invalid passowrd');
        });
    });
  });
});

describe('UserController (e2e)', () => {
  let userController: UserController;
  let userService: UserService;

  const mockUserService = {
    upgradeToPremium: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard) // Mock JwtAuthGuard to bypass authentication
      .useValue({
        canActivate: () => true, // Make the guard always pass
      })
      .compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  describe('upgradeToPremium', () => {
    it('should throw NotFoundException if user is not found', async () => {
      const userPremiumInput: UserPremiumInput = { phone: '12345' };
      mockUserService.upgradeToPremium.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(
        userController.upgradeToPremium(
          { user: { id: '1' } },
          userPremiumInput,
        ),
      ).rejects.toThrowError(NotFoundException);
    });

    it('should throw BadRequestException if user is already premium', async () => {
      const userPremiumInput: UserPremiumInput = { phone: '12345' };
      mockUserService.upgradeToPremium.mockRejectedValue(
        new BadRequestException('User is already a premium member'),
      );

      await expect(
        userController.upgradeToPremium(
          { user: { id: '1' } },
          userPremiumInput,
        ),
      ).rejects.toThrowError(BadRequestException);
    });

    it('should successfully upgrade user to premium', async () => {
      const userPremiumInput: UserPremiumInput = { phone: '12345' };
      const user = {
        id: '1',
        accountType: AccountTypeEnum.FREE,
        phone: '',
        upgradeAt: null,
      } as UserEntity;
      const upgradedUser = {
        ...user,
        accountType: AccountTypeEnum.PREMIUM,
        phone: '12345',
        upgradeAt: new Date(),
      };

      mockUserService.upgradeToPremium.mockResolvedValue(upgradedUser);

      const result = await userController.upgradeToPremium(
        { user: { id: '1' } },
        userPremiumInput,
      );
      expect(result).toEqual(upgradedUser);
    });
  });
});
