import { useEffect, useState } from 'react';
import { useScores } from '../../../context/ScoreContext';
import { DashboardTeamLeaderboard } from './components/DashboardTeamLeaderboard';
import { DashboardGolferLeaderboard } from './components/DashboardGolferLeaderboard';
import { ExpandableTeamList } from './components/ExpandableTeamList';
import { useFavoriteTeam } from '../../../hooks/useFavoriteTeam';
import './styles.scss';
import { DashboardGeneralInfo } from './components/DashboardGeneralInfo';
import { ErrorView } from '../../components/errorView/ErrorView';

export const Dashboard = () => {
  const { teams } = useScores();
  const { favoriteTeam } = useFavoriteTeam();
  const [selectedOwner, setSelectedOwner] = useState<string | null>(null);

  if (!teams || teams.length === 0) {
    return <ErrorView />;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    // Only set a default if we don't have a selection yet and data is ready
    if (teams.length > 0 && !selectedOwner) {
      const defaultOwner = favoriteTeam || teams[0].owner;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedOwner(defaultOwner);
    }
    // We remove selectedOwner from deps if we want it to ONLY run on initial load,
    // but keeping it with the !selectedOwner check is safer for when favoriteTeam loads late.
  }, [teams, favoriteTeam, selectedOwner]);

  const handleSelectTeam = (owner: string) => {
    setSelectedOwner(owner);
  };

  return (
    <div className="dashboard-page fade-in-up">
      <div className="dashboard-grid">
        {/* LEFT COLUMN: 2 Components */}
        <div className="dashboard-left-col">
          <div className="dashboard-panel">
            <h2 className="panel-header">Tournament Info</h2>
            <DashboardGeneralInfo
              eventName="The Masters"
              startDate="2026-04-09"
              endDate="2026-04-12"
              coursePar={72}
              teams={teams}
            />
          </div>

          <div className="dashboard-panel">
            <h2 className="panel-header">Team Leaderboard</h2>
            <DashboardTeamLeaderboard
              teams={teams}
              selectedOwner={selectedOwner}
              onSelectTeam={handleSelectTeam}
            />
          </div>
        </div>

        {/* CENTER COLUMN: 1 Component */}
        <div className="dashboard-right-col">
          <div className="dashboard-panel">
            <h2 className="panel-header">Team Details</h2>
            <ExpandableTeamList
              teams={teams}
              selectedOwner={selectedOwner}
              onToggleTeam={handleSelectTeam}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: 1 Component */}
        <div className="dashboard-right-col">
          <div className="dashboard-panel golfer-panel">
            <h2 className="panel-header">Individual Leaderboard</h2>
            <DashboardGolferLeaderboard teams={teams} />
          </div>
        </div>
      </div>
    </div>
  );
};
