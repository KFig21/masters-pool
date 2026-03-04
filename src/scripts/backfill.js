// RUN: npx tsx src/scripts/backfill.js
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Score } from '../../server/models/Score.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const runBackfill = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`⛳️ Backfilling into: ${mongoose.connection.name}`);

    const history = [
      { event: 'genesis', year: 2026 },
      { event: 'arnold_palmer', year: 2026 },
    ];

    for (const item of history) {
      // Robust pathing: looks for /public relative to the project root
      const filePath = path.resolve(
        __dirname,
        `../../public/data/events/${item.event}/${item.year}/latest.json`,
      );

      if (fs.existsSync(filePath)) {
        const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        await Score.findOneAndUpdate(
          { eventId: item.event, year: item.year },
          {
            eventId: item.event,
            year: item.year,
            data: jsonData,
            lastUpdated: new Date(),
          },
          { upsert: true },
        );
        console.log(`✅ Uploaded ${item.event} ${item.year}`);
      } else {
        console.log(`⚠️ Skipping ${item.event}: File not found at ${filePath}`);
      }
    }
  } catch (err) {
    console.error('❌ Backfill Error:', err);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
};

runBackfill();
