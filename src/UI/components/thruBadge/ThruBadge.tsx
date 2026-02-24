import './styles.scss';

interface Props {
  thru?: string;
  isCut?: boolean;
  status?: 'ACTIVE' | 'CUT' | 'DQ' | 'WD';
  isTournamentComplete?: boolean;
}

export const ThruBadge = ({ thru, isCut, status, isTournamentComplete }: Props) => {
  if (isCut || status !== 'ACTIVE' || !thru || isTournamentComplete) {
    return null;
  }

  // Convert "Thru 17" to "T17" for mobile
  const mobileThru = thru.replace('Thru ', 'T');

  return (
    <span
      className={`thru-badge ${thru === 'F' ? 'finished' : thru[0] !== 'T' ? 'tee-time' : 'active'}`}
    >
      <span className="desktop-badge-label">{thru}</span>
      <span className="mobile-badge-label">{mobileThru}</span>
    </span>
  );
};
