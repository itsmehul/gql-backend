import { Inject, Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { SES } from 'src/common/common.constants';
import { CoreOutput } from 'src/common/dtos/output.dto';

export enum AvailableEmailTemplates {
  VERIFY_EMAIL = 'VerifyEmail',
}

@Injectable()
export class MailService {
  constructor(@Inject(SES) private readonly ses: AWS.SES) {}

  sendVerificationEmail(
    destination: string,
    data: {
      code: string;
    },
  ) {
    this.sendTemplatedEmail(
      AvailableEmailTemplates.VERIFY_EMAIL,
      [destination],
      {
        verificationLink: `http://localhost:5000/verify-email?email=${destination}&code=${data.code}`,
      },
    );
  }

  async sendTemplatedEmail(
    template: AvailableEmailTemplates,
    destination: string[],
    data: any,
  ): Promise<CoreOutput> {
    // Create sendEmail params
    const params = {
      Template: template,
      Destination: {
        ToAddresses: destination,
      },
      Source: 'mehulgawdenxt@gmail.com' /* required */,
      TemplateData: JSON.stringify(data),
    };

    try {
      await this.ses.sendTemplatedEmail(params).promise();
      return { ok: true };
    } catch (error) {
      return { ok: false, error };
    }
  }
}
