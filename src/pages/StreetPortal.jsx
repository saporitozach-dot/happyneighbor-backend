import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const API_URL = import.meta.env.VITE_API_URL || "https://happyneighbor-api-production.up.railway.app/api";

const StreetPortal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [street, setStreet] = useState(null);
  const [vibeData, setVibeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStreetData();
  }, [id]);

  const fetchStreetData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/streets/${id}/vibe`);
      
      if (!response.ok) {
        throw new Error('Street not found');
      }
      
      const data = await response.json();
      setStreet(data.street);
      setVibeData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get the most common value from a vibe category
  const getTopVibe = (vibeCategory) => {
    if (!vibeCategory || Object.keys(vibeCategory).length === 0) return null;
    const sorted = Object.entries(vibeCategory).sort((a, b) => b[1] - a[1]);
    return { value: sorted[0][0], count: sorted[0][1], total: Object.values(vibeCategory).reduce((a, b) => a + b, 0) };
  };

  // Calculate percentage for bar visualization
  const getPercentage = (count, total) => {
    if (!total) return 0;
    return Math.round((count / total) * 100);
  };

  // Render vibe breakdown as horizontal bars
  const renderVibeBreakdown = (label, emoji, vibeCategory, colorClass = "bg-orange-500") => {
    if (!vibeCategory || Object.keys(vibeCategory).length === 0) {
      return (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <span>{emoji}</span>
            <span className="font-medium text-gray-700">{label}</span>
          </div>
          <p className="text-sm text-gray-400 italic">No data yet</p>
        </div>
      );
    }

    const total = Object.values(vibeCategory).reduce((a, b) => a + b, 0);
    const sorted = Object.entries(vibeCategory).sort((a, b) => b[1] - a[1]);

    return (
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{emoji}</span>
          <span className="font-semibold text-gray-800">{label}</span>
        </div>
        <div className="space-y-2">
          {sorted.map(([value, count]) => (
            <div key={value} className="flex items-center gap-3">
              <div className="w-24 text-xs text-gray-600 truncate" title={value}>{value}</div>
              <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                <div 
                  className={`h-full ${colorClass} rounded-full transition-all duration-500`}
                  style={{ width: `${getPercentage(count, total)}%` }}
                />
              </div>
              <div className="w-12 text-xs text-gray-500 text-right">
                {getPercentage(count, total)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading street data...</p>
        </div>
      </div>
    );
  }

  if (error || !street) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🏠</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Street Not Found</h1>
          <p className="text-gray-600 mb-6">
            This street doesn't exist in our database yet. Be the first to add it!
          </p>
          <Link
            to="/submit"
            className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Share Your Street
          </Link>
        </div>
      </div>
    );
  }

  const hasData = street.survey_count > 0;

  return (
    <>
      <Helmet>
        <title>{street.name}, {street.city} - Street Vibes | Happy Neighbor</title>
        <meta name="description" content={`See what residents say about living on ${street.name} in ${street.city}, ${street.state}`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                  Happy Neighbor
                </span>
              </Link>
              <div className="flex items-center gap-4">
                <Link to={`/community/${id}`} className="text-orange-600 hover:text-orange-700 transition-colors font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Community Hub
                </Link>
                <Link to="/submit" className="text-gray-600 hover:text-orange-600 transition-colors font-medium">
                  Share Your Street
                </Link>
                <Link to="/" className="text-gray-600 hover:text-orange-600 transition-colors font-medium">
                  Home
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-orange-100 mb-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span className="text-sm font-medium">{street.city}, {street.state}</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-3">{street.name}</h1>
                {street.neighborhood_name && (
                  <p className="text-orange-100 text-lg">
                    {street.neighborhood_name} neighborhood
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-3">
                  <div className="text-3xl font-bold">{street.survey_count}</div>
                  <div className="text-sm text-orange-100">
                    {street.survey_count === 1 ? 'Resident Review' : 'Resident Reviews'}
                  </div>
                </div>
              </div>
            </div>

            {street.vibe_summary && (
              <div className="mt-6 flex flex-wrap gap-2">
                {street.vibe_summary.split(' • ').map((vibe, i) => (
                  <span key={i} className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-sm font-medium">
                    {vibe}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {!hasData ? (
            /* No Data State */
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-xl mx-auto">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Be the First to Review This Street!
              </h2>
              <p className="text-gray-600 mb-6">
                No one has shared their experience living on {street.name} yet. 
                Help future neighbors by being the first to add a review!
              </p>
              <Link
                to="/submit"
                className="inline-block px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105"
              >
                Share Your Experience
              </Link>
            </div>
          ) : (
            /* Has Data */
            <div className="space-y-8">
              {/* Vibe Overview */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span>🏘️</span> Street Vibes
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {renderVibeBreakdown("Noise Level", "🔊", vibeData?.vibe?.noise_level, "bg-blue-500")}
                  {renderVibeBreakdown("Neighbor Sociability", "👋", vibeData?.vibe?.sociability, "bg-green-500")}
                  {renderVibeBreakdown("Community Events", "🎉", vibeData?.vibe?.events, "bg-purple-500")}
                  {renderVibeBreakdown("Family Friendliness", "👨‍👩‍👧‍👦", vibeData?.vibe?.kids_friendly, "bg-pink-500")}
                  {renderVibeBreakdown("Walkability", "🚶", vibeData?.vibe?.walkability, "bg-teal-500")}
                  {renderVibeBreakdown("Cookouts & BBQs", "🍖", vibeData?.vibe?.cookouts, "bg-red-500")}
                </div>
              </div>

              {/* Recent Notes */}
              {vibeData?.recentNotes && vibeData.recentNotes.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span>💬</span> What Residents Say
                  </h2>
                  <div className="space-y-4">
                    {vibeData.recentNotes.map((note, i) => (
                      <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                        <p className="text-gray-700 italic">"{note.note}"</p>
                        <p className="text-xs text-gray-400 mt-2">
                          — A verified resident
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl p-8 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Live on {street.name}?
                </h3>
                <p className="text-gray-600 mb-4">
                  Add your perspective to help others learn about this street
                </p>
                <Link
                  to="/submit"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Share Your Experience
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-500 text-sm">
                © 2024 Happy Neighbor. Data based on {street.survey_count} verified resident{street.survey_count !== 1 && 's'}.
              </p>
              <div className="flex gap-6 text-sm">
                <Link to="/privacy" className="text-gray-500 hover:text-orange-600">Privacy</Link>
                <Link to="/terms" className="text-gray-500 hover:text-orange-600">Terms</Link>
                <Link to="/about" className="text-gray-500 hover:text-orange-600">About</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default StreetPortal;

