import React, { useState, useRef, useEffect } from "react";

const CityStateLookup = ({ value, onChange, placeholder = "Search cities...", className = "", disabled = false }) => {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  const selectedCities = Array.isArray(value) ? value : (value ? value.split(",").map((s) => s.trim()).filter(Boolean) : []);

  const searchCities = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
          `format=json&q=${encodeURIComponent(query)}, USA&` +
          `addressdetails=1&limit=8&countrycodes=us`,
        { headers: { "User-Agent": "HappyNeighbor/1.0" } }
      );
      if (res.ok) {
        const data = await res.json();
        const seen = new Set();
        const formatted = data
          .filter((item) => {
            const addr = item.address || {};
            const city = addr.city || addr.town || addr.village || addr.municipality;
            const state = addr.state;
            if (!city || !state) return false;
            const key = `${city}|${state}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .map((item) => {
            const addr = item.address || {};
            const city = addr.city || addr.town || addr.village || addr.municipality;
            const state = addr.state || "";
            return `${city}, ${state}`;
          });
        setSuggestions(formatted);
        setShowSuggestions(formatted.length > 0);
        setSelectedIndex(-1);
      }
    } catch (err) {
      console.error("City search error:", err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchCities(input), 300);
    return () => clearTimeout(debounceRef.current);
  }, [input]);

  const addCity = (cityState) => {
    if (selectedCities.includes(cityState)) return;
    const next = [...selectedCities, cityState];
    onChange(next);
    setInput("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const removeCity = (cityState) => {
    const next = selectedCities.filter((c) => c !== cityState);
    onChange(next);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && suggestions.length > 0 && selectedIndex >= 0 && selectedIndex < suggestions.length) {
      e.preventDefault();
      addCity(suggestions[selectedIndex]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => (i < suggestions.length - 1 ? i + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => (i > 0 ? i - 1 : suggestions.length - 1));
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 p-2 border-2 border-gray-200 rounded-xl bg-white min-h-[48px] focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500">
        {selectedCities.map((c) => (
          <span
            key={c}
            className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-lg text-sm font-medium"
          >
            {c}
            <button
              type="button"
              onClick={() => removeCity(c)}
              className="hover:text-orange-600 ml-0.5"
              aria-label={`Remove ${c}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedCities.length === 0 ? placeholder : "Add another city..."}
          disabled={disabled}
          className={`flex-1 min-w-[120px] outline-none bg-transparent text-gray-800 placeholder-gray-400 ${className}`}
        />
      </div>
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-auto">
          {suggestions.map((s, i) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => addCity(s)}
                className={`w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors ${
                  i === selectedIndex ? "bg-orange-50" : ""
                } ${selectedCities.includes(s) ? "text-gray-400" : ""}`}
              >
                {s} {selectedCities.includes(s) && "✓"}
              </button>
            </li>
          ))}
        </ul>
      )}
      {loading && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default CityStateLookup;
