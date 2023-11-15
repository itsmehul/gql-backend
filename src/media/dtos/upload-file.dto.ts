import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class UploadFileInput {
  @Field(() => String)
  bucketURL: string;

  @Field(() => String)
  fileName?: string;
}

@ObjectType()
export class UploadFileOutput extends CoreOutput {
  @Field(() => String, { nullable: true })
  uploadURL?: string;
}
@ObjectType()
export class UploadFileVariantsOutput extends CoreOutput {
  @Field(() => [String], { nullable: true })
  uploadURLs?: string[];
}
