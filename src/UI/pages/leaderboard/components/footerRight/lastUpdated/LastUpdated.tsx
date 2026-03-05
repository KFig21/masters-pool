interface LastUpdatedProps {
  timestamp: string | null;
}

export const LastUpdated = ({ timestamp }: LastUpdatedProps) => {
  const formatTimestamp = (dateString: string | null) => {
    if (!dateString) return '--:--';
    return new Date(dateString).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="update-info">
      <span className="label">UPDATED</span>
      <span className="value">{formatTimestamp(timestamp)}</span>
    </div>
  );
};
