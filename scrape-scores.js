import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { CURRENT_EVENT, CURRENT_YEAR, EVENT_MATRIX } from './src/constants/index.ts';

console.log(`Starting data scrape for ${EVENT_MATRIX[CURRENT_EVENT].title} ${CURRENT_YEAR}...`);

// Grab tournament id for the current event in constants
const TOURNAMENT_ID = EVENT_MATRIX[CURRENT_EVENT].years[CURRENT_YEAR].id;
const LEADERBOARD_URL = `https://site.web.api.espn.com/apis/site/v2/sports/golf/leaderboard?league=pga&event=${TOURNAMENT_ID}`;

// Helper function to safely parse ESPN's string scores ("E", "-3", "+2") into integers
function parseRelScore(scoreStr) {
  if (!scoreStr) return 0;
  const cleanStr = String(scoreStr).trim().toUpperCase();
  if (cleanStr === 'E' || cleanStr === 'EVEN' || cleanStr === '0') return 0;
  // parseInt naturally handles minus signs, we just need to strip out the '+'
  return parseInt(cleanStr.replace('+', ''), 10) || 0;
}

// Define your current context
const EVENT_NAME = EVENT_MATRIX[CURRENT_EVENT].id;
const TEAMS = EVENT_MATRIX[CURRENT_EVENT].years[CURRENT_YEAR].teams;

// Path to the public directory where React can fetch the files
const DATA_DIR = path.join(
  process.cwd(),
  'public',
  'data',
  'events',
  EVENT_NAME,
  CURRENT_YEAR.toString(),
);

async function scrapeData() {
  console.log('Fetching live tournament data...');
  try {
    const response = await fetch(LEADERBOARD_URL);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();

    // Quick validation: If the API sends an empty array, throw an error to trigger the fallback
    if (!data.events?.[0]?.competitions?.[0]?.competitors) {
      throw new Error('API returned empty competitor data.');
    }

    const cleanLeaderboard = processLeaderboard(data);
    const compiledTeams = compileTeamData(cleanLeaderboard.leaderboard);

    saveDataWithBackups(compiledTeams);

    console.log(`✅ Success! Data compiled and saved.`);
  } catch (error) {
    console.error('❌ Error fetching data, looking for fallback...', error);
    restoreFromFallback();
  }
}

function saveDataWithBackups(compiledTeams) {
  // 1. Ensure the directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const timestamp = Date.now();
  const backupPath = path.join(DATA_DIR, `${timestamp}.json`);
  const latestPath = path.join(DATA_DIR, `latest.json`);

  const jsonString = JSON.stringify(compiledTeams, null, 2);

  // 2. Write the historical backup
  fs.writeFileSync(backupPath, jsonString);

  // 3. Overwrite the 'latest' file for the React app to read
  fs.writeFileSync(latestPath, jsonString);

  // Optional: Clean up old files so the folder doesn't get too massive
  cleanupOldBackups(DATA_DIR, 20); // Keep last 20 pulls
}

function restoreFromFallback() {
  if (!fs.existsSync(DATA_DIR)) return;

  // Get all timestamped JSON files, sort descending (newest first)
  const files = fs
    .readdirSync(DATA_DIR)
    .filter((f) => f !== 'latest.json' && f.endsWith('.json'))
    .sort()
    .reverse();

  for (const file of files) {
    try {
      const filePath = path.join(DATA_DIR, file);
      const fileData = fs.readFileSync(filePath, 'utf8');
      const parsedData = JSON.parse(fileData);

      if (parsedData && parsedData.length > 0) {
        console.log(`🔄 Restored fallback data from ${file}`);
        // Overwrite latest.json with this valid backup
        fs.writeFileSync(path.join(DATA_DIR, 'latest.json'), fileData);
        return;
      }
    } catch (e) {
      console.warn(`⚠️ Backup ${file} is corrupted, trying next...`);
    }
  }
  console.error('🚨 All fallbacks failed.');
}

function cleanupOldBackups(directory, keepCount) {
  const files = fs
    .readdirSync(directory)
    .filter((f) => f !== 'latest.json' && f.endsWith('.json'))
    .sort()
    .reverse(); // Newest first

  if (files.length > keepCount) {
    const filesToDelete = files.slice(keepCount);
    filesToDelete.forEach((file) => fs.unlinkSync(path.join(directory, file)));
  }
}

function processLeaderboard(apiData) {
  const competitors = apiData.events?.[0]?.competitions?.[0]?.competitors || [];

  const formattedPlayers = competitors.map((player) => {
    const rounds = player.linescores || [];
    const scorecard = {};
    let runningTotal = 0;

    // Process rounds 1-4
    [0, 1, 2, 3].forEach((index) => {
      const roundNum = index + 1;
      const roundData = rounds[index];

      // We check for displayValue instead of just 'value' to safely handle live rounds
      if (roundData && roundData.displayValue) {
        const total = parseInt(roundData.value) || 0; // Total strokes taken so far this round
        const roundScore = parseRelScore(roundData.displayValue); // The relative-to-par score

        runningTotal += roundScore;

        scorecard[`round${roundNum}`] = {
          total: total,
          scoreRound: roundScore,
          thruScore: runningTotal,
        };
      } else {
        scorecard[`round${roundNum}`] = {
          total: null,
          scoreRound: null,
          thruScore: null,
        };
      }
    });

    const statusStr = player.status?.displayValue || '';

    let status = 'ACTIVE';
    let isCut = false;

    if (statusStr === 'CUT' || statusStr === 'WD' || statusStr === 'DQ') {
      status = statusStr;
      isCut = true;
      // If player is cut, nullify round 3 and 4
      scorecard[`round3`] = {
        total: null,
        scoreRound: null,
        thruScore: null,
      };
      scorecard[`round4`] = {
        total: null,
        scoreRound: null,
        thruScore: null,
      };
    } else if (player.status?.type?.id === '3') {
      status = 'ACTIVE';
    }

    // UPDATED LOGIC: Use our perfectly calculated runningTotal as the source of truth!
    let currentScore = runningTotal;

    // Format the display string dynamically based on the math
    let displayScore =
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
        // Give missing players a 99 so they sort below any active golfer shooting over par
        score: stats ? stats.score : 99,
        // Display as DNP so the UI is clear to the user
        displayScore: stats ? stats.displayScore : 'DNP',
        thru: stats ? stats.thru : '-',
        // Mark them as DNP instead of ACTIVE
        status: stats ? stats.status : 'DNP',
        // Treat them as CUT so they are completely excluded from active team math
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

    // Calculate the top 4 based on THRU score
    [1, 2, 3, 4].forEach((roundNum) => {
      const roundKey = `round${roundNum}`;

      // 1. Get all valid scores for this round using thruScore
      const scoredGolfers = processedGolfers
        .filter((g) => g.scorecard[roundKey] && g.scorecard[roundKey].thruScore !== null)
        .map((g) => ({
          id: g.id,
          score: g.scorecard[roundKey].thruScore,
        }));

      // 2. Sort ascending (lowest cumulative score is best)
      scoredGolfers.sort((a, b) => a.score - b.score);

      // 3. Grab the IDs of the top 4
      const top4Ids = new Set(scoredGolfers.slice(0, 4).map((g) => g.id));

      // 4. Mark the scorecard for those top 4
      processedGolfers.forEach((g) => {
        if (g.scorecard[roundKey]) {
          g.scorecard[roundKey].isCountingScore = top4Ids.has(g.id);
        }
      });
    });

    return {
      ...team,
      golfers: processedGolfers,
    };
  });
}

scrapeData();
