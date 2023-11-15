import { Inject, Injectable } from '@nestjs/common';
import { S3 } from 'src/common/common.constants';
import * as AWS from 'aws-sdk';

function getPresignUrlPromiseFunction(s3, s3Params): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      await s3.getSignedUrl('putObject', s3Params, function (err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    } catch (error) {
      return reject(error);
    }
  });
}

@Injectable()
export class MediaService {
  constructor(@Inject(S3) private readonly s3: AWS.S3) {}

  async uploadImage(bucketUrl: string, fileName: string): Promise<string> {
    try {
      const s3Params = {
        Bucket: 'thehumbleartistimages/' + bucketUrl,
        Key: fileName,
        Expires: 60 * 60,
        ContentType: 'image/*',
      };
      const url = await getPresignUrlPromiseFunction(this.s3, s3Params);
      return url;
    } catch (err) {
      throw err;
    }
  }
}
