/**
 * Fetch streets from OpenStreetMap for neighborhoods
 * Uses Overpass API to get street data
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, '..', 'neighborhoods.db'));

// Run migrations first
console.log('Running database migrations...');

// Create streets table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS streets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    neighborhood_id INTEGER,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    full_address TEXT,
    description TEXT,
    latitude REAL,
    longitude REAL,
    osm_id TEXT UNIQUE,
    survey_count INTEGER DEFAULT 0,
    avg_noise_score REAL,
    avg_social_score REAL,
    avg_family_score REAL,
    vibe_summary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (neighborhood_id) REFERENCES neighborhoods(id) ON DELETE SET NULL
  );
`);

// Add new columns to neighborhoods if they don't exist
try { db.prepare('ALTER TABLE neighborhoods ADD COLUMN city TEXT').run(); } catch (e) {}
try { db.prepare('ALTER TABLE neighborhoods ADD COLUMN state TEXT').run(); } catch (e) {}
try { db.prepare('ALTER TABLE neighborhoods ADD COLUMN latitude REAL').run(); } catch (e) {}
try { db.prepare('ALTER TABLE neighborhoods ADD COLUMN longitude REAL').run(); } catch (e) {}
try { db.prepare('ALTER TABLE neighborhoods ADD COLUMN bounds_json TEXT').run(); } catch (e) {}

// Add street_id to resident_surveys if it doesn't exist
try { db.prepare('ALTER TABLE resident_surveys ADD COLUMN street_id INTEGER').run(); } catch (e) {}

console.log('Migrations complete!');

// Major cities with their bounding boxes (approximate)
const CITY_BOUNDS = {
  'St. Louis': { state: 'MO', lat: 38.6270, lon: -90.1994, radius: 15 },
  'Boston': { state: 'MA', lat: 42.3601, lon: -71.0589, radius: 12 },
  'Chicago': { state: 'IL', lat: 41.8781, lon: -87.6298, radius: 20 },
  'New York': { state: 'NY', lat: 40.7128, lon: -74.0060, radius: 15 },
  'Los Angeles': { state: 'CA', lat: 34.0522, lon: -118.2437, radius: 25 },
  'San Francisco': { state: 'CA', lat: 37.7749, lon: -122.4194, radius: 10 },
  'Seattle': { state: 'WA', lat: 47.6062, lon: -122.3321, radius: 12 },
  'Austin': { state: 'TX', lat: 30.2672, lon: -97.7431, radius: 15 },
  'Denver': { state: 'CO', lat: 39.7392, lon: -104.9903, radius: 12 },
  'Portland': { state: 'OR', lat: 45.5152, lon: -122.6784, radius: 12 },
};

// Fetch streets from Overpass API for a given area
async function fetchStreetsFromOSM(city, state, lat, lon, radiusKm = 5) {
  const overpassUrl = 'https://overpass-api.de/api/interpreter';
  
  // Overpass QL query to get residential streets
  const query = `
    [out:json][timeout:60];
    (
      way["highway"~"residential|living_street|tertiary"](around:${radiusKm * 1000},${lat},${lon});
    );
    out body;
    >;
    out skel qt;
  `;
  
  console.log(`Fetching streets for ${city}, ${state}...`);
  
  try {
    const response = await fetch(overpassUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extract unique street names
    const streetMap = new Map();
    
    for (const element of data.elements) {
      if (element.type === 'way' && element.tags?.name) {
        const streetName = element.tags.name;
        if (!streetMap.has(streetName)) {
          streetMap.set(streetName, {
            name: streetName,
            osm_id: `way/${element.id}`,
            city: city,
            state: state,
          });
        }
      }
    }
    
    return Array.from(streetMap.values());
  } catch (error) {
    console.error(`Error fetching streets for ${city}: ${error.message}`);
    return [];
  }
}

// Add predefined neighborhoods with their streets
async function populateNeighborhoodsAndStreets() {
  // St. Louis neighborhoods
  const stLouisNeighborhoods = [
    { name: 'Shaw', city: 'St. Louis', state: 'MO', lat: 38.6167, lon: -90.2500 },
    { name: 'Tower Grove South', city: 'St. Louis', state: 'MO', lat: 38.6089, lon: -90.2556 },
    { name: 'Tower Grove East', city: 'St. Louis', state: 'MO', lat: 38.6150, lon: -90.2389 },
    { name: 'The Hill', city: 'St. Louis', state: 'MO', lat: 38.6178, lon: -90.2772 },
    { name: 'Soulard', city: 'St. Louis', state: 'MO', lat: 38.6089, lon: -90.2089 },
    { name: 'Lafayette Square', city: 'St. Louis', state: 'MO', lat: 38.6200, lon: -90.2161 },
    { name: 'Central West End', city: 'St. Louis', state: 'MO', lat: 38.6439, lon: -90.2617 },
    { name: 'Dogtown', city: 'St. Louis', state: 'MO', lat: 38.6217, lon: -90.3017 },
    { name: 'Benton Park', city: 'St. Louis', state: 'MO', lat: 38.5989, lon: -90.2189 },
    { name: 'Fox Park', city: 'St. Louis', state: 'MO', lat: 38.6028, lon: -90.2267 },
  ];
  
  // Boston neighborhoods
  const bostonNeighborhoods = [
    { name: 'Back Bay', city: 'Boston', state: 'MA', lat: 42.3503, lon: -71.0810 },
    { name: 'Beacon Hill', city: 'Boston', state: 'MA', lat: 42.3588, lon: -71.0707 },
    { name: 'South End', city: 'Boston', state: 'MA', lat: 42.3417, lon: -71.0742 },
    { name: 'Jamaica Plain', city: 'Boston', state: 'MA', lat: 42.3097, lon: -71.1151 },
    { name: 'Charlestown', city: 'Boston', state: 'MA', lat: 42.3782, lon: -71.0602 },
    { name: 'South Boston', city: 'Boston', state: 'MA', lat: 42.3381, lon: -71.0476 },
    { name: 'Dorchester', city: 'Boston', state: 'MA', lat: 42.2998, lon: -71.0589 },
    { name: 'Roxbury', city: 'Boston', state: 'MA', lat: 42.3118, lon: -71.0851 },
    { name: 'Allston', city: 'Boston', state: 'MA', lat: 42.3539, lon: -71.1337 },
    { name: 'Brighton', city: 'Boston', state: 'MA', lat: 42.3464, lon: -71.1627 },
  ];
  
  // Suburban neighborhoods
  const suburbanNeighborhoods = [
    { name: 'Clayton', city: 'Clayton', state: 'MO', lat: 38.6426, lon: -90.3240 },
    { name: 'Kirkwood', city: 'Kirkwood', state: 'MO', lat: 38.5834, lon: -90.4068 },
    { name: 'Webster Groves', city: 'Webster Groves', state: 'MO', lat: 38.5926, lon: -90.3574 },
    { name: 'Maplewood', city: 'Maplewood', state: 'MO', lat: 38.6126, lon: -90.3243 },
    { name: 'University City', city: 'University City', state: 'MO', lat: 38.6559, lon: -90.3098 },
    { name: 'Brookline', city: 'Brookline', state: 'MA', lat: 42.3318, lon: -71.1212 },
    { name: 'Cambridge', city: 'Cambridge', state: 'MA', lat: 42.3736, lon: -71.1097 },
    { name: 'Somerville', city: 'Somerville', state: 'MA', lat: 42.3876, lon: -71.0995 },
    { name: 'Newton', city: 'Newton', state: 'MA', lat: 42.3370, lon: -71.2092 },
  ];
  
  const allNeighborhoods = [...stLouisNeighborhoods, ...bostonNeighborhoods, ...suburbanNeighborhoods];
  
  console.log(`\n📍 Populating ${allNeighborhoods.length} neighborhoods...\n`);
  
  // Insert neighborhoods
  const insertNeighborhood = db.prepare(`
    INSERT OR REPLACE INTO neighborhoods (name, city, state, location, latitude, longitude)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const insertStreet = db.prepare(`
    INSERT OR IGNORE INTO streets (name, neighborhood_id, city, state, full_address, osm_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  for (const neighborhood of allNeighborhoods) {
    // Insert neighborhood
    const location = `${neighborhood.city}, ${neighborhood.state}`;
    insertNeighborhood.run(
      neighborhood.name,
      neighborhood.city,
      neighborhood.state,
      location,
      neighborhood.lat,
      neighborhood.lon
    );
    
    // Get the neighborhood ID
    const neighborhoodRecord = db.prepare('SELECT id FROM neighborhoods WHERE name = ? AND city = ?').get(neighborhood.name, neighborhood.city);
    
    if (neighborhoodRecord) {
      console.log(`✓ Added neighborhood: ${neighborhood.name}, ${neighborhood.city}`);
      
      // Fetch streets from OSM
      const streets = await fetchStreetsFromOSM(
        neighborhood.city,
        neighborhood.state,
        neighborhood.lat,
        neighborhood.lon,
        2 // 2km radius for neighborhood streets
      );
      
      console.log(`  Found ${streets.length} streets`);
      
      // Insert streets
      for (const street of streets.slice(0, 50)) { // Limit to 50 streets per neighborhood
        const fullAddress = `${street.name}, ${neighborhood.name}, ${neighborhood.city}, ${neighborhood.state}`;
        insertStreet.run(
          street.name,
          neighborhoodRecord.id,
          neighborhood.city,
          neighborhood.state,
          fullAddress,
          street.osm_id
        );
      }
      
      // Rate limiting - wait between API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Print summary
  const neighborhoodCount = db.prepare('SELECT COUNT(*) as count FROM neighborhoods').get();
  const streetCount = db.prepare('SELECT COUNT(*) as count FROM streets').get();
  
  console.log('\n========================================');
  console.log(`✅ Database populated successfully!`);
  console.log(`   📍 ${neighborhoodCount.count} neighborhoods`);
  console.log(`   🏠 ${streetCount.count} streets`);
  console.log('========================================\n');
}

// Run the script
populateNeighborhoodsAndStreets().catch(console.error);

