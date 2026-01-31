import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  _id?: any;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false, select: false })
  password?: string;

  @Prop()
  displayName?: string;

  @Prop()
  avatar?: string;

  @Prop({ enum: ['local', 'google'], default: 'local' })
  provider: string;

  @Prop()
  providerId?: string;

  @Prop({ default: 'Europe/Paris' })
  tz?: string;

  @Prop({ type: Object, default: {} })
  settings?: {
    theme?: 'light' | 'dark';
    voiceRate?: number;
    voicePitch?: number;
    voiceVolume?: number;
    sound?: boolean;
    notifications?: boolean;
    reminders?: Array<{
      time: string;
      days: number[];
      enabled: boolean;
    }>;
    favoriteRoutine?: string;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
