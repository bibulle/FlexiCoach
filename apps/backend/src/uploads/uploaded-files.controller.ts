import {
  Controller,
  Get,
  Header,
  NotFoundException,
  Param,
  StreamableFile,
} from '@nestjs/common';
import { UploadsService } from './uploads.service';

/**
 * Serves the uploaded images at `/uploads/<filename>`, outside the `/api`
 * prefix (see main.ts) and without authentication: they are displayed by
 * plain `<img>` tags. File names are random UUIDs.
 */
@Controller('uploads')
export class UploadedFilesController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Get(':filename')
  // A name is never reused for another content
  @Header('Cache-Control', 'public, max-age=31536000, immutable')
  async getImage(@Param('filename') filename: string): Promise<StreamableFile> {
    const image = await this.uploadsService.findImage(filename);
    if (!image) {
      throw new NotFoundException('Image introuvable');
    }
    return new StreamableFile(image.data, {
      type: image.contentType,
      length: image.data.length,
    });
  }
}
