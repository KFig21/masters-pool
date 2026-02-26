// masters-pool/src/UI/components/thruBadge/ThruBadge.tsx
import './styles.scss';

interface Props {
  thru?: string;
  isCut?: boolean;
  status?: 'ACTIVE' | 'CUT' | 'DQ' | 'WD' | 'DNP';
  isTournamentComplete?: boolean;
}

export const ThruBadge = ({ thru, isCut, status, isTournamentComplete }: Props) => {
  if (isCut || status !== 'ACTIVE' || !thru || isTournamentComplete) {
    return null;
  }

  // 1. Check if "thru" is an ISO Timestamp (e.g., "2026-02-27T18:23:00Z")
  const isTimestamp = thru.includes('T') && thru.includes('Z');

  let displayThru = thru;
  let isTeeTime = false;

  if (isTimestamp) {
    isTeeTime = true;
    const date = new Date(thru);
    // Formats to "1:23 PM" (or whatever the user's local time is)
    displayThru = date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  // 2. Formatting for mobile
  // If it's a tee time, mobile shows the time. If it's "Thru 17", it shows "T17"
  const mobileThru = isTeeTime ? displayThru : displayThru.replace('Thru ', 'T');

  // 3. Determine CSS class
  // Logic:
  // - If it's "F", it's finished.
  // - If it was a timestamp, it's 'tee-time'.
  // - Otherwise, if it starts with "T" or "Thru", it's 'active'.
  const badgeClass = displayThru === 'F' ? 'finished' : isTeeTime ? 'tee-time' : 'active';

  return (
    <span className={`thru-badge ${badgeClass}`}>
      <span className="desktop-badge-label">{displayThru}</span>
      <span className="mobile-badge-label">{mobileThru}</span>
    </span>
  );
};
