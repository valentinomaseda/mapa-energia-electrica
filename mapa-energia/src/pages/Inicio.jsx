import { Link } from "react-router-dom";
import DotGrid from "../components/Background";

function Inicio() {
  return (
    <div
      className="inicio-container"
      style={{ position: "relative", overflow: "hidden" }}
    >
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }} aria-hidden>
        <div style={{ width: "100%", height: "600px", position: "relative" }}>
          <DotGrid
            dotSize={3}
            gap={15}
            baseColor="#271e37"
            activeColor="#5227FF"
            proximity={120}
            shockRadius={250}
            shockStrength={5}
            resistance={750}
            returnDuration={1.5}
          />
        </div>
      </div>

      <div className="inicio-hero" style={{ position: "relative", zIndex: 1 }}>
        <h1 className="inicio-title">
          Visualizador de la Red
          <span className="text-accent-blue"> Energética Argentina</span>
        </h1>
        <p className="inicio-subtitle">
          Un análisis interactivo de la infraestructura de generación y
          distribución de energía del país, basado en datos abiertos del IGN.
        </p>
        <div className="inicio-stats">
          <div className="stat-item">
            <span className="stat-number">445</span>
            <span>Centrales Eléctricas</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">493</span>
            <span>Plantas Transformadoras</span>
          </div>
        </div>
        <Link to="/mapa" className="inicio-cta-button">
          Acceder al Mapa Interactivo
        </Link>
      </div>
    </div>
  );
}

export default Inicio;
