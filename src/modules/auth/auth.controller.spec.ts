import { Test, TestingModule } from '@nestjs/testing';
import { SexTypeEnum } from '../../common/enums';
import { UserEntity } from '../../databases/entities';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginInput } from './inputs/login.input';
import { SignUpInput } from './inputs/sign-up.input';
import { AuthResponse } from './responses/auth.response';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signup: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should call AuthService.signup and return the created user', async () => {
      const signUpInput: SignUpInput = {
        email: 'test@example.com',
        name: 'Test User',
        phone: '1234567890',
        password: 'password',
        sex: SexTypeEnum.MALE,
      };

      const user = { id: '1', ...signUpInput } as UserEntity;

      jest.spyOn(authService, 'signup').mockResolvedValue(user);

      const result = await authController.signUp(signUpInput);

      expect(authService.signup).toHaveBeenCalledWith(signUpInput);
      expect(result).toEqual(user);
    });
  });

  describe('login', () => {
    it('should call AuthService.login and return the JWT token', async () => {
      const loginInput: LoginInput = {
        email: 'test@example.com',
        password: 'password',
      };

      const authResponse: AuthResponse = {
        accessToken: 'fake-jwt-token',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(authResponse);

      const result = await authController.login(loginInput);

      expect(authService.login).toHaveBeenCalledWith(loginInput);
      expect(result).toEqual(authResponse);
    });
  });
});
