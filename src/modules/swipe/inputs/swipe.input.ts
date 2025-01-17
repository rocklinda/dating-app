import { Field, ID, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { SwipeTypeEnum } from '../../../common/enums';

@InputType()
export class SwipeInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID('4')
  swipedUserId: string;

  @Field(() => SwipeTypeEnum)
  @IsNotEmpty()
  @IsEnum(SwipeTypeEnum)
  swipeType: SwipeTypeEnum;
}
