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
  const formatScore = (val: number | string) => {
    if (typeof val === 'string') return val;
    if (val === 0) return 'E';
    return val > 0 ? `+${val}` : val;
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
            {teams.map((team) => (
              <div
                key={team.owner}
                className={`leaderboard-row team-table ${favoriteTeam === team.owner ? 'favorite' : ''}
                  ${selectedOwner === team.owner ? 'selected' : ''}`}
                onClick={() => onSelectTeam(team.owner)}
              >
                <div className="col pos">{team.rank}</div>
                <div className="col team">{team.owner}</div>
                <td className="col round-score">{team.stats.sumR1 || '-'}</td>
                <td className="col round-score">{team.stats.sumR2 || '-'}</td>
                <td className="col round-score">{team.stats.sumR3 || '-'}</td>
                <td className="col round-score">{team.stats.sumR4 || '-'}</td>
                <div className="col total-score">{formatScore(team.stats.activeTotal)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
