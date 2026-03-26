import { useTheme } from '../../../context/ThemeContext';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import Brightness5Icon from '@mui/icons-material/Brightness5';
import './styles.scss';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className="theme-toggle-button">
      {theme === 'light' ? <BedtimeIcon /> : <Brightness5Icon />}
    </button>
  );
};
