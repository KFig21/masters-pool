import { useMemo } from 'react';
import { useScores, type ProcessedTeam } from '../../../../../context/ScoreContext';
import { RoundTable } from './components/tables/RoundTable';
import { ThruTable } from './components/tables/ThruTable';
import './styles.scss';

interface Props {
  team: ProcessedTeam;
}

export const Scorecard = ({ team }: Props) => {
  const { isTournamentActive, lastUpdated } = useScores();
  // Sort golfers: Best Score first, Cut players last
  const sortedGolfers = useMemo(() => {
    return [...team.golfers].sort((a, b) => {
      // If both are cut or both active, sort by score
      if (a.isCut === b.isCut) {
        return (a.score || 0) - (b.score || 0);
      }
      // If a is cut, he goes after b (return 1)
      return a.isCut ? 1 : -1;
    });
  }, [team.golfers]);

  const formatTimestamp = (dateString: string | null) => {
    if (!dateString) return '--:--';
    return new Date(dateString).toLocaleTimeString([], {
      hour: 'numeric', // Change from '2-digit' to 'numeric'
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="scorecard-wrapper">
      <ThruTable golfers={sortedGolfers} stats={team.stats} />
      <div className="spacer-row" />
      <RoundTable golfers={sortedGolfers} stats={team.stats} />

      {isTournamentActive && (
        <div className="scorecard-update-info">
          <span className="label">Updated:</span>
          <span className="value">{formatTimestamp(lastUpdated)}</span>
        </div>
      )}
    </div>
  );
};
