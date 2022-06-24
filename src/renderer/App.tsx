import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';
import Home from './Home';

declare global {
  interface Window {
    electron: {
      store: {
        get: (key: string) => unknown;
        set: (key: string, val: unknown) => void;
        // any other methods you've defined...
      };
      ipcRenderer: {
        send: (channel: string, args: unknown) => void;
      };
    };
  }
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}
