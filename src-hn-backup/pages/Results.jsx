import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Paywall from "../components/Paywall";
import SaveButton from "../components/SaveButton";
import BudgetLocationModal from "../components/BudgetLocationModal";
import ExitIntentModal from "../components/ExitIntentModal";
import { exportMatchesToPDF } from "../utils/exportPDF";

import { API_URL } from "../utils/apiConfig";

// Demo matches for prototype when backend is unavailable (with avg_home_price for budget filtering)
const getDemoMatches = () => [
  { id: 1, street_name: "Oak Avenue", name: "Oak Avenue", city: "Boston", state: "MA", location: "Boston, MA", neighborhood_name: "Riverside", type: "street", matchScore: 94, survey_count: 3, avg_home_price: 485000, avg_price_per_sqft: 385, noise_level: "Quiet", walkability: "Very Walkable", safety: "Very Safe", kids_friendly: "Very Family-Friendly", public_education: "Good", events: "Regular", lawn_space: "Large Yards", neighbor_familiarity: "Often", matchCategories: { noise: 100, walkability: 100, safety: 100, kids_friendly: 100, public_education: 80, events: 100, lawn_space: 100, neighbor_familiarity: 100 } },
  { id: 2, street_name: "Maple Lane", name: "Maple Lane", city: "Boston", state: "MA", location: "Boston, MA", neighborhood_name: "Parkview", type: "street", matchScore: 88, survey_count: 2, avg_home_price: 620000, avg_price_per_sqft: 420, noise_level: "Moderate", walkability: "Walkable", safety: "Safe", kids_friendly: "Family-Friendly", public_education: "Excellent", events: "Occasional", lawn_space: "Moderate Yards", neighbor_familiarity: "Sometimes", matchCategories: { noise: 80, walkability: 100, safety: 100, kids_friendly: 100, public_education: 100, events: 80, lawn_space: 70, neighbor_familiarity: 80 } },
  { id: 3, street_name: "Cedar Drive", name: "Cedar Drive", city: "Cambridge", state: "MA", location: "Cambridge, MA", neighborhood_name: "Hillside", type: "street", matchScore: 82, survey_count: 4, avg_home_price: 895000, avg_price_per_sqft: 680, noise_level: "Quiet", walkability: "Very Walkable", safety: "Safe", kids_friendly: "Some Families", public_education: "Excellent", events: "Very Active", lawn_space: "Moderate Yards", neighbor_familiarity: "Often", matchCategories: { noise: 100, walkability: 100, safety: 100, kids_friendly: 70, public_education: 100, events: 100, lawn_space: 80, neighbor_familiarity: 100 } },
  { id: 4, street_name: "Pine Street", name: "Pine Street", city: "Somerville", state: "MA", location: "Somerville, MA", neighborhood_name: "Downtown", type: "street", matchScore: 76, survey_count: 2, avg_home_price: 720000, avg_price_per_sqft: 520, noise_level: "Lively", walkability: "Very Walkable", safety: "Safe", kids_friendly: "Some Families", public_education: "Average", events: "Very Active", lawn_space: "Small Yards", neighbor_familiarity: "Often", matchCategories: { noise: 60, walkability: 100, safety: 100, kids_friendly: 70, public_education: 70, events: 100, lawn_space: 40, neighbor_familiarity: 100 } },
  { id: 5, street_name: "Elm Court", name: "Elm Court", city: "Brookline", state: "MA", location: "Brookline, MA", neighborhood_name: "Greenwood", type: "street", matchScore: 71, survey_count: 1, avg_home_price: 1150000, avg_price_per_sqft: 720, noise_level: "Very Quiet", walkability: "Walkable", safety: "Very Safe", kids_friendly: "Very Family-Friendly", public_education: "Excellent", events: "Occasional", lawn_space: "Very Large Yards", neighbor_familiarity: "Sometimes", matchCategories: { noise: 100, walkability: 80, safety: 100, kids_friendly: 100, public_education: 100, events: 80, lawn_space: 100, neighbor_familiarity: 80 } },
];

// Apply budget + location filters to matches
const applyBudgetLocationFilters = (matches, budgetLocation) => {
  if (!budgetLocation) return matches;
  let filtered = matches;
  const { budgetMin, budgetMax, preferredCities } = budgetLocation;
  if (budgetMin !== undefined && budgetMax !== undefined && (budgetMin > 0 || budgetMax < 999999999)) {
    filtered = filtered.filter((m) => {
      const price = m.avg_home_price || 0;
      return price >= budgetMin && price <= budgetMax;
    });
  }
  if (preferredCities && preferredCities.length > 0) {
    filtered = filtered.filter((m) =>
      preferredCities.some((c) => {
        const cityPart = (c.split(",")[0] || "").trim().toLowerCase();
        return cityPart && (m.city || "").toLowerCase().includes(cityPart);
      })
    );
  }
  return filtered;
};

const Results = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [matches, setMatches] = useState([]);
  const [allMatches, setAllMatches] = useState([]);
  const [rawMatches, setRawMatches] = useState([]); // Unfiltered matches for re-refining
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unlocked, setUnlocked] = useState(false);
  const [premiumAccess, setPremiumAccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ city: "", state: "", minMatchScore: "", minReviews: "" });
  const [demoMode, setDemoMode] = useState(false);
  const [refinedBy, setRefinedBy] = useState(null);
  const [filteredToNone, setFilteredToNone] = useState(false);
  const [showRefineModal, setShowRefineModal] = useState(false);

  useEffect(() => {
    checkPremiumStatus();
    fetchMatches();
  }, []);

  const checkPremiumStatus = async () => {
    // Check API if authenticated
    if (isAuthenticated) {
      try {
        const response = await fetch(`${API_URL}/user/premium-status`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          if (data.premiumAccess) {
            setPremiumAccess(true);
            setUnlocked(true);
            return;
          }
        }
      } catch (err) {
        console.error('Error checking premium status:', err);
      }
    }

    // For anonymous users, verify payment intent ID with backend
    const paymentIntentId = localStorage.getItem('premiumPaymentIntentId');
    const localPremium = localStorage.getItem('premiumAccess') === 'true';
    
    if (localPremium && paymentIntentId) {
      // Verify with backend to ensure it's still valid
      try {
        const response = await fetch(`${API_URL}/premium/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.premiumAccess && data.isValid) {
            setPremiumAccess(true);
            setUnlocked(true);
            // Update expiration date if provided
            if (data.expiresAt) {
              localStorage.setItem('premiumExpiresAt', data.expiresAt);
            }
            return;
          } else {
            // Premium expired or invalid, clear it
            localStorage.removeItem('premiumAccess');
            localStorage.removeItem('premiumPaymentIntentId');
            localStorage.removeItem('premiumExpiresAt');
            localStorage.removeItem('premiumUnlockedAt');
          }
        }
      } catch (err) {
        console.error('Error verifying premium:', err);
        // Fallback to local check if backend is unavailable
        const expiresAtStr = localStorage.getItem('premiumExpiresAt');
        if (expiresAtStr) {
          const expiresAt = new Date(expiresAtStr);
          if (expiresAt > new Date()) {
            setPremiumAccess(true);
            setUnlocked(true);
            return;
          }
        }
      }
    } else if (localPremium) {
      // Legacy: check local expiration only
      const expiresAtStr = localStorage.getItem('premiumExpiresAt');
      if (expiresAtStr) {
        const expiresAt = new Date(expiresAtStr);
        if (expiresAt > new Date()) {
          setPremiumAccess(true);
          setUnlocked(true);
          return;
        } else {
          // Expired, clear it
          localStorage.removeItem('premiumAccess');
          localStorage.removeItem('premiumExpiresAt');
          localStorage.removeItem('premiumUnlockedAt');
        }
      }
    }
  };

  const fetchMatches = async () => {
    try {
      // Get preferences from localStorage or account
      let preferencesStr = localStorage.getItem('userPreferences');
      
      // If authenticated, try to get from account
      if (isAuthenticated && !preferencesStr) {
        try {
          const prefResponse = await fetch(`${API_URL}/user/preferences`, {
            credentials: 'include',
          });
          if (prefResponse.ok) {
            const prefData = await prefResponse.json();
            if (prefData && Object.keys(prefData).length > 0) {
              preferencesStr = JSON.stringify({
                noise: prefData.noise,
                walkability: prefData.walkability,
                safety: prefData.safety,
                kids_friendly: prefData.kids,
                public_education: prefData.public_education,
                events: prefData.events,
                lawn_space: prefData.lawn_space,
                neighbor_familiarity: prefData.neighbor_familiarity,
              });
            }
          }
        } catch (err) {
          console.error('Error fetching preferences:', err);
        }
      }

      if (!preferencesStr) {
        navigate('/survey');
        return;
      }

      const preferences = JSON.parse(preferencesStr);
      
      // Fetch matches from backend
      const response = await fetch(`${API_URL}/matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }

      const data = await response.json();
      const budgetLoc = JSON.parse(localStorage.getItem("userBudgetLocation") || "null");
      setRawMatches(data);
      const filtered = applyBudgetLocationFilters(data, budgetLoc);
      const final = filtered.length > 0 ? filtered : data;
      setAllMatches(final);
      setMatches(final);
      setFilteredToNone(filtered.length === 0 && data.length > 0 && budgetLoc && (budgetLoc.budgetLabel !== "Any budget" || (budgetLoc.preferredCities || []).length > 0));
      if (budgetLoc && (budgetLoc.budgetLabel !== "Any budget" || (budgetLoc.preferredCities || []).length > 0)) {
        setRefinedBy(budgetLoc);
      }
    } catch (err) {
      console.error('Error fetching matches:', err);
      // Prototype demo mode: show sample matches when backend is unavailable
      setDemoMode(true);
      const demo = getDemoMatches();
      const budgetLoc = JSON.parse(localStorage.getItem("userBudgetLocation") || "null");
      setRawMatches(demo);
      const filtered = applyBudgetLocationFilters(demo, budgetLoc);
      const final = filtered.length > 0 ? filtered : demo;
      setAllMatches(final);
      setMatches(final);
      setFilteredToNone(filtered.length === 0 && budgetLoc && (budgetLoc.budgetLabel !== "Any budget" || (budgetLoc.preferredCities || []).length > 0));
      if (budgetLoc && (budgetLoc.budgetLabel !== "Any budget" || (budgetLoc.preferredCities || []).length > 0)) {
        setRefinedBy(budgetLoc);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefineComplete = () => {
    setShowRefineModal(false);
    const budgetLoc = JSON.parse(localStorage.getItem("userBudgetLocation") || "null");
    const raw = rawMatches.length > 0 ? rawMatches : (demoMode ? getDemoMatches() : allMatches);
    const filtered = applyBudgetLocationFilters(raw, budgetLoc);
    const final = filtered.length > 0 ? filtered : raw;
    setAllMatches(final);
    setMatches(final);
    setFilteredToNone(filtered.length === 0 && budgetLoc && (budgetLoc.budgetLabel !== "Any budget" || (budgetLoc.preferredCities || []).length > 0));
    if (budgetLoc && (budgetLoc.budgetLabel !== "Any budget" || (budgetLoc.preferredCities || []).length > 0)) {
      setRefinedBy(budgetLoc);
    } else {
      setRefinedBy(null);
    }
  };

  const handleSearch = async () => {
    if (!premiumAccess && !unlocked) {
      return; // Search only for premium users
    }

    try {
      const preferencesStr = localStorage.getItem('userPreferences');
      const preferences = preferencesStr ? JSON.parse(preferencesStr) : {};

      const response = await fetch(`${API_URL}/streets/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Premium-Access': premiumAccess || unlocked ? 'true' : 'false',
        },
        credentials: 'include',
        body: JSON.stringify({
          query: searchQuery,
          filters: filters,
          preferences: preferences,
        }),
      });

      if (response.status === 403) {
        // Premium required
        return;
      }

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      
      // Apply client-side filters
      let filtered = data;
      if (filters.minMatchScore) {
        filtered = filtered.filter(m => m.matchScore >= parseInt(filters.minMatchScore));
      }
      if (filters.minReviews) {
        filtered = filtered.filter(m => (m.survey_count || 0) >= parseInt(filters.minReviews));
      }
      
      setMatches(filtered);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const getTags = (street) => {
    const tags = [];
    if (street.kids_friendly && street.kids_friendly !== 'Not Family-Friendly') {
      tags.push('Family-Friendly');
    }
    if (street.noise_level && ['Very Quiet', 'Quiet'].includes(street.noise_level)) {
      tags.push('Quiet');
    }
    if (street.walkability && ['Walkable', 'Very Walkable'].includes(street.walkability)) {
      tags.push('Walkable');
    }
    if (street.safety && ['Safe', 'Very Safe'].includes(street.safety)) {
      tags.push('Safe');
    }
    if (street.events && ['Regular', 'Very Active'].includes(street.events)) {
      tags.push('Active Events');
    }
    if (street.lawn_space && ['Important', 'Very Important'].includes(street.lawn_space)) {
      tags.push('Large Yards');
    }
    if (street.neighbor_familiarity && ['Sometimes', 'Often'].includes(street.neighbor_familiarity)) {
      tags.push('Close-Knit');
    }
    return tags;
  };

  const handleUnlock = () => {
    setUnlocked(true);
    setPremiumAccess(true);
    // Note: Actual premium access is set by Paywall component after payment
    // This is just for UI state update
  };

  // Show only top 3 if not unlocked
  const visibleMatches = unlocked ? matches : matches.slice(0, 3);
  const remainingMatches = unlocked ? 0 : Math.max(0, matches.length - 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Finding your perfect street matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <nav className="sticky top-0 z-50 bg-white shadow-sm">
          <div className="px-6 sm:px-10">
            <div className="flex justify-between items-center h-14">
              <Link to="/" className="flex items-center gap-2">
                <img src="/images/logo.png" alt="Happy Neighbor" className="h-8 w-auto" />
                <span className="text-lg font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent tracking-tight">
                  Happy Neighbor
                </span>
              </Link>
              <Link to="/survey" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
                Take Survey Again
              </Link>
            </div>
          </div>
        </nav>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
            <p className="text-red-700 text-lg mb-4">{error}</p>
            <p className="text-gray-600 mb-4">To start the backend server, run: <code className="bg-gray-100 px-2 py-1 rounded">npm run dev:server</code></p>
            <Link
              to="/survey"
              className="inline-block px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Go Back to Survey
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <ExitIntentModal hasMatches={matches.length > 0} />
      {showRefineModal && (
        <BudgetLocationModal
          onComplete={handleRefineComplete}
          onSkip={handleRefineComplete}
        />
      )}
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="px-6 sm:px-10">
          <div className="flex justify-between items-center h-14">
            <Link to="/" className="flex items-center gap-2">
              <img src="/images/logo.png" alt="Happy Neighbor" className="h-8 w-auto" />
              <span className="text-lg font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent tracking-tight">
                Happy Neighbor
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowRefineModal(true)}
                className="text-gray-600 hover:text-orange-600 transition-colors text-sm font-medium"
              >
                Refine budget & location
              </button>
              <Link to="/survey" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
                Take Survey Again
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          {demoMode && (
            <div className="inline-block px-4 py-2 bg-amber-100 border border-amber-300 rounded-lg text-amber-800 text-sm mb-4">
              Demo mode — showing sample matches (backend not running)
            </div>
          )}
          {filteredToNone && (
            <div className="inline-block px-4 py-2 bg-amber-100 border border-amber-300 rounded-lg text-amber-800 text-sm mb-4">
              No matches in your budget/location. Showing all matches.
            </div>
          )}
          {refinedBy && !filteredToNone && (
            <div className="inline-block px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg text-orange-800 text-sm mb-4">
              Refined by: {[
                refinedBy.budgetLabel !== "Any budget" && refinedBy.budgetLabel,
                refinedBy.preferredCities?.length > 0 && refinedBy.preferredCities.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(", "),
              ].filter(Boolean).join(" • ")}
            </div>
          )}
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Your Street Matches
          </h1>
          <p className="text-xl text-gray-600">
            Based on your preferences, here are the best street matches for you
          </p>
        </div>

        {/* Search & Filter (Premium Only) */}
        {premiumAccess && unlocked && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🔍 Search & Filter Streets</h2>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="Search streets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <input
                type="text"
                placeholder="City"
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <input
                type="text"
                placeholder="State (e.g., MA)"
                value={filters.state}
                onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <input
                type="number"
                placeholder="Min Match Score (%)"
                value={filters.minMatchScore}
                onChange={(e) => setFilters({ ...filters, minMatchScore: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                min="0"
                max="100"
              />
              <input
                type="number"
                placeholder="Min Reviews"
                value={filters.minReviews}
                onChange={(e) => setFilters({ ...filters, minReviews: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                min="0"
              />
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Search
              </button>
            </div>
            {(searchQuery || filters.city || filters.state || filters.minMatchScore || filters.minReviews) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilters({ city: "", state: "", minMatchScore: "", minReviews: "" });
                  setMatches(allMatches);
                }}
                className="text-orange-600 hover:text-orange-700 text-sm font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {matches.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">
              No matches found. Try adjusting your preferences or add more streets in the admin panel.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/survey"
                className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Retake Survey
              </Link>
              <Link
                to="/admin"
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                Admin Panel
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-6 mb-8">
              {visibleMatches.map((match) => {
                const tags = getTags(match);
                return (
                  <div
                    id={`street-${match.id}`}
                    key={match.id}
                    className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all border border-gray-100"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <h2 className="text-3xl font-bold text-gray-900">{match.street_name || match.name}</h2>
                          <div className="px-4 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-bold text-lg">
                            {match.matchScore}% Match
                          </div>
                        </div>
                        <p className="text-gray-600 mb-2">{match.location}</p>
                        {match.neighborhood_name && (
                          <p className="text-sm text-gray-500 mb-2">In {match.neighborhood_name} neighborhood</p>
                        )}
                        {/* Category Breakdown */}
                        {match.matchCategories && (
                          <div className="mt-4 mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Match Breakdown</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {Object.entries(match.matchCategories).map(([category, score]) => {
                                if (score === null) return null;
                                const categoryLabels = {
                                  noise: '🔊 Noise',
                                  walkability: '🚶 Walkability',
                                  safety: '🛡️ Safety',
                                  kids_friendly: '👨‍👩‍👧‍👦 Family',
                                  public_education: '🎓 Schools',
                                  events: '🎉 Events',
                                  lawn_space: '🌱 Lawn Space',
                                  neighbor_familiarity: '👋 Know Names'
                                };
                                return (
                                  <div key={category} className="flex items-center justify-between p-2 bg-white rounded-lg">
                                    <span className="text-xs text-gray-600">{categoryLabels[category] || category}</span>
                                    <span className={`text-xs font-bold ${
                                      score >= 80 ? 'text-green-600' : 
                                      score >= 60 ? 'text-yellow-600' : 
                                      'text-orange-600'
                                    }`}>
                                      {score}%
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        {/* Pricing Info */}
                        {(match.avg_home_price || match.avg_price_per_sqft) && (
                          <div className="flex items-center gap-4 mb-4 py-2 px-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100">
                            {match.avg_home_price && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-emerald-600">🏠</span>
                                <span className="text-sm font-semibold text-gray-800">
                                  ${match.avg_home_price.toLocaleString()}
                                </span>
                                <span className="text-xs text-gray-500">avg</span>
                              </div>
                            )}
                            {match.avg_home_price && match.avg_price_per_sqft && (
                              <span className="text-gray-300">|</span>
                            )}
                            {match.avg_price_per_sqft && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-teal-600">📐</span>
                                <span className="text-sm font-semibold text-gray-800">
                                  ${match.avg_price_per_sqft}/sqft
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {tags.map((tag, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end gap-2">
                        <div className="text-sm text-gray-500 mb-2">
                          {match.survey_count} {match.survey_count === 1 ? 'review' : 'reviews'}
                        </div>
                        <div className="flex gap-2">
                          <SaveButton streetId={match.id} />
                          <Link
                            to={`/street/${match.id}`}
                            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Paywall to unlock unlimited matches */}
            {!unlocked && matches.length > 0 && (
              <div className="my-12">
                <Paywall onUnlock={handleUnlock} remainingCount={remainingMatches} />
              </div>
            )}

            {/* Show remaining matches after unlock */}
            {unlocked && matches.length > 3 && (
              <div className="space-y-6 mb-8">
                {matches.slice(3).map((match) => {
                  const tags = getTags(match);
                  return (
                    <div
                      id={`street-${match.id}`}
                      key={match.id}
                      className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all border border-gray-100"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <h2 className="text-3xl font-bold text-gray-900">{match.street_name || match.name}</h2>
                            <div className="px-4 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-bold text-lg">
                              {match.matchScore}% Match
                            </div>
                          </div>
                          <p className="text-gray-600 mb-2">{match.location}</p>
                          {match.neighborhood_name && (
                            <p className="text-sm text-gray-500 mb-2">In {match.neighborhood_name} neighborhood</p>
                          )}
                          {/* Pricing Info */}
                          {(match.avg_home_price || match.avg_price_per_sqft) && (
                            <div className="flex items-center gap-4 mb-4 py-2 px-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100">
                              {match.avg_home_price && (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-emerald-600">🏠</span>
                                  <span className="text-sm font-semibold text-gray-800">
                                    ${match.avg_home_price.toLocaleString()}
                                  </span>
                                  <span className="text-xs text-gray-500">avg</span>
                                </div>
                              )}
                              {match.avg_home_price && match.avg_price_per_sqft && (
                                <span className="text-gray-300">|</span>
                              )}
                              {match.avg_price_per_sqft && (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-teal-600">📐</span>
                                  <span className="text-sm font-semibold text-gray-800">
                                    ${match.avg_price_per_sqft}/sqft
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                          {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {tags.map((tag, i) => (
                                <span
                                  key={i}
                                  className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end">
                          <div className="text-sm text-gray-500 mb-2">
                            {match.survey_count} {match.survey_count === 1 ? 'review' : 'reviews'}
                          </div>
                          <Link
                            to={`/street/${match.id}`}
                            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-12 text-center">
              <Link
                to="/survey"
                className="inline-block px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-orange-300 transition-all"
              >
                Refine Your Search
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Results;
