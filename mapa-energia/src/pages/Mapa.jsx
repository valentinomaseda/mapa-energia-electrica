import { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, LayersControl, useMap } from "react-leaflet";
import "../App.css"; 
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

const iconoBrecha = new L.DivIcon({
  className: "icono-brecha-servicio",
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#e74c3c;border:2px solid white"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const pointToLayerCentral = (feature, latlng) => {
  return L.marker(latlng, { icon: iconoCentral, interactive: true });
};

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
    let popupContent = `<h4>${props.objeto || 'Elemento'}</h4>`;
    popupContent += `<strong>Nombre:</strong> ${nombreLimpio}<br/>`;
    if (props.gna) {
      popupContent += `<strong>Tipo:</strong> ${props.gna}<br/>`;
    }

    // Si existe información de distancia calculada, la mostramos
    if (props.nearestDist !== undefined && props.nearestDist !== null) {
      popupContent += `<strong>Distancia a planta más cercana:</strong> ${props.nearestDist.toFixed(2)} km<br/>`;
      if (props.nearestPlanta) {
        popupContent += `<strong>Planta cercana:</strong> ${props.nearestPlanta}<br/>`;
      }
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
  // Umbral en km para considerar que una central NO tiene transformador cercano (editable)
  const [serviceThresholdKm, setServiceThresholdKm] = useState(10);
  // Visibilidad de la capa de brechas
  const [brechasVisible, setBrechasVisible] = useState(false);

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

        // Calculamos la distancia a la planta más cercana para cada central
        const haversineKm = (lat1, lon1, lat2, lon2) => {
          const toRad = (v) => (v * Math.PI) / 180;
          const R = 6371; // km
          const dLat = toRad(lat2 - lat1);
          const dLon = toRad(lon2 - lon1);
          const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return R * c;
        };

        if (Array.isArray(centrales.features) && Array.isArray(plantas.features)) {
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
              cent.properties.nearestDist = isFinite(nearest.dist) ? nearest.dist : null;
              // Intentamos obtener un nombre identificador de la planta cercana
              const nombrePlanta = plantas.features[nearest.plantaIdx]?.properties?.fna || plantas.features[nearest.plantaIdx]?.properties?.nam || null;
              cent.properties.nearestPlanta = nombrePlanta || null;
            } catch (err) {
              console.error('Error calculando distancia para central:', err);
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

        {/* La capa de 'brechas' se renderiza fuera de LayersControl para
            manejar mejor la actualización cuando cambia el umbral. */}
      </LayersControl>

      {/* Leyenda mejorada que usa clases CSS (coincide con los iconos) */}
      <div className="map-legend">
        <div className="legend-title">Leyenda</div>
        <div className="legend-item"><div className="legend-sym central" /> <div>Centrales</div></div>
        <div className="legend-item"><div className="legend-sym planta" /> <div>Plantas</div></div>
        <div className="legend-item"><div className="legend-sym brecha" /> <div>Brecha (≥ {serviceThresholdKm} km)</div></div>
      </div>

      {/* Capa de brechas: renderizada fuera de LayersControl para mejor control */}
      {centralesData && brechasVisible && (
        <GeoJSON
          key={`brechas-${serviceThresholdKm}`}
          data={{
            type: 'FeatureCollection',
            features: centralesData.features.filter(f => {
              const d = f?.properties?.nearestDist;
              return d === null || d === undefined ? false : d >= serviceThresholdKm;
            })
          }}
          pointToLayer={(feature, latlng) => L.marker(latlng, { icon: iconoBrecha })}
          onEachFeature={onEachFeature}
        />
      )}

      {/* Control flotante para ajustar el umbral en tiempo real (con manejo de arrastre del mapa) */}
      <ThresholdControl
        value={serviceThresholdKm}
        onChange={setServiceThresholdKm}
        visible={brechasVisible}
        setVisible={setBrechasVisible}
      />
    </MapContainer>
  );
}

function ThresholdControl({ value, onChange, visible, setVisible }) {
  const map = useMap();

  const handlePointerDown = (e) => {
    // Evita propagación al mapa y deshabilita el arrastre
    e.stopPropagation();
    if (map && map.dragging) map.dragging.disable();
  };
  const handlePointerUp = (e) => {
    e.stopPropagation();
    if (map && map.dragging) map.dragging.enable();
  };

  return (
    <div className="threshold-control" style={{position:'absolute', left:12, bottom:12, zIndex:560}} onPointerDown={(e)=>e.stopPropagation()}>
      <label style={{display:'block', color:'#e2e8f0', fontSize:12, marginBottom:6}}>Umbral de distancia (km): <strong style={{color:'#fff'}}>{value}</strong></label>
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
      <div style={{marginTop:8, display:'flex', alignItems:'center', gap:8}}>
        <input id="brechas-visible" type="checkbox" checked={visible} onChange={(e)=>setVisible(e.target.checked)} />
        <label htmlFor="brechas-visible" style={{color:'#e2e8f0', fontSize:12}}>Mostrar brechas</label>
      </div>
    </div>
  );
}

export default Mapa;

