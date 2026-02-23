// masters-pool/scrape-scores.js

import fs from 'fs';
import fetch from 'node-fetch';
import { TEAMS } from './src/data/teams.ts';

// 2025 Masters ID (Update this ID for the actual live event when needed)
// const TOURNAMENT_ID = '401703504';
// const PAR = 72;

// 2026 Genesis Invitational ID for testing
const TOURNAMENT_ID = '401811933';
const LEADERBOARD_URL = `https://site.web.api.espn.com/apis/site/v2/sports/golf/leaderboard?league=pga&event=${TOURNAMENT_ID}`;

// Helper function to safely parse ESPN's string scores ("E", "-3", "+2") into integers
function parseRelScore(scoreStr) {
  if (!scoreStr) return 0;
  const cleanStr = String(scoreStr).trim().toUpperCase();
  if (cleanStr === 'E' || cleanStr === 'EVEN' || cleanStr === '0') return 0;
  // parseInt naturally handles minus signs, we just need to strip out the '+'
  return parseInt(cleanStr.replace('+', ''), 10) || 0;
}

async function scrapeData() {
  console.log('Fetching live tournament data...');
  try {
    const response = await fetch(LEADERBOARD_URL);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();
    const cleanLeaderboard = processLeaderboard(data);
    const compiledTeams = compileTeamData(cleanLeaderboard.leaderboard);

    fs.writeFileSync('./src/data/leaderboard_test.json', JSON.stringify(cleanLeaderboard, null, 2));
    fs.writeFileSync('./src/data/team_data.json', JSON.stringify(compiledTeams, null, 2));

    console.log(`✅ Success! Data compiled for ${cleanLeaderboard.leaderboard.length} players.`);
  } catch (error) {
    console.error('Error fetching data:', error);
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
