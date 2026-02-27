import './styles.scss';

interface Props {
  handleModal: () => void;
}

export const UpdateModal = ({ handleModal }: Props) => {
  return (
    <div className="modal-overlay" onClick={() => handleModal()}>
      <div className="modal-content fade-in-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">Scoring Updates</div>
        <p>The scores should update about every 3 minutes.</p>
        <button className="close-btn" onClick={() => handleModal()}>
          Close
        </button>
      </div>
    </div>
  );
};
