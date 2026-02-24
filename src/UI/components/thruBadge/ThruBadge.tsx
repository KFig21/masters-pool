import './styles.scss';

interface Props {
  thru?: string;
  isCut?: boolean;
  status?: 'ACTIVE' | 'CUT' | 'DQ' | 'WD';
  isTournamentComplete?: boolean; // Pass this in if you track global tournament status
}

export const ThruBadge = ({ thru, isCut, status, isTournamentComplete }: Props) => {
  // Hide if cut, DQ'd, WD'd, missing thru data, or the whole tournament is over
  if (isCut || status !== 'ACTIVE' || !thru || isTournamentComplete) {
    return null;
  }

  // Optional: If you don't want to show "F" (Finished for the day) at all, you could return null here too.
  // if (thru === 'F') return null;

  return (
    <span
      className={`thru-badge ${thru === 'F' ? 'finished' : thru[0] !== 'T' ? 'tee-time' : 'active'}`}
    >
      {thru}
    </span>
  );
};
