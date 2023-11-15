import { Args, Mutation, Resolver } from '@nestjs/graphql';
import {
  UploadFileInput,
  UploadFileOutput,
  UploadFileVariantsOutput,
} from './dtos/upload-file.dto';
import { MediaService } from './media.service';

@Resolver(() => null)
export class MediaResolver {
  constructor(private readonly mediaService: MediaService) {}

  @Mutation(() => UploadFileOutput)
  async uploadFile(
    @Args('input') uploadFileInput: UploadFileInput,
  ): Promise<UploadFileOutput> {
    try {
      const url = await this.mediaService.uploadImage(
        uploadFileInput.bucketURL,
        uploadFileInput.fileName,
      );
      return {
        uploadURL: url,
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  @Mutation(() => UploadFileVariantsOutput)
  async uploadMultipleFileVariants(
    @Args('input') uploadFileInput: UploadFileInput,
  ): Promise<UploadFileVariantsOutput> {
    try {
      const [webImageUrl, printUrl, mobileImageUrl] = await Promise.all(
        [
          ['WEB', 'webp'],
          ['PRINT', 'jpg'],
          ['MOBILE', 'webp'],
        ].map(([fileVariant, extension]) =>
          this.mediaService.uploadImage(
            uploadFileInput.bucketURL,
            `${uploadFileInput.fileName}/${fileVariant}.${extension}`,
          ),
        ),
      );
      return {
        ok: true,
        uploadURLs: [webImageUrl, printUrl, mobileImageUrl],
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
}
