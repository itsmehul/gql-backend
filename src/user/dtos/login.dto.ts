import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { User } from '../entities/user.entity';

@InputType()
export class LoginInput extends PickType(User, ['email', 'password']) {}

@InputType()
export class LoginOTPInput extends PickType(User, ['phone', 'countrycode']) {
  @Field(() => Number)
  otp: number;
}
@InputType()
export class LoginEmailOTPInput extends PickType(User, ['email']) {
  @Field(() => Number)
  otp: number;

  @Field(() => String)
  password: string;
}

@ObjectType()
export class LoginOutput extends CoreOutput {
  @Field(() => String, { nullable: true })
  token?: string;
}
