import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoutinesController } from './routines.controller';
import { RoutinesService } from './routines.service';
import { Routine, RoutineSchema } from '../schemas/routine.schema';
import { User, UserSchema } from '../schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Routine.name, schema: RoutineSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [RoutinesController],
  providers: [RoutinesService],
  exports: [RoutinesService],
})
export class RoutinesModule {}
