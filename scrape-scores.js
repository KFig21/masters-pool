import fs from 'fs';
import fetch from 'node-fetch';
import { TEAMS } from './src/data/teams.ts';

// 2025 Masters ID (Update this ID for the actual live event when needed)
const TOURNAMENT_ID = '401703504';
const PAR = 72;
const LEADERBOARD_URL = `https://site.web.api.espn.com/apis/site/v2/sports/golf/leaderboard?league=pga&event=${TOURNAMENT_ID}`;

async function scrapeData() {
  console.log('Fetching 2025 Masters data...');
  try {
    const response = await fetch(LEADERBOARD_URL);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();
    const cleanLeaderboard = processLeaderboard(data);
    const compiledTeams = compileTeamData(cleanLeaderboard.leaderboard);

    fs.writeFileSync('./src/data/leaderboard_2025.json', JSON.stringify(cleanLeaderboard, null, 2));
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

      if (roundData && roundData.value) {
        const total = parseInt(roundData.value);
        const roundScore = total - PAR;
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

    // --- FIX FOR .replace() ERROR ---
    let currentScore = 0;
    // Check multiple potential locations for the score string
    let displayScore = player.score?.displayValue || player.score || 'E';

    // Convert to string safely to avoid .replace() errors
    let displayScoreStr = String(displayScore);

    if (displayScoreStr === 'E' || displayScoreStr === '0' || displayScoreStr === 'even') {
      currentScore = 0;
      displayScore = 'E';
    } else {
      // Remove any non-numeric characters except the minus sign
      currentScore = parseInt(displayScoreStr.replace('+', '')) || 0;
      displayScore = displayScoreStr;
    }

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
      // ... (keep mapping logic exactly the same)
      const stats = statsLookup[ref.id];
      return {
        id: ref.id,
        name: ref.name,
        score: stats ? stats.score : 0,
        displayScore: stats ? stats.displayScore : '-',
        thru: stats ? stats.thru : '-',
        status: stats ? stats.status : 'ACTIVE',
        isCut: stats ? stats.isCut : false,
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

    // --- UPDATED: Calculate the top 4 based on THRU score ---
    [1, 2, 3, 4].forEach((roundNum) => {
      const roundKey = `round${roundNum}`;

      // 1. Get all valid scores for this round using thruScore
      const scoredGolfers = processedGolfers
        .filter((g) => g.scorecard[roundKey] && g.scorecard[roundKey].thruScore !== null)
        .map((g) => ({
          id: g.id,
          score: g.scorecard[roundKey].thruScore, // Swapped from scoreRound
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

scrapeData(); // npm run scrape
