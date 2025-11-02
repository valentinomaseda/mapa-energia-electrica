import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ marginRight: '10px' }}
            // 1. Añadimos la clase de acento de color que ya existe en App.css
            className="text-accent-blue"
          >
            {/* 2. Reemplazamos el <path> genérico por el <polygon> del rayo */}
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          
          {/* 3. Dividimos el texto para aplicar el acento, igual que en Inicio.jsx */}
          <span>
            Proyecto SIG // <span className="text-accent-blue">Red Energética</span>
          </span>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;