import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import { API_URL } from "../utils/apiConfig";

// Demo street data for prototype when backend is unavailable (IDs 1-5 match Results demo)
const getDemoStreetData = (streetId) => {
  const n = parseInt(streetId);
  const demos = {
    1: { name: "Oak Avenue", city: "Boston", state: "MA", neighborhood_name: "Riverside", survey_count: 3, vibe_summary: "Quiet • Walkable • Family-Friendly", vibe: { noise_level: { Quiet: 3 }, walkability: { "Very Walkable": 3 }, safety: { "Very Safe": 3 }, kids_friendly: { "Very Family-Friendly": 3 }, public_education: { Good: 3 }, events: { Regular: 3 }, lawn_space: { "Large Yards": 3 }, neighbor_familiarity: { Often: 3 } } },
    2: { name: "Maple Lane", city: "Boston", state: "MA", neighborhood_name: "Parkview", survey_count: 2, vibe_summary: "Moderate • Walkable • Family-Friendly", vibe: { noise_level: { Moderate: 2 }, walkability: { Walkable: 2 }, safety: { Safe: 2 }, kids_friendly: { "Family-Friendly": 2 }, public_education: { Excellent: 2 }, events: { Occasional: 2 }, lawn_space: { "Moderate Yards": 2 }, neighbor_familiarity: { Sometimes: 2 } } },
    3: { name: "Cedar Drive", city: "Cambridge", state: "MA", neighborhood_name: "Hillside", survey_count: 4, vibe_summary: "Quiet • Very Walkable • Active", vibe: { noise_level: { Quiet: 4 }, walkability: { "Very Walkable": 4 }, safety: { Safe: 4 }, kids_friendly: { "Some Families": 4 }, public_education: { Excellent: 4 }, events: { "Very Active": 4 }, lawn_space: { "Moderate Yards": 4 }, neighbor_familiarity: { Often: 4 } } },
    4: { name: "Pine Street", city: "Somerville", state: "MA", neighborhood_name: "Downtown", survey_count: 2, vibe_summary: "Lively • Very Walkable • Active", vibe: { noise_level: { Lively: 2 }, walkability: { "Very Walkable": 2 }, safety: { Safe: 2 }, kids_friendly: { "Some Families": 2 }, public_education: { Average: 2 }, events: { "Very Active": 2 }, lawn_space: { "Small Yards": 2 }, neighbor_familiarity: { Often: 2 } } },
    5: { name: "Elm Court", city: "Brookline", state: "MA", neighborhood_name: "Greenwood", survey_count: 1, vibe_summary: "Very Quiet • Family-Friendly • Large Yards", vibe: { noise_level: { "Very Quiet": 1 }, walkability: { Walkable: 1 }, safety: { "Very Safe": 1 }, kids_friendly: { "Very Family-Friendly": 1 }, public_education: { Excellent: 1 }, events: { Occasional: 1 }, lawn_space: { "Very Large Yards": 1 }, neighbor_familiarity: { Sometimes: 1 } } },
  };
  const d = demos[n];
  if (!d) return null;
  const { vibe, ...rest } = d;
  return { street: { id: streetId, ...rest }, vibe, recentNotes: [], message: `Based on ${d.survey_count} verified resident${d.survey_count === 1 ? '' : 's'}` };
};

// Mock realtor listings data generator
const generateMockListings = (street) => {
  if (!street) return [];
  
  const realtors = [
    { name: "Sarah Mitchell", company: "Compass Realty", photo: "https://randomuser.me/api/portraits/women/44.jpg" },
    { name: "Michael Chen", company: "RE/MAX Premier", photo: "https://randomuser.me/api/portraits/men/32.jpg" },
    { name: "Jennifer Rodriguez", company: "Coldwell Banker", photo: "https://randomuser.me/api/portraits/women/68.jpg" },
    { name: "David Thompson", company: "Keller Williams", photo: "https://randomuser.me/api/portraits/men/75.jpg" },
  ];

  const houseImages = [
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=400&h=300&fit=crop",
  ];

  // State-based price multipliers
  const stateMultipliers = {
    'CA': 2.2, 'NY': 1.8, 'MA': 1.7, 'WA': 1.6, 'CO': 1.5,
    'NJ': 1.5, 'CT': 1.4, 'MD': 1.3, 'VA': 1.2, 'FL': 1.1,
    'TX': 0.95, 'AZ': 1.1, 'NC': 0.9, 'GA': 0.95, 'PA': 0.85,
  };
  const multiplier = stateMultipliers[street.state] || 1.0;

  return [
    {
      id: 1,
      address: `${Math.floor(Math.random() * 900) + 100} ${street.name}`,
      price: Math.round((350000 + Math.random() * 150000) * multiplier),
      beds: 3,
      baths: 2,
      sqft: 1850,
      image: houseImages[0],
      realtor: realtors[0],
      status: "For Sale",
      daysOnMarket: 5,
    },
    {
      id: 2,
      address: `${Math.floor(Math.random() * 900) + 100} ${street.name}`,
      price: Math.round((420000 + Math.random() * 180000) * multiplier),
      beds: 4,
      baths: 2.5,
      sqft: 2400,
      image: houseImages[1],
      realtor: realtors[1],
      status: "For Sale",
      daysOnMarket: 12,
    },
    {
      id: 3,
      address: `${Math.floor(Math.random() * 900) + 100} ${street.name}`,
      price: Math.round((290000 + Math.random() * 100000) * multiplier),
      beds: 2,
      baths: 1,
      sqft: 1200,
      image: houseImages[2],
      realtor: realtors[2],
      status: "New Listing",
      daysOnMarket: 1,
    },
  ];
};

const StreetPortal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [street, setStreet] = useState(null);
  const [vibeData, setVibeData] = useState(null);
  const [similarStreets, setSimilarStreets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [listings, setListings] = useState([]);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    fetchStreetData();
  }, [id]);

  // Generate mock listings when street data is loaded
  useEffect(() => {
    if (street) {
      setListings(generateMockListings(street));
    }
  }, [street]);

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
      
      // Fetch similar streets
      try {
        const similarResponse = await fetch(`${API_URL}/streets/${id}/similar?limit=3`);
        if (similarResponse.ok) {
          const similarData = await similarResponse.json();
          setSimilarStreets(similarData);
        }
      } catch (err) {
        console.error('Error fetching similar streets:', err);
      }
      
      // Debug: Log if vibe data is empty
      if (!data.vibe || Object.keys(data.vibe).length === 0 || 
          Object.values(data.vibe).every(v => !v || Object.keys(v).length === 0)) {
        console.warn('No vibe data for street:', data.street?.name);
      }
    } catch (err) {
      // Prototype demo mode: show demo street when backend is unavailable
      const demoData = getDemoStreetData(id);
      if (demoData) {
        setDemoMode(true);
        setStreet(demoData.street);
        setVibeData({ street: demoData.street, vibe: demoData.vibe, recentNotes: demoData.recentNotes });
        setError(null);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Get the most common (average) value from a vibe category
  const getAverageResult = (vibeCategory) => {
    if (!vibeCategory || Object.keys(vibeCategory).length === 0) return null;
    const sorted = Object.entries(vibeCategory).sort((a, b) => b[1] - a[1]);
    const total = Object.values(vibeCategory).reduce((a, b) => a + b, 0);
    return { 
      value: sorted[0][0], 
      count: sorted[0][1], 
      total: total,
      percentage: Math.round((sorted[0][1] / total) * 100)
    };
  };

  // Calculate percentage for bar visualization
  const getPercentage = (count, total) => {
    if (!total) return 0;
    return Math.round((count / total) * 100);
  };

  // Render aggregated result card for each aspect
  const renderAspectCard = (label, emoji, vibeCategory, colorClass = "bg-orange-500", description = "") => {
    if (!vibeCategory || typeof vibeCategory !== 'object' || Object.keys(vibeCategory).length === 0) {
      return (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{emoji}</span>
            <span className="font-semibold text-gray-700">{label}</span>
          </div>
          <p className="text-sm text-gray-400 italic">No data yet</p>
        </div>
      );
    }

    const total = Object.values(vibeCategory).reduce((a, b) => a + b, 0);
    const sorted = Object.entries(vibeCategory).sort((a, b) => b[1] - a[1]);
    const averageResult = getAverageResult(vibeCategory);
    
    if (!averageResult) {
      return (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{emoji}</span>
            <span className="font-semibold text-gray-700">{label}</span>
          </div>
          <p className="text-sm text-gray-400 italic">No data yet</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{emoji}</span>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{label}</h3>
            {description && (
              <p className="text-xs text-gray-500">{description}</p>
            )}
          </div>
        </div>
        
        {/* Average Result - Most Prominent */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-gray-900">{averageResult.value}</span>
            <span className="text-sm text-gray-500">
              {averageResult.count} of {averageResult.total} residents
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full ${colorClass} rounded-full transition-all duration-500`}
              style={{ width: `${averageResult.percentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {averageResult.percentage}% of residents agree
          </p>
        </div>

        {/* Breakdown of all responses */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Full Breakdown</p>
          <div className="space-y-2">
            {sorted.map(([value, count]) => (
              <div key={value} className="flex items-center gap-3">
                <div className="w-32 text-sm text-gray-600 truncate" title={value}>{value}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full ${colorClass} rounded-full transition-all duration-500`}
                    style={{ width: `${getPercentage(count, total)}%` }}
                  />
                </div>
                <div className="w-16 text-xs text-gray-500 text-right">
                  {getPercentage(count, total)}% ({count})
                </div>
              </div>
            ))}
          </div>
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
        <title>{street.name}, {street.city} - Street Details | Happy Neighbor</title>
        <meta name="description" content={`See aggregated resident data about ${street.name} in ${street.city}, ${street.state}`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100">
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
                <Link to="/results" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
                  Back to Results
                </Link>
                <Link to="/submit" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
                  Share Your Street
                </Link>
                <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
                  Home
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {demoMode && (
          <div className="max-w-6xl mx-auto px-4 pt-4">
            <div className="px-4 py-2 bg-amber-100 border border-amber-300 rounded-lg text-amber-800 text-sm text-center">
              Demo mode — showing sample street data (backend not running)
            </div>
          </div>
        )}
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

        {/* Realtor Listings Section */}
        {listings.length > 0 && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span>🏡</span> Homes for Sale on {street.name}
              </h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                Sponsored Listings
              </span>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <div 
                  key={listing.id}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 group"
                >
                  {/* Property Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={listing.image} 
                      alt={listing.address}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        listing.status === 'New Listing' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-blue-500 text-white'
                      }`}>
                        {listing.status}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 bg-black/60 text-white rounded text-xs">
                        {listing.daysOnMarket} {listing.daysOnMarket === 1 ? 'day' : 'days'} ago
                      </span>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="p-5">
                    <div className="mb-3">
                      <p className="text-2xl font-bold text-gray-900">
                        ${listing.price.toLocaleString()}
                      </p>
                      <p className="text-gray-600 text-sm mt-1">{listing.address}</p>
                      <p className="text-gray-500 text-xs">{street.city}, {street.state}</p>
                    </div>

                    {/* Specs */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <span className="flex items-center gap-1">
                        <span className="font-semibold">{listing.beds}</span> beds
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="flex items-center gap-1">
                        <span className="font-semibold">{listing.baths}</span> baths
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="flex items-center gap-1">
                        <span className="font-semibold">{listing.sqft.toLocaleString()}</span> sqft
                      </span>
                    </div>

                    {/* Realtor Info */}
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        <img 
                          src={listing.realtor.photo} 
                          alt={listing.realtor.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-orange-200"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {listing.realtor.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {listing.realtor.company}
                          </p>
                        </div>
                        <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold rounded-lg hover:shadow-md transition-all">
                          Contact
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
            /* Has Data - Show Aggregated Results */
            <div className="space-y-8">
              {/* Summary Card */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Street Overview
                </h2>
                <p className="text-gray-700">
                  Based on <strong>{street.survey_count}</strong> verified resident{street.survey_count !== 1 ? 's' : ''}, 
                  here's what the average experience is like on {street.name}.
                </p>
              </div>

              {/* Aggregated Aspect Cards */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span>📊</span> Average Street Characteristics
                </h2>
                {street.survey_count === 0 ? (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 text-center">
                    <div className="text-4xl mb-4">📝</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      No Resident Reviews Yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      This street doesn't have any verified resident reviews yet. Be the first to share your experience!
                    </p>
                    <Link
                      to="/submit"
                      className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Share Your Experience
                    </Link>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {renderAspectCard(
                      "Noise Level", 
                      "🔊", 
                      vibeData?.vibe?.noise_level, 
                      "bg-blue-500",
                      "How quiet or lively is this street?"
                    )}
                    {renderAspectCard(
                      "Walkability", 
                      "🚶", 
                      vibeData?.vibe?.walkability, 
                      "bg-teal-500",
                      "How easy is it to walk around this area?"
                    )}
                    {renderAspectCard(
                      "Safety", 
                      "🛡️", 
                      vibeData?.vibe?.safety, 
                      "bg-green-500",
                      "How safe does this street feel?"
                    )}
                    {renderAspectCard(
                      "Family Friendliness", 
                      "👨‍👩‍👧‍👦", 
                      vibeData?.vibe?.kids_friendly, 
                      "bg-pink-500",
                      "Is this street good for families with kids?"
                    )}
                    {renderAspectCard(
                      "Public Education", 
                      "🎓", 
                      vibeData?.vibe?.public_education, 
                      "bg-purple-500",
                      "Quality of public K-12 schools in the area"
                    )}
                    {renderAspectCard(
                      "Community Events", 
                      "🎉", 
                      vibeData?.vibe?.events, 
                      "bg-purple-500",
                      "How often do community events happen? (Including BBQs & cookouts)"
                    )}
                    {renderAspectCard(
                      "Lawn Space & Yard Size", 
                      "🌱", 
                      vibeData?.vibe?.lawn_space, 
                      "bg-emerald-500",
                      "What's the lawn space & yard size like on this street?"
                    )}
                    {renderAspectCard(
                      "Neighbors Know Each Other", 
                      "👋", 
                      vibeData?.vibe?.neighbor_familiarity, 
                      "bg-orange-500",
                      "Do neighbors know each other by name?"
                    )}
                  </div>
                )}
              </div>

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

          {/* Similar Streets */}
          {similarStreets.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span>🔗</span> Similar Streets
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {similarStreets.map((similar) => (
                  <Link
                    key={similar.id}
                    to={`/street/${similar.id}`}
                    className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{similar.name}</h3>
                    <p className="text-gray-600 mb-2">{similar.city}, {similar.state}</p>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {similar.similarity}% Similar
                      </span>
                      <span className="text-sm text-gray-500">
                        {similar.survey_count} {similar.survey_count === 1 ? 'review' : 'reviews'}
                      </span>
                    </div>
                  </Link>
                ))}
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
                <Link to="/businesses" className="text-gray-500 hover:text-orange-600">Businesses</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default StreetPortal;
