import { registerEnumType } from '@nestjs/graphql';

export enum AccountTypeEnum {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
}

registerEnumType(AccountTypeEnum, {
  name: 'AccountTypeEnum',
  description: 'Account type enum',
});
