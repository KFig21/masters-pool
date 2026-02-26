// one time run to backfill the db. MAY have to be moved to the root folder

import mongoose from 'mongoose';
import fs from 'fs';
import dotenv from 'dotenv';
import { Score } from '../../server/models/Score.js';

dotenv.config();

const runBackfill = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  // Define what you want to import
  const history = [
    { event: 'masters', year: 2023 },
    { event: 'masters', year: 2025 },
    { event: 'cognizant', year: 2026 },
  ];

  for (const item of history) {
    const path = `./public/data/events/${item.event}/${item.year}/latest.json`;
    if (fs.existsSync(path)) {
      const jsonData = JSON.parse(fs.readFileSync(path, 'utf-8'));
      await Score.findOneAndUpdate(
        { eventId: item.event, year: item.year },
        { data: jsonData, lastUpdated: new Date() },
        { upsert: true },
      );
      console.log(`✅ Uploaded ${item.event} ${item.year}`);
    }
  }
  process.exit();
};

runBackfill();
