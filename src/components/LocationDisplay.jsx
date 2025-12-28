import React, { useState } from 'react';

const LocationDisplay = ({ neighborhoods = [], onLocationClick, selectedId = null }) => {
  const [groupBy, setGroupBy] = useState('location'); // 'location' or 'school_district'

  // Group neighborhoods by location or school district
  const grouped = neighborhoods.reduce((acc, neighborhood) => {
    let key;
    if (groupBy === 'school_district') {
      key = neighborhood.school_district || 'No School District';
    } else {
      key = neighborhood.location || 'Unknown Location';
    }
    
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(neighborhood);
    return acc;
  }, {});

  // Sort groups alphabetically
  const sortedGroups = Object.keys(grouped).sort();

  if (neighborhoods.length === 0) {
    return (
      <div className="w-full bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl overflow-hidden border-2 border-orange-200 shadow-xl p-12 text-center">
        <p className="text-gray-500 font-medium text-lg">No neighborhoods to display</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl overflow-hidden border-2 border-orange-200 shadow-xl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            {groupBy === 'school_district' ? 'Neighborhoods by School District' : 'Neighborhoods by Location'}
          </h3>
          <div className="flex gap-2 bg-white rounded-lg p-1 border border-gray-200">
            <button
              onClick={() => setGroupBy('location')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                groupBy === 'location'
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Location
            </button>
            <button
              onClick={() => setGroupBy('school_district')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                groupBy === 'school_district'
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              School District
            </button>
          </div>
        </div>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {sortedGroups.map((groupKey) => (
            <div
              key={groupKey}
              className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-3">
                {groupBy === 'school_district' ? (
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
                <h4 className="font-bold text-gray-900 text-lg">{groupKey}</h4>
                <span className="text-sm text-gray-500">
                  ({grouped[groupKey].length} neighborhood{grouped[groupKey].length !== 1 ? 's' : ''})
                </span>
              </div>
              <div className="space-y-2 ml-7">
                {grouped[groupKey].map((neighborhood) => {
                  const isSelected = selectedId === neighborhood.id;
                  return (
                    <div
                      key={neighborhood.id}
                      onClick={() => onLocationClick && onLocationClick(neighborhood)}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-orange-100 border-2 border-orange-500'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{neighborhood.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {groupBy === 'school_district' && neighborhood.location && (
                              <span className="text-xs text-gray-500">{neighborhood.location}</span>
                            )}
                            {groupBy === 'location' && neighborhood.school_district && (
                              <span className="text-xs text-green-600 font-medium">
                                🏫 {neighborhood.school_district}
                              </span>
                            )}
                          </div>
                          {neighborhood.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {neighborhood.description}
                            </p>
                          )}
                        </div>
                        {isSelected && (
                          <div className="ml-4 w-3 h-3 bg-orange-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LocationDisplay;

