import './styles.scss';
import Hazard from '../../../assets/images/hazard.png';

export const ErrorView = () => {
  return (
    <div className="errorView-wrapper">
      <div className="errorView-content">
        <div className="errorView-image-container">
          <img src={Hazard} alt="No Data Available" className="errorView-image" />
        </div>
        <span className="errorView-text">Out of bounds</span>
        <div className="errorView-subtext-container">
          <span className="errorView-subtext">
            try refreshing the page or{' '}
            <a className="errorView-link" href="/">
              click here
            </a>{' '}
            to go home
          </span>
        </div>
      </div>
    </div>
  );
};
