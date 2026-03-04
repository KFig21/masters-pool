// RUN: npx tsx src/scripts/cleanup.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function cleanup() {
  try {
    // Connect to the cluster
    await mongoose.connect(process.env.MONGODB_URI);

    // Switch to the 'test' database to drop it
    const testDb = mongoose.connection.useDb('test');
    console.log('🧹 Attempting to drop the "test" database...');

    await testDb.dropDatabase();

    console.log('✅ "test" database deleted successfully.');
  } catch (err) {
    console.error('❌ Cleanup failed:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
}

cleanup();
