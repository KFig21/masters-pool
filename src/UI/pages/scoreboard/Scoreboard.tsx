import { useState } from 'react';
import { TeamRow } from './components/teamRow/TeamRow';
import { useFavoriteTeam } from '../../../hooks/useFavoriteTeam';
import Logo from '../../../assets/images/logo.png';
import compiledTeams from '../../../data/team_data.json';
import './styles.scss';
import { ScoringModal } from './components/scoringModal/ScoringModal';

export interface ScoreboardTeamData {
  rank: number;
  owner: string;
  r1: number | string;
  r2: number | string;
  r3: number | string;
  r4: number | string;
  totalScore: number | string;
  isFavorite: boolean;
  isCut: boolean;
}

export const Scoreboard = () => {
  const { favoriteTeam } = useFavoriteTeam();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getBest4Sum = (golfers: any[], roundKey: string): number => {
    const scores = golfers.map((g) => {
      const val = g.scorecard?.[roundKey]?.thruScore;
      return typeof val === 'number' ? val : Infinity;
    });
    scores.sort((a, b) => a - b);
    const best4 = scores.slice(0, 4);
    if (best4.some((s) => s === Infinity)) return Infinity;
    return best4.reduce((acc, curr) => acc + curr, 0);
  };

  const formatDiff = (val: number): number | string => {
    return val === Infinity || isNaN(val) ? '-' : val;
  };

  const processedTeams = compiledTeams.map((team) => {
    // 1. Calculate sums based on existing rounds
    const sumR1 = getBest4Sum(team.golfers, 'round1');
    const sumR2 = getBest4Sum(team.golfers, 'round2');
    const sumR3 = getBest4Sum(team.golfers, 'round3');
    const sumR4 = getBest4Sum(team.golfers, 'round4');

    // 2. Count active golfers (not cut)
    // We assume the data has "isCut": true/false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activeGolfersCount = team.golfers.filter((g: any) => !g.isCut).length;
    console.log('activeGolfersCount', team.owner, team.golfers, activeGolfersCount);
    const isTeamCut = activeGolfersCount < 4;

    let activeTotal: number | string = 0;

    // 3. Determine Total Score logic
    if (isTeamCut) {
      // You can choose to display "CUT" even if they have a WD, or specific status
      activeTotal = 'CUT';
    } else {
      // Standard best-4 logic
      if (sumR4 !== Infinity) activeTotal = sumR4;
      else if (sumR3 !== Infinity) activeTotal = sumR3;
      else if (sumR2 !== Infinity) activeTotal = sumR2;
      else if (sumR1 !== Infinity) activeTotal = sumR1;
      else activeTotal = 999; // Default for pre-tournament
    }

    return {
      ...team,
      stats: { sumR1, sumR2, sumR3, sumR4, activeTotal, isTeamCut },
    };
  });

  // 4. Sort: Lower scores first, 'CUT' teams last
  const sortedTeams = [...processedTeams].sort((a, b) => {
    const scoreA = a.stats.activeTotal;
    const scoreB = b.stats.activeTotal;

    // Helper to check if a score is a "bad" status (CUT/WD/DQ)
    const isBadStatus = (val: number | string) => val === 'CUT' || val === 'WD' || val === 'DQ';

    if (isBadStatus(scoreA) && isBadStatus(scoreB)) return 0;
    if (isBadStatus(scoreA)) return 1;
    if (isBadStatus(scoreB)) return -1;

    return (scoreA as number) - (scoreB as number);
  });

  return (
    <>
      <div className="scoreboard-wrapper fade-in-up">
        <div className="scoreboard-arch"></div>
        <div className="scoreboard-container">
          <div className="scoreboard-title-container">
            <div className="logo-container">
              <img src={Logo} alt="Masters Pool Logo" />
            </div>
            <div className="scoreboard-header-title">2026 Masters Pool</div>
          </div>

          <div className="scoreboard-table-header">
            <div className="cell pos">POS</div>
            <div className="cell name">TEAM</div>
            <div className="cell round">R1</div>
            <div className="cell round">R2</div>
            <div className="cell round">R3</div>
            <div className="cell round">R4</div>
            <div className="cell total">
              SCORE
              <button className="info-icon" onClick={() => handleModal()}>
                i
              </button>
            </div>
          </div>

          <div className="scoreboard-teams">
            {sortedTeams.map((team, index) => {
              const { sumR1, sumR2, sumR3, sumR4, activeTotal, isTeamCut } = team.stats;
              const r1Display = sumR1;
              const r2Display = sumR2 !== Infinity && sumR1 !== Infinity ? sumR2 - sumR1 : Infinity;
              const r3Display = sumR3 !== Infinity && sumR2 !== Infinity ? sumR3 - sumR2 : Infinity;
              const r4Display = sumR4 !== Infinity && sumR3 !== Infinity ? sumR4 - sumR3 : Infinity;

              const propData: ScoreboardTeamData = {
                rank: index + 1,
                owner: team.owner,
                r1: formatDiff(r1Display),
                r2: formatDiff(r2Display),
                r3: formatDiff(r3Display),
                r4: formatDiff(r4Display),
                totalScore: activeTotal === 999 ? 'E' : activeTotal,
                isFavorite: favoriteTeam === team.owner,
                isCut: isTeamCut,
              };

              return <TeamRow key={team.owner} data={propData} />;
            })}
          </div>
        </div>
        <div className="scoreboard-footer"></div>
      </div>

      {/* Scoring Info Modal */}
      {isModalOpen && <ScoringModal handleModal={handleModal} />}
    </>
  );
};
