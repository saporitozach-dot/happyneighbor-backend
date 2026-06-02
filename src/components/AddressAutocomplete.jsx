import React, { useState, useEffect, useRef } from "react";

const AddressAutocomplete = ({
  value,
  onChange,
  onSelect,
  placeholder = "123 Main Street, City, State",
  className = "",
  disabled = false,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceTimer = useRef(null);

  const searchAddresses = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
          `format=json&q=${encodeURIComponent(query)}&` +
          `addressdetails=1&limit=5&countrycodes=us&extratags=1`,
        { headers: { "User-Agent": "BlockParty/1.0" } }
      );
      if (response.ok) {
        const data = await response.json();
        const formatted = data.map((item) => {
          const address = item.address || {};
          let formattedAddress = "";
          if (address.house_number && address.road) {
            formattedAddress = `${address.house_number} ${address.road}`;
            if (address.city || address.town || address.village)
              formattedAddress += `, ${address.city || address.town || address.village}`;
            if (address.state) formattedAddress += `, ${address.state}`;
          } else {
            formattedAddress = item.display_name.split(",").slice(0, 3).join(",").trim();
          }
          return {
            display: formattedAddress || item.display_name,
            full: item.display_name,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            address,
          };
        });
        setSuggestions(formatted);
        setShowSuggestions(formatted.length > 0);
        setSelectedIndex(-1);
      }
    } catch (err) {
      console.error("Address search error:", err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    onChange(e.target.value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => searchAddresses(e.target.value), 300);
  };

  const handleSelectSuggestion = (suggestion) => {
    onChange(suggestion.display);
    setShowSuggestions(false);
    setSuggestions([]);
    if (onSelect) onSelect(suggestion);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((p) => (p < suggestions.length - 1 ? p + 1 : p));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((p) => (p > 0 ? p - 1 : -1));
    } else if (e.key === "Enter" && selectedIndex >= 0 && selectedIndex < suggestions.length) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        suggestionsRef.current && !suggestionsRef.current.contains(e.target) &&
        inputRef.current && !inputRef.current.contains(e.target)
      )
        setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(
    () => () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    },
    []
  );

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/90 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-party/50 focus:border-party transition-colors ${className}`}
          autoComplete="off"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              className="h-5 w-5 animate-spin text-sage-600"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-stone-200 shadow-soft max-h-56 overflow-y-auto"
        >
          {suggestions.map((suggestion, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className={`w-full text-left px-4 py-3 text-slate-800 hover:bg-party-pale/80 transition-colors rounded-lg ${
                i === selectedIndex ? "bg-party-pale/80" : ""
              }`}
            >
              <span className="text-sm font-medium">{suggestion.display}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
