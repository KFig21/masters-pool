import { useParams } from 'react-router-dom';
import { useFavoriteTeam } from '../../../hooks/useFavoriteTeam';
import { useScores } from '../../../context/ScoreContext';
import { Scorecard } from './components/scorecard/Scorecard';
import './styles.scss';

export const Team = () => {
  const { owner } = useParams();
  const { favoriteTeam, toggleFavorite } = useFavoriteTeam();
  const { getTeamByOwner } = useScores();

  const teamInfo = owner ? getTeamByOwner(owner) : undefined;

  if (!owner || !teamInfo) {
    return <div className="team-wrapper">Team not found</div>;
  }

  const isFavorite = favoriteTeam === owner;
  const { rank } = teamInfo;
  const { activeTotal } = teamInfo.stats;
  const displayScore = activeTotal === 999 ? 'E' : activeTotal;

  return (
    <div className="team-wrapper">
      <div className="team-container">
        <div className="team-header">
          <button
            className={`favorite-icon ${isFavorite ? 'active' : ''}`}
            onClick={() => toggleFavorite(owner)}
            aria-label={isFavorite ? 'Unfavorite team' : 'Favorite team'}
          >
            {isFavorite ? '★' : '☆'}
          </button>

          {/* NOW DYNAMIC: */}
          <div className="team-header-data place">{rank}</div>
          <div className="team-header-data name">{owner}</div>
          <div className="team-header-data score">{displayScore}</div>
        </div>

        {/* Scorecard */}
        <Scorecard />

        {/* map thru players - NEED HOLE BY HOLE SCORES */}
        <div className="team-players">
          {/* <Player_FullScorecard player="Tiger Woods" />
          <Player_FullScorecard player="Rory McIlroy" />
          <Player_FullScorecard player="Dustin Johnson" />
          <Player_FullScorecard player="Shane Lowry" />
          <Player_FullScorecard player="Jason Day" /> */}
        </div>
      </div>
    </div>
  );
};
