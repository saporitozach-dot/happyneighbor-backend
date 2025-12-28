import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import LocationDisplay from "../components/LocationDisplay";

const API_URL = import.meta.env.VITE_API_URL || "https://happyneighbor-api-production.up.railway.app/api";

const Results = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      // Get preferences from localStorage
      const preferencesStr = localStorage.getItem('userPreferences');
      if (!preferencesStr) {
        // No preferences found, redirect to survey
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
      setMatches(data);
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError('Failed to load matches. Make sure the backend server is running on port 3001.');
    } finally {
      setLoading(false);
    }
  };

  const getTags = (neighborhood) => {
    const tags = [];
    if (neighborhood.kids_friendly && neighborhood.kids_friendly !== 'Not Important') {
      tags.push('Family-Friendly');
    }
    if (neighborhood.noise_level && ['Very Quiet', 'Quiet'].includes(neighborhood.noise_level)) {
      tags.push('Quiet');
    }
    if (neighborhood.walkability && ['Walkable', 'Very Walkable'].includes(neighborhood.walkability)) {
      tags.push('Walkable');
    }
    if (neighborhood.events && ['Regular', 'Very Active'].includes(neighborhood.events)) {
      tags.push('Active Events');
    }
    if (neighborhood.cookouts && ['Regular', 'Love Them'].includes(neighborhood.cookouts)) {
      tags.push('Cookouts');
    }
    if (neighborhood.nightlife && ['Active', 'Very Active'].includes(neighborhood.nightlife)) {
      tags.push('Nightlife');
    }
    if (neighborhood.sociability && ['Social', 'Very Social'].includes(neighborhood.sociability)) {
      tags.push('Social');
    }
    return tags;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Finding your perfect matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                  Happy Neighbor
                </span>
              </Link>
              <Link to="/survey" className="text-gray-600 hover:text-orange-600 transition-colors font-medium">
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
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                Happy Neighbor
              </span>
            </Link>
            <Link to="/survey" className="text-gray-600 hover:text-orange-600 transition-colors font-medium">
              Take Survey Again
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Your Neighborhood Matches
          </h1>
          <p className="text-xl text-gray-600">
            Based on your preferences, here are the best matches for you
          </p>
        </div>

        {matches.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">
              No matches found. Try adjusting your preferences or add more neighborhoods in the admin panel.
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
            {/* Location Display */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Matches by Location</h2>
              <LocationDisplay 
                neighborhoods={matches} 
                onLocationClick={(neighborhood) => {
                  // Scroll to that neighborhood card
                  const element = document.getElementById(`neighborhood-${neighborhood.id}`);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
              />
            </div>

            <div className="space-y-6">
              {matches.map((match) => {
                const tags = getTags(match);
                return (
                  <div
                    id={`neighborhood-${match.id}`}
                    key={match.id}
                    className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all border border-gray-100"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <h2 className="text-3xl font-bold text-gray-900">{match.name}</h2>
                          <div className="px-4 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full font-bold text-lg">
                            {match.matchScore}% Match
                          </div>
                        </div>
                        {match.description && (
                          <p className="text-gray-600 mb-4">{match.description}</p>
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
                      <div className="mt-4 md:mt-0 md:ml-6">
                        <p className="text-gray-500 mb-2">{match.location}</p>
                        <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

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
