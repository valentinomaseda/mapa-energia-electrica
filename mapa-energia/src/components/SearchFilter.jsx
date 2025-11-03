import React, { useState } from "react";
import "../styles/SearchFilter.css";

function SearchFilter({ centralesData, plantasData, onFilterChange }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("central"); // "central" o "planta"

  const handleInputChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    performFilter(term, searchType);
  };

  const handleTypeChange = (e) => {
    const type = e.target.value;
    setSearchType(type);
    performFilter(searchTerm, type);
  };

  const performFilter = (term, type) => {
    if (type === "central") {
      if (!centralesData || !centralesData.features) {
        onFilterChange({ centrales: [], plantas: [] });
        return;
      }

      const filtered = centralesData.features.filter((feature) => {
        const nombre = (
          feature.properties?.fna ||
          feature.properties?.nam ||
          ""
        ).toLowerCase();
        return nombre.includes(term.toLowerCase());
      });

      onFilterChange({ centrales: filtered, plantas: [] });
    } else {
      if (!plantasData || !plantasData.features) {
        onFilterChange({ centrales: [], plantas: [] });
        return;
      }

      const filtered = plantasData.features.filter((feature) => {
        const nombre = (
          feature.properties?.fna ||
          feature.properties?.nam ||
          ""
        ).toLowerCase();
        return nombre.includes(term.toLowerCase());
      });

      onFilterChange({ centrales: [], plantas: filtered });
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    onFilterChange({ centrales: [], plantas: [] });
  };

  const getResultsCount = () => {
    if (searchType === "central") {
      return centralesData?.features?.filter((f) =>
        (f.properties?.fna || f.properties?.nam || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      ).length || 0;
    } else {
      return plantasData?.features?.filter((f) =>
        (f.properties?.fna || f.properties?.nam || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      ).length || 0;
    }
  };

  return (
    <div className="search-filter-container">
      <div className="search-filter-wrapper">
        <select
          value={searchType}
          onChange={handleTypeChange}
          className="search-filter-select"
        >
          <option value="central">⚡ Central Eléctrica</option>
          <option value="planta">🔌 Planta Transformadora</option>
        </select>
        <input
          type="text"
          placeholder={
            searchType === "central"
              ? "🔍 Buscar central..."
              : "🔍 Buscar planta..."
          }
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
          {`${getResultsCount()} resultado(s) encontrado(s)`}
        </div>
      )}
    </div>
  );
}

export default SearchFilter;
