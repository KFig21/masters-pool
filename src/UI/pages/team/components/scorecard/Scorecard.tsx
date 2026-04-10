import { useMemo } from 'react';
import { useScores, type ProcessedTeam } from '../../../../../context/ScoreContext';
import { RoundTable } from './components/tables/RoundTable';
import { ThruTable } from './components/tables/ThruTable';
import './styles.scss';
import { NextUpdateTimer } from '../../../leaderboard/components/footerRight/nextUpdateTimer/NextUpdateTimer';

interface Props {
  team: ProcessedTeam;
}

export const Scorecard = ({ team }: Props) => {
  const { isTournamentActive, nextUpdate } = useScores();
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

  return (
    <div className="scorecard-wrapper">
      <RoundTable golfers={sortedGolfers} stats={team.stats} />
      <div className="spacer-row" />
      <ThruTable golfers={sortedGolfers} stats={team.stats} />

      {isTournamentActive && (
        <div className="scorecard-update-info">
          <NextUpdateTimer targetDateStr={nextUpdate} page={'scorecard'} />
        </div>
      )}
    </div>
  );
};
