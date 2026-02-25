import { Routes, Route } from 'react-router-dom';
import { Leaderboard } from './pages/leaderboard/Leaderboard';
import { Team } from './pages/team/Team';
import { BottomNav } from './components/bottomNav/BottomNav';
import { BackgroundSlider } from './components/backgroundSlider/BackgroundSlider';
import { NoLandscape } from './components/noLandscape/NoLandscape';
import './styles/index.scss';
import { useScores } from '../context/ScoreContext';

function App() {
  const { isLoading, teams } = useScores();

  return (
    <div className="app-container">
      <BackgroundSlider />
      <NoLandscape /> {/* Add here */}
      <div className="content-wrap">
        <Routes>
          <Route path="/" element={<Leaderboard />} />
          <Route path="/team/:owner" element={<Team />} />
        </Routes>
      </div>
      {!isLoading && teams.length > 0 && <BottomNav />}
    </div>
  );
}

export default App;
