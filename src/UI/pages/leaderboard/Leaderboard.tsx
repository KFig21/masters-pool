import { useState } from 'react';
import { TeamRow } from './components/teamRow/TeamRow';
import { useFavoriteTeam } from '../../../hooks/useFavoriteTeam';
import { useScores } from '../../../context/ScoreContext';
import { EVENT_MATRIX } from '../../../constants';
import Logo from '../../../assets/images/logo.png';
import { ScoringModal } from './components/modals/scoringModal/ScoringModal';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import { TournamentSelectorModal } from './components/modals/tournamentSelectorModal/TournamentSelectorModal';
import { NoData } from './components/noData/NoData';
import { Loading } from '../../components/loading/Loading';
import { UpdateModal } from './components/modals/updateModal/updateModal';
import { TeeTimeCountdown } from '../../components/TeeTimeCountdown/TeeTimeCountdown';
import { FooterRight } from './components/footerRight/FooterRight';
import { Link } from 'react-router-dom';
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import './styles.scss';

export interface ScoreboardTeamData {
  rank: number;
  owner: string;
  isTied: boolean;
  r1: number | string;
  r2: number | string;
  r3: number | string;
  r4: number | string;
  totalScore: number | string;
  activeGolfers: number;
  isFavorite: boolean;
  isCut: boolean;
}

export const Leaderboard = () => {
  const { favoriteTeam } = useFavoriteTeam();
  const {
    teams,
    isLoading,
    currentYear,
    currentEvent,
    lastUpdated,
    nextUpdate,
    isTournamentActive,
  } = useScores();
  const [isScoringModalOpen, setIsScoringModalOpen] = useState(false);
  const [isScoringUpdateModalOpen, setIsScoringUpdateModalOpen] = useState(false);
  const [isTournamentSelectorModalOpen, setIsTournamentSelectorModalOpen] = useState(false);

  const handleScoringModal = () => {
    setIsScoringModalOpen(!isScoringModalOpen);
  };

  const handleScoringUpdateModal = () => {
    setIsScoringUpdateModalOpen(!isScoringUpdateModalOpen);
  };

  const handleTournamentSelectorModal = () => {
    setIsTournamentSelectorModalOpen(!isTournamentSelectorModalOpen);
  };

  const formatDiff = (val: number): number | string => {
    return val === Infinity || isNaN(val) ? '-' : val;
  };

  // Safely grab the friendly name of the current event
  const eventConfig = EVENT_MATRIX[currentEvent as keyof typeof EVENT_MATRIX];
  const eventName = eventConfig?.title || 'Golf';

  // Extract the start date dynamically based on the current active tournament
  const tournamentStartDate = eventConfig?.years[currentYear]?.startDate || null;

  // --- Dynamic Header Title Scaling Logic ---
  const fullTitle = `${eventName} Pool`;
  const baseLength = 12; // Length of "Masters Pool"

  // We calculate how many characters over the base we are
  const charDiff = Math.max(0, fullTitle.length - baseLength);

  // 0.015 is the "magic number" that gets Arnold Palmer (~18 chars) to ~0.92 scale
  // We clamp it at 0.7 so it never gets too tiny to read
  const scaleFactor = Math.max(0.7, 1 - charDiff * 0.015);

  const dynamicHeaderStyle = {
    transform: `scale(${scaleFactor})`,
    transformOrigin: 'center center',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  } as React.CSSProperties;
  // -----------------------------

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="leaderboard-wrapper fade-in-up">
          <div className="leaderboard-arch"></div>
          <div className="leaderboard-container">
            <div className="leaderboard-title-container" style={dynamicHeaderStyle}>
              <div className="logo-container">
                <img src={Logo} alt={`${eventName} Pool Logo`} />
              </div>
              <div className="leaderboard-header-title">
                {/* Dynamic Year and Event Name */}
                <div className="header-title-year">{currentYear}</div>
                <div className="header-title-text">{eventName} Pool</div>
              </div>
            </div>

            <div className={`leaderboard-table-header`}>
              <div className="cell pos">POS</div>
              <div className="cell name">TEAM</div>
              <div className="cell round">R1</div>
              <div className="cell round">R2</div>
              <div className="cell round">R3</div>
              <div className="cell round">R4</div>
              <div className="cell total" onClick={() => handleScoringModal()}>
                SCORE
                <button className="info-icon" onClick={() => handleScoringModal()}>
                  i
                </button>
              </div>
            </div>

            <div className="leaderboard-teams">
              {/* // TODO: What the heck is this? */}
              {/* Added Loading and Empty State handling */}
              {isLoading ? (
                <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'Work Sans' }}>
                  Loading scores...
                </div>
              ) : teams.length === 0 ? (
                <NoData handleModal={handleTournamentSelectorModal} />
              ) : (
                teams.map((team, index) => {
                  const { activeTotal, isTeamCut } = team.stats;

                  // Determine if this rank is a tie
                  const isTied =
                    (teams[index - 1] && teams[index - 1].stats.activeTotal === activeTotal) ||
                    (teams[index + 1] && teams[index + 1].stats.activeTotal === activeTotal);

                  const propData: ScoreboardTeamData = {
                    rank: team.rank,
                    owner: team.owner,
                    isTied: isTied,
                    r1: formatDiff(team.stats.dailyR1 ?? Infinity),
                    r2: formatDiff(team.stats.dailyR2 ?? Infinity),
                    r3: formatDiff(team.stats.dailyR3 ?? Infinity),
                    r4: formatDiff(team.stats.dailyR4 ?? Infinity),
                    totalScore: activeTotal === 999 ? 'E' : activeTotal,
                    activeGolfers: team.stats.activeGolfers,
                    isFavorite: favoriteTeam === team.owner,
                    isCut: isTeamCut,
                  };

                  return <TeamRow key={team.owner} data={propData} />;
                })
              )}
            </div>
          </div>
          <div className="leaderboard-footer">
            <div className="footer-left">
              <button
                className="tournament-selector-icon-container"
                onClick={() => handleTournamentSelectorModal()}
              >
                <ManageSearchIcon className="tournament-selector-icon" />
              </button>

              <Link to="/dashboard" className="dashboard-button">
                <SpaceDashboardIcon className="dashboard-icon" />
              </Link>
            </div>

            <TeeTimeCountdown targetDateStr={tournamentStartDate} />

            {isTournamentActive ? (
              <FooterRight
                isTournamentActive={isTournamentActive}
                lastUpdated={lastUpdated}
                nextUpdate={nextUpdate}
                onUpdateClick={handleScoringUpdateModal}
              />
            ) : (
              <div className="footer-right">
                <div className="empty-block"></div>
              </div>
            )}
          </div>
        </div>
      )}
      {isScoringModalOpen && <ScoringModal handleModal={handleScoringModal} />}
      {isTournamentSelectorModalOpen && (
        <TournamentSelectorModal handleModal={handleTournamentSelectorModal} />
      )}
      {isScoringUpdateModalOpen && <UpdateModal handleModal={handleScoringUpdateModal} />}
    </>
  );
};
