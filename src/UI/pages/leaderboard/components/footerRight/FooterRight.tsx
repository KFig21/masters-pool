import { NextUpdateTimer } from './nextUpdateTimer/NextUpdateTimer';
// import { LastUpdated } from './lastUpdated/LastUpdated';

interface FooterRightProps {
  isTournamentActive: boolean;
  lastUpdated: string | null;
  nextUpdate: string | null;
  onUpdateClick: () => void;
}

export const FooterRight = ({
  isTournamentActive,
  // lastUpdated,
  nextUpdate,
  onUpdateClick,
}: FooterRightProps) => {
  // If tournament is not active..
  if (!isTournamentActive) {
    return (
      <div className="footer-right">
        <div className="empty-block"></div>
      </div>
    );
  }

  return (
    <div className="footer-right" onClick={onUpdateClick}>
      {/* <LastUpdated timestamp={lastUpdated} /> */}
      <NextUpdateTimer targetDateStr={nextUpdate} page={'leaderboard'} />
    </div>
  );
};
