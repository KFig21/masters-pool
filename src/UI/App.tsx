import { Routes, Route } from 'react-router-dom';
import { Leaderboard } from './pages/leaderboard/Leaderboard';
import { Team } from './pages/team/Team';
import { Dashboard } from './pages/dashboard/Dashboard';
import { BottomNav } from './components/bottomNav/BottomNav';
import { BackgroundSlider } from './components/backgroundSlider/BackgroundSlider';
import { NoLandscape } from './components/noLandscape/NoLandscape';
import { useScores } from '../context/ScoreContext';
import { useTheme } from '../context/ThemeContext';
import './styles/index.scss';
import { ThemeToggle } from './components/themeToggle/ThemeToggle';

function App() {
  const { isLoading, teams, currentEvent } = useScores();
  const { theme } = useTheme();

  return (
    <div className="app-container" data-tournament={currentEvent.toLowerCase()} data-theme={theme}>
      <BackgroundSlider />
      <NoLandscape />
      <div className="content-wrap">
        <ThemeToggle />
        <Routes>
          <Route path="/" element={<Leaderboard />} />
          <Route path="/team/:owner" element={<Team />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
      {!isLoading && teams.length > 0 && <BottomNav />}
    </div>
  );
}

export default App;
