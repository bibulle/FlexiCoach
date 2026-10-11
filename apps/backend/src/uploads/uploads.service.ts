import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import {
  UploadedImage,
  UploadedImageDocument,
} from '../schemas/uploaded-image.schema';

/** Accepted image types and the extension given to the stored file. */
export const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

/** What is needed from an uploaded file (subset of Express.Multer.File). */
export interface ImageFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

/** `<uuid>.<ext>`: the only names this service generates (and serves). */
const FILENAME_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp)$/i;

@Injectable()
export class UploadsService {
  constructor(
    @InjectModel(UploadedImage.name)
    private imageModel: Model<UploadedImageDocument>,
  ) {}

  /** Stores an image in the database and returns its public name. */
  async saveImage(
    file: ImageFile,
    ownerId?: string,
  ): Promise<{ filename: string; originalName: string; size: number }> {
    // The extension comes from the validated type, never from the client name
    const filename = `${randomUUID()}${IMAGE_EXTENSIONS[file.mimetype]}`;
    await new this.imageModel({
      filename,
      contentType: file.mimetype,
      size: file.size,
      originalName: file.originalname,
      ownerId,
      data: file.buffer,
    }).save();

    return { filename, originalName: file.originalname, size: file.size };
  }

  /** Image stored under this public name, or null. */
  async findImage(filename: string): Promise<UploadedImage | null> {
    if (!FILENAME_PATTERN.test(filename)) {
      return null;
    }
    return this.imageModel.findOne({ filename }).exec();
  }
}
