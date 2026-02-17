import { useState, useEffect } from 'react';

// Custom event to sync across components without a complex Context provider
const FAVORITE_UPDATED_EVENT = 'favoriteTeamUpdated';

export const useFavoriteTeam = () => {
  const [favoriteTeam, setFavoriteTeam] = useState<string | null>(() => {
    return localStorage.getItem('favoriteTeam');
  });

  useEffect(() => {
    // Listen for changes from other components
    const handleStorageChange = () => {
      setFavoriteTeam(localStorage.getItem('favoriteTeam'));
    };

    window.addEventListener(FAVORITE_UPDATED_EVENT, handleStorageChange);
    return () => window.removeEventListener(FAVORITE_UPDATED_EVENT, handleStorageChange);
  }, []);

  const toggleFavorite = (teamName: string) => {
    if (favoriteTeam === teamName) {
      // Remove if already favorite
      localStorage.removeItem('favoriteTeam');
      setFavoriteTeam(null);
    } else {
      // Set new favorite
      localStorage.setItem('favoriteTeam', teamName);
      setFavoriteTeam(teamName);
    }
    // Trigger custom event to notify other components
    window.dispatchEvent(new Event(FAVORITE_UPDATED_EVENT));
  };

  return { favoriteTeam, toggleFavorite };
};
