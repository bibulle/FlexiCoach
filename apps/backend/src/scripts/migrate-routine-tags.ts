import mongoose from 'mongoose';

const TAG_MAP: Record<string, string> = {
  'douce-10min': 'quotidien',
  'bureau-5min': 'bureau',
};

const KEYWORD_TAGS: Array<{ keywords: string[]; tag: string }> = [
  {
    keywords: ['squash', 'golf', 'running', 'sport', 'ischio', 'gainage'],
    tag: 'sport',
  },
  {
    keywords: ['bureau', 'cervical', 'assis', 'travail', 'express'],
    tag: 'bureau',
  },
  { keywords: ['respiration', 'sophrologie', 'cohérence'], tag: 'respiration' },
  { keywords: ['mobilité', 'mobilite', 'étirement', 'yoga'], tag: 'mobilite' },
  {
    keywords: ['quotidien', 'matin', 'soir', 'réveil', 'douce'],
    tag: 'quotidien',
  },
];

function inferTag(routine: {
  id: string;
  name: string;
  description?: string;
}): string | null {
  if (TAG_MAP[routine.id]) return TAG_MAP[routine.id];
  const text = `${routine.name} ${routine.description ?? ''}`.toLowerCase();
  for (const { keywords, tag } of KEYWORD_TAGS) {
    if (keywords.some((kw) => text.includes(kw))) return tag;
  }
  return null;
}

async function migrateRoutineTags() {
  const mongoUri =
    process.env.MONGODB_URI || 'mongodb://localhost:27017/flexicoach';
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB');

  const col = mongoose.connection.db.collection('routines');
  const routines = await col.find({}).toArray();

  let updated = 0;
  for (const routine of routines) {
    if (routine.tag) continue; // already tagged
    const tag = inferTag(routine as any);
    if (tag) {
      await col.updateOne({ _id: routine._id }, { $set: { tag } });
      console.log(`  ✓ ${routine.name} → ${tag}`);
      updated++;
    } else {
      console.log(`  ⚠️  ${routine.name} → no tag inferred`);
    }
  }

  console.log(`\n✨ Tagged ${updated}/${routines.length} routines`);
  await mongoose.disconnect();
}

migrateRoutineTags().catch((err) => {
  console.error(err);
  process.exit(1);
});
