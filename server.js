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

// Connection Logic
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('🚨 ERROR: MONGODB_URI is not defined in environment variables!');
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI, { dbName: 'masters_pool' })
  .then(() => console.log('⛳️ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// API Endpoints
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

// Timer - 5 minute interval
setInterval(
  () => {
    scrapeData().catch((err) => console.error('Scraper Interval Error:', err));
  },
  5 * 60 * 1000,
);

// Kick off first scrape
scrapeData();

// Serve Static Files (Vite build output)
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
