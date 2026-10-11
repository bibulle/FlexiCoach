import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../schemas/user.schema';
import {
  IMAGE_EXTENSIONS,
  MAX_IMAGE_SIZE,
  UploadsService,
} from './uploads.service';

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      // Kept in memory, then stored in MongoDB: nothing is written on the
      // container disk, which does not survive a redeployment
      storage: memoryStorage(),
      fileFilter: (_req, file, cb) => {
        if (!IMAGE_EXTENSIONS[file.mimetype]) {
          cb(
            new BadRequestException(
              'Seuls les formats JPEG, PNG et WebP sont acceptés',
            ),
            false,
          );
          return;
        }
        cb(null, true);
      },
      limits: {
        fileSize: MAX_IMAGE_SIZE,
      },
    }),
  )
  async uploadImage(
    @UploadedFile()
    file: Express.Multer.File,
    @CurrentUser() user?: User,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }
    const saved = await this.uploadsService.saveImage(
      file,
      user?._id?.toString(),
    );
    return {
      imageUrl: `/uploads/${saved.filename}`,
      originalName: saved.originalName,
      size: saved.size,
    };
  }
}
