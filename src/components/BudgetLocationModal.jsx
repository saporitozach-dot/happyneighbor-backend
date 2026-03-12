import React, { useState } from "react";
import CityStateLookup from "./CityStateLookup";
import { API_URL } from "../utils/apiConfig";

const MORTGAGE_RANGES = [
  { value: "any", label: "Any budget", min: 0, max: 999999999 },
  { value: "under300", label: "Under $300k", min: 0, max: 300000 },
  { value: "300-500", label: "$300k – $500k", min: 300000, max: 500000 },
  { value: "500-750", label: "$500k – $750k", min: 500000, max: 750000 },
  { value: "750-1M", label: "$750k – $1M", min: 750000, max: 1000000 },
  { value: "1M+", label: "$1M+", min: 1000000, max: 999999999 },
];

const BudgetLocationModal = ({ onComplete, onSkip, initialBudget = "", initialLocations = "" }) => {
  const [budget, setBudget] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("userBudgetLocation") || "{}");
      return MORTGAGE_RANGES.find(r => r.label === saved.budgetLabel)?.value ?? initialBudget ?? "";
    } catch { return initialBudget || ""; }
  });
  const [cityList, setCityList] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("userBudgetLocation") || "{}");
      return (saved.preferredCities || []).map(c => {
        const parts = c.split(",").map(s => s.trim());
        return parts.length >= 2 ? `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)}, ${parts[1].toUpperCase()}` : c;
      });
    } catch { return []; }
  });
  const [showModal, setShowModal] = useState(true);
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const range = MORTGAGE_RANGES.find((r) => r.value === budget) || MORTGAGE_RANGES[0];
    const cities = cityList.map((c) => {
      const [city, state] = c.split(",").map((s) => s.trim());
      return state ? `${city.toLowerCase()}, ${state.toLowerCase()}` : city.toLowerCase();
    });
    localStorage.setItem(
      "userBudgetLocation",
      JSON.stringify({
        budgetMin: range.min,
        budgetMax: range.max,
        budgetLabel: range.label,
        preferredCities: cities,
      })
    );
    setShowModal(false);
    if (email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      fetch(`${API_URL}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), source: "refine_modal" }),
      }).catch(() => {});
    }
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem(
      "userBudgetLocation",
      JSON.stringify({
        budgetMin: 0,
        budgetMax: 999999999,
        budgetLabel: "Any budget",
        preferredCities: [],
      })
    );
    setShowModal(false);
    onSkip?.() || onComplete();
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-5 text-white">
          <h2 className="text-xl font-bold">Refine Your Search</h2>
          <p className="text-orange-100 text-sm mt-1">
            Help us show you the best matches in your price range & preferred areas
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              🏠 Mortgage / Home Budget
            </label>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-800"
            >
              <option value="">Select your budget...</option>
              {MORTGAGE_RANGES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              📍 Cities or areas you&apos;d like to be near
            </label>
            <CityStateLookup
              value={cityList}
              onChange={setCityList}
              placeholder="Type to search cities (e.g. Boston, Austin)"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              📧 Email your matches (optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-800 placeholder-gray-400"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSkip}
              className="flex-1 px-4 py-3 text-gray-600 hover:text-gray-800 font-medium rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Skip for now
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all"
            >
              Show My Matches
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetLocationModal;
export { MORTGAGE_RANGES };
