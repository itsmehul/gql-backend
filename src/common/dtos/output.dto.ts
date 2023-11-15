import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CoreOutput {
  @Field(() => String, { nullable: true })
  error?: Error | string;

  @Field(() => Boolean)
  ok: boolean;
}
