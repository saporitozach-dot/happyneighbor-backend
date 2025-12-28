import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LocationDisplay from "../components/LocationDisplay";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const Admin = () => {
  const { user, logout } = useAuth();
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [filteredNeighborhoods, setFilteredNeighborhoods] = useState([]);
  const [selectedCity, setSelectedCity] = useState('all'); // 'all', 'Boston, MA', 'St. Louis, MO'
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);
  const [surveys, setSurveys] = useState([]);
  const [showNeighborhoodForm, setShowNeighborhoodForm] = useState(false);
  const [showSurveyForm, setShowSurveyForm] = useState(false);
  const [editingSurveyId, setEditingSurveyId] = useState(null);
  
  const [neighborhoodForm, setNeighborhoodForm] = useState({
    name: "",
    location: "",
    description: "",
    school_district: "",
  });

  const [surveyForm, setSurveyForm] = useState({
    resident_name: "",
    noise_level: "",
    sociability: "",
    events: "",
    kids_friendly: "",
    walkability: "",
    cookouts: "",
    nightlife: "",
    additional_notes: "",
  });

  useEffect(() => {
    fetchNeighborhoods();
  }, []);

  useEffect(() => {
    if (selectedNeighborhood) {
      fetchSurveys(selectedNeighborhood.id);
    }
  }, [selectedNeighborhood]);

  // Filter neighborhoods by selected city
  useEffect(() => {
    if (selectedCity === 'all') {
      setFilteredNeighborhoods(neighborhoods);
    } else {
      setFilteredNeighborhoods(neighborhoods.filter(n => n.location === selectedCity));
    }
  }, [selectedCity, neighborhoods]);

  const fetchNeighborhoods = async () => {
    try {
      const response = await fetch(`${API_URL}/neighborhoods`);
      const data = await response.json();
      setNeighborhoods(data);
    } catch (error) {
      console.error("Error fetching neighborhoods:", error);
    }
  };

  const fetchSurveys = async (neighborhoodId) => {
    try {
      const response = await fetch(`${API_URL}/neighborhoods/${neighborhoodId}/surveys`);
      const data = await response.json();
      setSurveys(data);
    } catch (error) {
      console.error("Error fetching surveys:", error);
    }
  };

  const handleNeighborhoodSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/neighborhoods`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(neighborhoodForm),
      });
      resetNeighborhoodForm();
      fetchNeighborhoods();
    } catch (error) {
      console.error("Error saving neighborhood:", error);
      alert("Error saving neighborhood. Make sure the backend server is running!");
    }
  };

  const handleSurveySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSurveyId) {
        await fetch(`${API_URL}/surveys/${editingSurveyId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(surveyForm),
        });
      } else {
        await fetch(`${API_URL}/neighborhoods/${selectedNeighborhood.id}/surveys`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(surveyForm),
        });
      }
      resetSurveyForm();
      fetchSurveys(selectedNeighborhood.id);
      fetchNeighborhoods(); // Refresh to update survey counts
    } catch (error) {
      console.error("Error saving survey:", error);
      alert("Error saving survey. Make sure the backend server is running!");
    }
  };

  const handleDeleteNeighborhood = async (id) => {
    if (!window.confirm("Are you sure you want to delete this neighborhood? All surveys will be deleted too.")) return;
    
    try {
      await fetch(`${API_URL}/neighborhoods/${id}`, {
        method: "DELETE",
      });
      fetchNeighborhoods();
      if (selectedNeighborhood?.id === id) {
        setSelectedNeighborhood(null);
        setSurveys([]);
      }
    } catch (error) {
      console.error("Error deleting neighborhood:", error);
    }
  };

  const handleDeleteSurvey = async (id) => {
    if (!window.confirm("Are you sure you want to delete this survey?")) return;
    
    try {
      await fetch(`${API_URL}/surveys/${id}`, {
        method: "DELETE",
      });
      fetchSurveys(selectedNeighborhood.id);
      fetchNeighborhoods();
    } catch (error) {
      console.error("Error deleting survey:", error);
    }
  };

  const handleEditSurvey = (survey) => {
    setSurveyForm({
      resident_name: survey.resident_name || "",
      noise_level: survey.noise_level || "",
      sociability: survey.sociability || "",
      events: survey.events || "",
      kids_friendly: survey.kids_friendly || "",
      walkability: survey.walkability || "",
      cookouts: survey.cookouts || "",
      nightlife: survey.nightlife || "",
      additional_notes: survey.additional_notes || "",
    });
    setEditingSurveyId(survey.id);
    setShowSurveyForm(true);
  };

  const resetNeighborhoodForm = () => {
    setNeighborhoodForm({ name: "", location: "", description: "", school_district: "" });
    setShowNeighborhoodForm(false);
  };

  const resetSurveyForm = () => {
    setSurveyForm({
      resident_name: "",
      noise_level: "",
      sociability: "",
      events: "",
      kids_friendly: "",
      walkability: "",
      cookouts: "",
      nightlife: "",
      additional_notes: "",
    });
    setEditingSurveyId(null);
    setShowSurveyForm(false);
  };

  // Options for describing the neighborhood (not preferences)
  const options = {
    noise_level: ["Very Quiet", "Quiet", "Moderate", "Lively"],
    sociability: ["Very Private", "Somewhat Social", "Social", "Very Social"],
    events: ["None", "Occasional", "Regular", "Very Active"],
    kids_friendly: ["Not Family-Friendly", "Some Families", "Family-Friendly", "Very Family-Friendly"],
    walkability: ["Not Walkable", "Somewhat Walkable", "Walkable", "Very Walkable"],
    cookouts: ["No Cookouts", "Occasional Cookouts", "Regular Cookouts", "Very Active Cookouts"],
    nightlife: ["Quiet Evenings", "Some Activity", "Active", "Very Active"],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                Happy Neighbor Admin
              </span>
            </Link>
            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900">{user.displayName || user.name || 'Admin'}</p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                  <button
                    onClick={logout}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
              <Link to="/" className="text-gray-600 hover:text-orange-600 transition-colors font-medium">
                Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Neighborhood Management</h1>
          <p className="text-gray-600 text-lg">Manage neighborhoods and resident survey responses</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Neighborhoods</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{neighborhoods.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Filtered Results</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{filteredNeighborhoods.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Surveys</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {neighborhoods.reduce((sum, n) => sum + (n.survey_count || 0), 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* City Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Neighborhoods by Location</h2>
              <p className="text-sm text-gray-500 mt-1">Filter neighborhoods by city</p>
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-semibold text-gray-700 bg-white shadow-sm"
            >
              <option value="all">All Cities ({neighborhoods.length})</option>
              <option value="Boston, MA">Boston, MA ({neighborhoods.filter(n => n.location === 'Boston, MA').length})</option>
              <option value="St. Louis, MO">St. Louis, MO ({neighborhoods.filter(n => n.location === 'St. Louis, MO').length})</option>
            </select>
          </div>
          <LocationDisplay 
            neighborhoods={filteredNeighborhoods}
            selectedId={selectedNeighborhood?.id}
            onLocationClick={(neighborhood) => {
              setSelectedNeighborhood(neighborhood);
            }}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Neighborhoods */}
          <div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Neighborhoods</h2>
                  <p className="text-sm text-gray-500 mt-1">Manage neighborhood listings</p>
                </div>
                <button
                  onClick={() => setShowNeighborhoodForm(!showNeighborhoodForm)}
                  className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                >
                  {showNeighborhoodForm ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Neighborhood
                    </>
                  )}
                </button>
              </div>

              {showNeighborhoodForm && (
                <form onSubmit={handleNeighborhoodSubmit} className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Neighborhood Name *
                    </label>
                    <input
                      type="text"
                      value={neighborhoodForm.name}
                      onChange={(e) => setNeighborhoodForm({ ...neighborhoodForm, name: e.target.value })}
                      required
                      placeholder="e.g., Wellesley Hills"
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Location (City, State) *
                    </label>
                    <select
                      value={neighborhoodForm.location}
                      onChange={(e) => setNeighborhoodForm({ ...neighborhoodForm, location: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    >
                      <option value="">Select a city...</option>
                      <option value="Boston, MA">Boston, MA</option>
                      <option value="St. Louis, MO">St. Louis, MO</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={neighborhoodForm.description}
                      onChange={(e) => setNeighborhoodForm({ ...neighborhoodForm, description: e.target.value })}
                      rows="3"
                      placeholder="Brief description of the neighborhood..."
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Elementary School District (Optional)
                    </label>
                    <input
                      type="text"
                      value={neighborhoodForm.school_district}
                      onChange={(e) => setNeighborhoodForm({ ...neighborhoodForm, school_district: e.target.value })}
                      placeholder="e.g., Wellesley Public Schools, Ladue School District"
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-1">Helps families find neighborhoods by school district</p>
                  </div>
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Add Neighborhood
                  </button>
                </form>
              )}

              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {filteredNeighborhoods.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-gray-500 font-medium">
                      {selectedCity === 'all' 
                        ? 'No neighborhoods added yet.' 
                        : `No neighborhoods found for ${selectedCity}.`}
                    </p>
                  </div>
                ) : (
                  filteredNeighborhoods.map((neighborhood) => (
                    <div
                      key={neighborhood.id}
                      onClick={() => setSelectedNeighborhood(neighborhood)}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                        selectedNeighborhood?.id === neighborhood.id
                          ? "border-orange-500 bg-orange-50 shadow-md"
                          : "border-gray-200 hover:border-orange-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg">{neighborhood.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{neighborhood.location}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              {neighborhood.survey_count || 0} survey{neighborhood.survey_count !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNeighborhood(neighborhood.id);
                          }}
                          className="ml-3 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Surveys */}
          <div>
            {selectedNeighborhood ? (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedNeighborhood.name}</h2>
                    <p className="text-gray-600 text-sm mt-1">{selectedNeighborhood.location}</p>
                    {selectedNeighborhood.description && (
                      <p className="text-sm text-gray-500 mt-2">{selectedNeighborhood.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      resetSurveyForm();
                      setShowSurveyForm(!showSurveyForm);
                    }}
                    className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    {showSurveyForm ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Survey
                      </>
                    )}
                  </button>
                </div>

                {showSurveyForm && (
                  <form onSubmit={handleSurveySubmit} className="space-y-4 mb-6 pb-6 border-b">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Resident Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={surveyForm.resident_name}
                        onChange={(e) => setSurveyForm({ ...surveyForm, resident_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {Object.keys(options).map((key) => (
                        <div key={key}>
                          <label className="block text-sm font-semibold text-gray-700 mb-2 capitalize">
                            {key.replace("_", " ")}
                          </label>
                          <select
                            value={surveyForm[key]}
                            onChange={(e) => setSurveyForm({ ...surveyForm, [key]: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="">Select...</option>
                            {options[key].map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Additional Notes
                      </label>
                      <textarea
                        value={surveyForm.additional_notes}
                        onChange={(e) => setSurveyForm({ ...surveyForm, additional_notes: e.target.value })}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                        placeholder="Any additional comments about the neighborhood..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      {editingSurveyId ? "Update Survey" : "Add Survey"}
                    </button>
                  </form>
                )}

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Resident Surveys ({surveys.length})
                  </h3>
                  {surveys.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No surveys yet. Add one above!
                    </p>
                  ) : (
                    surveys.map((survey) => (
                      <div
                        key={survey.id}
                        className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {survey.resident_name || "Anonymous Resident"}
                            </p>
                            {survey.address && (
                              <p className="text-xs text-gray-500 mt-1">
                                📍 {survey.address}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              {new Date(survey.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditSurvey(survey)}
                              className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSurvey(survey.id)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                          {survey.noise_level && (
                            <div>
                              <span className="text-gray-600">Noise: </span>
                              <span className="font-medium">{survey.noise_level}</span>
                            </div>
                          )}
                          {survey.sociability && (
                            <div>
                              <span className="text-gray-600">Social: </span>
                              <span className="font-medium">{survey.sociability}</span>
                            </div>
                          )}
                          {survey.kids_friendly && (
                            <div>
                              <span className="text-gray-600">Kids: </span>
                              <span className="font-medium">{survey.kids_friendly}</span>
                            </div>
                          )}
                          {survey.walkability && (
                            <div>
                              <span className="text-gray-600">Walkable: </span>
                              <span className="font-medium">{survey.walkability}</span>
                            </div>
                          )}
                        </div>
                        {survey.additional_notes && (
                          <p className="text-sm text-gray-700 mt-2 italic">
                            "{survey.additional_notes}"
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <p className="text-gray-500 text-lg">
                  Select a neighborhood to view and add resident surveys
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
