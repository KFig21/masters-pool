import './styles.scss';

interface Props {
  handleModal: () => void;
}

export const ScoringModal = ({ handleModal }: Props) => {
  return (
    <div className="modal-overlay" onClick={() => handleModal()}>
      <div className="modal-content fade-in-up" onClick={(e) => e.stopPropagation()}>
        <h3>Scoring Rules</h3>
        <p>
          Calculates the team's total score based on the <strong>best 4 cumulative scores</strong>{' '}
          at the end of each round.
        </p>
        <p>
          Round columns (R1-R4) display the <strong>net movement</strong> from the previous day,
          reflecting the team’s performance today even if your top 4 golfers changed.
        </p>
        <div className="modal-example">
          <strong>Example:</strong> If the team was -8 after R1 and moved to -11 after R2, the R2
          column will display -3.
        </div>
        <button className="close-btn" onClick={() => handleModal()}>
          Close
        </button>
      </div>
    </div>
  );
};
