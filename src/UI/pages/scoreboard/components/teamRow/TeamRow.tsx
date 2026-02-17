import { Link } from 'react-router-dom';
import type { ScoreboardTeamData } from '../../Scoreboard';
import './styles.scss';

interface Props {
  data: ScoreboardTeamData;
}

export const TeamRow = ({ data }: Props) => {
  const { rank, owner, r1, r2, r3, r4, totalScore, isFavorite } = data;

  const getScoreClass = (score: number | string) => {
    if (typeof score === 'string') return '';
    if (score < 0) return 'under-par';
    if (score === 0) return 'even-par';
    return 'over-par';
  };

  const formatScore = (score: number | string) => {
    if (score === 'N/A') return '-';
    if (score === 0) return 'E';
    if (typeof score === 'number' && score > 0) return `${score}`;
    if (typeof score === 'number' && score < 0) return `${score.toString().slice(1)}`;
    return score;
  };

  return (
    <div className={`teamRow-wrapper ${isFavorite ? 'favorite-row' : ''}`}>
      <Link to={`/team/${owner}`} className="teamRow-container">
        <div className="cell rank">{rank}</div>
        <div className="cell name">{owner.toUpperCase()}</div>

        {/* Dynamic Round Scores */}
        <div className={`cell score ${getScoreClass(r1)}`}>{formatScore(r1)}</div>
        <div className={`cell score ${getScoreClass(r2)}`}>{formatScore(r2)}</div>
        <div className={`cell score ${getScoreClass(r3)}`}>{formatScore(r3)}</div>
        <div className={`cell score ${getScoreClass(r4)}`}>{formatScore(r4)}</div>

        {/* Total Score (Highlighted) */}
        <div className={`cell score total ${getScoreClass(totalScore)}`}>
          {formatScore(totalScore)}
        </div>
      </Link>
    </div>
  );
};
