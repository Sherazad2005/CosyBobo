import { Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import LabPage from './pages/LabPage';
import Register from './pages/Register';
import Market from './pages/Market';

function App() {
  return (
    <>
      <nav className='p-4 flex gap-4'>
        <Link to='/' className='text-sm font-semibold'>Login</Link>
        <Link to='/lab' className='text-sm font-semibold'>Lab</Link>
        <Link to='/market' className='text-sm font-semibold'>Market</Link>
      </nav>

    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/lab" element={<LabPage />} />
      <Route path="/market" element={<Market />} />
    </Routes>
    </>
  );
}

export default App;
