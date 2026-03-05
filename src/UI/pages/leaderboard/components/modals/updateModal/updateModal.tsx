import { useState } from 'react';
import './styles.scss';
import { onClose } from '../utils';

interface Props {
  handleModal: () => void;
}

export const UpdateModal = ({ handleModal }: Props) => {
  const [isClosing, setIsClosing] = useState(false);
  return (
    <div
      className={`modal-overlay ${isClosing ? 'is-closing' : ''}`}
      onClick={() => onClose(setIsClosing, handleModal)}
    >
      <div
        className={`modal-content ${isClosing ? 'is-closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-title">Scoring Updates</div>
        <p>During tournament hours the scores will update about every 3 minutes.</p>
        <button className="close-button" onClick={() => onClose(setIsClosing, handleModal)}>
          Close
        </button>
      </div>
    </div>
  );
};
