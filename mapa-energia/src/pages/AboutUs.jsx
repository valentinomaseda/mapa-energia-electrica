import DotGrid from "../components/Background";
import "../styles/AboutUs.css";

function AboutUs() {
  const developers = [
    {
      id: 1,
      name: "Valentino Maseda",
      role: "Full Stack Developer",
      description: "Especialista en visualización de datos geoespaciales e integración SIG",
      skills: ["React", "Node.js", "GIS", "Bases de datos", "UX/UI"],
    },
    {
      id: 2,
      name: "Tadeo Rufine",
      role: "Full Stack Developer",
      description: "Especialista en interfaz de usuario y experiencia",
      skills: ["React", "Node.js", "GIS", "Bases de datos", "UX/UI"],
    },
    {
      id: 3,
      name: "Zarah Massuh",
      role: "Full Stack Developer",
      description: "Gestión de datos y APIs",
      skills: ["React", "Node.js", "GIS", "Bases de datos", "UX/UI"],
    },
    {
      id: 4,
      name: "Matías Morici",
      role: "Full Stack Developer",
      description: "Especialista en datos geoespaciales",
      skills: ["React", "Node.js", "GIS", "Bases de datos", "UX/UI"],
    },
  ];

  return (
    <div
      className="aboutus-container"
      style={{ position: "relative" }}
    >
      <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }} aria-hidden>
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

      <div className="aboutus-content" style={{ position: "relative", zIndex: 1 }}>
        <div className="aboutus-header">
          <h1 className="aboutus-title">
            Conoce al <span className="text-accent-blue">Equipo</span>
          </h1>
          <p className="aboutus-subtitle">
            Desarrolladores apasionados por la visualización de datos y la
            infraestructura energética argentina
          </p>
        </div>

        <div className="developers-grid">
          {developers.map((dev) => (
            <div key={dev.id} className="developer-card">
              <div className="card-header">
                <div className="developer-avatar">{dev.name.charAt(0)}</div>
              </div>
              <div className="card-body">
                <h3 className="developer-name">{dev.name}</h3>
                <p className="developer-role">{dev.role}</p>
                <p className="developer-description">{dev.description}</p>
              </div>
              <div className="card-footer">
                <div className="skills">
                  {dev.skills.map((skill, index) => (
                    <span key={index} className="skill-badge">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AboutUs;
