import { InternalServerErrorException } from '@nestjs/common';
import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import * as bcrypt from 'bcrypt';
import { IsEmail, IsEnum, IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';

import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';

export enum UserRole {
  SuperAdmin = 'SuperAdmin',
  Admin = 'Admin',
  Base = 'Base',
}

registerEnumType(UserRole, { name: 'UserRole' });

@InputType('OTPInput', { isAbstract: true })
@ObjectType()
export class OTP {
  @Field(() => String)
  code: number;
  @Field(() => Date)
  expires: Date;
}

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  name: string;

  @Field(() => Number, { nullable: true })
  @Column({ unique: true, type: 'bigint', nullable: true })
  phone: number;

  @Field(() => Number, { nullable: true })
  @Column({ nullable: true })
  countrycode: number;

  @Field(() => String, { nullable: true })
  @Column({ unique: true, nullable: true })
  @IsEmail()
  email: string;

  @Field(() => String, { nullable: true })
  @Column({ select: false, nullable: true })
  @IsString()
  password: string;

  @Field(() => OTP, { nullable: true })
  @Column({ type: 'json', nullable: true, select: false })
  otp?: OTP;

  @Column({ type: 'enum', enum: UserRole })
  @Field(() => UserRole)
  @IsEnum(UserRole)
  role: UserRole;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      try {
        this.password = await bcrypt.hash(this.password, 10);
      } catch (e) {
        console.log(e);
        throw new InternalServerErrorException();
      }
    }
  }

  async checkPassword(aPassword: string): Promise<boolean> {
    try {
      const ok = await bcrypt.compare(aPassword, this.password);
      return ok;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }
}
