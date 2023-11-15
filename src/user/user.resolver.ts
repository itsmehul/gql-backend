import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import {
  CreateAccountEmailOTPInput,
  CreateAccountInput,
  CreateAccountOTPInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import {
  LoginEmailOTPInput,
  LoginInput,
  LoginOTPInput,
  LoginOutput,
} from './dtos/login.dto';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly usersService: UserService) {}

  @Query(() => UserProfileOutput)
  @Role(['Any'])
  me(@AuthUser() authUser: User): Promise<UserProfileOutput> {
    return this.usersService.findById(authUser.id);
  }

  @Mutation(() => CreateAccountOutput)
  async createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    return this.usersService.createAccount(createAccountInput);
  }

  @Mutation(() => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    return this.usersService.login(loginInput);
  }

  @Mutation(() => EditProfileOutput)
  @Role(['Any'])
  async editProfile(
    @AuthUser() authUser: User,
    @Args('input') editProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    return this.usersService.editProfile(authUser.id, editProfileInput);
  }
  // @Mutation(() => VerifyEmailOutput)
  // verifyEmail(
  //   @Args('input') { code }: VerifyEmailInput,
  // ): Promise<VerifyEmailOutput> {
  //   return this.usersService.verifyEmail(code);
  // }

  @Mutation(() => LoginOutput)
  async signInWOTP(
    @Args('input') createAccountOTPInput: CreateAccountOTPInput,
  ): Promise<CreateAccountOutput> {
    return this.usersService.signinWOTP(createAccountOTPInput);
  }

  @Mutation(() => LoginOutput)
  async loginWOTP(
    @Args('input') loginWOTPInput: LoginOTPInput,
  ): Promise<LoginOutput> {
    return this.usersService.loginWOTP(loginWOTPInput);
  }

  @Mutation(() => LoginOutput)
  async loginWEmailOTP(
    @Args('input') loginEmailOTPInput: LoginEmailOTPInput,
  ): Promise<LoginOutput> {
    return this.usersService.loginEmailWOTP(loginEmailOTPInput);
  }

  @Mutation(() => LoginOutput)
  async sendInvite(
    @Args('input') createAccountEmailOTPInput: CreateAccountEmailOTPInput,
  ): Promise<CreateAccountOutput> {
    return this.usersService.signinWEmailOTP(createAccountEmailOTPInput);
  }
}
