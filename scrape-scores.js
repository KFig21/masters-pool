// scrape-scores.js
import fetch from 'node-fetch';
import { CURRENT_EVENT, CURRENT_YEAR, EVENT_MATRIX } from './src/constants/index.ts';
import { Score } from './server/models/Score.js';

/**
 * SCRAPER CONFIGURATION
 */
const EVENT_DATA = EVENT_MATRIX[CURRENT_EVENT];
const EVENT_TITLE = EVENT_DATA.title;
const EVENT_YEAR_CONFIG = EVENT_DATA.years[CURRENT_YEAR];
const TOURNAMENT_ID = EVENT_YEAR_CONFIG.id;
const TEAMS = EVENT_YEAR_CONFIG.teams;
const CUT_LINE = EVENT_YEAR_CONFIG.cutLine;

const LEADERBOARD_URL = `https://site.web.api.espn.com/apis/site/v2/sports/golf/leaderboard?league=pga&event=${TOURNAMENT_ID}`;

console.log(`🚀 Scraper initialized for ${EVENT_TITLE} ${CURRENT_YEAR}`);

/**
 * HELPER: Parse ESPN scores ("E", "-3", "+2") to Integers
 */
function parseRelScore(scoreStr) {
  if (!scoreStr) return 0;
  const cleanStr = String(scoreStr).trim().toUpperCase();
  if (cleanStr === 'E' || cleanStr === 'EVEN' || cleanStr === '0') return 0;
  return parseInt(cleanStr.replace('+', ''), 10) || 0;
}

/**
 * CHECK: Is the tournament active based on dates in constants?
 */
function isTournamentWeek() {
  const now = new Date();
  if (!EVENT_YEAR_CONFIG.startDate || !EVENT_YEAR_CONFIG.endDate) {
    console.warn(`⚠️ Dates missing for ${EVENT_TITLE}. Running anyway.`);
    return true;
  }
  const start = new Date(`${EVENT_YEAR_CONFIG.startDate}T00:00:00`);
  const end = new Date(`${EVENT_YEAR_CONFIG.endDate}T23:59:59`);
  return now >= start && now <= end;
}

/**
 * MAIN SCRAPE FUNCTION
 */
export async function scrapeData() {
  if (!isTournamentWeek()) {
    console.log(`💤 ${EVENT_TITLE} is outside scheduled dates. Skipping.`);
    return;
  }

  console.log('⛳️ Fetching live scores from ESPN...');

  try {
    const response = await fetch(LEADERBOARD_URL);
    const data = await response.json();

    const tournamentStatus = data.events?.[0]?.competitions?.[0]?.status?.type?.completed;
    if (tournamentStatus === true) {
      console.log(`🏁 ${EVENT_TITLE} is COMPLETED. Skipping update.`);
      return;
    }

    const cleanLeaderboard = processLeaderboard(data);
    const compiledTeams = compileTeamData(cleanLeaderboard.leaderboard);
    const date = new Date();
    const formattedDate = date.toLocaleString('en-US', {
      timeZone: 'America/New_York',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    // SAVE TO MONGODB ONLY
    await Score.findOneAndUpdate(
      { eventId: CURRENT_EVENT, year: CURRENT_YEAR },
      {
        tournamentName: EVENT_TITLE,
        data: compiledTeams,
        lastUpdated: date,
      },
      { upsert: true, new: true },
    );

    console.log(`✅ DB Updated: ${formattedDate}.`);
  } catch (error) {
    console.error('❌ Scraper Error:', error);
  }
}

/**
 * DATA PROCESSING: Format ESPN API response
 */
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

        scorecard[`round${roundNum}`] = {
          total: total,
          scoreRound: roundScore,
          thruScore: runningTotal,
        };
      } else {
        scorecard[`round${roundNum}`] = { total: null, scoreRound: null, thruScore: null };
      }
    });

    const statusStr = player.status?.displayValue || '';
    let status = 'ACTIVE';
    let isCut = false;

    if (['CUT', 'WD', 'DQ'].includes(statusStr)) {
      status = statusStr;
      isCut = true;
      scorecard.round3 = { total: null, scoreRound: null, thruScore: null };
      scorecard.round4 = { total: null, scoreRound: null, thruScore: null };
    }

    const currentScore = runningTotal;
    const displayScore =
      currentScore === 0 ? 'E' : currentScore > 0 ? `+${currentScore}` : String(currentScore);

    return {
      player: {
        name: player.athlete.displayName,
        id: player.athlete.id,
        score: currentScore,
        displayScore: displayScore,
        thru: statusStr,
        status: status,
        isCut: isCut,
        scorecard: scorecard,
      },
    };
  });

  return { leaderboard: formattedPlayers };
}

/**
 * TEAM COMPILATION: Match live scores to user teams
 */
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

    // Handle best-ball counting scores logic
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
