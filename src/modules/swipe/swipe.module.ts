import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  MatchEntity,
  UserEntity,
  UserSwipeActivityEntity,
} from '../../databases/entities';
import { UserModule } from '../user/user.module';
import { SwipeController } from './swipe.controller';
import { SwipeService } from './swipe.service';

@Module({
  providers: [SwipeService],
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      MatchEntity,
      UserSwipeActivityEntity,
    ]),
    UserModule,
  ],
  controllers: [SwipeController],
})
export class SwipeModule {}
