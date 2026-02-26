import express from 'express';
import cron from 'node-cron';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, initDb } from './db.js';
import { scrape } from './scraper.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const IS_PROD = process.env.NODE_ENV === 'production';

// --- API ---
app.get('/api/scores/:event/:year', async (req, res) => {
  const { event, year } = req.params;
  try {
    const result = await pool.query(
      'SELECT data, updated_at FROM scores WHERE event = $1 AND year = $2',
      [event, parseInt(year)],
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: `No data found for ${event} ${year}` });
    }
    res.json({
      data: result.rows[0].data,
      updatedAt: result.rows[0].updated_at,
    });
  } catch (err) {
    console.error('DB query failed:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Serve built frontend in production ---
if (IS_PROD) {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

// --- Boot ---
async function start() {
  await initDb();

  // Scrape immediately on start, then every 5 minutes
  await scrape();
  cron.schedule('*/5 * * * *', scrape);

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

start();
