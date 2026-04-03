import type { ProcessedTeam } from '../../../../context/ScoreContext';

// Helper to add the correct ordinal suffix
const getOrdinal = (d: number) => {
  if (d > 3 && d < 21) return 'th';
  switch (d % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
};

export const formatTournamentDates = (startStr: string, endStr: string) => {
  if (!startStr || !endStr) return '';

  const start = new Date(`${startStr}T12:00:00Z`);
  const end = new Date(`${endStr}T12:00:00Z`);

  const startMonth = start.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });

  const startDayNum = start.getUTCDate();
  const endDayNum = end.getUTCDate();

  const startDay = `${startDayNum}${getOrdinal(startDayNum)}`;
  const endDay = `${endDayNum}${getOrdinal(endDayNum)}`;

  // If same month: "April 2nd - 5th"
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}`;
  }

  // If cross-month: "March 30th - April 2nd"
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
};

export const getTeamGolferStatus = (team: ProcessedTeam) => {
  const statuses = {
    cut: 0,
    done: 0,
    left: 0,
    active: 0,
    null: 0,
  };
  team.golfers.forEach((golfer) => {
    const status = golfer.isCut
      ? 'cut'
      : golfer.thru === 'F'
        ? 'done'
        : golfer.thru && golfer.thru.split(' ').includes('Thru')
          ? 'active'
          : golfer.thru
            ? 'left'
            : 'null';

    statuses[status] += 1;
  });

  return statuses;
};
