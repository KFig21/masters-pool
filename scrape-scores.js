import fs from 'fs';
import fetch from 'node-fetch';
import { TEAMS } from './src/data/teams.ts';

const TOURNAMENT_ID = '401703504';
const PAR = 72; // Augusta National Par
const LEADERBOARD_URL = `https://site.web.api.espn.com/apis/site/v2/sports/golf/leaderboard?league=pga&event=${TOURNAMENT_ID}`;

async function scrapeData() {
  console.log('Fetching 2025 Masters data...');
  try {
    const response = await fetch(LEADERBOARD_URL);
    const data = await response.json();

    const cleanLeaderboard = processLeaderboard(data);
    const compiledTeams = compileTeamData(cleanLeaderboard.leaderboard);

    fs.writeFileSync('./src/data/leaderboard_2025.json', JSON.stringify(cleanLeaderboard, null, 2));
    fs.writeFileSync('./src/data/team_data.json', JSON.stringify(compiledTeams, null, 2));

    console.log(`✅ Success! Data compiled with round-by-round thru scores.`);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function processLeaderboard(apiData) {
  const competitors = apiData.events[0]?.competitions[0]?.competitors || [];

  const formattedPlayers = competitors.map((player) => {
    const rounds = player.linescores || [];
    const scorecard = {};
    let runningTotal = 0;

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
        // Handle missing rounds (Cut or hasn't played yet)
        scorecard[`round${roundNum}`] = {
          total: null,
          scoreRound: null,
          thruScore: null,
        };
      }
    });

    // Check if the player was cut
    const isCut = player.status?.type?.id === '3' || player.status?.displayValue === 'CUT';

    return {
      player: {
        name: player.athlete.displayName,
        id: player.athlete.id,
        // ESPN "displayValue" for score can be "E", "+2", etc.
        score: parseInt(player.statistics[0].displayValue.replace('+', '')) || 0,
        displayScore: player.statistics[0].displayValue,
        thru: player.status.displayValue,
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

  return TEAMS.map((team) => ({
    owner: team.owner,
    golfers: team.golfers.map((ref) => {
      const stats = statsLookup[ref.id];
      return {
        id: ref.id,
        name: ref.name,
        score: stats ? stats.scoreRound : 0,
        displayScore: stats ? stats.displayScore : 'E',
        thru: stats ? stats.scoreThru : '--',
        isCut: stats ? stats.isCut : false,
        scorecard: stats ? stats.scorecard : {},
      };
    }),
  }));
}

scrapeData();
