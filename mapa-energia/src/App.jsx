import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Inicio from './pages/Inicio';
import Mapa from './pages/Mapa';
import './App.css';

function App() {
  // Ahora usamos rutas declarativas en lugar de controlar
  // la navegación mediante estado manual.
  return (
    <div className="app-container">
      {/* Navbar siempre visible (no depende de props de navegación) */}
      <Navbar />

      <div className="page-content">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/mapa" element={<Mapa />} />
          <Route path="*" element={<div>404 — No encontrado</div>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;

