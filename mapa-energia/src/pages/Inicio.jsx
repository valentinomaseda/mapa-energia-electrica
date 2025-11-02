import React from 'react';
// (No importamos CSS, lo maneja App.jsx)

function Inicio() {
  return (
    // Usamos estilos de App.css para centrar esto
    <div className="inicio-container">
      <h1>Infraestructura Energética Argentina</h1>
      <p>
        Este proyecto es un trabajo integrador para la materia Sistemas de Información Geográfica (UTN).
      </p>
      <p>
        Utiliza React y Leaflet para visualizar capas GeoJSON exportadas desde QGIS,
        basadas en datos oficiales del Instituto Geográfico Nacional (IGN).
      </p>
      <p>
        Haz clic en <strong>"Mapa Interactivo"</strong> en la navegación para comenzar.
      </p>
    </div>
  );
}

export default Inicio;

