import { useEffect, useState } from 'react';
import { useScores } from '../../../context/ScoreContext';
import { DashboardTeamLeaderboard } from './components/teamLeaderboard/DashboardTeamLeaderboard';
import { DashboardGolferLeaderboard } from './components/golfersLeaderboard/DashboardGolferLeaderboard';
import { ExpandableTeamList } from './components/teamList/ExpandableTeamList';
import { useFavoriteTeam } from '../../../hooks/useFavoriteTeam';
import './styles.scss';
import { DashboardGeneralInfo } from './components/generalInfo/DashboardGeneralInfo';
import { ErrorView } from '../../components/errorView/ErrorView';

export const Dashboard = () => {
  const { teams } = useScores();
  const { favoriteTeam } = useFavoriteTeam();
  const [selectedOwner, setSelectedOwner] = useState<string | null>(null);

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

  if (!teams || teams.length === 0) {
    return <ErrorView />;
  }

  const handleSelectTeam = (owner: string) => {
    setSelectedOwner(owner);
  };

  return (
    <div className="dashboard-page fade-in-up">
      <div className="dashboard-grid">
        {/* LEFT COLUMN: 2 Components */}
        <div className="dashboard-left-col">
          <DashboardGeneralInfo teams={teams} />

          <DashboardTeamLeaderboard
            teams={teams}
            selectedOwner={selectedOwner}
            onSelectTeam={handleSelectTeam}
          />
        </div>

        {/* CENTER COLUMN: 1 Component */}
        <div className="dashboard-right-col">
          <ExpandableTeamList
            teams={teams}
            selectedOwner={selectedOwner}
            onToggleTeam={handleSelectTeam}
          />
        </div>

        {/* RIGHT COLUMN: 1 Component */}
        <div className="dashboard-right-col">
          <DashboardGolferLeaderboard teams={teams} selectedOwner={selectedOwner} />
        </div>
      </div>
    </div>
  );
};
