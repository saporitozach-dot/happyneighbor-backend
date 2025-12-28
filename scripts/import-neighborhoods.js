import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get database path (go up from scripts/ to root)
const dbPath = join(__dirname, '..', 'neighborhoods.db');
const db = new Database(dbPath);

// Rate limiting for API calls (milliseconds between requests)
const API_DELAY = 1000; // 1 second between requests

// OpenStreetMap Nominatim API (free, no key required)
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';

/**
 * Search for neighborhoods using OpenStreetMap Nominatim API
 * This finds real neighborhoods, subdivisions, and places in a city
 */
async function searchOSMNeighborhoods(city, state, limit = 50) {
  // Try multiple search strategies
  const queries = [
    `neighborhood ${city} ${state} USA`,
    `suburb ${city} ${state} USA`,
    `${city} ${state} neighborhood`,
    `${city} ${state} residential`
  ];
  
  let allResults = [];
  
  for (const query of queries) {
    const url = new URL(NOMINATIM_BASE_URL);
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('limit', '50');
    url.searchParams.set('dedupe', '1');
    
    // Be respectful with API rate limiting
    await new Promise(resolve => setTimeout(resolve, API_DELAY));
    
    try {
      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'HappyNeighbor-Import/1.0 (neighborhood-matching-platform)' // Required by Nominatim
        }
      });
      
      if (!response.ok) {
        console.warn(`HTTP error for query "${query}": status ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      
      // Process results
      data.forEach(item => {
        const address = item.address || {};
        const type = item.type || '';
        const category = item.category || '';
        const cityName = address.city || address.town || address.municipality || '';
        
        // Check if it's in our target city
        if (!cityName.toLowerCase().includes(city.toLowerCase())) {
          return;
        }
        
        // Accept various neighborhood-like types
        const isNeighborhood = (
          type === 'neighbourhood' ||
          type === 'suburb' ||
          type === 'quarter' ||
          type === 'residential' ||
          category === 'place' ||
          item.class === 'place' ||
          (address.neighbourhood && cityName.toLowerCase().includes(city.toLowerCase())) ||
          (address.suburb && cityName.toLowerCase().includes(city.toLowerCase()))
        );
        
        if (isNeighborhood) {
          const name = address.neighbourhood || 
                      address.suburb || 
                      address.quarter ||
                      item.name || 
                      item.display_name.split(',')[0] || 
                      'Unknown';
          
          allResults.push({
            name: name.trim(),
            location: `${city}, ${state}`,
            description: `${type || category || 'Area'} in ${city}, ${state}`,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            osmData: item
          });
        }
      });
      
    } catch (error) {
      console.warn(`Error searching OSM for "${query}":`, error.message);
      continue;
    }
  }
  
  // Deduplicate by name
  const unique = new Map();
  allResults.forEach(n => {
    const key = n.name.toLowerCase().trim();
    if (!unique.has(key) && n.name !== 'Unknown' && n.name.length > 1) {
      unique.set(key, n);
    }
  });
  
  return Array.from(unique.values()).slice(0, limit);
}

/**
 * Import neighborhoods from a CSV file
 * Expected CSV format:
 * name,location,description
 * "Riverside Community","Portland, OR","A beautiful neighborhood..."
 */
function importFromCSV(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    return records.map(record => ({
      name: record.name || record.neighborhood || record['Neighborhood Name'],
      location: record.location || record.city || record['City, State'],
      description: record.description || record.desc || record.Description || ''
    }));
  } catch (error) {
    console.error('Error reading CSV file:', error.message);
    return [];
  }
}

/**
 * Import neighborhoods from a JSON file
 * Expected format: [{ name, location, description }, ...]
 */
function importFromJSON(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    if (!Array.isArray(data)) {
      throw new Error('JSON file must contain an array of neighborhoods');
    }
    
    return data.map(item => ({
      name: item.name || item.neighborhood,
      location: item.location || `${item.city}, ${item.state}`,
      description: item.description || item.desc || ''
    }));
  } catch (error) {
    console.error('Error reading JSON file:', error.message);
    return [];
  }
}

/**
 * Add neighborhoods to database
 */
function addNeighborhoods(neighborhoods, skipDuplicates = true) {
  const insert = db.prepare(`
    INSERT INTO neighborhoods (name, location, description, created_at, updated_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `);
  
  const checkExists = db.prepare(`
    SELECT id FROM neighborhoods WHERE name = ? AND location = ?
  `);
  
  let added = 0;
  let skipped = 0;
  
  for (const neighborhood of neighborhoods) {
    if (!neighborhood.name || !neighborhood.location) {
      console.warn('Skipping neighborhood with missing name or location:', neighborhood);
      skipped++;
      continue;
    }
    
    if (skipDuplicates) {
      const existing = checkExists.get(neighborhood.name, neighborhood.location);
      if (existing) {
        skipped++;
        continue;
      }
    }
    
    try {
      insert.run(
        neighborhood.name.trim(),
        neighborhood.location.trim(),
        (neighborhood.description || '').trim()
      );
      added++;
      console.log(`✓ Added: ${neighborhood.name} (${neighborhood.location})`);
    } catch (error) {
      console.error(`✗ Error adding ${neighborhood.name}:`, error.message);
      skipped++;
    }
  }
  
  return { added, skipped };
}

/**
 * Main import function
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    console.log(`
Usage: node scripts/import-neighborhoods.js <command> [options]

Commands:
  csv <file>              Import from CSV file
  json <file>             Import from JSON file
  osm <cities>            Import from OpenStreetMap (provide cities as: "City,State")
  
Examples:
  node scripts/import-neighborhoods.js csv data/neighborhoods.csv
  node scripts/import-neighborhoods.js json data/neighborhoods.json
  node scripts/import-neighborhoods.js osm "Portland,OR" "Seattle,WA" "Austin,TX"
  node scripts/import-neighborhoods.js osm "St. Louis,MO"
    `);
    process.exit(0);
  }
  
  let neighborhoods = [];
  
  if (command === 'csv') {
    const filePath = args[1];
    if (!filePath) {
      console.error('Error: Please provide a CSV file path');
      process.exit(1);
    }
    neighborhoods = importFromCSV(filePath);
    console.log(`Found ${neighborhoods.length} neighborhoods in CSV file`);
    
  } else if (command === 'json') {
    const filePath = args[1];
    if (!filePath) {
      console.error('Error: Please provide a JSON file path');
      process.exit(1);
    }
    neighborhoods = importFromJSON(filePath);
    console.log(`Found ${neighborhoods.length} neighborhoods in JSON file`);
    
  } else if (command === 'osm') {
    const cities = args.slice(1);
    if (cities.length === 0) {
      console.error('Error: Please provide at least one city (format: "City,State")');
      process.exit(1);
    }
    
    console.log(`Searching OpenStreetMap for neighborhoods in ${cities.length} city/cities...`);
    
    for (const cityState of cities) {
      const [city, state] = cityState.split(',').map(s => s.trim());
      if (!city || !state) {
        console.warn(`Invalid format: ${cityState}. Expected "City,State"`);
        continue;
      }
      
      console.log(`\nSearching for neighborhoods in ${city}, ${state}...`);
      const results = await searchOSMNeighborhoods(city, state);
      console.log(`Found ${results.length} neighborhoods in ${city}, ${state}`);
      neighborhoods.push(...results.map(n => ({
        name: n.name,
        location: n.location,
        description: n.description
      })));
      
      // Respect rate limiting
      if (cities.indexOf(cityState) < cities.length - 1) {
        await new Promise(resolve => setTimeout(resolve, API_DELAY));
      }
    }
    
  } else {
    console.error(`Unknown command: ${command}`);
    process.exit(1);
  }
  
  if (neighborhoods.length === 0) {
    console.log('No neighborhoods found to import.');
    process.exit(0);
  }
  
  console.log(`\nImporting ${neighborhoods.length} neighborhoods...`);
  const { added, skipped } = addNeighborhoods(neighborhoods);
  
  console.log(`\n✅ Import complete!`);
  console.log(`   Added: ${added}`);
  console.log(`   Skipped (duplicates): ${skipped}`);
  
  db.close();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || import.meta.url.endsWith(process.argv[1]) || process.argv[1].includes('import-neighborhoods.js')) {
  main().catch(console.error);
} else {
  // Also run if we have command line arguments
  if (process.argv.length > 2) {
    main().catch(console.error);
  }
}

export { searchOSMNeighborhoods, importFromCSV, importFromJSON, addNeighborhoods };
