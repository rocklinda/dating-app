import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import moment, { DurationInputArg2 } from 'moment';
import { DataSource } from 'typeorm';
import { JWT_ACCESS_TOKEN_EXPIRED_IN } from '../../common/constants';
import { UserEntity } from '../../databases/entities';
import { UserService } from '../user/user.service';
import { LoginInput } from './inputs/login.input';
import { SignUpInput } from './inputs/sign-up.input';
import { AuthResponse } from './responses/auth.response';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async signup(signUpInput: SignUpInput): Promise<UserEntity> {
    const { email, name, phone, password, sex } = signUpInput;

    const userExists = await this.userService.findOneByAttribute({
      where: [{ email }, { phone }],
    });

    if (userExists) {
      throw new BadRequestException('Email is already in use');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = queryRunner.manager.create(UserEntity, {
        name,
        phone,
        email,
        password: await this.hashPassword(password),
        sex,
      });

      await queryRunner.manager.save<UserEntity>(user);

      await queryRunner.commitTransaction();

      return user;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof ConflictException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to create user');
    } finally {
      await queryRunner.release();
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = Number(this.configService.get('JWT_SECRET'));
    const salt = await bcrypt.genSalt(saltRounds);
    const hashed = await bcrypt.hash(password, salt);

    return hashed;
  }

  async login(loginInput: LoginInput): Promise<AuthResponse> {
    const { email, password } = loginInput;

    const user = await this.userService.findOneByAttribute({
      where: [{ email }],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValid = await this.compare(password, user.password);

    if (!isValid) {
      throw new UnauthorizedException('Login failed, invalid passowrd');
    }

    return await this.generateJwtToken(user);
  }

  private async compare(password: string, encrypted: string): Promise<boolean> {
    return bcrypt.compare(password, encrypted);
  }

  private async generateJwtToken(user: UserEntity): Promise<AuthResponse> {
    const currentTime = moment();

    const jwtExpiredAccessTokenInValue = JWT_ACCESS_TOKEN_EXPIRED_IN.replace(
      /[^\d.-]+/g,
      '',
    );
    const jwtExpiredAccessTokenInUnit = JWT_ACCESS_TOKEN_EXPIRED_IN.replace(
      /[\d.-]+/g,
      '',
    );

    const expiredAtAccessToken = currentTime
      .add(
        Number(jwtExpiredAccessTokenInValue),
        jwtExpiredAccessTokenInUnit as DurationInputArg2,
      )
      .unix();

    const payload = { iat: currentTime.unix(), sub: user.id };

    const accessToken = this.jwtService.sign({
      ...payload,
      exp: expiredAtAccessToken,
    });

    return {
      accessToken,
    } as AuthResponse;
  }
}
