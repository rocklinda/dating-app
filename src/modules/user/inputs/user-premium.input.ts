import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

@InputType()
export class UserPremiumInput {
  @Field({ nullable: true })
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;
}
