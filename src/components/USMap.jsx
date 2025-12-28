import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from 'react-simple-maps';

// Error Boundary Component
class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Map Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl overflow-hidden border-2 border-orange-200 shadow-xl relative" style={{ minHeight: '500px' }}>
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-xl z-10">
            <div className="text-center">
              <p className="text-red-600 font-medium mb-2">Map Error</p>
              <p className="text-gray-500 text-sm mb-4">{this.state.error?.message || 'Unknown error'}</p>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
              >
                Reload Map
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// US Map TopoJSON URL - using unprojected version for geoAlbersUsa
const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// Simple city coordinates lookup (expand as needed)
const cityCoordinates = {
  'Portland, OR': [-122.6784, 45.5152],
  'St. Louis, MO': [-90.1994, 38.6270],
  'Austin, TX': [-97.7431, 30.2672],
  'Seattle, WA': [-122.3321, 47.6062],
  'San Francisco, CA': [-122.4194, 37.7749],
  'New York, NY': [-74.0060, 40.7128],
  'Chicago, IL': [-87.6298, 41.8781],
  'Los Angeles, CA': [-118.2437, 34.0522],
  'Denver, CO': [-104.9903, 39.7392],
  'Boston, MA': [-71.0589, 42.3601],
  'Miami, FL': [-80.1918, 25.7617],
  'Phoenix, AZ': [-112.0740, 33.4484],
  'Philadelphia, PA': [-75.1652, 39.9526],
  'San Diego, CA': [-117.1611, 32.7157],
  'Dallas, TX': [-96.7970, 32.7767],
  'Houston, TX': [-95.3698, 29.7604],
  'Atlanta, GA': [-84.3880, 33.7490],
  'Detroit, MI': [-83.0458, 42.3314],
  'Minneapolis, MN': [-93.2650, 44.9778],
  'Nashville, TN': [-86.7816, 36.1627],
};

// State center coordinates for zooming
const stateCenters = {
  'AL': [-86.7911, 32.8067], // Alabama
  'AK': [-152.4044, 61.3707], // Alaska
  'AZ': [-111.4312, 33.7298], // Arizona
  'AR': [-92.3731, 34.9697], // Arkansas
  'CA': [-119.4179, 36.1162], // California
  'CO': [-105.3111, 39.0598], // Colorado
  'CT': [-72.7273, 41.5978], // Connecticut
  'DE': [-75.5277, 39.3185], // Delaware
  'FL': [-81.6868, 27.7663], // Florida
  'GA': [-83.1132, 33.0406], // Georgia
  'HI': [-157.4983, 21.0943], // Hawaii
  'ID': [-114.4788, 44.2405], // Idaho
  'IL': [-89.3985, 40.3495], // Illinois
  'IN': [-86.1477, 39.8494], // Indiana
  'IA': [-93.6209, 42.0115], // Iowa
  'KS': [-98.4842, 38.5266], // Kansas
  'KY': [-84.6701, 37.6681], // Kentucky
  'LA': [-92.1450, 31.1695], // Louisiana
  'ME': [-69.3977, 44.3235], // Maine
  'MD': [-76.5019, 39.0639], // Maryland
  'MA': [-71.5118, 42.2302], // Massachusetts
  'MI': [-84.5467, 43.3266], // Michigan
  'MN': [-94.6859, 45.6945], // Minnesota
  'MS': [-89.6678, 32.7416], // Mississippi
  'MO': [-92.1893, 38.4561], // Missouri
  'MT': [-110.4544, 47.0527], // Montana
  'NE': [-99.9018, 41.1254], // Nebraska
  'NV': [-117.0554, 38.3135], // Nevada
  'NH': [-71.5653, 43.4525], // New Hampshire
  'NJ': [-74.5210, 40.2989], // New Jersey
  'NM': [-106.2485, 34.8405], // New Mexico
  'NY': [-74.9481, 42.1657], // New York
  'NC': [-79.0193, 35.6301], // North Carolina
  'ND': [-99.7840, 47.5289], // North Dakota
  'OH': [-82.7649, 40.3888], // Ohio
  'OK': [-97.5349, 35.5653], // Oklahoma
  'OR': [-122.0709, 44.5720], // Oregon
  'PA': [-77.1945, 40.5908], // Pennsylvania
  'RI': [-71.5118, 41.6809], // Rhode Island
  'SC': [-80.9450, 33.8569], // South Carolina
  'SD': [-99.9018, 44.2998], // South Dakota
  'TN': [-86.7816, 35.7478], // Tennessee
  'TX': [-99.9018, 31.0545], // Texas
  'UT': [-111.8926, 40.1500], // Utah
  'VT': [-72.7317, 44.0459], // Vermont
  'VA': [-78.1694, 37.7693], // Virginia
  'WA': [-121.4900, 47.4009], // Washington
  'WV': [-80.9696, 38.4912], // West Virginia
  'WI': [-89.6165, 44.2685], // Wisconsin
  'WY': [-107.3025, 42.7557], // Wyoming
};

// Helper function to create a simple hash for consistent positioning
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// Helper function to extract coordinates from location string and spread markers within cities
const getCoordinates = (location, neighborhoodName = '', zoomLevel = 1, index = 0) => {
  try {
    if (!location) return null;
    
    // Clamp zoom level - cap at 3.5 for stability (reduced from 4 to prevent crashes)
    const safeZoomLevel = Math.max(0.5, Math.min(3.5, zoomLevel));
    
    let baseCoords = null;
    
    // Try exact match first
    if (cityCoordinates[location]) {
      baseCoords = cityCoordinates[location];
    } else {
      // Try to match by city name (e.g., "Portland" in "Portland, OR")
      const cityName = location.split(',')[0].trim();
      for (const [key, coords] of Object.entries(cityCoordinates)) {
        if (key.toLowerCase().startsWith(cityName.toLowerCase())) {
          baseCoords = coords;
          break;
        }
      }
    }
    
    if (!baseCoords || !Array.isArray(baseCoords) || baseCoords.length !== 2) {
      // Default fallback - approximate US center
      baseCoords = [-95.7129, 37.0902];
    }
    
    // Validate base coordinates
    if (isNaN(baseCoords[0]) || isNaN(baseCoords[1])) {
      baseCoords = [-95.7129, 37.0902];
    }
    
    // Spread markers within cities - allows better separation at high zoom
    // Use neighborhood name + location + index to create consistent but varied offset
    const hash = hashString(neighborhoodName + location);
    const baseSpreadRadius = 0.6; // Increased from 0.3 degrees base spread at zoom 1 for better separation
    // Spread increases more aggressively with zoom for better separation at high zoom
    // Use exponent 1.8 for better spread, cap at 8 degrees max for reasonable separation
    const spreadRadius = Math.min(baseSpreadRadius * Math.pow(Math.max(1, safeZoomLevel), 1.8), 8.0);
    
    // Combine hash and index for better distribution
    // Use hash for angle, index for ring position to create more even spacing
    const combinedHash = (hash + index * 7919) % 10000; // Use large prime for better distribution
    
    // Create more even distribution - use index to create distinct angles
    // Distribute angles more evenly around the circle (8 segments for good distribution)
    const angleStep = 360 / 8; // Divide circle into 8 segments
    const angle = (((combinedHash % 360) + (index * angleStep)) % 360) * (Math.PI / 180);
    
    // Use a more even distribution of distances - create rings instead of random
    // Use index to determine ring, hash for slight variation
    const ringNumber = (index % 5) + ((hash % 3) / 3); // Create 5 rings with slight variation
    const distance = (ringNumber / 4.5) * spreadRadius; // Evenly distribute across rings
    
    // Calculate offset using polar coordinates
    const latOffset = Math.cos(angle) * distance;
    const lonOffset = Math.sin(angle) * distance;
    
    // Adjust longitude offset based on latitude (account for Earth's curvature)
    // Add safety check for division by zero
    try {
      const latRad = baseCoords[1] * (Math.PI / 180);
      const cosLat = Math.cos(latRad);
      const latAdjustment = Math.abs(cosLat) > 0.01 ? 1 / cosLat : 1;
      
      // Cap latAdjustment to prevent extreme values at high zoom - allow slightly more range for better spread
      const safeLatAdjustment = Math.max(0.6, Math.min(1.8, latAdjustment));
      
      const finalLon = baseCoords[0] + lonOffset * safeLatAdjustment;
      const finalLat = baseCoords[1] + latOffset;
      
      // Validate and clamp coordinates to prevent crashes
      if (isNaN(finalLon) || isNaN(finalLat) || !isFinite(finalLon) || !isFinite(finalLat)) {
        return baseCoords; // Return base coords if calculation fails
      }
      
      const clampedLon = Math.max(-180, Math.min(180, finalLon));
      const clampedLat = Math.max(15, Math.min(72, finalLat));
      
      // Final validation
      if (isNaN(clampedLon) || isNaN(clampedLat) || !isFinite(clampedLon) || !isFinite(clampedLat)) {
        return baseCoords;
      }
      
      return [clampedLon, clampedLat];
    } catch (error) {
      console.error('Error in coordinate calculation:', error);
      return baseCoords;
    }
  } catch (error) {
    console.error('Error in getCoordinates:', error, { location, neighborhoodName, zoomLevel });
    // Return safe fallback coordinates
    return [-95.7129, 37.0902];
  }
};

const USMap = ({ neighborhoods = [], onMarkerClick, selectedId = null }) => {
  const [mapError, setMapError] = useState(false);
  const [position, setPosition] = useState({ coordinates: [-97, 37], zoom: 1 }); // US center coordinates
  const [isZooming, setIsZooming] = useState(false); // Prevent rapid zoom changes
  const moveEndTimeoutRef = useRef(null); // Ref for debounce timeout
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (moveEndTimeoutRef.current) {
        clearTimeout(moveEndTimeoutRef.current);
      }
    };
  }, []);
  
  // Ensure coordinates are always valid and within reasonable bounds
  const safeCoordinates = (() => {
    try {
      if (!position || !position.coordinates) {
        return [-97, 37];
      }
      
      // Handle both array and object formats
      let coords = null;
      if (Array.isArray(position.coordinates)) {
        coords = position.coordinates;
      } else if (typeof position.coordinates === 'object' && position.coordinates.length === 2) {
        coords = Array.from(position.coordinates);
      } else {
        return [-97, 37];
      }
      
      if (!coords || coords.length !== 2) {
        return [-97, 37];
      }
      
      const lon = coords[0];
      const lat = coords[1];
      
      if (typeof lon !== 'number' || typeof lat !== 'number' || isNaN(lon) || isNaN(lat) || !isFinite(lon) || !isFinite(lat)) {
        return [-97, 37];
      }
      
      // Keep within US bounds
      const clampedLon = Math.max(-180, Math.min(180, lon));
      const clampedLat = Math.max(15, Math.min(72, lat));
      
      // Final validation
      if (isNaN(clampedLon) || isNaN(clampedLat) || !isFinite(clampedLon) || !isFinite(clampedLat)) {
        return [-97, 37];
      }
      
      return [clampedLon, clampedLat];
    } catch (error) {
      console.error('Error calculating safeCoordinates:', error, position);
      return [-97, 37];
    }
  })();
  
  const safeZoom = (() => {
    try {
      const zoom = typeof position.zoom === 'number' && !isNaN(position.zoom) && isFinite(position.zoom) ? position.zoom : 1;
      // Cap at 3.5x zoom for stability (reduced from 4 to prevent crashes)
      const clamped = Math.max(0.5, Math.min(3.5, zoom));
      if (isNaN(clamped) || !isFinite(clamped) || clamped <= 0 || clamped > 3.5) {
        return 1;
      }
      return clamped;
    } catch (error) {
      console.error('Error calculating safeZoom:', error);
      return 1;
    }
  })();


  // Get state abbreviation from location string (e.g., "Portland, OR" -> "OR")
  const getStateFromLocation = (location) => {
    if (!location) return null;
    const parts = location.split(',');
    if (parts.length >= 2) {
      return parts[1].trim();
    }
    return null;
  };

  // Handle state click - zoom into that state
  const handleStateClick = (geo) => {
    const props = geo.properties || {};
    const stateName = props.name || props.NAME || '';
    const stateAbbr = props.STUSPS || props.abbrev || props.postal || '';
    
    // Try to find state center by abbreviation or name
    let stateCenter = null;
    
    // First try by abbreviation (most reliable)
    if (stateAbbr && stateCenters[stateAbbr]) {
      stateCenter = stateCenters[stateAbbr];
    } else {
      // Try to extract abbreviation from state name
      const nameWords = stateName.split(' ');
      if (nameWords.length > 0) {
        // Try common patterns like "New York" -> "NY", "North Carolina" -> "NC"
        const firstLetters = nameWords.map(w => w[0]).join('').toUpperCase();
        if (stateCenters[firstLetters]) {
          stateCenter = stateCenters[firstLetters];
        }
      }
      
      // Fallback: try to match by state name keywords
      if (!stateCenter) {
        const nameLower = stateName.toLowerCase();
        for (const [abbr, coords] of Object.entries(stateCenters)) {
          // Match common state name patterns
          const stateNames = {
            'CA': 'california', 'TX': 'texas', 'NY': 'new york', 'FL': 'florida',
            'IL': 'illinois', 'PA': 'pennsylvania', 'OH': 'ohio', 'GA': 'georgia',
            'NC': 'north carolina', 'MI': 'michigan', 'NJ': 'new jersey',
            'VA': 'virginia', 'WA': 'washington', 'AZ': 'arizona', 'MA': 'massachusetts',
            'TN': 'tennessee', 'IN': 'indiana', 'MO': 'missouri', 'MD': 'maryland',
            'WI': 'wisconsin', 'CO': 'colorado', 'MN': 'minnesota', 'SC': 'south carolina',
            'AL': 'alabama', 'LA': 'louisiana', 'KY': 'kentucky', 'OR': 'oregon',
            'OK': 'oklahoma', 'CT': 'connecticut', 'IA': 'iowa', 'UT': 'utah',
            'AR': 'arkansas', 'NV': 'nevada', 'MS': 'mississippi', 'KS': 'kansas',
            'NM': 'new mexico', 'NE': 'nebraska', 'WV': 'west virginia', 'ID': 'idaho',
            'HI': 'hawaii', 'NH': 'new hampshire', 'ME': 'maine', 'RI': 'rhode island',
            'MT': 'montana', 'DE': 'delaware', 'SD': 'south dakota', 'ND': 'north dakota',
            'AK': 'alaska', 'VT': 'vermont', 'DC': 'district of columbia', 'WY': 'wyoming'
          };
          
          if (stateNames[abbr] && nameLower.includes(stateNames[abbr])) {
            stateCenter = coords;
            break;
          }
        }
      }
    }
    
    if (stateCenter && Array.isArray(stateCenter) && stateCenter.length === 2) {
      const lon = stateCenter[0];
      const lat = stateCenter[1];
      if (typeof lon === 'number' && typeof lat === 'number' && !isNaN(lon) && !isNaN(lat) && isFinite(lon) && isFinite(lat)) {
        setPosition({
          coordinates: [
            Math.max(-180, Math.min(180, lon)),
            Math.max(15, Math.min(72, lat))
          ],
          zoom: 2.5 // Zoom level for state view
        });
      }
    }
  };

  // Handle position updates from ZoomableGroup - with debounce to prevent crashes
  const handleMoveEnd = useCallback((newPosition) => {
    if (isZooming) return; // Prevent updates while zooming
    
    // Clear any existing timeout
    if (moveEndTimeoutRef.current) {
      clearTimeout(moveEndTimeoutRef.current);
    }
    
    try {
      if (!newPosition) {
        return;
      }
      
      // Safely extract coordinates - handle both array and object formats
      let coords = null;
      if (newPosition && typeof newPosition === 'object') {
        if (Array.isArray(newPosition.coordinates)) {
          coords = newPosition.coordinates;
        } else if (Array.isArray(newPosition)) {
          coords = newPosition;
        } else if (newPosition.coordinates && typeof newPosition.coordinates === 'object') {
          // Handle case where coordinates might be an array-like object
          try {
            coords = Array.from(newPosition.coordinates);
          } catch (e) {
            // If Array.from fails, try to access as array
            if (newPosition.coordinates.length === 2) {
              coords = [newPosition.coordinates[0], newPosition.coordinates[1]];
            }
          }
        }
      } else if (Array.isArray(newPosition)) {
        coords = newPosition;
      }
      
      if (!coords || !Array.isArray(coords) || coords.length !== 2) {
        return;
      }
      
      // Extract values safely - ensure they're numbers
      const lon = Number(coords[0]);
      const lat = Number(coords[1]);
      const zoom = typeof newPosition.zoom === 'number' ? newPosition.zoom : safeZoom;
      
      // Validate coordinates
      if (typeof lon !== 'number' || typeof lat !== 'number' || isNaN(lon) || isNaN(lat) || !isFinite(lon) || !isFinite(lat)) {
        return;
      }
      
      // Clamp values with safety margins - cap zoom at 3.5 to prevent crashes
      const clampedLon = Math.max(-180, Math.min(180, lon));
      const clampedLat = Math.max(15, Math.min(72, lat));
      const clampedZoom = Math.max(0.5, Math.min(3.5, zoom));
      
      // Only update if values are valid
      if (!isNaN(clampedLon) && !isNaN(clampedLat) && !isNaN(clampedZoom) && 
          isFinite(clampedLon) && isFinite(clampedLat) && isFinite(clampedZoom)) {
        setIsZooming(true);
        setPosition({
          coordinates: [clampedLon, clampedLat],
          zoom: clampedZoom
        });
        // Reset zoom flag after a short delay - increased for better stability
        moveEndTimeoutRef.current = setTimeout(() => setIsZooming(false), 250);
      }
    } catch (error) {
      console.error('Error in handleMoveEnd:', error);
      setIsZooming(false);
    }
  }, [safeZoom, isZooming]);

  return (
    <MapErrorBoundary>
      <div 
        className="w-full bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl overflow-hidden border-2 border-orange-200 shadow-xl relative select-none"
        style={{ minHeight: '500px' }}
      >
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Zoom in at current center, don't change coordinates - cap at 3.5x for safety
            if (isZooming) return;
            setIsZooming(true);
            const newZoom = Math.min(safeZoom * 1.15, 3.5); // Reduced multiplier from 1.2 to 1.15 for smoother zoom
            setPosition(prev => ({ 
              ...prev,
              zoom: newZoom 
            }));
            setTimeout(() => setIsZooming(false), 250); // Increased delay for better stability
          }}
          className="bg-white hover:bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 shadow-md text-gray-700 font-semibold text-lg transition-colors z-30"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Zoom out at current center, don't change coordinates
            const newZoom = Math.max(safeZoom / 1.2, 0.5);
            setPosition(prev => ({ 
              ...prev,
              zoom: newZoom 
            }));
          }}
          className="bg-white hover:bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 shadow-md text-gray-700 font-semibold text-lg transition-colors z-30"
          title="Zoom Out"
        >
          −
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setPosition({ coordinates: [-97, 37], zoom: 1 }); // Reset to US center
          }}
          className="bg-white hover:bg-gray-100 border border-gray-300 rounded-lg px-3 py-1.5 shadow-md text-gray-700 font-semibold text-xs transition-colors"
          title="Reset View"
        >
          Reset
        </button>
        <div className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-xs text-gray-600 text-center">
          {position.zoom.toFixed(1)}x
        </div>
      </div>

      <ComposableMap
        projection="geoAlbersUsa"
        width={800}
        height={500}
        style={{ 
          width: '100%', 
          height: 'auto', 
          backgroundColor: '#F8FAFC'
        }}
      >
        {(() => {
          try {
            // Validate zoom and coordinates before rendering - prevent rendering if invalid
            if (!safeCoordinates || !Array.isArray(safeCoordinates) || safeCoordinates.length !== 2) {
              console.error('Invalid coordinates:', safeCoordinates);
              return <div className="p-4 text-red-600">Error: Invalid map coordinates. Please refresh.</div>;
            }
            
            // Check if coordinates are iterable
            if (typeof safeCoordinates[Symbol.iterator] !== 'function') {
              console.error('Coordinates not iterable:', safeCoordinates);
              return <div className="p-4 text-red-600">Error: Map coordinates not iterable. Please refresh.</div>;
            }
            
            if (isNaN(safeZoom) || safeZoom < 0.5 || safeZoom > 3.5 || !isFinite(safeZoom)) {
              console.error('Invalid zoom:', safeZoom);
              return <div className="p-4 text-red-600">Error: Invalid zoom level. Please refresh.</div>;
            }
            
            // Double-check values before passing to ZoomableGroup - cap at 3.5x for stability
            const finalZoom = isNaN(safeZoom) || !isFinite(safeZoom) || safeZoom <= 0 ? 1 : Math.max(0.5, Math.min(3.5, safeZoom));
            
            // Ensure safeCoordinates is a proper array - create a plain array literal to ensure iterability
            let finalCenter = [-97, 37];
            try {
              if (Array.isArray(safeCoordinates) && safeCoordinates.length === 2) {
                const lon = Number(safeCoordinates[0]);
                const lat = Number(safeCoordinates[1]);
                if (typeof lon === 'number' && typeof lat === 'number' && 
                    !isNaN(lon) && !isNaN(lat) && isFinite(lon) && isFinite(lat)) {
                  // Create a plain array literal (not Array.from) to ensure proper iterability
                  finalCenter = [lon, lat];
                }
              }
            } catch (error) {
              console.error('Error preparing finalCenter:', error);
              finalCenter = [-97, 37];
            }
            
            // Ensure finalCenter is a proper array before passing to ZoomableGroup
            if (!Array.isArray(finalCenter) || finalCenter.length !== 2) {
              finalCenter = [-97, 37];
            }
            
            // Final validation - ensure both values are numbers
            try {
              const [lon, lat] = finalCenter;
              if (typeof lon !== 'number' || typeof lat !== 'number' || 
                  isNaN(lon) || isNaN(lat) || !isFinite(lon) || !isFinite(lat)) {
                finalCenter = [-97, 37];
              } else {
                // Recreate as plain array to ensure it's a fresh iterable
                finalCenter = [Number(lon), Number(lat)];
              }
            } catch (error) {
              console.error('Error validating finalCenter:', error);
              finalCenter = [-97, 37];
            }
            
            return (
              <ZoomableGroup
                zoom={finalZoom}
                center={finalCenter}
                onMoveEnd={handleMoveEnd}
                minZoom={0.5}
                maxZoom={3.5}
                translateExtent={[[-200, -100], [200, 100]]}
              >
                <Geographies geography={geoUrl}>
                  {(geographiesResult) => {
                    try {
                      // react-simple-maps passes { geographies } object
                      // DO NOT destructure - access properties directly to avoid errors
                      if (!geographiesResult || typeof geographiesResult !== 'object') {
                        console.warn('Invalid geographiesResult:', geographiesResult);
                        setMapError(true);
                        return null;
                      }
                      
                      // Access geographies property directly without destructuring
                      let geographies = null;
                      if ('geographies' in geographiesResult && Array.isArray(geographiesResult.geographies)) {
                        geographies = geographiesResult.geographies;
                      } else {
                        // If it's not in expected format, try to extract
                        const keys = Object.keys(geographiesResult);
                        for (let i = 0; i < keys.length; i++) {
                          const key = keys[i];
                          if (Array.isArray(geographiesResult[key])) {
                            geographies = geographiesResult[key];
                            break;
                          }
                        }
                      }
                      
                      // Validate geographies
                      if (!geographies || !Array.isArray(geographies) || geographies.length === 0) {
                        console.warn('Invalid geographies array:', geographiesResult);
                        setMapError(true);
                        return null;
                      }
                      
                      return geographies.map((geo, index) => {
                        try {
                          if (!geo || typeof geo !== 'object') {
                            console.warn('Invalid geo object at index', index);
                            return null;
                          }
                          
                          const geoKey = geo.rsmKey || geo.id || `geo-${index}`;
                          
                          return (
                            <Geography
                              key={geoKey}
                              geography={geo}
                              fill="#DBEAFE"
                              stroke="#3B82F6"
                              strokeWidth={2}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleStateClick(geo);
                              }}
                              style={{
                                default: { outline: 'none', cursor: 'pointer' },
                                hover: { 
                                  fill: '#BFDBFE', 
                                  outline: 'none',
                                  stroke: '#2563EB',
                                  strokeWidth: 2.5,
                                  cursor: 'pointer'
                                },
                                pressed: { 
                                  fill: '#93C5FD', 
                                  outline: 'none',
                                  stroke: '#1D4ED8',
                                  strokeWidth: 3,
                                  cursor: 'pointer'
                                },
                              }}
                            />
                          );
                        } catch (error) {
                          console.error('Error rendering geography:', error, geo);
                          return null;
                        }
                      });
                    } catch (error) {
                      console.error('Error in Geographies callback:', error, geographiesResult);
                      setMapError(true);
                      return null;
                    }
                  }}
                </Geographies>
                
                {/* Markers for neighborhoods - scale with zoom level */}
                {neighborhoods.map((neighborhood, index) => {
                  try {
                    if (!neighborhood || typeof neighborhood !== 'object') return null;
                    
                    const coords = getCoordinates(neighborhood.location, neighborhood.name, safeZoom, index);
                    if (!coords || !Array.isArray(coords) || coords.length !== 2) return null;
                    
                    // Access array elements directly without destructuring
                    const lon = Number(coords[0]);
                    const lat = Number(coords[1]);
                    
                    if (typeof lon !== 'number' || typeof lat !== 'number' || isNaN(lon) || isNaN(lat) || !isFinite(lon) || !isFinite(lat)) {
                      return null;
                    }
                    
                    // Create a plain array literal to ensure proper iterability
                    const safeCoords = [Number(lon), Number(lat)];
                    
                    // Final validation - ensure it's a valid array with numbers
                    if (!Array.isArray(safeCoords) || safeCoords.length !== 2) {
                      return null;
                    }
                    
                    // Validate the numbers are actually numbers
                    if (typeof safeCoords[0] !== 'number' || typeof safeCoords[1] !== 'number' ||
                        isNaN(safeCoords[0]) || isNaN(safeCoords[1]) ||
                        !isFinite(safeCoords[0]) || !isFinite(safeCoords[1])) {
                      return null;
                    }
                    
                    const isSelected = selectedId === neighborhood.id;
                    
                    // Scale marker size based on zoom level - smaller at low zoom, larger when zoomed
                    const baseRadius = isSelected ? 5 : 4;
                    const markerRadius = Math.min(baseRadius * Math.pow(safeZoom, 0.6), 12); // Scale with zoom, cap at 12px
                    
                    // Scale stroke width with zoom
                    const strokeWidth = Math.max(1, 1.5 * Math.pow(safeZoom, 0.5));
                    
                    // Show labels when zoomed in enough - lower threshold for better UX
                    // Show selected always, others at zoom 1.5+ (moderate zoom)
                    const showLabel = isSelected || safeZoom >= 1.5;
                    
                    // Scale text size with zoom to prevent overlap - smaller at low zoom, larger when zoomed
                    // Base size 9px, scales up to 14px at max zoom
                    const textSize = Math.min(9 + (safeZoom - 1) * 1.5, 14);
                    
                    // Calculate text position using same hash/angle as marker for consistent positioning
                    // Position labels at different angles around marker to prevent overlap
                    const labelHash = hashString(neighborhood.name + neighborhood.location);
                    const labelAngle = ((labelHash + index * 7919) % 360) * (Math.PI / 180);
                    
                    // Distance from marker center - increases with zoom for better separation
                    const labelDistance = markerRadius + (safeZoom >= 2.0 ? 12 : 8) + (index % 3) * 2;
                    
                    // Calculate x and y offsets using polar coordinates
                    const textOffsetX = Math.sin(labelAngle) * labelDistance;
                    const textOffsetY = -Math.cos(labelAngle) * labelDistance; // Negative for upward positioning
                    
                    // Determine text anchor based on angle to keep text readable
                    let textAnchor = 'middle';
                    if (labelAngle > Math.PI / 4 && labelAngle < 3 * Math.PI / 4) {
                      textAnchor = 'start'; // Right side
                    } else if (labelAngle > 5 * Math.PI / 4 && labelAngle < 7 * Math.PI / 4) {
                      textAnchor = 'end'; // Left side
                    }
                  
                    return (
                      <Marker key={neighborhood.id} coordinates={safeCoords}>
                        <g
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onMarkerClick && onMarkerClick(neighborhood);
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <circle
                            r={markerRadius}
                            fill={isSelected ? '#2563EB' : '#10B981'}
                            stroke="#fff"
                            strokeWidth={strokeWidth}
                          >
                            <title>{neighborhood.name} - {neighborhood.location}</title>
                          </circle>
                          {showLabel && (
                            <text
                              x={textOffsetX}
                              y={textOffsetY}
                              textAnchor={textAnchor}
                              style={{
                                fontFamily: 'system-ui',
                                fill: '#1F2937',
                                fontSize: `${textSize}px`,
                                fontWeight: '600',
                                pointerEvents: 'none',
                                textShadow: '0 1px 2px rgba(255,255,255,0.8), 0 -1px 2px rgba(255,255,255,0.8), 1px 0 2px rgba(255,255,255,0.8), -1px 0 2px rgba(255,255,255,0.8)',
                              }}
                            >
                              {neighborhood.name}
                            </text>
                          )}
                        </g>
                      </Marker>
                    );
                  } catch (error) {
                    console.error('Error rendering marker:', error, neighborhood);
                    return null; // Skip this marker if there's an error
                  }
                })}
              </ZoomableGroup>
            );
          } catch (error) {
            console.error('Error rendering map:', error);
            setMapError(true);
            return null;
          }
        })()}
      </ComposableMap>
      
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-xl z-10">
          <div className="text-center">
            <p className="text-red-600 font-medium mb-2">Error loading map data</p>
            <p className="text-gray-500 text-sm">Please refresh the page</p>
          </div>
        </div>
      )}
      {neighborhoods.length === 0 && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-xl z-10">
          <p className="text-gray-500 font-medium">No neighborhoods to display on map</p>
        </div>
      )}
      </div>
    </MapErrorBoundary>
  );
};

export default USMap;
