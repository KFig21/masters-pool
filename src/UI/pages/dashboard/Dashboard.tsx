import React, { useState } from 'react';
import { useScores } from '../../../context/ScoreContext';
import { DashboardTeamLeaderboard } from './components/DashboardTeamLeaderboard';
import { DashboardGolferLeaderboard } from './components/DashboardGolferLeaderboard';
import { ExpandableTeamList } from './components/ExpandableTeamList';
import './styles.scss';

export const Dashboard = () => {
  const { teams } = useScores();
  const [selectedOwner, setSelectedOwner] = useState<string | null>(null);

  const toggleTeam = (owner: string) => {
    setSelectedOwner((prev) => (prev === owner ? null : owner));
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-grid">
        {/* LEFT COLUMN: 2 Components */}
        <div className="dashboard-left-col">
          <div className="dashboard-panel">
            <h2 className="panel-header">Team Leaderboard</h2>
            <DashboardTeamLeaderboard
              teams={teams}
              selectedOwner={selectedOwner}
              onSelectTeam={toggleTeam}
            />
          </div>

          <div className="dashboard-panel golfer-panel">
            <h2 className="panel-header">Individual Leaderboard</h2>
            <DashboardGolferLeaderboard teams={teams} />
          </div>
        </div>

        {/* RIGHT COLUMN: 1 Component */}
        <div className="dashboard-right-col">
          <div className="dashboard-panel">
            <h2 className="panel-header">Team Details</h2>
            <ExpandableTeamList
              teams={teams}
              selectedOwner={selectedOwner}
              onToggleTeam={toggleTeam}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
