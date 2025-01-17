import { Body, Controller, Post } from '@nestjs/common';
import { UserEntity } from '../../databases/entities';
import { AuthService } from './auth.service';
import { LoginInput } from './inputs/login.input';
import { SignUpInput } from './inputs/sign-up.input';
import { AuthResponse } from './responses/auth.response';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() signUpInput: SignUpInput): Promise<UserEntity> {
    return await this.authService.signup(signUpInput);
  }

  @Post('login')
  async login(@Body() loginInput: LoginInput): Promise<AuthResponse> {
    return await this.authService.login(loginInput);
  }
}
