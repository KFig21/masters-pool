import { Routes, Route } from 'react-router-dom';
import { Scoreboard } from './pages/scoreboard/Scoreboard';
import { Team } from './pages/team/Team';
import { BottomNav } from './components/bottomNav/BottomNav';
import { BackgroundSlider } from './components/backgroundSlider/BackgroundSlider';
import './styles/index.scss';

function App() {
  return (
    <div className="app-container">
      <BackgroundSlider />
      <div className="content-wrap">
        <Routes>
          <Route path="/" element={<Scoreboard />} />
          <Route path="/team/:owner" element={<Team />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  );
}

export default App;
