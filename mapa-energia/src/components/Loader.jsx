import React from 'react';

export default function Loader() {
  return (
    <div className="app-loader" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true"></div>
      <div className="loader-text">Cargando mapa…</div>
    </div>
  );
}
