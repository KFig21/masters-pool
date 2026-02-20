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
      const stats = statsLookup[ref.id];
      return {
        id: ref.id,
        name: ref.name,
        // Fallback to defaults if player not found in feed yet
        score: stats ? stats.score : 0,
        displayScore: stats ? stats.displayScore : '-',
        thru: stats ? stats.thru : '-',
        status: stats ? stats.status : 'ACTIVE',
        isCut: stats ? stats.isCut : false,
        scorecard: stats
          ? stats.scorecard
          : {
              round1: { total: null, scoreRound: null, scoreThru: null },
              round2: { total: null, scoreRound: null, scoreThru: null },
              round3: { total: null, scoreRound: null, scoreThru: null },
              round4: { total: null, scoreRound: null, scoreThru: null },
            },
      };
    });

    return {
      ...team,
      golfers: processedGolfers,
    };
  });
}

scrapeData(); // npm run scrape
