import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Inicio from './pages/Inicio';
import Mapa from './pages/Mapa';
import AboutUs from './pages/AboutUs';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Navbar />

      <div className="page-content">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/mapa" element={<Mapa />} />
          <Route path="/equipo" element={<AboutUs />} />
          <Route path="*" element={<div>404 — No encontrado</div>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;

