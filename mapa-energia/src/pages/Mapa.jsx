import { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  LayersControl,
  useMap,
  Polyline,
} from "react-leaflet";
import "../App.css";
import Loader from "../components/Loader";
import SearchFilter from "../components/SearchFilter";
import L from "leaflet";

const iconoCentral = new L.DivIcon({
  className: "icono-central-electrica",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const iconoPlanta = new L.DivIcon({
  className: "icono-planta-transformadora-img",
  html: `<div style="width:24px;height:24px;display:flex;align-items:center;justify-content:center"><img src="${
    import.meta.env.BASE_URL
  }planta_transformadora_icon.svg" alt="planta" style="width:16px;height:16px;display:block"/></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const iconoCentralRoja = new L.DivIcon({
  className: "icono-central-electrica-roja",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const pointToLayerPlanta = (feature, latlng) => {
  return L.marker(latlng, { icon: iconoPlanta, interactive: true });
};

// Función para crear popups informativos para cada feature
const onEachFeature = (feature, layer, { plantasData, onConnectionSelect }) => {
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

      // Si es una central y tiene planta cercana, buscar coords de la planta y dibujar línea
      if (feature.geometry && props.nearestPlanta && plantasData) {
        const [lon, lat] = feature.geometry.coordinates;
        const plantaFeature = plantasData.features.find(
          (pf) =>
            (pf.properties?.fna || pf.properties?.nam) === props.nearestPlanta
        );
        if (plantaFeature && plantaFeature.geometry) {
          const [plantaLon, plantaLat] = plantaFeature.geometry.coordinates;
          onConnectionSelect({
            centralCoords: [lat, lon],
            plantaCoords: [plantaLat, plantaLon],
            distance: props.nearestDist,
          });
        }
      }
    });
  } catch (err) {
    console.error("Error construyendo popup:", err);
  }
};

// Componente que usa useMap() para centrar la vista en un feature seleccionado
function MapNavigator({ feature }) {
  const map = useMap();

  useEffect(() => {
    if (map && feature?.geometry?.coordinates) {
      const [lon, lat] = feature.geometry.coordinates;
      map.flyTo([lat, lon], 12, { duration: 1 });
    }
  }, [map, feature]);

  return null;
}

// Componente con Polyline animada
function AnimatedPolyline({ connection }) {
  const polylineRef = useRef(null);

  useEffect(() => {
    if (polylineRef.current && polylineRef.current._path) {
      const element = polylineRef.current._path;
      element.style.animation = "drawPolyline 1.2s ease-in-out forwards";
    }
  }, [connection]);

  return (
    <Polyline
      ref={polylineRef}
      positions={[connection.centralCoords, connection.plantaCoords]}
      color="#4299e1"
      weight={2}
      opacity={1}
      dashArray="5, 5"
    />
  );
}

function FiltersPanel({ tiposDisponibles, filtrosActivos, setFiltrosActivos }) {
  const map = useMap();

  const handleMouseEnter = () => {
    try {
      if (map && map.scrollWheelZoom) map.scrollWheelZoom.disable();
    } catch (err) {
      void err;
      // ignore
    }
  };
  const handleMouseLeave = () => {
    try {
      if (map && map.scrollWheelZoom) map.scrollWheelZoom.enable();
    } catch (err) {
      void err;
      // ignore
    }
  };

  return (
    <div
      className="filter-section"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onWheel={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div className="filter-title">Filtrar por tipo</div>

      <div className="filter-list">
        {tiposDisponibles && tiposDisponibles.length > 0 ? (
          tiposDisponibles.map((t) => {
            const id = `filter-${t.replace(/\s+/g, "-").toLowerCase()}`;
            const checked = filtrosActivos.includes(t);
            return (
              <label key={t} htmlFor={id} className="filter-item">
                <input
                  id={id}
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    setFiltrosActivos((prev) =>
                      prev.includes(t)
                        ? prev.filter((x) => x !== t)
                        : [...prev, t]
                    );
                  }}
                />
                <span className="custom-checkbox"></span>
                <span className="filter-label-text">{t}</span>
              </label>
            );
          })
        ) : (
          <div className="filter-loading">Cargando tipos...</div>
        )}
      </div>
    </div>
  );
}

function Mapa() {
  const [centralesData, setCentralesData] = useState(null);
  const [plantasData, setPlantasData] = useState(null);
  const [serviceThresholdKm, setServiceThresholdKm] = useState(10);
  const [highlightBrechas, setHighlightBrechas] = useState(true);
  const [tiposDisponibles, setTiposDisponibles] = useState([]);
  const [filtrosActivos, setFiltrosActivos] = useState([]);
  const [filteredCentrales, setFilteredCentrales] = useState([]);
  const [filteredPlantas, setFilteredPlantas] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [connection, setConnection] = useState(null); // { centralCoords, plantaCoords, distance }
  const mapCenter = [-38.4161, -63.6167];
  const zoomLevel = 5;

  // Cargar datos GeoJSON al montar el componente
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

        // Calcular tipos disponibles (propiedad gna) y activar todos por defecto
        try {
          const tiposSet = new Set();
          centrales.features.forEach((f) => {
            const raw = f?.properties?.gna ?? "Sin tipo";
            const g = String(raw).trim();
            // Excluir entrada genérica/ruido "Central" para evitar un checkbox que no filtra nada
            if (g.toLowerCase() === "central") return;
            tiposSet.add(g);
          });
          const tiposArr = Array.from(tiposSet).sort();
          setTiposDisponibles(tiposArr);
          setFiltrosActivos(tiposArr.slice());
        } catch (e) {
          console.error("Error calculando tipos disponibles:", e);
        }
      } catch (err) {
        console.error("Error al cargar los datos:", err);
      }
    };
    fetchData();
  }, []);

  if (!centralesData || !plantasData) {
    return <Loader />;
  }

  // Decidir qué centrales mostrar (filtradas o todas)
  const centralesToShow =
    filteredCentrales.length > 0
      ? { ...centralesData, features: filteredCentrales }
      : centralesData;

  // Decidir qué plantas mostrar (filtradas o todas)
  const plantasToShow =
    filteredPlantas.length > 0
      ? { ...plantasData, features: filteredPlantas }
      : plantasData;

  const handleFilterChange = (result) => {
    setFilteredCentrales(result.centrales || []);
    setFilteredPlantas(result.plantas || []);
  };

  // Callback para navegar a un feature cuando se selecciona desde sugerencias
  const handleSelectFeature = (feature) => {
    if (feature?.geometry?.coordinates) {
      // Simplemente guardamos el feature; MapNavigator se encargará de centrar
      setSelectedFeature(feature);
    }
  };

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

      <SearchFilter
        centralesData={centralesData}
        plantasData={plantasData}
        onFilterChange={handleFilterChange}
        onSelectFeature={handleSelectFeature}
      />

      {/* Componente que maneja la navegación del mapa hacia un feature seleccionado */}
      {selectedFeature && <MapNavigator feature={selectedFeature} />}

      <LayersControl position="topright">
        {centralesToShow && (
          <LayersControl.Overlay name="⚡ Centrales Eléctricas" checked>
            <GeoJSON
              key={`centrales-${serviceThresholdKm}-${highlightBrechas}-${filtrosActivos.join(
                "|"
              )}-${filteredCentrales.length}`}
              data={centralesToShow}
              filter={(feature) => {
                if (!filtrosActivos || filtrosActivos.length === 0)
                  return false;
                const g = feature?.properties?.gna ?? "Sin tipo";
                return filtrosActivos.includes(g);
              }}
              pointToLayer={(feature, latlng) => {
                const d = feature?.properties?.nearestDist;
                const useRed =
                  typeof d === "number" &&
                  d >= serviceThresholdKm &&
                  highlightBrechas;
                return L.marker(latlng, {
                  icon: useRed ? iconoCentralRoja : iconoCentral,
                  interactive: true,
                });
              }}
              onEachFeature={(feature, layer) =>
                onEachFeature(feature, layer, {
                  plantasData,
                  onConnectionSelect: setConnection,
                })
              }
            />
          </LayersControl.Overlay>
        )}

        {plantasToShow && (
          <LayersControl.Overlay name="🔌 Plantas Transformadoras" checked>
            <GeoJSON
              key={`plantas-${filteredPlantas.length}`}
              data={plantasToShow}
              pointToLayer={pointToLayerPlanta}
              onEachFeature={(feature, layer) =>
                onEachFeature(feature, layer, {
                  plantasData: null,
                  onConnectionSelect: null,
                })
              }
            />
          </LayersControl.Overlay>
        )}
      </LayersControl>

      {/* Polyline para visualizar la conexión entre central y planta */}
      {connection && connection.centralCoords && connection.plantaCoords && (
        <AnimatedPolyline connection={connection} />
      )}

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
        {/* Filtros por tipo de planta */}
        <FiltersPanel
          tiposDisponibles={tiposDisponibles}
          filtrosActivos={filtrosActivos}
          setFiltrosActivos={setFiltrosActivos}
        />
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
        Umbral de distancia (km):{" "}
        <strong style={{ color: "#fff" }}>{value}</strong>
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
      <div
        style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}
      >
        <input
          id="highlight-brechas"
          type="checkbox"
          checked={!!highlight}
          onChange={(e) => setHighlight && setHighlight(e.target.checked)}
          style={{ cursor: "pointer" }}
        />
        <label
          htmlFor="highlight-brechas"
          style={{ color: "#e2e8f0", fontSize: 12 }}
        >
          Resaltar brechas
        </label>
      </div>
    </div>
  );
}

export default Mapa;
