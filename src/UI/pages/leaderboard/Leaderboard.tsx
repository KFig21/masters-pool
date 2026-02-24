import { useState } from 'react';
import { TeamRow } from './components/teamRow/TeamRow';
import { useFavoriteTeam } from '../../../hooks/useFavoriteTeam';
import { useScores } from '../../../context/ScoreContext';
import { EVENT_MATRIX } from '../../../constants';
import Logo from '../../../assets/images/logo.png';
import { ScoringModal } from './components/modals/scoringModal/ScoringModal';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import './styles.scss';
import { TournamentSelectorModal } from './components/modals/tournamentSelectorModal/TournamentSelectorModal';

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

export const Leaderboard = () => {
  const { favoriteTeam } = useFavoriteTeam();
  // Pulling the new context variables
  const { teams, isLoading, currentYear, currentEvent } = useScores();
  const [isScoringModalOpen, setIsScoringModalOpen] = useState(false);
  const [isTournamentSelectorModalOpen, setIsTournamentSelectorModalOpen] = useState(false);

  const handleScoringModal = () => {
    setIsScoringModalOpen(!isScoringModalOpen);
  };

  const handleTournamentSelectorModal = () => {
    setIsTournamentSelectorModalOpen(!isTournamentSelectorModalOpen);
  };

  const formatDiff = (val: number): number | string => {
    return val === Infinity || isNaN(val) ? '-' : val;
  };

  // Safely grab the friendly name of the current event
  const eventName = EVENT_MATRIX[currentEvent as keyof typeof EVENT_MATRIX]?.title || 'Golf';

  return (
    <>
      <div className="leaderboard-wrapper fade-in-up">
        <div className="leaderboard-arch"></div>
        <div className="leaderboard-container">
          <div className="leaderboard-title-container">
            <div className="logo-container">
              <img src={Logo} alt={`${eventName} Pool Logo`} />
            </div>
            <div className="leaderboard-header-title">
              {/* Dynamic Year and Event Name */}
              <div className="header-title-year">{currentYear}</div>
              <div className="header-title-text">{eventName} Pool</div>
            </div>
          </div>

          <div className="leaderboard-table-header">
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
            {/* Added Loading and Empty State handling */}
            {isLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'Work Sans' }}>
                Loading scores...
              </div>
            ) : teams.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'Work Sans' }}>
                No teams found for {currentYear} {eventName}.
              </div>
            ) : (
              teams.map((team) => {
                const { sumR1, sumR2, sumR3, sumR4, activeTotal, isTeamCut } = team.stats;

                const r1Display = sumR1;
                const r2Display =
                  sumR2 !== Infinity && sumR1 !== Infinity ? sumR2 - sumR1 : Infinity;
                const r3Display =
                  sumR3 !== Infinity && sumR2 !== Infinity ? sumR3 - sumR2 : Infinity;
                const r4Display =
                  sumR4 !== Infinity && sumR3 !== Infinity ? sumR4 - sumR3 : Infinity;

                const propData: ScoreboardTeamData = {
                  rank: team.rank,
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
              })
            )}
          </div>
        </div>
        <div className="leaderboard-footer">
          <div
            className="tournament-selector-icon-container"
            onClick={() => handleTournamentSelectorModal()}
          >
            <ManageSearchIcon className="tournament-selector-icon" />
          </div>
        </div>
      </div>

      {isScoringModalOpen && <ScoringModal handleModal={handleScoringModal} />}
      {isTournamentSelectorModalOpen && (
        <TournamentSelectorModal handleModal={handleTournamentSelectorModal} />
      )}
    </>
  );
};
