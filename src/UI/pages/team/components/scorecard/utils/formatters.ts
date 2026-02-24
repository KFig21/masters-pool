/**
 * Returns a CSS class name based on a score relative to par.
 */
export const getScoreClass = (
  val: number | null | undefined,
  isCut: boolean | undefined,
): string => {
  if (isCut) return 'cut';
  if (val === null || val === undefined) return '';
  if (val === 0) return 'even';
  return val < 0 ? 'under' : 'over';
};

/**
 * Formats a numeric score relative to par (e.g., -3, E, +2).
 */
export const formatRelativeScore = (val: number | null | undefined): string | number => {
  if (val === null || val === undefined) return '-';
  if (val === 0) return 'E';
  return val > 0 ? `+${val}` : val;
};

/**
 * Formats a team's aggregate value, handling string statuses like CUT or WD.
 */
export const formatTeamValue = (val: number | null | string): string | number => {
  if (val === null) return '-';
  if (val === 0) return 'E';

  if (typeof val === 'string') {
    const lowerVal = val.toLowerCase();
    if (lowerVal === 'even') return 'E';
    if (lowerVal === 'cut') return 'CUT';
    if (lowerVal === 'wd') return 'WD';
    return val;
  }

  return val > 0 ? `+${val}` : val;
};

/**
 * Determines the CSS class for a team value, handling string statuses.
 */
export const getTeamClass = (val: number | null | string): string => {
  if (val === null) return '';
  if (val === 0) return 'even';

  if (typeof val === 'string') {
    const lowerVal = val.toLowerCase();
    if (lowerVal === 'even') return 'even'; // Map 'even' string to 'even' class
    if (lowerVal === 'cut' || lowerVal === 'wd' || lowerVal === 'dq' || lowerVal === 'dnp')
      return lowerVal.toUpperCase();
    return '';
  }

  return val < 0 ? 'under' : 'over';
};
