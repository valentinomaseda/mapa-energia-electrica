import { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, LayersControl } from "react-leaflet";
import "../App.css"; 
import L from "leaflet";

// (Tu código de iconos y funciones pointToLayer no cambia)
const iconoCentral = new L.DivIcon({
  className: "icono-central-electrica",
  iconSize: [24, 24], 
  iconAnchor: [12, 12],
});

const iconoPlanta = new L.DivIcon({
  className: "icono-planta-transformadora", 
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const pointToLayerCentral = (feature, latlng) => {
  return L.marker(latlng, { icon: iconoCentral, interactive: true });
};

const pointToLayerPlanta = (feature, latlng) => {
  return L.marker(latlng, { icon: iconoPlanta, interactive: true });
};

// (Tu función onEachFeature no cambia)
const onEachFeature = (feature, layer) => {
  try {
    if (!feature || !feature.properties) return;
    const props = feature.properties;
    let nombre = props.fna || props.nam || "Sin nombre";
    if (typeof nombre !== "string") nombre = String(nombre);
    const nombreLimpio = nombre.replace(/\r\n/g, ""); 
    let popupContent = `<h4>${props.objeto || 'Elemento'}</h4>`;
    popupContent += `<strong>Nombre:</strong> ${nombreLimpio}<br/>`;
    if (props.gna) {
      popupContent += `<strong>Tipo:</strong> ${props.gna}`;
    }
    layer.bindPopup(popupContent);
    layer.on('click', () => {
      if (layer.getPopup) {
        const p = layer.getPopup();
        if (p) layer.openPopup();
      }
    });
  } catch (err) {
    console.error("Error construyendo popup:", err);
  }
};


function Mapa() {
  const [centralesData, setCentralesData] = useState(null);
  const [plantasData, setPlantasData] = useState(null);

  const mapCenter = [-38.4161, -63.6167];
  const zoomLevel = 5;

  // (Tu useEffect de carga de datos no cambia)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [centralesRes, plantasRes] = await Promise.all([
          fetch(`${import.meta.env.BASE_URL}central_electrica.geojson`),
          fetch(`${import.meta.env.BASE_URL}planta_transformadora.geojson`)
        ]);

        const centrales = await centralesRes.json();
        const plantas = await plantasRes.json();

        setCentralesData(centrales);
        setPlantasData(plantas);
      } catch (err) {
        console.error("Error al cargar los datos:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <MapContainer
      center={mapCenter}
      zoom={zoomLevel}
      className="map-container-pagina" // Usa la clase de App.css
    >
      {/* --- ¡CAMBIO ESTÉTICO! --- 
          Usamos un mapa base "Dark Matter" de CartoDB.
          Es mucho más profesional para visualizar datos. */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      <LayersControl position="topright">
        {centralesData && (
          <LayersControl.Overlay name="⚡ Centrales Eléctricas" checked>
            <GeoJSON
              data={centralesData}
              pointToLayer={pointToLayerCentral}
              onEachFeature={onEachFeature}
            />
          </LayersControl.Overlay>
        )}

        {plantasData && (
          // Usé el emoji 🔌 para diferenciarlo
          <LayersControl.Overlay name="🔌 Plantas Transformadoras" checked>
            <GeoJSON
              data={plantasData}
              pointToLayer={pointToLayerPlanta}
              onEachFeature={onEachFeature} 
            />
          </LayersControl.Overlay>
        )}
      </LayersControl>
    </MapContainer>
  );
}

export default Mapa;

