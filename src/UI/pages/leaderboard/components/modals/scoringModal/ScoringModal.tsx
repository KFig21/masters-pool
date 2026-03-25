import { useState } from 'react';
import './styles.scss';
import { onClose, useEscapeKey } from '../utils';

interface Props {
  handleModal: () => void;
}

export const ScoringModal = ({ handleModal }: Props) => {
  const [isClosing, setIsClosing] = useState(false);

  useEscapeKey(() => onClose(setIsClosing, handleModal));

  return (
    <div
      className={`modal-overlay ${isClosing ? 'is-closing' : ''}`}
      onClick={() => onClose(setIsClosing, handleModal)}
    >
      <div
        className={`modal-content ${isClosing ? 'is-closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-title">Scoring Rules</div>
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
        <button className="close-button" onClick={() => onClose(setIsClosing, handleModal)}>
          Close
        </button>
      </div>
    </div>
  );
};
