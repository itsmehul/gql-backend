import { DynamicModule, Global, Module } from '@nestjs/common';
import * as AWSRoot from 'aws-sdk';
import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB, S3, SES, SNS } from './common.constants';
import { AwsKeys } from './common.interfaces';

const pubsub = new PubSub();

@Global()
@Module({
  imports: [
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', '..', 'build'),
    //   serveStaticOptions: {
    //     setHeaders: (res) => {
    //       res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    //       res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    //     },
    //   },
    //   exclude: ['/graphql'],
    // }),
  ],
})
export class CommonModule {
  static forRoot(credentials: AwsKeys): DynamicModule {
    AWSRoot.config.update({
      region: 'ap-south-1',
      credentials,
    });
    return {
      module: CommonModule,
      providers: [
        {
          provide: PUB_SUB,
          useValue: pubsub,
        },
        {
          provide: SES,
          useValue: new AWSRoot.SES(),
        },
        {
          provide: S3,
          useValue: new AWSRoot.S3(),
        },
        {
          provide: SNS,
          useValue: new AWSRoot.SNS(),
        },
      ],
      exports: [PUB_SUB, SES, S3, SNS],
    };
  }
}
