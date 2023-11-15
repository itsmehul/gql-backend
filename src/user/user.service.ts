import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { SmsService } from 'src/sms/sms.service';
import { generateEmailOTP, generateOTP } from 'src/utils/generateOTP';
import { concatCodeWNumber } from 'src/utils/misc';
import { Repository } from 'typeorm';
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
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly smsService: SmsService,
    private readonly mailService: MailService,
  ) {}

  // The JWT doesn't expire instead we authorize the ip address
  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const exists = await this.users.findOne({
        where: {
          email,
        },
      });
      if (exists) {
        return { ok: false, error: 'There is a user with that email already' };
      }
      await this.users.save(this.users.create({ email, password, role }));
      // const verification = await this.verifications.save(
      //   this.verifications.create({
      //     user,
      //   }),
      // );
      // this.mailService.sendVerificationEmail([user.email], {
      //   email: user.email,
      //   code: verification.code,
      // });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: "Couldn't create account" };
    }
  }
  async sendOTP(phone: number, countrycode: number): Promise<number> {
    try {
      const otp = generateOTP();
      await this.smsService.sendSMS(
        concatCodeWNumber(countrycode, phone),
        `Your verification code is: ${otp}`,
      );
      return otp;
    } catch {
      throw 'Failed to create OTP';
    }
  }

  async sendEmailOTP(email: string): Promise<number> {
    try {
      const otp = generateEmailOTP();
      await this.mailService.sendVerificationEmail(email, {
        code: `${otp}`,
      });
      return otp;
    } catch {
      throw 'Failed to create OTP';
    }
  }

  async findById(id: string): Promise<any> {
    try {
      const user = await this.users.findOneOrFail({
        where: {
          id,
        },
      });

      return {
        ok: true,
        user,
      };
    } catch (error) {
      return { ok: false, error: 'User Not Found' };
    }
  }

  async signinWOTP({
    phone,
    role,
    countrycode,
  }: CreateAccountOTPInput): Promise<CreateAccountOutput> {
    try {
      const foundUser = await this.users.findOne({
        where: { phone, countrycode },
      });

      if (foundUser) {
        const code = await this.sendOTP(phone, countrycode);

        await this.users.update(
          { phone },
          {
            otp: {
              code,
              expires: DateTime.utc().plus({ minutes: 5 }),
            },
          },
        );
        return { ok: true };
      }
      const code = await this.sendOTP(phone, countrycode);
      await this.users.save(
        this.users.create({
          phone,
          role,
          countrycode,
          otp: {
            code,
            expires: DateTime.local().plus({ minutes: 5 }),
          },
        }),
      );
      return { ok: true };
    } catch (e) {
      return { ok: false, error: "Couldn't create account" };
    }
  }

  async signinWEmailOTP({
    email,
    role,
  }: CreateAccountEmailOTPInput): Promise<CreateAccountOutput> {
    try {
      const foundUser = await this.users.findOne({ where: { email } });
      if (foundUser) {
        const code = await this.sendEmailOTP(email);
        await this.users.update(
          { email },
          {
            otp: {
              code,
              expires: DateTime.utc().plus({ days: 5 }),
            },
          },
        );
        return { ok: true };
      }
      const code = await this.sendEmailOTP(email);
      await this.users.save(
        this.users.create({
          email,
          role,
          otp: {
            code,
            expires: DateTime.local().plus({ days: 5 }),
          },
        }),
      );
      return { ok: true };
    } catch (e) {
      return { ok: false, error: "Couldn't create account" };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.users.findOne({
        where: { email },
        select: ['id', 'password', 'role'],
      });
      if (!user) {
        throw 'User not found';
      }
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        throw 'Wrong password';
      }

      const token = this.jwtService.sign(user.id);

      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error: error || "Can't log user in.",
      };
    }
  }

  async loginWOTP({
    phone,
    otp,
    countrycode,
  }: LoginOTPInput): Promise<LoginOutput> {
    try {
      const user = await this.users.findOne({
        where: { phone, countrycode },
        select: ['id', 'otp'],
      });
      if (!user) {
        throw 'User not found';
      }
      if (!user.otp) {
        throw 'Please request another OTP';
      }
      if (DateTime.utc().toJSDate() > user.otp.expires) {
        throw 'OTP Expired';
      }
      if (user.otp.code !== otp) {
        throw 'Wrong OTP';
      }
      this.users.update({ phone }, { otp: null });
      const token = this.jwtService.sign(user.id);
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error: "Can't log user in.",
      };
    }
  }

  async loginEmailWOTP({
    email,
    otp,
    password,
  }: LoginEmailOTPInput): Promise<LoginOutput> {
    try {
      const user = await this.users.findOne({
        where: { email },
        select: ['id', 'otp'],
      });
      if (!user) {
        throw 'User not found';
      }
      if (!user.otp) {
        throw 'Please request another OTP';
      }
      if (DateTime.utc().toJSDate() > user.otp.expires) {
        throw 'OTP Expired';
      }
      if (user.otp.code !== otp) {
        throw 'Wrong OTP';
      }
      await this.users.save(
        await this.users.preload({ id: user.id, email, otp: null, password }),
      );
      const token = this.jwtService.sign(user.id);
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error: error || "Can't log user in.",
      };
    }
  }

  async editProfile(
    userId: string,
    editProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      const user = await this.users.findOne({
        where: { id: userId },
      });
      if (!user) {
        return {
          ok: false,
          error: 'User not found',
        };
      }

      await this.users.update({ id: userId }, { ...editProfileInput });
      return {
        ok: true,
      };
    } catch (error) {
      return { ok: false, error: 'Could not update profile.' };
    }
  }
}
