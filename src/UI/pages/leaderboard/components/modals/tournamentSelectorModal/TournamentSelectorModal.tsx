import { useScores } from '../../../../../../context/ScoreContext';
import { EVENT_MATRIX, CURRENT_EVENT } from '../../../../../../constants';
import './styles.scss';
import type { EventType } from '../../../../../../types/team';
import { useState } from 'react';
import { onClose } from '../utils';

interface Props {
  handleModal: () => void;
}

export const TournamentSelectorModal = ({ handleModal }: Props) => {
  const { currentEvent, currentYear, setCurrentEvent, setCurrentYear } = useScores();
  const [isClosing, setIsClosing] = useState(false);

  const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newEvent = e.target.value as EventType;
    if (!newEvent || newEvent === 'spacer') return;

    setCurrentEvent(newEvent);

    const eventData = EVENT_MATRIX[newEvent];
    if (eventData) {
      const availableYears = Object.keys(eventData.years);
      if (availableYears.length > 0) {
        const latestYear = availableYears.sort((a, b) => Number(b) - Number(a))[0];
        setCurrentYear(Number(latestYear));
      }
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentYear(Number(e.target.value));
  };

  // 1. Sort all events alphabetically first to keep the "others" list tidy
  const sortedAllEntries = Object.entries(EVENT_MATRIX).sort((a, b) =>
    a[1].title.localeCompare(b[1].title),
  );

  // 2. Pin the hardcoded CURRENT_EVENT to the top
  const primaryEventEntry = sortedAllEntries.find(([key]) => key === CURRENT_EVENT);

  // 3. Filter out the primary event from the rest of the alphabetical list
  const otherEntries = sortedAllEntries.filter(([key]) => key !== CURRENT_EVENT);

  // 4. Get the available years for each event
  const currentEventData = EVENT_MATRIX[currentEvent as EventType];
  const availableYears = currentEventData
    ? Object.keys(currentEventData.years).sort((a, b) => Number(b) - Number(a))
    : [];

  return (
    <div
      className={`modal-overlay ${isClosing ? 'is-closing' : ''}`}
      onClick={() => onClose(setIsClosing, handleModal)}
    >
      <div
        className={`modal-content ${isClosing ? 'is-closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-title">Select a Pool</div>
        <p>Choose a tournament and year to view a leaderboard.</p>

        <div className="modal-selector-container">
          <div className="selector-group">
            <label htmlFor="event-select">Tournament</label>
            <select id="event-select" value={currentEvent} onChange={handleEventChange}>
              {/* Primary "Current" Event pinned at top */}
              {primaryEventEntry && (
                <option value={primaryEventEntry[0]}>{primaryEventEntry[1].title}</option>
              )}

              {/* Spacer logic remains the same */}
              {otherEntries.length > 0 && (
                <option value="spacer" disabled>
                  ──────────
                </option>
              )}

              {/* Remaining tournaments in alphabetical order */}
              {otherEntries.map(([key, data]) => (
                <option key={key} value={key}>
                  {data.title}
                </option>
              ))}
            </select>
          </div>

          <div className="selector-group">
            <label htmlFor="year-select">Year</label>
            <select id="year-select" value={currentYear} onChange={handleYearChange}>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button className="close-button" onClick={() => onClose(setIsClosing, handleModal)}>
          Done
        </button>
      </div>
    </div>
  );
};
