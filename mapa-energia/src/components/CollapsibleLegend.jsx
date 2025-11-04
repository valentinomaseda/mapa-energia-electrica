import { useState } from 'react';
import { useMap } from 'react-leaflet';
import '../styles/CollapsibleLegend.css';
import arrowDown from '../assets/arrow-down.svg';

function CollapsibleLegend({ serviceThresholdKm, tiposDisponibles, filtrosActivos, setFiltrosActivos }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const map = useMap();

  const handleCheckboxChange = (tipo) => {
    setFiltrosActivos((prev) =>
      prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo]
    );
  };

  const handleMouseEnter = () => {
    if (map) {
      map.scrollWheelZoom.disable();
    }
  };

  const handleMouseLeave = () => {
    if (map) {
      map.scrollWheelZoom.enable();
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handlePointerDown = (e) => {
    e.stopPropagation();
  };

  const handlePointerUp = (e) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="map-legend" 
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="legend-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="legend-title">Leyenda</div>
        <div className={`legend-toggle ${isExpanded ? 'expanded' : 'collapsed'}`}>
            <img src={arrowDown} alt="Toggle Legend" />
        </div>
      </div>

      {isExpanded && (
        <div className="legend-content">
          <div className="legend-item">
            <div className="legend-sym central" /> <div>Centrales</div>
          </div>
          <div className="legend-item">
            <div className="legend-sym planta" /> <div>Plantas</div>
          </div>
          <div className="legend-item">
            <div className="legend-sym brecha" />{" "}
            <div>Brecha (≥ {serviceThresholdKm} km)</div>
          </div>

          <div className="legend-divider"></div>
          <div className="legend-subtitle">Líneas por Tensión</div>
          <div className="legend-item">
            <div className="legend-line" style={{ backgroundColor: '#9C27B0' }}></div>
            <div>≥ 500 kV</div>
          </div>
          <div className="legend-item">
            <div className="legend-line" style={{ backgroundColor: '#E91E63' }}></div>
            <div>330-499 kV</div>
          </div>
          <div className="legend-item">
            <div className="legend-line" style={{ backgroundColor: '#FBC02D' }}></div>
            <div>220-329 kV</div>
          </div>
          <div className="legend-item">
            <div className="legend-line" style={{ backgroundColor: '#00BCD4' }}></div>
            <div>132-219 kV</div>
          </div>
          <div className="legend-item">
            <div className="legend-line" style={{ backgroundColor: '#795548' }}></div>
            <div>&lt; 132 kV</div>
          </div>

          <div className="legend-divider"></div>
          <div className="legend-subtitle">Filtrar por tipo</div>
          <div className="legend-filters">
            {tiposDisponibles.map((tipo) => (
              <div key={tipo} className="filter-checkbox">
                <input
                  type="checkbox"
                  id={`filter-${tipo}`}
                  checked={filtrosActivos.includes(tipo)}
                  onChange={() => handleCheckboxChange(tipo)}
                />
                <label htmlFor={`filter-${tipo}`}>{tipo}</label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CollapsibleLegend;
