import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../neighborhoods.db');
const db = new Database(dbPath);

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch ALL streets for a city using Overpass API
async function fetchAllStreetsForCity(city, state) {
  console.log(`   Fetching streets for ${city}, ${state}...`);
  
  // Clean city name for query
  const cleanCity = city.replace(/'/g, "\\'");
  
  const query = `
    [out:json][timeout:120];
    area["name"="${cleanCity}"]["admin_level"~"[5678]"]->.searchArea;
    (
      way["highway"]["name"](area.searchArea);
    );
    out tags;
  `;
  
  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'HappyNeighbor/1.0 (neighborhood-data-collection)'
      },
      body: `data=${encodeURIComponent(query)}`
    });
    
    if (!response.ok) {
      console.log(`   ⚠️ API returned ${response.status}, trying alternative query...`);
      return await fetchStreetsAlternative(city, state);
    }
    
    const data = await response.json();
    const streets = new Set();
    
    if (data.elements) {
      data.elements.forEach(el => {
        if (el.tags && el.tags.name) {
          const highway = el.tags.highway;
          // Include residential streets, not highways
          if (['residential', 'tertiary', 'secondary', 'primary', 'unclassified', 
               'living_street', 'pedestrian', 'service'].includes(highway)) {
            streets.add(el.tags.name);
          }
        }
      });
    }
    
    return Array.from(streets);
  } catch (error) {
    console.log(`   ⚠️ Error: ${error.message}, trying alternative...`);
    return await fetchStreetsAlternative(city, state);
  }
}

// Alternative method using Nominatim search
async function fetchStreetsAlternative(city, state) {
  try {
    const query = encodeURIComponent(`${city}, ${state}, USA`);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&limit=1`,
      { headers: { 'User-Agent': 'HappyNeighbor/1.0' } }
    );
    
    if (!response.ok) return [];
    
    const data = await response.json();
    if (data.length === 0) return [];
    
    const { lat, lon } = data[0];
    
    // Search for streets near this location
    const streetQuery = `
      [out:json][timeout:60];
      (
        way["highway"]["name"](around:5000,${lat},${lon});
      );
      out tags;
    `;
    
    const streetResponse = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'HappyNeighbor/1.0'
      },
      body: `data=${encodeURIComponent(streetQuery)}`
    });
    
    if (!streetResponse.ok) return [];
    
    const streetData = await streetResponse.json();
    const streets = new Set();
    
    if (streetData.elements) {
      streetData.elements.forEach(el => {
        if (el.tags && el.tags.name) {
          const highway = el.tags.highway;
          if (['residential', 'tertiary', 'secondary', 'primary', 'unclassified',
               'living_street', 'pedestrian'].includes(highway)) {
            streets.add(el.tags.name);
          }
        }
      });
    }
    
    return Array.from(streets);
  } catch (error) {
    return [];
  }
}

async function importAllStreets() {
  console.log('🏘️  COMPREHENSIVE STREET IMPORT');
  console.log('================================\n');
  
  // Get unique cities from neighborhoods
  const cities = db.prepare(`
    SELECT DISTINCT city, state, 
           GROUP_CONCAT(id) as neighborhood_ids,
           COUNT(*) as neighborhood_count
    FROM neighborhoods 
    WHERE city IS NOT NULL 
    GROUP BY city, state
    ORDER BY neighborhood_count DESC
  `).all();
  
  console.log(`Found ${cities.length} unique cities to process\n`);
  
  const insertStreet = db.prepare(`
    INSERT OR IGNORE INTO streets (neighborhood_id, name, city, state)
    VALUES (?, ?, ?, ?)
  `);
  
  let totalAdded = 0;
  let citiesProcessed = 0;
  
  for (const cityRow of cities) {
    citiesProcessed++;
    const { city, state, neighborhood_ids } = cityRow;
    const ids = neighborhood_ids.split(',').map(Number);
    
    console.log(`\n[${citiesProcessed}/${cities.length}] 📍 ${city}, ${state || 'Unknown'}`);
    console.log(`   Neighborhoods: ${ids.length}`);
    
    // Check if we already have streets for this city
    const existingCount = db.prepare(
      'SELECT COUNT(*) as count FROM streets WHERE city = ?'
    ).get(city);
    
    if (existingCount.count > 100) {
      console.log(`   ✓ Already has ${existingCount.count} streets, skipping fetch`);
      continue;
    }
    
    // Fetch streets for this city
    const streets = await fetchAllStreetsForCity(city, state || '');
    console.log(`   Found ${streets.length} streets`);
    
    if (streets.length === 0) {
      console.log(`   ⚠️ No streets found, will try again later`);
      await delay(1000);
      continue;
    }
    
    // Add streets to ALL neighborhoods in this city
    let added = 0;
    for (const neighborhoodId of ids) {
      for (const streetName of streets) {
        try {
          const result = insertStreet.run(neighborhoodId, streetName, city, state || '');
          if (result.changes > 0) added++;
        } catch (e) {
          // Ignore duplicates
        }
      }
    }
    
    console.log(`   ✅ Added ${added} street entries`);
    totalAdded += added;
    
    // Rate limiting - be nice to the API
    await delay(2000);
  }
  
  // Final summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 FINAL SUMMARY');
  console.log('='.repeat(50));
  
  const finalStats = db.prepare(`
    SELECT 
      (SELECT COUNT(*) FROM neighborhoods WHERE city IS NOT NULL) as neighborhoods,
      (SELECT COUNT(DISTINCT neighborhood_id) FROM streets) as with_streets,
      (SELECT COUNT(*) FROM streets) as total_streets,
      (SELECT COUNT(DISTINCT city) FROM streets) as cities_covered
  `).get();
  
  console.log(`\n📍 Neighborhoods: ${finalStats.neighborhoods}`);
  console.log(`✅ With streets: ${finalStats.with_streets}`);
  console.log(`🛣️  Total streets: ${finalStats.total_streets}`);
  console.log(`🏙️  Cities covered: ${finalStats.cities_covered}`);
  console.log(`➕ New entries added: ${totalAdded}`);
  
  // Show top cities
  console.log('\n📈 Top cities by street count:');
  const topCities = db.prepare(`
    SELECT city, COUNT(DISTINCT name) as streets
    FROM streets
    GROUP BY city
    ORDER BY streets DESC
    LIMIT 15
  `).all();
  
  topCities.forEach(c => {
    console.log(`   ${c.city}: ${c.streets} streets`);
  });
}

importAllStreets().catch(console.error);


