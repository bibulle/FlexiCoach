import { readFileSync } from 'fs';
import { join } from 'path';
import mongoose from 'mongoose';

/**
 * Seeds the built-in routines used by the UI tests (douce-10min, bureau-5min).
 * Upsert only: existing data is never deleted.
 * MONGODB_URI must point to the database used by the backend under test.
 */
export default async function globalSetup() {
  const uri =
    process.env['MONGODB_URI'] || 'mongodb://localhost:27017/flexicoach';
  const routinesDir = join(__dirname, '../../../../routines');

  await mongoose.connect(uri);
  try {
    const routines = mongoose.connection.db!.collection('routines');
    for (const file of ['douce-10min.json', 'bureau-5min.json']) {
      const routine = JSON.parse(readFileSync(join(routinesDir, file), 'utf-8'));
      await routines.updateOne(
        { id: routine.id },
        { $set: { ...routine, visibility: 'builtIn' } },
        { upsert: true },
      );
    }
  } finally {
    await mongoose.disconnect();
  }
}
