import { registerEnumType } from '@nestjs/graphql';

export enum SwipeTypeEnum {
  PASS = 'PASS',
  LIKE = 'LIKE',
}

registerEnumType(SwipeTypeEnum, {
  name: 'SwipeTypeEnum',
  description: 'Swipe type enum',
});
