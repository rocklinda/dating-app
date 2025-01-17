import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SwipeTypeEnum } from '../../common/enums';

@ObjectType()
@Entity({ name: 'user_swipe_activities' })
export class UserSwipeActivityEntity extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID)
  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId: string;

  @Field(() => ID)
  @Column({ name: 'swiped_user_id', type: 'varchar', length: 36 })
  swipedUserId: string;

  @Column({
    name: 'swipe_type',
    type: 'enum',
    enum: SwipeTypeEnum,
    default: SwipeTypeEnum.PASS,
  })
  swipeType: SwipeTypeEnum;

  @Field(() => Date)
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
