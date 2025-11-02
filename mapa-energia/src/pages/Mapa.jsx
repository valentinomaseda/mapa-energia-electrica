import { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, LayersControl } from "react-leaflet";
import "../App.css"; // <-- CAMBIO 1: La ruta ahora es "../App.css"
import L from "leaflet";

// (Todo tu código de iconos y funciones va aquí, sin cambios)
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

const onEachCentral = (feature, layer) => {
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
    console.error("Error construyendo popup de central:", err, feature.properties);
  }
};

// --- CAMBIO 2: Renombramos la función de "App" a "Mapa" ---
function Mapa() {
  const [centralesData, setCentralesData] = useState(null);
  const [plantasData, setPlantasData] = useState(null);

  const mapCenter = [-38.4161, -63.6167];
  const zoomLevel = 5;

  // (Tu useEffect de carga de datos [cite: 77-94], sin cambios)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [centralesRes, plantasRes] = await Promise.all([
          fetch(`${import.meta.env.BASE_URL}central_electrica.geojson`),
          fetch(`${import.meta.env.BASE_URL}planta_transformadora.geojson`),
        ]);

        const centrales = await centralesRes.json();
        const plantas = await plantasRes.json();

        setCentralesData(centrales);
        setPlantasData(plantas);
        console.log("Datos cargados (centrales, plantas)", centrales?.features?.length, plantas?.features?.length);
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
      // --- CAMBIO 3: El estilo ahora es 100% del contenedor padre (.page-content) ---
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      <LayersControl position="topright">
        {centralesData && (
          <LayersControl.Overlay name="⚡ Centrales Eléctricas" checked>
            <GeoJSON
              data={centralesData}
              pointToLayer={pointToLayerCentral}
              onEachFeature={onEachCentral}
            />
          </LayersControl.Overlay>
        )}

        {plantasData && (
          <LayersControl.Overlay name="🔌 Plantas Transformadoras" checked>
            <GeoJSON
              data={plantasData}
              pointToLayer={pointToLayerPlanta}
              onEachFeature={onEachCentral}
            />
          </LayersControl.Overlay>
        )}
      </LayersControl>
    </MapContainer>
  );
}

// --- CAMBIO 4: Exportamos "Mapa" ---
export default Mapa;

