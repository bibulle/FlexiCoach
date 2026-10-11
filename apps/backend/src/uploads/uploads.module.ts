import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UploadsController } from './uploads.controller';
import { UploadedFilesController } from './uploaded-files.controller';
import { UploadsService } from './uploads.service';
import {
  UploadedImage,
  UploadedImageSchema,
} from '../schemas/uploaded-image.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UploadedImage.name, schema: UploadedImageSchema },
    ]),
  ],
  controllers: [UploadsController, UploadedFilesController],
  providers: [UploadsService],
})
export class UploadsModule {}
