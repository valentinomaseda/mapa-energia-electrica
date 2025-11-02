import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  LayersControl,
  useMap,
} from "react-leaflet";
import "../App.css";
import Loader from "../components/Loader";
import L from "leaflet";

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

// Icono de central en estado 'brecha' (rojo)
const iconoCentralRoja = new L.DivIcon({
  className: "icono-central-electrica-roja",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// NOTE: no se usa un icono separado para "brecha"; cambiaremos el color del icono de central.

const pointToLayerPlanta = (feature, latlng) => {
  return L.marker(latlng, { icon: iconoPlanta, interactive: true });
};

const onEachFeature = (feature, layer) => {
  try {
    if (!feature || !feature.properties) return;
    const props = feature.properties;
    let nombre = props.fna || props.nam || "Sin nombre";
    if (typeof nombre !== "string") nombre = String(nombre);
    const nombreLimpio = nombre.replace(/\r\n/g, "");
    let popupContent = `<h4>${props.objeto || "Elemento"}</h4>`;
    popupContent += `<strong>Nombre:</strong> ${nombreLimpio}<br/>`;
    if (props.gna) {
      popupContent += `<strong>Tipo:</strong> ${props.gna}<br/>`;
    }

    if (props.nearestDist !== undefined && props.nearestDist !== null) {
      popupContent += `<strong>Distancia a planta más cercana:</strong> ${props.nearestDist.toFixed(
        2
      )} km<br/>`;
      if (props.nearestPlanta) {
        popupContent += `<strong>Planta cercana:</strong> ${props.nearestPlanta}<br/>`;
      }
    }

    layer.bindPopup(popupContent);
    layer.on("click", () => {
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
  const [serviceThresholdKm, setServiceThresholdKm] = useState(10);
  // Controla si las centrales que superan el umbral se muestran en rojo
  const [highlightBrechas, setHighlightBrechas] = useState(true);
  const mapCenter = [-38.4161, -63.6167];
  const zoomLevel = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [centralesRes, plantasRes] = await Promise.all([
          fetch(`${import.meta.env.BASE_URL}central_electrica.geojson`),
          fetch(`${import.meta.env.BASE_URL}planta_transformadora.geojson`),
        ]);

        const centrales = await centralesRes.json();
        const plantas = await plantasRes.json();

        // Calculamos la distancia a la planta más cercana para cada central
        const haversineKm = (lat1, lon1, lat2, lon2) => {
          const toRad = (v) => (v * Math.PI) / 180;
          const R = 6371;
          const dLat = toRad(lat2 - lat1);
          const dLon = toRad(lon2 - lon1);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) *
              Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return R * c;
        };

        if (
          Array.isArray(centrales.features) &&
          Array.isArray(plantas.features)
        ) {
          centrales.features = centrales.features.map((cent) => {
            try {
              const [lonC, latC] = cent.geometry.coordinates;
              let nearest = { dist: Infinity, plantaIdx: null };
              plantas.features.forEach((pla, j) => {
                const [lonP, latP] = pla.geometry.coordinates;
                const d = haversineKm(latC, lonC, latP, lonP);
                if (d < nearest.dist) {
                  nearest = { dist: d, plantaIdx: j };
                }
              });
              cent.properties = cent.properties || {};
              cent.properties.nearestDist = isFinite(nearest.dist)
                ? nearest.dist
                : null;
              // Intentamos obtener un nombre identificador de la planta cercana
              const nombrePlanta =
                plantas.features[nearest.plantaIdx]?.properties?.fna ||
                plantas.features[nearest.plantaIdx]?.properties?.nam ||
                null;
              cent.properties.nearestPlanta = nombrePlanta || null;
            } catch (err) {
              console.error("Error calculando distancia para central:", err);
            }
            return cent;
          });
        }

        setCentralesData(centrales);
        setPlantasData(plantas);
      } catch (err) {
        console.error("Error al cargar los datos:", err);
      }
    };
    fetchData();
  }, []);

  // Mostrar loader mientras no se han cargado ambos GeoJSON
  if (!centralesData || !plantasData) {
    return <Loader />;
  }

  return (
    <MapContainer
      center={mapCenter}
      zoom={zoomLevel}
      className="map-container-pagina"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      <LayersControl position="topright">
        {centralesData && (
          <LayersControl.Overlay name="⚡ Centrales Eléctricas" checked>
            <GeoJSON
              key={`centrales-${serviceThresholdKm}-${highlightBrechas}`}
              data={centralesData}
              pointToLayer={(feature, latlng) => {
                const d = feature?.properties?.nearestDist;
                const useRed = typeof d === 'number' && d >= serviceThresholdKm && highlightBrechas;
                return L.marker(latlng, { icon: useRed ? iconoCentralRoja : iconoCentral, interactive: true });
              }}
              onEachFeature={onEachFeature}
            />
          </LayersControl.Overlay>
        )}

        {plantasData && (
          <LayersControl.Overlay name="🔌 Plantas Transformadoras" checked>
            <GeoJSON
              data={plantasData}
              pointToLayer={pointToLayerPlanta}
              onEachFeature={onEachFeature}
            />
          </LayersControl.Overlay>
        )}

      </LayersControl>

      <div className="map-legend">
        <div className="legend-title">Leyenda</div>
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
      </div>

      <ThresholdControl
        value={serviceThresholdKm}
        onChange={setServiceThresholdKm}
        highlight={highlightBrechas}
        setHighlight={setHighlightBrechas}
      />
    </MapContainer>
  );
}

function ThresholdControl({ value, onChange, highlight, setHighlight }) {
  const map = useMap();

  const handlePointerDown = (e) => {
    e.stopPropagation();
    if (map && map.dragging) map.dragging.disable();
  };
  const handlePointerUp = (e) => {
    e.stopPropagation();
    if (map && map.dragging) map.dragging.enable();
  };

  return (
    <div
      className="threshold-control"
      style={{ position: "absolute", left: 12, bottom: 12, zIndex: 560 }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <label
        style={{
          display: "block",
          color: "#e2e8f0",
          fontSize: 12,
          marginBottom: 6,
        }}
      >
        Umbral de distancia (km): <strong style={{ color: "#fff" }}>{value}</strong>
      </label>
      <input
        type="range"
        min={1}
        max={200}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchEnd={handlePointerUp}
        onMouseDown={handlePointerDown}
        onMouseUp={handlePointerUp}
      />
      <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
        <input
          id="highlight-brechas"
          type="checkbox"
          checked={!!highlight}
          onChange={(e) => setHighlight && setHighlight(e.target.checked)}
          style={{ cursor: "pointer" }}
        />
        <label htmlFor="highlight-brechas" style={{ color: "#e2e8f0", fontSize: 12 }}>
          Resaltar brechas
        </label>
      </div>
    </div>
  );
}

export default Mapa;
