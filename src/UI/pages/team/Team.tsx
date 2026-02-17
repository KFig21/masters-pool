import { useParams } from 'react-router-dom';
import { useFavoriteTeam } from '../../../hooks/useFavoriteTeam';
import './styles.scss';

// interface Props {
//   fakeProp: string;
// }

export const Team = () => {
  const { owner } = useParams();
  // const navigate = useNavigate();
  const { favoriteTeam, toggleFavorite } = useFavoriteTeam();
  if (!owner) return null;

  const isFavorite = favoriteTeam === owner;

  return (
    <div className="team-wrapper">
      {/* SAVE THIS FOR MOBILE */}
      {/* <button onClick={() => navigate('/')} className="back-btn">
            &larr; Back to Scoreboard
          </button> */}
      <div className="team-container">
        <div className="team-header">
          {/* FAVORITE TOGGLE BUTTON */}
          <button
            className={`favorite-icon ${isFavorite ? 'active' : ''}`}
            onClick={() => toggleFavorite(owner)}
            aria-label={isFavorite ? 'Unfavorite team' : 'Favorite team'}
          >
            {isFavorite ? '★' : '☆'}
          </button>
          <div className="team-header-data place">2</div>
          <div className="team-header-data name">{owner}</div>
          <div className="team-header-data score">-4</div>
        </div>
        <div className="team-players">
          {/* map thru players - NEED HOLE BY HOLE SCORES */}
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
