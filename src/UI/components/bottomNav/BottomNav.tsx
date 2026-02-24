import { Link, useLocation } from 'react-router-dom';
import { useFavoriteTeam } from '../../../hooks/useFavoriteTeam'; // Import hook
import './styles.scss';
import { useScores } from '../../../context/ScoreContext';

export const BottomNav = () => {
  const location = useLocation();
  const { teams } = useScores();
  const { favoriteTeam } = useFavoriteTeam(); // Get current favorite

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.includes(path)) return true;
    return false;
  };

  return (
    <div className="bottomNav-wrapper">
      <div className="bottomNav-scroll-container">
        <Link to="/" className={`nav-tab scoreboard ${isActive('/') ? 'active' : ''}`}>
          <div className="team-name">Leaderboard</div>
        </Link>

        {teams.map((team) => {
          const isFav = favoriteTeam === team.owner;

          return (
            <Link
              key={team.owner}
              to={`/team/${team.owner}`}
              className={`nav-tab ${isActive(`/team/${team.owner}`) ? 'active' : ''}`}
            >
              <div className="team-name">
                {isFav && <span className="favorite-icon">★</span>}
                {team.owner}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
