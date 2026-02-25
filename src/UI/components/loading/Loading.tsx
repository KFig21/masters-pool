import './styles.scss';

export const Loading = () => {
  const text = 'Loading...';

  return (
    <div className="loading-wrapper">
      <div className="loading-content">
        <div className="loading-text">
          {text.split('').map((char, index) => (
            <span key={index} style={{ animationDelay: `${index * 0.1}s` }}>
              {char}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
