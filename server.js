// masters-pool/server.js

import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Score } from './server/models/Score.js';
import { scrapeData } from './scrape-scores.js';

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI, {
    dbName: 'masters_pool',
  })
  .then(() => console.log('⛳️ Connected to Golf Database'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Add a variable to hold the next scrape time
let nextScrapeTime = null;

// --- API ENDPOINT ---
app.get('/api/scores/:event/:year', async (req, res) => {
  try {
    const { event, year } = req.params;
    const scores = await Score.findOne({ eventId: event, year: parseInt(year) });
    if (!scores) return res.status(404).json({ error: 'No data found' });

    res.json({
      teams: scores.data,
      lastUpdated: scores.lastUpdated,
      nextUpdate: nextScrapeTime,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SMART SCRAPER TIMER ---
async function runSmartScraper() {
  try {
    await scrapeData();
  } catch (err) {
    console.error('❌ Smart Scraper Error:', err);
  } finally {
    scheduleNextScrape();
  }
}

function scheduleNextScrape() {
  // Get current hour in Eastern Time (Augusta, GA time)
  const now = new Date();
  const estString = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
  const estDate = new Date(estString);
  const hour = estDate.getHours(); // Returns 0-23

  let delayMinutes = 3; // Default: Active Tournament Hours

  // If it's 8 PM (20) or later, OR before 6 AM (6), slow down to once an hour
  if (hour >= 20 || hour < 6) {
    delayMinutes = 60;
    console.log(`🌙 Off-hours detected (Hour: ${hour} EST). Next DB update in 60 minutes.`);
  }

  // Calculate and store the exact time of the next scrape
  const delayMs = delayMinutes * 60 * 1000;
  nextScrapeTime = new Date(Date.now() + delayMs).toISOString();

  setTimeout(runSmartScraper, delayMs);
}

// Kick off the initial scrape cycle
runSmartScraper();

// --- SERVE FRONTEND ---
app.use(express.static(path.join(__dirname, 'dist')));
app.get('/*splat', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
