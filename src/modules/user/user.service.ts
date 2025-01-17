import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { AccountTypeEnum } from '../../common/enums';
import { UserEntity } from '../../databases/entities';
import { UserPremiumInput } from './inputs/user-premium.input';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findByAttribute(
    findOption: FindManyOptions<UserEntity>,
  ): Promise<UserEntity[]> {
    return this.userRepository.find(findOption);
  }

  async findOneByAttribute(
    findOption: FindOneOptions<UserEntity>,
  ): Promise<UserEntity> {
    return this.userRepository.findOne(findOption);
  }

  async upgradeToPremium(
    userId: string,
    userPremiumInput: UserPremiumInput,
  ): Promise<UserEntity> {
    const { phone } = userPremiumInput;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.accountType === AccountTypeEnum.PREMIUM) {
      throw new BadRequestException('User is already a premium member');
    }

    user.accountType = AccountTypeEnum.PREMIUM;
    user.phone = phone;
    user.upgradeAt = new Date();

    return await this.userRepository.save(user);
  }
}
