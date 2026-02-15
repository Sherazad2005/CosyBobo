import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import LabPage from './pages/LabPage';
import Register from './pages/Register';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/lab" element={<LabPage />} />
    </Routes>
  );
}

export default App;
