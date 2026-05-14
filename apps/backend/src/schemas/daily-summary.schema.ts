import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DailySummaryDocument = DailySummary & Document;

@Schema({ timestamps: true })
export class DailySummary {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;

  @Prop({ required: true })
  date!: string; // Format: 'YYYY-MM-DD'

  @Prop({
    type: [
      {
        routineId: String,
        completed: Boolean,
        durationSec: Number,
      },
    ],
    default: [],
  })
  routines!: Array<{
    routineId: string;
    completed: boolean;
    durationSec: number;
  }>;

  @Prop({ required: true, default: 0 })
  totalSec!: number;

  @Prop()
  streakAfter?: number;
}

export const DailySummarySchema = SchemaFactory.createForClass(DailySummary);

// Index composé pour rechercher efficacement par userId et date
DailySummarySchema.index({ userId: 1, date: 1 }, { unique: true });
