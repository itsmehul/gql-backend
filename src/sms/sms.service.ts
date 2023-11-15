import { Inject, Injectable } from '@nestjs/common';
import { SNS } from 'src/common/common.constants';
import * as AWS from 'aws-sdk';

@Injectable()
export class SmsService {
  constructor(@Inject(SNS) private readonly sns: AWS.SNS) {}
  async sendSMS(phone: number, message: string) {
    // if (process.env.NODE_ENV !== 'production') {
    //   return {
    //     ok: true,
    //   };
    // }
    const params: AWS.SNS.PublishInput = {
      Message: message,
      PhoneNumber: `+${phone}`,
      MessageAttributes: {
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional',
        },
        'AWS.SNS.SMS.SenderID': {
          DataType: 'String',
          StringValue: 'thArtist',
        },
      },
    };
    try {
      await this.sns.publish(params).promise();
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
}
