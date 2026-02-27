import { Link } from 'react-router-dom';
import type { ScoreboardTeamData } from '../../Leaderboard';
import { AnimatedCell } from './AnimatedCell';
import './styles.scss';

interface Props {
  data: ScoreboardTeamData;
}

export const TeamRow = ({ data }: Props) => {
  const { rank, owner, isTied, r1, r2, r3, r4, totalScore, isFavorite } = data;

  const getScoreClass = (score: number | string) => {
    if (score === 'CUT' || score === 'WD' || score === 'DQ') return 'cut-text';
    if (typeof score === 'string') return '';
    if (score < 0) return 'under-par';
    if (score === 0) return 'even-par';
    return 'over-par';
  };

  const formatScore = (score: number | string) => {
    if (score === 'N/A') return '-';
    if (typeof score === 'string') return score;
    if (score === 0) return 'E';
    if (typeof score === 'number' && score > 0) return `${score}`;
    if (typeof score === 'number' && score < 0) return `${score.toString().slice(1)}`;
    return score;
  };

  const rowClass =
    totalScore === 'CUT' || totalScore === 'WD' || totalScore === 'DQ' ? 'team-cut' : '';

  return (
    <div className={`teamRow-wrapper ${isFavorite ? 'favorite-row' : ''} ${rowClass}`}>
      <Link to={`/team/${owner}`} className="teamRow-container">
        <AnimatedCell className="cell rank" value={rank} isTied={isTied} />

        <AnimatedCell className="cell name" value={owner.toUpperCase()} animationTrigger={rank} />

        <AnimatedCell className={`cell score ${getScoreClass(r1)}`} value={formatScore(r1)} />
        <AnimatedCell className={`cell score ${getScoreClass(r2)}`} value={formatScore(r2)} />
        <AnimatedCell className={`cell score ${getScoreClass(r3)}`} value={formatScore(r3)} />
        <AnimatedCell className={`cell score ${getScoreClass(r4)}`} value={formatScore(r4)} />

        <AnimatedCell
          className={`cell score total ${getScoreClass(totalScore)}`}
          value={formatScore(totalScore)}
        />
      </Link>
    </div>
  );
};
