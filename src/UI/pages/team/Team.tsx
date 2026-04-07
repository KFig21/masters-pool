import { Link, useParams } from 'react-router-dom';
import { useFavoriteTeam } from '../../../hooks/useFavoriteTeam';
import { useScores } from '../../../context/ScoreContext';
import { Scorecard } from './components/scorecard/Scorecard';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import './styles.scss';
import { Loading } from '../../components/loading/Loading';
import { ErrorView } from '../../components/errorView/ErrorView';

export const Team = () => {
  const { owner } = useParams();
  const { favoriteTeam, toggleFavorite } = useFavoriteTeam();
  const { getTeamByOwner, isLoading, isTournamentActive, isTournamentComplete } = useScores();

  if (isLoading) {
    return <Loading />;
  }

  const teamInfo = owner ? getTeamByOwner(owner) : undefined;

  if (!owner || !teamInfo) {
    return <ErrorView />;
  }

  console.log('teamInfo', teamInfo); // teamInfo.stats.isTeamCut is where you know if they are cut. possibly move this out of stats and into the team root

  const isFavorite = favoriteTeam === owner;
  // const { rank } = teamInfo;
  const { activeTotal, isTeamCut } = teamInfo.stats;

  const displayScore =
    activeTotal === 999
      ? 'E'
      : typeof activeTotal == 'number' && activeTotal > 0
        ? `+${activeTotal}`
        : activeTotal;

  return (
    <div className="team-wrapper">
      <div className="team-container fade-in-up">
        {/*  HEADER */}
        <div className={`team-header ${isTeamCut ? 'is-cut' : ''}`}>
          {/* Mobile back button */}
          <Link to="/" className="mobile-back-button">
            <ArrowBackIosNewIcon sx={{ fontSize: '1.2rem' }} />
          </Link>
          {/* Favorite icon */}
          <div className={`favorite-icon-container ${isFavorite ? 'active' : ''}`}>
            <button
              className={`favorite-icon`}
              onClick={() => toggleFavorite(owner)}
              aria-label={isFavorite ? 'Unfavorite team' : 'Favorite team'}
            >
              {isFavorite ? '★' : '☆'}
            </button>
          </div>
          {/* Team name and score */}
          <div className="team-header-data-container">
            <div className="team-header-data name">{owner}</div>
            {/* Only show score if: 1. The tournament is active (or complete) 2. The team isn't cut */}
            {(isTournamentActive || isTournamentComplete) && !isTeamCut && (
              <div className="team-header-data score">
                {displayScore === 0 ? 'E' : displayScore}
              </div>
            )}
          </div>
        </div>

        {/* Scorecard */}
        <div className="team-stats">
          <Scorecard team={teamInfo} />
        </div>
      </div>
    </div>
  );
};
