import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl, Popup } from 'react-leaflet';
import L from 'leaflet';
import './App.css'; // Asegúrate de tener este archivo o importa el CSS de Leaflet aquí

// --- 1. DATOS DE EJEMPLO (MOCK) PARA LÍNEAS ---
// (Ya que no tenemos ese archivo, usamos esto como placeholder)
const mockLineas = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [-65.4294, -24.8022], // Coordenada de una planta en Salta
          [-65.0425, -24.6894], // Coordenada de una central en Salta
          [-64.9807, -25.5084]  // Coordenada de otra planta en Metán
        ]
      },
      "properties": {
        "nombre": "Línea de Transmisión (Ejemplo)",
        "tipo": "Alta Tensión",
        "tension": "500 kV"
      }
    }
  ]
};

// --- 2. ESTILOS Y POPUPS ---

// Estilo para las Líneas de Transmisión
const styleLinea = {
  color: '#ff7800', // Naranja
  weight: 4,
  opacity: 0.8
};

// Icono personalizado para Centrales Eléctricas (Ej: un rayo)
// Usamos L.DivIcon para crear iconos con SVG, es más flexible.
const iconCentral = new L.DivIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFA500" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-zap"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
  className: 'leaflet-div-icon', // Puedes usar esta clase para estilos CSS
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Icono personalizado para Plantas Transformadoras (Ej: un cuadrado)
const iconPlanta = new L.DivIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#007BFF" stroke="#FFFFFF" stroke-width="1.5"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect></svg>`,
  className: 'leaflet-div-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Funciones para aplicar los iconos a cada punto
const pointToLayerCentral = (feature, latlng) => {
  return L.marker(latlng, { icon: iconCentral });
};

const pointToLayerPlanta = (feature, latlng) => {
  return L.marker(latlng, { icon: iconPlanta });
};

// Función genérica para crear Popups
// Se ejecutará en CADA capa (onEachFeature)
const onEachFeature = (feature, layer) => {
  if (feature.properties) {
    // Inspeccionamos las propiedades de tus archivos
    const props = feature.properties;
    
    // Para Centrales Eléctricas [cite: 860, 862]
    let popupContent = `<h4>${props.objeto || 'Elemento'}</h4><hr>`;
    
    // Usamos 'fna' (nombre completo) si existe, si no 'nam' (nombre)
    const nombre = props.fna || props.nam || 'Sin nombre';
    
    // Limpiamos los saltos de línea \r\n que vi en tus datos [cite: 860]
    popupContent += `<strong>Nombre:</strong> ${nombre.replace(/\r\n/g, '')}<br/>`;

    // Añadimos el tipo (gna: 'Central Térmica', 'Central Solar', etc.)
    if (props.gna) {
      popupContent += `<strong>Tipo:</strong> ${props.gna}<br/>`;
    }
    
    // Añadimos propiedades genéricas si existen
    if (props.tipo) {
      popupContent += `<strong>Tipo:</strong> ${props.tipo}<br/>`;
    }
    if (props.tension) {
      popupContent += `<strong>Tensión:</strong> ${props.tension}<br/>`;
    }

    layer.bindPopup(popupContent);
  }
};

// --- 3. COMPONENTE PRINCIPAL DE LA APP ---
function App() {
  // Estados para almacenar los datos GeoJSON
  const [centralesData, setCentralesData] = useState(null);
  const [lineasData, setLineasData] = useState(null);
  const [plantasData, setPlantasData] = useState(null);

  // Centro aproximado de Argentina
  const mapCenter = [-38.4161, -63.6167];
  const zoomLevel = 5;

  // --- 4. CARGA DE DATOS (useEffect) ---
  useEffect(() => {
    // Cargar Centrales Eléctricas
    fetch('/central_electrica.geojson')
      .then(res => res.json())
      .then(data => setCentralesData(data))
      .catch(err => console.error("Error cargando centrales:", err));

    // Cargar Plantas Transformadoras
    fetch('/planta_transformadora.geojson')
      .then(res => res.json())
      .then(data => setPlantasData(data))
      .catch(err => console.error("Error cargando plantas:", err));

    // Cargar Líneas (usamos el mock de arriba)
    setLineasData(mockLineas);

  }, []); // El array vacío asegura que se ejecute solo una vez

  return (
    <MapContainer center={mapCenter} zoom={zoomLevel} style={{ height: '100vh', width: '100vw' }}>
      
      {/* Capa Base (Tiles) de OpenStreetMap */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* --- 5. CONTROLADOR DE CAPAS --- */}
      <LayersControl position="topright">
        
        {/* Capa 1: Centrales Eléctricas (Puntos) */}
        {centralesData && (
          <LayersControl.Overlay name="⚡ Centrales Eléctricas" checked>
            <GeoJSON
              data={centralesData}
              pointToLayer={pointToLayerCentral}
              onEachFeature={onEachFeature}
            />
          </LayersControl.Overlay>
        )}

        {/* Capa 2: Plantas Transformadoras (Puntos) */}
        {plantasData && (
          <LayersControl.Overlay name="🟦 Plantas Transformadoras" checked>
            <GeoJSON
              data={plantasData}
              pointToLayer={pointToLayerPlanta}
              onEachFeature={onEachFeature}
            />
          </LayersControl.Overlay>
        )}

        {/* Capa 3: Líneas de Transmisión (Líneas) */}
        {lineasData && (
          <LayersControl.Overlay name="🟧 Líneas de Transmisión (Ejemplo)" checked>
            <GeoJSON
              data={lineasData}
              style={styleLinea}
              onEachFeature={onEachFeature}
            />
          </LayersControl.Overlay>
        )}

      </LayersControl>
    </MapContainer>
  );
}

export default App;