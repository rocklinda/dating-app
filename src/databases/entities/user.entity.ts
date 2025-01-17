import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Exclude } from 'class-transformer';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AccountTypeEnum, SexTypeEnum } from '../../common/enums';

@ObjectType()
@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ name: 'email', length: 100, unique: true })
  email: string;

  @Field({ nullable: true })
  @Column({ name: 'phone', length: 100, unique: true, nullable: true })
  phone?: string;

  @Field()
  @Column({ name: 'name', length: 250 })
  name: string;

  @Column({
    name: 'sex',
    type: 'enum',
    enum: SexTypeEnum,
    default: SexTypeEnum.MALE,
  })
  sex: SexTypeEnum;

  @Column({
    name: 'account_type',
    type: 'enum',
    enum: AccountTypeEnum,
    default: AccountTypeEnum.FREE,
  })
  accountType: AccountTypeEnum;

  @Exclude()
  @Column({ name: 'password', length: 250, nullable: true })
  password: string;

  @Field(() => Int)
  @Column({ name: 'daily_swipe_count', type: 'int' })
  dailySwipeCount: number;

  @Field(() => Date)
  @Column({ name: 'last_swipe_date', type: 'date' })
  lastSwipeDate?: Date;

  @Field(() => Date)
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
