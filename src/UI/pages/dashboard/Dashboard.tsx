import { useEffect, useState } from 'react';
import { useScores } from '../../../context/ScoreContext';
import { DashboardTeamLeaderboard } from './components/teamLeaderboard/DashboardTeamLeaderboard';
import { DashboardGolferLeaderboard } from './components/golfersLeaderboard/DashboardGolferLeaderboard';
import { ExpandableTeamList } from './components/teamList/ExpandableTeamList';
import { useFavoriteTeam } from '../../../hooks/useFavoriteTeam';
import { DashboardGeneralInfo } from './components/generalInfo/DashboardGeneralInfo';
import { ErrorView } from '../../components/errorView/ErrorView';
import { Link } from 'react-router-dom';
import Logo from '../../../assets/images/logo.png';
import './styles.scss';
import { DashboardTimerPanel } from './components/timerPanel/DashboardTimerPanel';
import { EVENT_MATRIX } from '../../../constants';
import { DashboardWeatherPanel } from './components/weatherPanel/DashboardWeatherPanel';

export const Dashboard = () => {
  const { teams, isTournamentActive, nextUpdate, currentEvent, currentYear } = useScores();
  const { favoriteTeam } = useFavoriteTeam();
  const [selectedOwner, setSelectedOwner] = useState<string | null>(null);
  // Extract the start date dynamically based on the current active tournament
  const eventConfig = EVENT_MATRIX[currentEvent as keyof typeof EVENT_MATRIX];
  const tournamentStartDate = eventConfig?.years[currentYear]?.startDate || null;

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

  const desktopView = (
    <div className="dashboard-page desktop fade-in-up">
      {/* DASHBOARD GRID */}
      <div className="dashboard-grid">
        {/* LEFT COLUMN: 2 Components */}
        <div className="dashboard-col">
          <DashboardGeneralInfo teams={teams} />

          <DashboardWeatherPanel />

          <DashboardTimerPanel
            isTournamentActive={isTournamentActive}
            nextUpdate={nextUpdate}
            targetDateStr={tournamentStartDate}
          />
        </div>

        {/* CENTER COLUMN: 1 Component */}
        <div className="dashboard-col">
          <DashboardTeamLeaderboard
            teams={teams}
            selectedOwner={selectedOwner}
            onSelectTeam={handleSelectTeam}
          />

          <ExpandableTeamList
            teams={teams}
            selectedOwner={selectedOwner}
            onToggleTeam={handleSelectTeam}
          />
        </div>

        {/* RIGHT COLUMN: 1 Component */}
        <div className="dashboard-col">
          <DashboardGolferLeaderboard
            teams={teams}
            selectedOwner={selectedOwner}
            onSelectTeam={handleSelectTeam}
          />
        </div>
      </div>
    </div>
  );

  const mobileView = (
    <div className="dashboard-page mobile fade-in-up">
      {/* MOBILE HEADER */}
      <Link to="/" className="dashboard-header">
        <div className="header-arrow">←</div>
        <div className="header-text">Back to Leaderboard</div>
      </Link>

      {/* DASHBOARD GRID */}
      <div className="dashboard-grid">
        {/* LEFT COLUMN: 2 Components */}
        <div className="dashboard-col">
          {/* Team Leaderboard */}
          <DashboardTeamLeaderboard
            teams={teams}
            selectedOwner={selectedOwner}
            onSelectTeam={handleSelectTeam}
          />

          {/* Team Detail */}
          <ExpandableTeamList
            teams={teams}
            selectedOwner={selectedOwner}
            onToggleTeam={handleSelectTeam}
          />

          {/* Update Timer */}
          <DashboardTimerPanel
            isTournamentActive={isTournamentActive}
            nextUpdate={nextUpdate}
            targetDateStr={tournamentStartDate}
          />

          {/* Golfer Leaderboard */}
          <DashboardGolferLeaderboard
            teams={teams}
            selectedOwner={selectedOwner}
            onSelectTeam={handleSelectTeam}
          />

          {/* Tournament Info */}
          <DashboardGeneralInfo teams={teams} />

          {/* Weather */}
          <DashboardWeatherPanel />
        </div>
      </div>

      {/* MOBILE FOOTER */}
      <div className="dashboard-footer">
        <Link to="/" className="logo-container">
          <img src={Logo} alt="Masters Pool Logo" />
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {desktopView}
      {mobileView}
    </>
  );
};
