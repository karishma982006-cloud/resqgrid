import { connectDB } from '../config/db.js';
import { seedDatabase } from './seedData.js';

const run = async () => {
  try {
    await connectDB();
    await seedDatabase();
    console.log('[SEED RUNNER] Database seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('[SEED RUNNER ERROR]', err);
    process.exit(1);
  }
};

run();
