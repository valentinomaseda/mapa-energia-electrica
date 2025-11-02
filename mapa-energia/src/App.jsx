import React, { useState } from 'react';
import Navbar from './components/Navbar'; // 1. Importamos la barra de navegación
import Inicio from './pages/Inicio';       // 2. Importamos la página de Inicio
import Mapa from './pages/Mapa';           // 3. Importamos tu Mapa
import './App.css'; 

function App() {
  // Este estado controla qué página estamos viendo. Empezamos en 'inicio'.
  const [paginaActual, setPaginaActual] = useState('inicio');

  // Función que decide qué componente de página mostrar
  const renderizarPagina = () => {
    switch (paginaActual) {
      case 'inicio':
        return <Inicio />;
      case 'mapa':
        return <Mapa />;
      default:
        return <Inicio />;
    }
  };

  return (
    // 'app-container' es un nuevo estilo en App.css
    // que divide la app en "Navbar" y "Contenido"
    <div className="app-container">
      
      {/* La Navbar siempre es visible y le pasamos la
          función para cambiar de página */}
      <Navbar cambiarPagina={setPaginaActual} />

      {/* El 'page-content' es un contenedor que se estira
          para ocupar el resto de la pantalla */}
      <div className="page-content">
        {renderizarPagina()}
      </div>
    </div>
  );
}

export default App;

