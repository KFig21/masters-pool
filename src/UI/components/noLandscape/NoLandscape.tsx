import './styles.scss';

export const NoLandscape = () => {
  return (
    <div className="no-landscape-overlay">
      <div className="no-landscape-content">
        <span className="no-landscape-text">Not developed for landscape</span>
        <span className="no-landscape-subtext">Please rotate your device</span>
      </div>
    </div>
  );
};
