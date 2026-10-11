import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UploadedImageDocument = UploadedImage & Document;

/**
 * Image uploaded by a user (step illustration). The binary content lives in
 * MongoDB so that it survives a redeployment: the container file system is
 * recreated at each release. Images are limited to 5 MB, well below the 16 MB
 * limit of a document.
 */
@Schema({ timestamps: true })
export class UploadedImage {
  /** Public name, used in the URL: `/uploads/<filename>`. */
  @Prop({ required: true, unique: true })
  filename!: string;

  @Prop({ required: true })
  contentType!: string;

  @Prop({ required: true })
  size!: number;

  @Prop()
  originalName?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  ownerId?: Types.ObjectId;

  @Prop({ required: true, type: Buffer })
  data!: Buffer;
}

export const UploadedImageSchema = SchemaFactory.createForClass(UploadedImage);
