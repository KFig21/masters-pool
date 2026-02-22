import { Link, useParams } from 'react-router-dom';
import { useFavoriteTeam } from '../../../hooks/useFavoriteTeam';
import { useScores } from '../../../context/ScoreContext';
import { Scorecard } from './components/scorecard/Scorecard';
import Logo from '../../../assets/images/logo.png';
import './styles.scss';

export const Team = () => {
  const { owner } = useParams();
  const { favoriteTeam, toggleFavorite } = useFavoriteTeam();
  const { getTeamByOwner } = useScores();

  const teamInfo = owner ? getTeamByOwner(owner) : undefined;
  console.log('teamInfo', teamInfo); // teamInfo.stats.isTeamCut is where you know if they are cut. possibly move this out of stats and into the team root

  if (!owner || !teamInfo) {
    return <div className="team-wrapper">Team not found</div>;
  }

  const isFavorite = favoriteTeam === owner;
  // const { rank } = teamInfo;
  const { activeTotal, isTeamCut } = teamInfo.stats;

  // Testing CUT strikethrough
  // let { activeTotal, isTeamCut } = teamInfo.stats;
  // isTeamCut = Math.random() < 0.5;

  const displayScore =
    activeTotal === 999
      ? 'E'
      : typeof activeTotal == 'number' && activeTotal > 0
        ? `+${activeTotal}`
        : activeTotal;

  return (
    <div className="team-wrapper">
      <div className="team-container">
        <div className={`team-header ${isTeamCut ? 'is-cut' : ''}`}>
          <Link to="/" className="mobile-back-button">
            ↩
          </Link>
          <div className={`favorite-icon-container ${isFavorite ? 'active' : ''}`}>
            <button
              className={`favorite-icon`}
              onClick={() => toggleFavorite(owner)}
              aria-label={isFavorite ? 'Unfavorite team' : 'Favorite team'}
            >
              {isFavorite ? '★' : '☆'}
            </button>
          </div>

          <div className="team-header-data-container">
            <div className="team-header-data name">{owner}</div>
            {!isTeamCut && <div className="team-header-data score">{displayScore}</div>}
          </div>
        </div>

        {/* Scorecard */}
        <div className="team-stats fade-in-up ">
          <Scorecard team={teamInfo} />
          {/* map thru players - NEED HOLE BY HOLE SCORES */}
          <div className="team-players">
            {/* <Player_FullScorecard player="Tiger Woods" />
          <Player_FullScorecard player="Rory McIlroy" />
          <Player_FullScorecard player="Dustin Johnson" />
          <Player_FullScorecard player="Shane Lowry" />
          <Player_FullScorecard player="Jason Day" /> */}
          </div>
          <div className="team-footer">
            <div className="logo-container">
              <img src={Logo} alt="Masters Pool Logo" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
