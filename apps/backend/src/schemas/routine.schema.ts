import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoutineDocument = Routine & Document;

@Schema({ timestamps: true })
export class Step {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  seconds!: number;

  @Prop({ required: true, enum: ['mouvement', 'statique', 'respiration'] })
  mode!: string;

  @Prop({ required: true })
  text!: string;

  @Prop({ type: [{ at: Number, say: String }], default: [] })
  cues?: Array<{
    at: number;
    say: string;
  }>;
}

const StepSchema = SchemaFactory.createForClass(Step);

@Schema({ timestamps: true })
export class Routine {
  @Prop({ required: true, unique: true })
  id!: string;

  @Prop({ required: true, unique: true })
  slug!: string;

  @Prop({ required: true })
  name!: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  duration!: number;

  @Prop({ required: true })
  level!: string;

  @Prop({ type: [StepSchema], required: true })
  steps!: Step[];

  @Prop({ required: true })
  totalSeconds!: number;

  @Prop({ default: 10 })
  restSeconds?: number;

  @Prop({ default: 1 })
  version?: number;

  @Prop({ default: 'builtIn', enum: ['builtIn', 'user'] })
  visibility?: string;

  @Prop()
  ownerId?: string;

  @Prop()
  tag?: string;
}

export const RoutineSchema = SchemaFactory.createForClass(Routine);
