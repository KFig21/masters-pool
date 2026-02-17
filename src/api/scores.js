// api/scores.js
export default async function handler(req, res) {
  const url = 'https://site.web.api.espn.com/apis/site/v2/sports/golf/leaderboard?league=pga';
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
};
