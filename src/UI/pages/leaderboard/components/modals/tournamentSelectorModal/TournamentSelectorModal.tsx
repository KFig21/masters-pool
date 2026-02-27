// masters-pool/src/UI/pages/leaderboard/components/modals/tournamentSelectorModal/TournamentSelectorModal.tsx

import { useScores } from '../../../../../../context/ScoreContext';
import { EVENT_MATRIX } from '../../../../../../constants';
import './styles.scss';
import type { EventType } from '../../../../../../types/team';

interface Props {
  handleModal: () => void;
}

export const TournamentSelectorModal = ({ handleModal }: Props) => {
  const { currentEvent, currentYear, setCurrentEvent, setCurrentYear } = useScores();

  const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // 2. Cast the value to EventType immediately
    const newEvent = e.target.value as EventType;
    setCurrentEvent(newEvent);

    // 3. Use the typed newEvent to index the matrix
    const eventData = EVENT_MATRIX[newEvent];
    if (eventData) {
      const availableYears = Object.keys(eventData.years);
      if (availableYears.length > 0) {
        // Sort descending to get the most recent year (e.g., 2026 before 2025)
        const latestYear = availableYears.sort((a, b) => Number(b) - Number(a))[0];
        setCurrentYear(Number(latestYear));
      }
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentYear(Number(e.target.value));
  };

  // 4. Safely access the matrix using the typed currentEvent from context
  const currentEventData = EVENT_MATRIX[currentEvent as EventType];
  const availableYears = currentEventData
    ? Object.keys(currentEventData.years).sort((a, b) => Number(b) - Number(a))
    : [];

  return (
    <div className="modal-overlay" onClick={handleModal}>
      <div className="modal-content fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">Select a Pool</div>
        <p>Choose a tournament and year to view a leaderboard.</p>

        <div className="modal-selector-container">
          <div className="selector-group">
            <label htmlFor="event-select">Tournament</label>
            <select id="event-select" value={currentEvent} onChange={handleEventChange}>
              {Object.entries(EVENT_MATRIX).map(([key, data]) => (
                <option key={key} value={key}>
                  {data.title} {/* Changed .name to .title based on your scrape-scores.js logic */}
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

        <button className="close-btn" onClick={handleModal}>
          Done
        </button>
      </div>
    </div>
  );
};
