import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import { API_URL } from "../utils/apiConfig";

const Compare = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [savedStreets, setSavedStreets] = useState([]);
  const [selectedStreets, setSelectedStreets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedStreets();
  }, []);

  const fetchSavedStreets = async () => {
    try {
      if (isAuthenticated) {
        const response = await fetch(`${API_URL}/user/saved-streets`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setSavedStreets(data);
        }
      } else {
        // Get from localStorage
        const savedIds = JSON.parse(localStorage.getItem('savedStreets') || '[]');
        if (savedIds.length > 0) {
          // Fetch street details
          const streets = await Promise.all(
            savedIds.map(async (id) => {
              const res = await fetch(`${API_URL}/streets/${id}/vibe`);
              if (res.ok) {
                const data = await res.json();
                return { ...data.street, survey_count: data.street.survey_count || 0 };
              }
              return null;
            })
          );
          setSavedStreets(streets.filter(s => s !== null));
        }
      }
    } catch (error) {
      console.error('Error fetching saved streets:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (streetId) => {
    setSelectedStreets(prev =>
      prev.includes(streetId)
        ? prev.filter(id => id !== streetId)
        : [...prev, streetId]
    );
  };

  const compareSelected = () => {
    if (selectedStreets.length < 2) {
      alert('Please select at least 2 streets to compare');
      return;
    }
    navigate(`/compare/${selectedStreets.join(',')}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading saved streets...</p>
        </div>
      </div>
    );
  }

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
            <Link to="/results" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
              Back to Results
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Compare Streets</h1>

        {savedStreets.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Saved Streets Yet</h2>
            <p className="text-gray-600 mb-6">
              Save streets from your results to compare them side by side.
            </p>
            <Link
              to="/results"
              className="inline-block px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              View Your Matches
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                Select 2 or more streets to compare ({selectedStreets.length} selected)
              </p>
              <button
                onClick={compareSelected}
                disabled={selectedStreets.length < 2}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  selectedStreets.length >= 2
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Compare Selected
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {savedStreets.map((street) => (
                <div
                  key={street.id}
                  className={`bg-white rounded-2xl shadow-lg p-6 border-2 transition-all cursor-pointer ${
                    selectedStreets.includes(street.id)
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                  onClick={() => toggleSelection(street.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{street.name}</h3>
                      <p className="text-gray-600">{street.city}, {street.state}</p>
                      {street.neighborhood_name && (
                        <p className="text-sm text-gray-500 mt-1">In {street.neighborhood_name}</p>
                      )}
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedStreets.includes(street.id)
                        ? 'border-orange-500 bg-orange-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedStreets.includes(street.id) && (
                        <span className="text-white text-sm">✓</span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {street.survey_count || 0} {street.survey_count === 1 ? 'review' : 'reviews'}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Compare;


