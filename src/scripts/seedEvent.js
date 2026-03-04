// RUN: npx tsx src/scripts/seedEvent.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Score } from '../../server/models/Score.js';
import { CURRENT_EVENT, CURRENT_YEAR, EVENT_MATRIX } from '../../src/constants/index.ts';

dotenv.config();

async function seedDatabase() {
  const eventConfig = EVENT_MATRIX[CURRENT_EVENT];
  const yearConfig = eventConfig?.years[CURRENT_YEAR];

  if (!yearConfig) {
    console.error(`❌ No config found for ${CURRENT_EVENT} ${CURRENT_YEAR}`);
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'masters_pool' });
    console.log(`🌱 Seeding ${eventConfig.title} into ${mongoose.connection.name}...`);

    const initialData = yearConfig.teams.map((team) => ({
      ...team,
      golfers: team.golfers.map((g) => ({
        id: g.id,
        name: g.name,
        score: 0,
        displayScore: 'E',
        thru: '-',
        status: 'ACTIVE',
        isCut: false,
        scorecard: {
          round1: { total: null, scoreRound: null, thruScore: null, isCountingScore: false },
          round2: { total: null, scoreRound: null, thruScore: null, isCountingScore: false },
          round3: { total: null, scoreRound: null, thruScore: null, isCountingScore: false },
          round4: { total: null, scoreRound: null, thruScore: null, isCountingScore: false },
        },
      })),
    }));

    await Score.findOneAndUpdate(
      { eventId: CURRENT_EVENT, year: CURRENT_YEAR },
      {
        eventId: CURRENT_EVENT,
        year: CURRENT_YEAR,
        tournamentName: eventConfig.title,
        data: initialData,
        lastUpdated: new Date(),
      },
      { upsert: true },
    );

    console.log(`✅ Success! Seeded ${eventConfig.title}.`);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
}

seedDatabase();
