import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Helmet } from 'react-helmet-async';

import { API_URL } from "../utils/apiConfig";

const Profile = () => {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [profileData, setProfileData] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [connections, setConnections] = useState([]);
  const [editingNeighborhood, setEditingNeighborhood] = useState(false);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isAuthenticated) {
      fetchProfile();
      fetchNeighborhoods();
      fetchConnections();
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    const loginSuccess = searchParams.get('login');
    if (loginSuccess === 'success') {
      // Refresh auth state after successful login
      setTimeout(() => {
        window.location.href = '/profile';
      }, 500);
    }
  }, [searchParams]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/user/profile`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
        setPreferences(data.preferences);
        setSelectedNeighborhood(data.neighborhood_id || null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchNeighborhoods = async () => {
    try {
      const response = await fetch(`${API_URL}/neighborhoods`);
      if (response.ok) {
        const data = await response.json();
        setNeighborhoods(data);
      }
    } catch (error) {
      console.error('Error fetching neighborhoods:', error);
    }
  };

  const fetchConnections = async () => {
    try {
      const response = await fetch(`${API_URL}/user/connections`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setConnections(data.connections || []);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const handleNeighborhoodUpdate = async () => {
    try {
      const selected = neighborhoods.find(n => n.id === parseInt(selectedNeighborhood));
      const response = await fetch(`${API_URL}/user/neighborhood`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          neighborhood_id: selectedNeighborhood ? parseInt(selectedNeighborhood) : null,
          neighborhood_name: selected ? selected.name : null,
        }),
      });

      if (response.ok) {
        setEditingNeighborhood(false);
        fetchProfile();
        fetchConnections(); // Refresh connections
      }
    } catch (error) {
      console.error('Error updating neighborhood:', error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-purple-50">
      <Helmet>
        <title>My Profile - Happy Neighbor</title>
        <meta name="description" content="View your profile and neighborhood preferences" />
      </Helmet>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              Happy Neighbor
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/survey"
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Find Matches
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Message */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-6">
            {profileData?.profile_picture && (
              <img
                src={profileData.profile_picture}
                alt={profileData.full_name || 'Profile'}
                className="w-24 h-24 rounded-full border-4 border-orange-100"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome, {profileData?.first_name || profileData?.full_name || 'User'}!
              </h1>
              {profileData?.headline && (
                <p className="text-gray-600 text-lg">{profileData.headline}</p>
              )}
              {profileData?.location && (
                <p className="text-gray-500 mt-1">{profileData.location}</p>
              )}
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <p className="text-gray-900">{profileData?.email || 'Not provided'}</p>
            </div>
            {(profileData?.verified_address || profileData?.verified_street_id) && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Community Hub Address</label>
                <p className="text-gray-900">{profileData.verified_address || 'Verified resident'}</p>
                <Link to={`/community/${profileData.verified_street_id}`} className="text-orange-600 hover:underline text-sm mt-1 inline-block">
                  Open Community Hub →
                </Link>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <p className="text-gray-900">{profileData?.full_name || 'Not provided'}</p>
            </div>
            {profileData?.job_title && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Job Title</label>
                <p className="text-gray-900">{profileData.job_title}</p>
              </div>
            )}
            {profileData?.company && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Company</label>
                <p className="text-gray-900">{profileData.company}</p>
              </div>
            )}
            {profileData?.industry && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Industry</label>
                <p className="text-gray-900">{profileData.industry}</p>
              </div>
            )}
            {profileData?.created_at && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Member Since</label>
                <p className="text-gray-900">
                  {new Date(profileData.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
            {profileData?.last_login && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Last Login</label>
                <p className="text-gray-900">
                  {new Date(profileData.last_login).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>
          {profileData?.profile_url && (
            <div className="mt-6">
              <a
                href={profileData.profile_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                View LinkedIn Profile
              </a>
            </div>
          )}
        </div>

        {/* My Neighborhood */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Neighborhood</h2>
            {!editingNeighborhood && (
              <button
                onClick={() => setEditingNeighborhood(true)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
              >
                {profileData?.neighborhood_name ? 'Change' : 'Set'} Neighborhood
              </button>
            )}
          </div>
          
          {editingNeighborhood ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Your Neighborhood
                </label>
                <select
                  value={selectedNeighborhood || ''}
                  onChange={(e) => setSelectedNeighborhood(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">-- Select a neighborhood --</option>
                  {neighborhoods.map((neighborhood) => (
                    <option key={neighborhood.id} value={neighborhood.id}>
                      {neighborhood.name} - {neighborhood.location}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleNeighborhoodUpdate}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingNeighborhood(false);
                    setSelectedNeighborhood(profileData?.neighborhood_id || null);
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              {profileData?.neighborhood_name ? (
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-xl font-semibold text-gray-900">
                    {profileData.neighborhood_name}
                  </p>
                  {profileData.neighborhood?.location && (
                    <p className="text-gray-600 mt-1">{profileData.neighborhood.location}</p>
                  )}
                  {connections.length > 0 && connections.filter(c => c.neighborhood_id === profileData.neighborhood_id).length > 0 && (
                    <p className="text-orange-600 mt-2 text-sm">
                      {connections.filter(c => c.neighborhood_id === profileData.neighborhood_id).length} connection{connections.filter(c => c.neighborhood_id === profileData.neighborhood_id).length !== 1 ? 's' : ''} in this neighborhood
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">You haven't set your neighborhood yet.</p>
                  <button
                    onClick={() => setEditingNeighborhood(true)}
                    className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
                  >
                    Set Your Neighborhood
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Connections in Same Neighborhood */}
        {profileData?.neighborhood_id && connections.filter(c => c.neighborhood_id === profileData.neighborhood_id).length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Connections in {profileData.neighborhood_name}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {connections
                .filter(c => c.neighborhood_id === profileData.neighborhood_id)
                .map((connection) => (
                  <div
                    key={connection.id}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      {connection.profile_picture && (
                        <img
                          src={connection.profile_picture}
                          alt={connection.full_name}
                          className="w-16 h-16 rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{connection.full_name}</p>
                        {connection.headline && (
                          <p className="text-sm text-gray-600">{connection.headline}</p>
                        )}
                        {connection.company && (
                          <p className="text-sm text-gray-500">{connection.company}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Saved Streets (Home seeker) - cap at 3 for free */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Saved Streets</h2>
            <span className="text-sm text-gray-500">
              {profileData?.savedCount ?? 0} / {profileData?.savedLimit ?? 3} saved
            </span>
          </div>
          {profileData?.savedStreets?.length > 0 ? (
            <div className="space-y-4">
              {profileData.savedStreets.map((street) => (
                <div
                  key={street.id}
                  className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100"
                >
                  <div>
                    <Link to={`/street/${street.id}`} className="font-semibold text-gray-900 hover:text-orange-600">
                      {street.name}
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">
                      {street.neighborhood_name} • {street.city}, {street.state}
                    </p>
                    {street.survey_count > 0 && (
                      <p className="text-xs text-orange-600 mt-1">{street.survey_count} verified review{street.survey_count !== 1 ? 's' : ''}</p>
                    )}
                  </div>
                  <Link
                    to={`/street/${street.id}`}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                  >
                    View
                  </Link>
                </div>
              ))}
              {!profileData?.premium_access && (profileData?.savedLimit ?? 3) <= 3 && (
                <p className="text-sm text-gray-500 italic">
                  Free accounts can save up to 3 streets. Upgrade to save more.
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No saved streets yet.</p>
              <Link
                to="/survey"
                className="inline-block px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
              >
                Find Matches & Save Streets
              </Link>
            </div>
          )}
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Neighborhood Preferences</h2>
            {preferences ? (
              <Link
                to="/survey"
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
              >
                Update Preferences
              </Link>
            ) : (
              <Link
                to="/survey"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Set Preferences
              </Link>
            )}
          </div>
          {preferences ? (
            <div className="grid md:grid-cols-2 gap-4">
              {preferences.noise && (
                <div className="p-4 bg-orange-50 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Noise Level</label>
                  <p className="text-gray-900">{preferences.noise}</p>
                </div>
              )}
              {preferences.sociability && (
                <div className="p-4 bg-orange-50 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Sociability</label>
                  <p className="text-gray-900">{preferences.sociability}</p>
                </div>
              )}
              {preferences.events && (
                <div className="p-4 bg-orange-50 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Events</label>
                  <p className="text-gray-900">{preferences.events}</p>
                </div>
              )}
              {preferences.kids && (
                <div className="p-4 bg-orange-50 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Kids Friendly</label>
                  <p className="text-gray-900">{preferences.kids}</p>
                </div>
              )}
              {preferences.walkability && (
                <div className="p-4 bg-orange-50 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Walkability</label>
                  <p className="text-gray-900">{preferences.walkability}</p>
                </div>
              )}
              {preferences.lawn_space && (
                <div className="p-4 bg-orange-50 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Lawn Space</label>
                  <p className="text-gray-900">{preferences.lawn_space}</p>
                </div>
              )}
              {preferences.nightlife && (
                <div className="p-4 bg-orange-50 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nightlife</label>
                  <p className="text-gray-900">{preferences.nightlife}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">You haven't set your neighborhood preferences yet.</p>
              <Link
                to="/survey"
                className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Take the Survey
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link
            to="/survey"
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl p-6 hover:shadow-xl transition-all"
          >
            <h3 className="text-xl font-bold mb-2">Find Matches</h3>
            <p className="text-orange-100">Take our survey to get personalized neighborhood recommendations</p>
          </Link>
          <Link
            to="/results"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-6 hover:shadow-xl transition-all"
          >
            <h3 className="text-xl font-bold mb-2">View Results</h3>
            <p className="text-purple-100">See your previous neighborhood matches</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;
