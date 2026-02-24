// masters-pool/src/UI/pages/leaderboard/components/modals/tournamentSelectorModal/TournamentSelectorModal.tsx

import { useScores } from '../../../../../../context/ScoreContext';
import { EVENT_MATRIX } from '../../../../../../constants';
import './styles.scss';

interface Props {
  handleModal: () => void;
}

export const TournamentSelectorModal = ({ handleModal }: Props) => {
  const { currentEvent, currentYear, setCurrentEvent, setCurrentYear } = useScores();

  const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newEvent = e.target.value;
    setCurrentEvent(newEvent);

    // Auto-select the first available year for the newly selected event
    const availableYears = Object.keys(EVENT_MATRIX[newEvent as keyof typeof EVENT_MATRIX].years);
    if (availableYears.length > 0) {
      setCurrentYear(Number(availableYears[0]));
    }
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentYear(Number(e.target.value));
  };

  const currentEventData = EVENT_MATRIX[currentEvent as keyof typeof EVENT_MATRIX];
  const availableYears = currentEventData
    ? Object.keys(currentEventData.years).sort().reverse()
    : [];

  return (
    <div className="modal-overlay" onClick={() => handleModal()}>
      <div className="modal-content fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">Select a Pool</div>
        <p>Choose a tournament and year to view a leaderboard.</p>

        <div className="modal-selector-container">
          <div className="selector-group">
            <label htmlFor="event-select">Tournament</label>
            <select id="event-select" value={currentEvent} onChange={handleEventChange}>
              {Object.entries(EVENT_MATRIX).map(([key, data]) => (
                <option key={key} value={key}>
                  {data.name}
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

        <button className="close-btn" onClick={() => handleModal()}>
          Done
        </button>
      </div>
    </div>
  );
};
