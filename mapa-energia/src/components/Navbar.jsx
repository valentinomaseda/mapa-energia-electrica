import React from 'react';
// (No importamos CSS, lo maneja App.jsx)

// Recibimos 'cambiarPagina' (que es 'setPaginaActual')
// desde App.jsx como una "prop"
function Navbar({ cambiarPagina }) {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        Proyecto SIG - Energía
      </div>
      <div className="navbar-links">
        {/* Estos no son links <a> tradicionales.
            Usan onClick para cambiar el estado en App.jsx
            sin recargar la página. */}
        <a className="navbar-link" onClick={() => cambiarPagina('inicio')}>
          Inicio
        </a>
        <a className="navbar-link" onClick={() => cambiarPagina('mapa')}>
          Mapa Interactivo
        </a>
      </div>
    </nav>
  );
}

export default Navbar;

