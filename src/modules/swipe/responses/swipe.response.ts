import { Field, ObjectType } from '@nestjs/graphql';
import { UserEntity } from '../../../databases/entities';
import { PaginationResponse } from './pagination.response';

@ObjectType()
export class SwipeResponse extends PaginationResponse {
  @Field(() => [UserEntity], { defaultValue: [] })
  swipeList: UserEntity[];
}
