import { registerEnumType } from '@nestjs/graphql';

export enum SexTypeEnum {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

registerEnumType(SexTypeEnum, {
  name: 'SexTypeEnum',
  description: 'Sex type enum',
});
