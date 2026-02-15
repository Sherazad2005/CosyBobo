import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import LabPage from './pages/LabPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/lab" element={<LabPage />} />
    </Routes>
  );
}

export default App;
