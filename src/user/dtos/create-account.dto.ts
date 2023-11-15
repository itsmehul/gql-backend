import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { User } from '../entities/user.entity';

@InputType()
export class CreateAccountInput extends PickType(User, [
  'email',
  'password',
  'role',
]) {}

@InputType()
export class CreateAccountOTPInput extends PickType(User, [
  'phone',
  'countrycode',
  'role',
]) {}

@InputType()
export class CreateAccountEmailOTPInput extends PickType(User, [
  'email',
  'role',
]) {}

@ObjectType()
export class CreateAccountOutput extends CoreOutput {}
