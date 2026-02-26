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
    dbName: 'masters_pool', // This creates a specific DB for this app
  })
  .then(() => console.log('⛳️ Connected to Golf Database'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// --- API ENDPOINT ---
app.get('/api/scores/:event/:year', async (req, res) => {
  try {
    const { event, year } = req.params;
    const scores = await Score.findOne({ eventId: event, year: parseInt(year) });
    if (!scores) return res.status(404).json({ error: 'No data found' });
    res.json(scores.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SCRAPER TIMER ---
setInterval(scrapeData, 5 * 60 * 1000); // 5 minutes
scrapeData(); // Initial run on start

// --- SERVE FRONTEND ---
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
