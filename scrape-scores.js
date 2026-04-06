// scrape-scores.js
import fetch from 'node-fetch';
import {
  BACKFILL_OVERRIDE,
  CURRENT_EVENT,
  CURRENT_YEAR,
  EVENT_MATRIX,
} from './src/constants/index.ts';
import { Score } from './server/models/Score.js';
import fetchEnhancedWeather from './src/scripts/fetchWeather.js';

// Polyfill for older Node versions if structuredClone is missing
const clone = (obj) => {
  if (typeof structuredClone === 'function') return structuredClone(obj);
  return JSON.parse(JSON.stringify(obj));
};

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
 * MAIN SCRAPE FUNCTION
 */
export async function scrapeData() {
  // 1. FRESH CONFIG EXTRACTION
  // We extract these INSIDE the function to ensure we always use the latest state
  const EVENT_DATA = EVENT_MATRIX[CURRENT_EVENT];
  const EVENT_YEAR_CONFIG = EVENT_DATA.years[CURRENT_YEAR];

  if (!EVENT_YEAR_CONFIG) {
    console.error(`❌ No configuration found for ${CURRENT_EVENT} ${CURRENT_YEAR}`);
    return;
  }

  // 2. THE "ZOMBIE KILLER": DEEP CLONE
  // By using structuredClone, we sever the reference to the constants file.
  // This ensures TEAMS starts as a 100% clean slate every 3 minutes.
  const TEAMS_CLEAN = clone(EVENT_YEAR_CONFIG.teams);
  const CUT_LINE = EVENT_YEAR_CONFIG.cutLine;
  const TOURNAMENT_ID = EVENT_YEAR_CONFIG.id;
  const LEADERBOARD_URL = `https://site.web.api.espn.com/apis/site/v2/sports/golf/leaderboard?league=pga&event=${TOURNAMENT_ID}`;

  // Date Check
  const now = new Date();
  const start = new Date(`${EVENT_YEAR_CONFIG.startDate}T00:00:00`);
  const end = new Date(`${EVENT_YEAR_CONFIG.endDate}T23:59:59`);

  if (!BACKFILL_OVERRIDE) {
    if (now < start || now > end) {
      console.log(`💤 ${EVENT_DATA.title} is outside scheduled dates. Skipping.`);
      return;
    }
  }

  console.log(`⛳️ Fetching live scores for ${EVENT_DATA.title}...`);

  try {
    const response = await fetch(LEADERBOARD_URL);
    const data = await response.json();

    // Tournament metadata
    const eventInfo = data.events?.[0];
    const tournamentInfo = eventInfo?.tournament;
    const currentRound = eventInfo?.competitions?.[0]?.status.period;
    const status = eventInfo?.competitions?.[0]?.status.type.name;
    const course = eventInfo?.courses?.[0]?.name || 'Unknown Course';
    const espnWeather = eventInfo?.courses?.[0]?.weather || 'null';

    const richWeather = await fetchEnhancedWeather(espnWeather.zipCode);

    const tournamentMetadata = {
      cutScore: tournamentInfo.cutScore,
      cutCount: tournamentInfo.cutCount,
      currentRound: currentRound,
      status: status,
      course: course,
      weather: richWeather || {
        conditionId: espnWeather.conditionId || null,
        temperature: espnWeather.temperature || null,
        highTemperature: espnWeather.highTemperature || null,
        lowTemperature: espnWeather.lowTemperature || null,
        windSpeed: espnWeather.windSpeed || null,
        windDirection: espnWeather.windDirection || null,
      },
    };

    const tournamentStatus = data.events?.[0]?.competitions?.[0]?.status?.type?.completed;
    if (tournamentStatus === true) {
      console.log(`🏁 Tournament is COMPLETED. Skipping update.`);
      return;
    }

    const cleanLeaderboard = processLeaderboard(data);

    // We pass the CLEANED, CLONED teams here
    const compiledTeams = compileTeamData(cleanLeaderboard.leaderboard, TEAMS_CLEAN, CUT_LINE);

    const date = new Date();
    await Score.findOneAndUpdate(
      { eventId: CURRENT_EVENT, year: CURRENT_YEAR },
      {
        tournamentName: EVENT_DATA.title,
        data: compiledTeams,
        lastUpdated: date,
        tournamentMetadata: tournamentMetadata,
      },
      { upsert: true, new: true },
    );

    console.log(`✅ DB Updated at ${date.toLocaleTimeString()}.`);
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
function compileTeamData(leaderboardPlayers, cleanTeams, cutLine) {
  const statsLookup = {};
  leaderboardPlayers.forEach((entry) => {
    statsLookup[entry.player.id] = entry.player;
  });

  // 1. Track assigned golfers to isolate the unselected field
  const selectedGolferIds = new Set();

  const teams = cleanTeams.map((team) => {
    const processedGolfers = team.golfers.map((ref) => {
      selectedGolferIds.add(ref.id); // Mark golfer as selected
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
          ? clone(stats.scorecard)
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

      const topXScoreIds = new Set(scoredGolfers.slice(0, cutLine).map((g) => g.id));

      processedGolfers.forEach((g) => {
        if (g.scorecard[roundKey]) {
          g.scorecard[roundKey].isCountingScore = topXScoreIds.has(g.id);
        }
      });
    });

    return { ...team, golfers: processedGolfers };
  });

  // 2. Build the Unselected Team
  const unselectedGolfers = leaderboardPlayers
    .filter((entry) => !selectedGolferIds.has(entry.player.id))
    .map((entry) => {
      const stats = entry.player;
      return {
        id: stats.id,
        name: stats.name,
        score: stats.score !== undefined ? stats.score : 99,
        displayScore: stats.displayScore || 'DNP',
        thru: stats.thru || '-',
        status: stats.status || 'DNP',
        isCut: stats.isCut !== undefined ? stats.isCut : true,
        scorecard: clone(
          stats.scorecard || {
            round1: { total: null, scoreRound: null, thruScore: null, isCountingScore: false },
            round2: { total: null, scoreRound: null, thruScore: null, isCountingScore: false },
            round3: { total: null, scoreRound: null, thruScore: null, isCountingScore: false },
            round4: { total: null, scoreRound: null, thruScore: null, isCountingScore: false },
          },
        ),
      };
    });

  const unselectedTeam = {
    owner: 'UNSELECTED_FIELD',
    name: 'The Field',
    golfers: unselectedGolfers,
  };

  return [...teams, unselectedTeam];
}
