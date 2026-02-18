import './styles.scss';

interface Props {
  player: string;
}

export const Player_FullScorecard = ({ player }: Props) => {
  const holes = Array.from({ length: 18 }, (_, i) => i + 1);

  const parsByHole: Record<number, number> = {
    1: 4,
    2: 5,
    3: 4,
    4: 3,
    5: 4,
    6: 3,
    7: 4,
    8: 5,
    9: 4,
    10: 4,
    11: 4,
    12: 3,
    13: 5,
    14: 4,
    15: 5,
    16: 3,
    17: 4,
    18: 4,
  };

  const totalPar = Object.values(parsByHole).reduce((a, b) => a + b, 0);

  // Placeholder for rounds - in the future, this will come from props/API
  const rounds = [1, 2, 3, 4];

  return (
    <div className="player-wrapper">
      <div className="player-container">
        {/* Left - Player Info */}
        <div className="player-info">
          <div className="player-name">{player}</div>
          {/* PLAYER SCORE */}
        </div>

        {/* Right - Scorecard */}
        <div className="player-scorecard">
          {/* Holes Header */}
          <div className="player-scorecard-row header">
            <div className="player-scorecard-cell row-title">Hole</div>
            {holes.map((h) => (
              <div key={`hole-${h}`} className="player-scorecard-cell num">
                {h}
              </div>
            ))}
            <div className="player-scorecard-cell row-end">TOT</div>
          </div>

          {/* Par Row */}
          <div className="player-scorecard-row par-row">
            <div className="player-scorecard-cell row-title">Par</div>
            {holes.map((h) => (
              <div key={`par-${h}`} className="player-scorecard-cell num">
                {parsByHole[h]}
              </div>
            ))}
            <div className="player-scorecard-cell row-end">{totalPar}</div>
          </div>

          {/* Score Rows (R1-R4) */}
          {rounds.map((r) => (
            <div key={`round-${r}`} className="player-scorecard-row score-row">
              <div className="player-scorecard-cell row-title score">R{r}</div>
              {holes.map((h) => (
                <div key={`r${r}-h${h}`} className="player-scorecard-cell score">
                  3
                </div>
              ))}
              <div className="player-scorecard-cell score row-end">-</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
