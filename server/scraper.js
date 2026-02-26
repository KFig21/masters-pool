import fetch from 'node-fetch';
import { pool } from './db.js';
import { CURRENT_EVENT, CURRENT_YEAR, EVENT_MATRIX } from '../src/constants/index.ts';

const TOURNAMENT_ID = EVENT_MATRIX[CURRENT_EVENT].years[CURRENT_YEAR].id;
const LEADERBOARD_URL = `https://site.web.api.espn.com/apis/site/v2/sports/golf/leaderboard?league=pga&event=${TOURNAMENT_ID}`;
const EVENT_NAME = EVENT_MATRIX[CURRENT_EVENT].id;
const TEAMS = EVENT_MATRIX[CURRENT_EVENT].years[CURRENT_YEAR].teams;
const CUT_LINE = EVENT_MATRIX[CURRENT_EVENT].years[CURRENT_YEAR].cutLine;

function parseRelScore(scoreStr) {
  if (!scoreStr) return 0;
  const cleanStr = String(scoreStr).trim().toUpperCase();
  if (cleanStr === 'E' || cleanStr === 'EVEN' || cleanStr === '0') return 0;
  return parseInt(cleanStr.replace('+', ''), 10) || 0;
}

export async function scrape() {
  console.log(`🔄 Scraping ${EVENT_MATRIX[CURRENT_EVENT].title} ${CURRENT_YEAR}...`);
  try {
    const response = await fetch(LEADERBOARD_URL);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();

    if (!data.events?.[0]?.competitions?.[0]?.competitors) {
      throw new Error('API returned empty competitor data.');
    }

    const cleanLeaderboard = processLeaderboard(data);
    const compiledTeams = compileTeamData(cleanLeaderboard.leaderboard);

    await pool.query(
      `INSERT INTO scores (event, year, data, updated_at)
       VALUES ($1, $2, $3, now())
       ON CONFLICT (event, year) DO UPDATE
         SET data = EXCLUDED.data, updated_at = now()`,
      [EVENT_NAME, CURRENT_YEAR, JSON.stringify(compiledTeams)],
    );

    console.log('✅ Scrape success — DB updated.');
  } catch (error) {
    console.error('❌ Scrape failed:', error.message);
    // No fallback needed — DB already holds last good data
  }
}

function processLeaderboard(apiData) {
  const competitors = apiData.events?.[0]?.competitions?.[0]?.competitors || [];

  const formattedPlayers = competitors.map((player) => {
    const rounds = player.linescores || [];
    const scorecard = {};
    let runningTotal = 0;

    [0, 1, 2, 3].forEach((index) => {
      const roundNum = index + 1;
      const roundData = rounds[index];

      if (roundData && roundData.displayValue) {
        const total = parseInt(roundData.value) || 0;
        const roundScore = parseRelScore(roundData.displayValue);
        runningTotal += roundScore;
        scorecard[`round${roundNum}`] = { total, scoreRound: roundScore, thruScore: runningTotal };
      } else {
        scorecard[`round${roundNum}`] = { total: null, scoreRound: null, thruScore: null };
      }
    });

    const statusStr = player.status?.displayValue || '';
    let status = 'ACTIVE';
    let isCut = false;

    if (statusStr === 'CUT' || statusStr === 'WD' || statusStr === 'DQ') {
      status = statusStr;
      isCut = true;
      scorecard['round3'] = { total: null, scoreRound: null, thruScore: null };
      scorecard['round4'] = { total: null, scoreRound: null, thruScore: null };
    }

    const currentScore = runningTotal;
    const displayScore =
      currentScore === 0 ? 'E' : currentScore > 0 ? `+${currentScore}` : String(currentScore);

    return {
      player: {
        name: player.athlete.displayName,
        id: player.athlete.id,
        score: currentScore,
        displayScore,
        thru: statusStr,
        status,
        isCut,
        scorecard,
      },
    };
  });

  return { leaderboard: formattedPlayers };
}

function compileTeamData(leaderboardPlayers) {
  const statsLookup = {};
  leaderboardPlayers.forEach((entry) => {
    statsLookup[entry.player.id] = entry.player;
  });

  return TEAMS.map((team) => {
    const processedGolfers = team.golfers.map((ref) => {
      const stats = statsLookup[ref.id];
      return {
        id: ref.id,
        name: ref.name,
        score: stats ? stats.score : 99,
        displayScore: stats ? stats.displayScore : 'DNP',
        thru: stats ? stats.thru : '-',
        status: stats ? stats.status : 'DNP',
        isCut: stats ? stats.isCut : true,
        scorecard: stats
          ? stats.scorecard
          : {
              round1: { total: null, scoreRound: null, thruScore: null, isCountingScore: false },
              round2: { total: null, scoreRound: null, thruScore: null, isCountingScore: false },
              round3: { total: null, scoreRound: null, thruScore: null, isCountingScore: false },
              round4: { total: null, scoreRound: null, thruScore: null, isCountingScore: false },
            },
      };
    });

    [1, 2, 3, 4].forEach((roundNum) => {
      const roundKey = `round${roundNum}`;
      const scoredGolfers = processedGolfers
        .filter((g) => g.scorecard[roundKey]?.thruScore !== null)
        .map((g) => ({ id: g.id, score: g.scorecard[roundKey].thruScore }))
        .sort((a, b) => a.score - b.score);

      const topXScoreIds = new Set(scoredGolfers.slice(0, CUT_LINE).map((g) => g.id));
      processedGolfers.forEach((g) => {
        if (g.scorecard[roundKey]) {
          g.scorecard[roundKey].isCountingScore = topXScoreIds.has(g.id);
        }
      });
    });

    return { ...team, golfers: processedGolfers };
  });
}
