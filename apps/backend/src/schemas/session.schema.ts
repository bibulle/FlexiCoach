import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SessionDocument = Session & Document;

@Schema({ timestamps: true })
export class Session {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;

  @Prop({ required: true })
  routineId: string;

  @Prop({ required: true, type: Date })
  startAt: Date;

  @Prop({ type: Date })
  endAt?: Date;

  @Prop({ required: true })
  durationSec: number;

  @Prop({ required: true, default: false })
  completed: boolean;

  @Prop({ min: 0, max: 100 })
  progress?: number;

  @Prop({ min: 1, max: 5 })
  feeling?: number;

  @Prop({ type: Object })
  device?: {
    ua?: string;
    platform?: string;
  };
}

export const SessionSchema = SchemaFactory.createForClass(Session);

// Add indexes for optimized queries
SessionSchema.index({ userId: 1 });
SessionSchema.index({ userId: 1, startAt: -1 });
SessionSchema.index({ routineId: 1 });
SessionSchema.index({ startAt: -1 });
