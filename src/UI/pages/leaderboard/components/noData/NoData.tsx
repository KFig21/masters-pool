import './styles.scss';
import Hazard from '../../../../../assets/images/hazard.png';

export const NoData = () => {
  return (
    <div className="no-data-wrapper">
      <div className="no-data-content">
        <div className="no-data-image-container">
          <img src={Hazard} alt="No Data Available" className="no-data-image" />
        </div>
        <span className="no-data-text">No Team Data Available</span>
        <span className="no-data-subtext">come back soon!</span>
      </div>
    </div>
  );
};
