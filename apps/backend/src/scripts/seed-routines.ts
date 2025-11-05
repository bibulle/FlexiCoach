import mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedRoutines() {
  const mongoUri =
    process.env.MONGODB_URI || 'mongodb://localhost:27017/flexicoach';

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const routinesCollection = db.collection('routines');

    // Drop existing indexes to avoid conflicts
    try {
      await routinesCollection.dropIndexes();
      console.log('🗑️  Dropped existing indexes');
    } catch (error) {
      // Ignore if no indexes exist
    }

    // Clear existing routines
    await routinesCollection.deleteMany({});
    console.log('🗑️  Cleared existing routines');

    // Load routine files
    const routinesDir = path.join(__dirname, '../../../..', 'routines');
    const routineFiles = ['douce-10min.json', 'bureau-5min.json'];

    for (const file of routineFiles) {
      const filePath = path.join(routinesDir, file);

      if (fs.existsSync(filePath)) {
        const routineData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        await routinesCollection.insertOne(routineData);
        console.log(`✅ Loaded: ${routineData.name}`);
      } else {
        console.warn(`⚠️  File not found: ${filePath}`);
      }
    }

    const count = await routinesCollection.countDocuments();
    console.log(`\n✨ Successfully seeded ${count} routines`);
  } catch (error) {
    console.error('❌ Error seeding routines:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seedRoutines();
