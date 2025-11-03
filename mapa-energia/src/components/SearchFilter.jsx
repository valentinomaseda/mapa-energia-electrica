import React, { useState } from "react";
import "../styles/SearchFilter.css";

function SearchFilter({ data, onFilterChange }) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleInputChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    // Filtrar centrales por nombre
    if (!data || !data.features) {
      onFilterChange([]);
      return;
    }

    const filtered = data.features.filter((feature) => {
      const nombre = (
        feature.properties?.fna ||
        feature.properties?.nam ||
        ""
      ).toLowerCase();
      return nombre.includes(term.toLowerCase());
    });

    onFilterChange(filtered);
  };

  const handleClear = () => {
    setSearchTerm("");
    onFilterChange([]);
  };

  return (
    <div className="search-filter-container">
      <div className="search-filter-wrapper">
        <input
          type="text"
          placeholder="🔍 Buscar central por nombre..."
          value={searchTerm}
          onChange={handleInputChange}
          className="search-filter-input"
        />
        {searchTerm && (
          <button onClick={handleClear} className="search-filter-clear">
            ✕
          </button>
        )}
      </div>
      {searchTerm && (
        <div className="search-filter-info">
          {`${
            data?.features?.filter((f) =>
              (f.properties?.fna || f.properties?.nam || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
            ).length || 0
          } resultado(s) encontrado(s)`}
        </div>
      )}
    </div>
  );
}

export default SearchFilter;
