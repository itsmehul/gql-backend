import { Global, Module } from '@nestjs/common';
import { MediaResolver } from './media.resolver';
import { MediaService } from './media.service';

@Module({
  providers: [MediaService, MediaResolver],
  exports: [MediaService],
})
@Global()
export class MediaModule {}
