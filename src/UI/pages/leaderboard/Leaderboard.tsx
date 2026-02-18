import { useState } from 'react';
import { TeamRow } from './components/teamRow/TeamRow';
import { useFavoriteTeam } from '../../../hooks/useFavoriteTeam';
import { useScores } from '../../../context/ScoreContext';
import Logo from '../../../assets/images/logo.png';
import './styles.scss';
import { ScoringModal } from './components/scoringModal/ScoringModal';

export interface ScoreboardTeamData {
  rank: number;
  owner: string;
  r1: number | string;
  r2: number | string;
  r3: number | string;
  r4: number | string;
  totalScore: number | string;
  isFavorite: boolean;
  isCut: boolean;
}

export const Leaderboard = () => {
  const { favoriteTeam } = useFavoriteTeam();
  const { teams } = useScores();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const formatDiff = (val: number): number | string => {
    return val === Infinity || isNaN(val) ? '-' : val;
  };

  return (
    <>
      <div className="scoreboard-wrapper fade-in-up">
        {/* ... Header and Logo code remains the same ... */}
        <div className="scoreboard-arch"></div>
        <div className="scoreboard-container">
          <div className="scoreboard-title-container">
            <div className="logo-container">
              <img src={Logo} alt="Masters Pool Logo" />
            </div>
            <div className="scoreboard-header-title">2026 Masters Pool</div>
          </div>

          <div className="scoreboard-table-header">
            <div className="cell pos">POS</div>
            <div className="cell name">TEAM</div>
            <div className="cell round">R1</div>
            <div className="cell round">R2</div>
            <div className="cell round">R3</div>
            <div className="cell round">R4</div>
            <div className="cell total">
              SCORE
              <button className="info-icon" onClick={() => handleModal()}>
                i
              </button>
            </div>
          </div>

          <div className="scoreboard-teams">
            {teams.map((team) => {
              // Data is already calculated in Context!
              const { sumR1, sumR2, sumR3, sumR4, activeTotal, isTeamCut } = team.stats;

              // Simple display logic only
              const r1Display = sumR1;
              const r2Display = sumR2 !== Infinity && sumR1 !== Infinity ? sumR2 - sumR1 : Infinity;
              const r3Display = sumR3 !== Infinity && sumR2 !== Infinity ? sumR3 - sumR2 : Infinity;
              const r4Display = sumR4 !== Infinity && sumR3 !== Infinity ? sumR4 - sumR3 : Infinity;

              const propData: ScoreboardTeamData = {
                rank: team.rank, // Now comes from context
                owner: team.owner,
                r1: formatDiff(r1Display),
                r2: formatDiff(r2Display),
                r3: formatDiff(r3Display),
                r4: formatDiff(r4Display),
                totalScore: activeTotal === 999 ? 'E' : activeTotal,
                isFavorite: favoriteTeam === team.owner,
                isCut: isTeamCut,
              };

              return <TeamRow key={team.owner} data={propData} />;
            })}
          </div>
        </div>
        <div className="scoreboard-footer"></div>
      </div>

      {isModalOpen && <ScoringModal handleModal={handleModal} />}
    </>
  );
};
