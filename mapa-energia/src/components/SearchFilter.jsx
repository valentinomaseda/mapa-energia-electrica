import React, { useState, useRef, useEffect } from "react";
import "../styles/SearchFilter.css";

const SearchIcon = () => (
  <svg
    className="search-filter-icon"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    width="18"
    height="18"
  >
    <path
      fillRule="evenodd"
      d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
      clipRule="evenodd"
    />
  </svg>
);

const ClearIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    width="16"
    height="16"
  >
    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
  </svg>
);

function SearchFilter({ centralesData, plantasData, onFilterChange, onSelectFeature }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("central");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    performFilter(term, searchType);
    updateSuggestions(term, searchType);
  };

  const handleTypeChange = (e) => {
    const type = e.target.value;
    setSearchType(type);
    performFilter(searchTerm, type);
    updateSuggestions(searchTerm, type);
  };

  const updateSuggestions = (term, type) => {
    if (!term.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const data = type === "central" ? centralesData : plantasData;
    if (!data || !data.features) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const normalizedTerm = term
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const filtered = data.features
      .filter((feature) => {
        const nombre = (
          feature.properties?.fna ||
          feature.properties?.nam ||
          ""
        )
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        return nombre.includes(normalizedTerm);
      })
      .slice(0, 8);

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  };

  const handleSuggestionClick = (feature) => {
    const nombre = feature.properties?.fna || feature.properties?.nam || "Sin nombre";
    setSearchTerm(nombre);
    setShowSuggestions(false);
    if (onSelectFeature) {
      onSelectFeature(feature);
    }
  };

  const performFilter = (term, type) => {
    const normalizedTerm = term
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

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
        )
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        return nombre.includes(normalizedTerm);
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
        )
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        return nombre.includes(normalizedTerm);
      });
      onFilterChange({ centrales: [], plantas: filtered });
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    performFilter("", searchType);
  };

  const getResultsCount = () => {
    const normalizedTerm = searchTerm
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (searchType === "central") {
      return (
        centralesData?.features?.filter((f) => {
          const nombre = (f.properties?.fna || f.properties?.nam || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
          return nombre.includes(normalizedTerm);
        }).length || 0
      );
    } else {
      return (
        plantasData?.features?.filter((f) => {
          const nombre = (f.properties?.fna || f.properties?.nam || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
          return nombre.includes(normalizedTerm);
        }).length || 0
      );
    }
  };

  return (
    <div className="search-filter-container" ref={containerRef}>
      <div className="search-filter-wrapper">
        <SearchIcon />

        <select
          value={searchType}
          onChange={handleTypeChange}
          className="search-filter-select"
        >
          <option value="central">Central Eléctrica</option>
          <option value="planta">Planta Transformadora</option>
        </select>

        <input
          type="text"
          placeholder={
            searchType === "central"
              ? "Buscar central..."
              : "Buscar planta..."
          }
          value={searchTerm}
          onChange={handleInputChange}
          className="search-filter-input"
        />

        {searchTerm && (
          <button onClick={handleClear} className="search-filter-clear">
            <ClearIcon />
          </button>
        )}
      </div>

      {searchTerm && (
        <div className="search-filter-info">
          {`${getResultsCount()} resultados`}
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="search-suggestions">
          {suggestions.map((feature, idx) => {
            const nombre = feature.properties?.fna || feature.properties?.nam || "Sin nombre";
            const tipo = feature.properties?.gna || feature.properties?.tipo || "";
            return (
              <div
                key={idx}
                className="search-suggestion-item"
                onClick={() => handleSuggestionClick(feature)}
              >
                <div className="suggestion-name">{nombre}</div>
                {tipo && <div className="suggestion-type">{tipo}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SearchFilter;