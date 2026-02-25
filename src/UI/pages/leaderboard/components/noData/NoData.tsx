import './styles.scss';
import Hazard from '../../../../../assets/images/hazard.png';

interface Props {
  handleModal: () => void;
}

export const NoData = ({ handleModal }: Props) => {
  return (
    <div className="no-data-wrapper">
      <div className="no-data-content" onClick={() => handleModal()}>
        <div className="no-data-image-container">
          <img src={Hazard} alt="No Data Available" className="no-data-image" />
        </div>
        <span className="no-data-text">No team data available</span>
        <div className="no-data-subtext-container">
          <span className="no-data-subtext">click here to choose another pool!</span>
        </div>
      </div>
    </div>
  );
};
