import React from 'react';
import type { ProcessedTeam } from '../../../../../context/ScoreContext';
import './styles.scss';
import { useFavoriteTeam } from '../../../../../hooks/useFavoriteTeam';

interface Props {
  teams: ProcessedTeam[];
  selectedOwner?: string | null;
  onSelectTeam: (owner: string) => void;
}

export const DashboardTeamLeaderboard: React.FC<Props> = ({
  teams,
  onSelectTeam,
  selectedOwner,
}) => {
  const { favoriteTeam } = useFavoriteTeam();

  const formatScore = (val: number | string | null | undefined) => {
    // Catch missing data and Infinity
    if (val === null || val === undefined || val === Infinity) return '-';
    // Pass strings through (e.g., "CUT", "WD")
    if (typeof val === 'string') return val;
    // Format golf numbers
    if (val === 0) return 'E';
    return val > 0 ? `+${val}` : val;
  };

  const getScoreClass = (val: number | string | null | undefined) => {
    if (val === 'CUT') return 'cut';
    if (typeof val !== 'number' || val === Infinity) return '';
    if (val < 0) return 'under-par';
    if (val > 0) return 'over-par';
    return 'even-par';
  };

  return (
    <div className="dashboard-panel">
      <div className="panel-upper">
        <div className="panel-header">Team Leaderboard</div>
        <div className="leaderboard-header team-table">
          <div className="col header pos">POS</div>
          <div className="col header team">TEAM</div>
          <th className="col header round-score">R1</th>
          <th className="col header round-score">R2</th>
          <th className="col header round-score">R3</th>
          <th className="col header round-score">R4</th>
          <th className="col header total-score">TOT</th>
        </div>
      </div>
      <div className="panel-lower">
        <div className="mini-leaderboard">
          <div className="ml-body">
            {teams.map((team, _, arr) => {
              // Determine ties by checking if any other team has the exact same score
              const isBadStatus = typeof team.stats.activeTotal === 'string'; // Catches 'CUT', 'WD', etc.
              const isTied =
                !isBadStatus &&
                arr.filter((t) => t.stats.activeTotal === team.stats.activeTotal).length > 1;

              return (
                <div
                  key={team.owner}
                  className={`leaderboard-row team-table ${favoriteTeam === team.owner ? 'favorite' : ''}
                  ${selectedOwner === team.owner ? 'selected' : ''}`}
                  onClick={() => onSelectTeam(team.owner)}
                >
                  <div className="col pos">
                    {isBadStatus ? '-' : isTied ? `T-${team.rank}` : team.rank}
                  </div>
                  <div className="col team">{team.owner}</div>
                  <div className={`col round-score ${getScoreClass(team.stats.sumR1)}`}>
                    {formatScore(team.stats.sumR1)}
                  </div>
                  <div className={`col round-score ${getScoreClass(team.stats.sumR2)}`}>
                    {formatScore(team.stats.sumR2)}
                  </div>
                  <div className={`col round-score ${getScoreClass(team.stats.sumR3)}`}>
                    {formatScore(team.stats.sumR3)}
                  </div>
                  <div className={`col round-score ${getScoreClass(team.stats.sumR4)}`}>
                    {formatScore(team.stats.sumR4)}
                  </div>
                  <div className={`col total-score ${getScoreClass(team.stats.activeTotal)}`}>
                    {formatScore(team.stats.activeTotal)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
