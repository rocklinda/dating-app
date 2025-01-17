import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindManyOptions,
  FindOneOptions,
  In,
  Not,
  Raw,
  Repository,
} from 'typeorm';
import {
  AccountTypeEnum,
  SexTypeEnum,
  SwipeTypeEnum,
} from '../../common/enums';
import {
  MatchEntity,
  UserEntity,
  UserSwipeActivityEntity,
} from '../../databases/entities';
import { UserService } from '../user/user.service';
import { SwipeInput } from './inputs/swipe.input';

@Injectable()
export class SwipeService {
  constructor(
    @InjectRepository(UserSwipeActivityEntity)
    private readonly userSwipeActivityRepository: Repository<UserSwipeActivityEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly userService: UserService,
    private readonly dataSource: DataSource,
  ) {}

  async swipe(
    userId: string,
    swipeInput: SwipeInput,
  ): Promise<{ isMatch: boolean; message: string }> {
    const { swipedUserId, swipeType } = swipeInput;

    const user = await this.userService.findOneByAttribute({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User does not exist.');
    }

    const isToday =
      new Date(user.lastSwipeDate).toDateString() === new Date().toDateString();

    const newDailySwipeCount = isToday ? user.dailySwipeCount + 1 : 1;

    if (
      user.accountType !== AccountTypeEnum.PREMIUM &&
      newDailySwipeCount > 10
    ) {
      throw new BadRequestException(
        'You have reached the daily swipe limit of 10 swipes for free accounts.',
      );
    }

    const swipedUserLike = await this.findOneByAttribute({
      where: {
        userId: swipedUserId,
        swipedUserId: userId,
        swipeType: SwipeTypeEnum.LIKE,
      },
    });
    const isSwipedUserLike = !!swipedUserLike;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userSwipeActivity = queryRunner.manager.create(
        UserSwipeActivityEntity,
        {
          userId,
          swipedUserId,
          swipeType,
        },
      );

      await queryRunner.manager.save(
        UserSwipeActivityEntity,
        userSwipeActivity,
      );

      let isMatch = false;

      if (isSwipedUserLike && swipeType === SwipeTypeEnum.LIKE) {
        await queryRunner.manager.save(MatchEntity, {
          user1Id: userId,
          user2Id: swipedUserId,
        });
        isMatch = true;
      }

      await queryRunner.manager.update(
        UserEntity,
        { id: userId },
        {
          dailySwipeCount: newDailySwipeCount,
          lastSwipeDate: new Date(),
        },
      );

      await queryRunner.commitTransaction();

      return {
        isMatch,
        message: isMatch
          ? 'It’s a match! Both users liked each other.'
          : 'Swipe recorded successfully.',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        `Failed to record swipe activity: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findByAttribute(
    findOption: FindManyOptions<UserSwipeActivityEntity>,
  ): Promise<UserSwipeActivityEntity[]> {
    return this.userSwipeActivityRepository.find(findOption);
  }

  async findOneByAttribute(
    findOption: FindOneOptions<UserSwipeActivityEntity>,
  ): Promise<UserSwipeActivityEntity> {
    return this.userSwipeActivityRepository.findOne(findOption);
  }

  async getSwipeList(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ swipeList: UserEntity[]; total: number }> {
    const user = await this.userService.findOneByAttribute({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User does not exist.');
    }

    const alreadySwipedToday = await this.userSwipeActivityRepository.find({
      where: {
        userId,
        createdAt: Raw((alias) => `${alias} >= :today`, {
          today: new Date().setHours(0, 0, 0, 0),
        }),
      },
      select: ['swipedUserId'],
    });

    const swipedUserIds = alreadySwipedToday.map((swipe) => swipe.swipedUserId);

    const excludeUserIds = [userId, ...swipedUserIds];

    const oppositeSex =
      user.sex == SexTypeEnum.MALE ? SexTypeEnum.FEMALE : SexTypeEnum.MALE;

    const [swipeList, total] = await this.userRepository.findAndCount({
      where: {
        id: Not(In(excludeUserIds)),
        sex: oppositeSex,
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      swipeList,
      total,
    };
  }
}
