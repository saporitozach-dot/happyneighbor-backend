/**
 * Local API Test Helpers
 * Utilities for testing API logic without making actual HTTP requests
 * These work with the database directly, simulating API behavior
 */

import { createTestDatabase, insertTestData, clearTestDatabase } from './dbHelpers.js';
import { generateMockNeighborhood, generateMockStreet, generateMockSurvey, generateMockUser, generateMockPreferences } from './mockData.js';

/**
 * Simulate API response structure
 */
export function createApiResponse(data, status = 200) {
  return {
    status,
    json: async () => data,
    ok: status >= 200 && status < 300
  };
}

/**
 * Test helper: Get all neighborhoods (simulates GET /api/neighborhoods)
 */
export function testGetNeighborhoods(db) {
  try {
    const neighborhoods = db.prepare('SELECT * FROM neighborhoods ORDER BY name').all();
    
    // Simulate aggregation (simplified version)
    const neighborhoodsWithSurveys = neighborhoods.map(neighborhood => {
      const surveyCount = db.prepare('SELECT COUNT(*) as count FROM resident_surveys WHERE neighborhood_id = ?')
        .get(neighborhood.id);
      return {
        ...neighborhood,
        survey_count: surveyCount?.count || 0
      };
    });
    
    return createApiResponse(neighborhoodsWithSurveys);
  } catch (error) {
    return createApiResponse({ error: error.message }, 500);
  }
}

/**
 * Test helper: Get single neighborhood (simulates GET /api/neighborhoods/:id)
 */
export function testGetNeighborhood(db, id) {
  try {
    const neighborhood = db.prepare('SELECT * FROM neighborhoods WHERE id = ?').get(id);
    if (!neighborhood) {
      return createApiResponse({ error: 'Neighborhood not found' }, 404);
    }
    
    const surveys = db.prepare('SELECT * FROM resident_surveys WHERE neighborhood_id = ? ORDER BY created_at DESC')
      .all(id);
    
    return createApiResponse({
      ...neighborhood,
      surveys,
      survey_count: surveys.length
    });
  } catch (error) {
    return createApiResponse({ error: error.message }, 500);
  }
}

/**
 * Test helper: Create neighborhood (simulates POST /api/neighborhoods)
 */
export function testCreateNeighborhood(db, data) {
  try {
    const { name, location, description, school_district, city, state } = data;
    
    if (!name || !location) {
      return createApiResponse({ error: 'Name and location are required' }, 400);
    }
    
    // Parse city and state from location if not provided
    let parsedCity = city;
    let parsedState = state;
    if (!parsedCity || !parsedState) {
      const locationParts = location.split(',').map(s => s.trim());
      if (locationParts.length >= 2) {
        parsedCity = parsedCity || locationParts[0];
        parsedState = parsedState || locationParts[1];
      } else {
        parsedCity = parsedCity || 'Unknown';
        parsedState = parsedState || 'XX';
      }
    }
    
    const stmt = db.prepare(`
      INSERT INTO neighborhoods (name, city, state, location, description, school_district)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(name, parsedCity, parsedState, location, description || null, school_district || null);
    const neighborhood = db.prepare('SELECT * FROM neighborhoods WHERE id = ?').get(result.lastInsertRowid);
    
    return createApiResponse(neighborhood, 201);
  } catch (error) {
    return createApiResponse({ error: error.message }, 500);
  }
}

/**
 * Test helper: Get all streets (simulates GET /api/streets)
 */
export function testGetStreets(db, filters = {}) {
  try {
    const { neighborhood_id, city, state } = filters;
    let query = 'SELECT s.*, n.name as neighborhood_name FROM streets s LEFT JOIN neighborhoods n ON s.neighborhood_id = n.id';
    const params = [];
    const conditions = [];
    
    if (neighborhood_id) {
      conditions.push('s.neighborhood_id = ?');
      params.push(neighborhood_id);
    }
    if (city) {
      conditions.push('s.city LIKE ?');
      params.push(`%${city}%`);
    }
    if (state) {
      conditions.push('s.state = ?');
      params.push(state);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY s.name';
    
    const streets = db.prepare(query).all(...params);
    return createApiResponse(streets);
  } catch (error) {
    return createApiResponse({ error: error.message }, 500);
  }
}

/**
 * Test helper: Create street (simulates POST /api/streets)
 */
export function testCreateStreet(db, data) {
  try {
    const { name, neighborhood_id, city, state, full_address, description, latitude, longitude, osm_id } = data;
    
    if (!name || !city || !state) {
      return createApiResponse({ error: 'Name, city, and state are required' }, 400);
    }
    
    const stmt = db.prepare(`
      INSERT INTO streets (name, neighborhood_id, city, state, full_address, description, latitude, longitude, osm_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      name,
      neighborhood_id || null,
      city,
      state,
      full_address || null,
      description || null,
      latitude || null,
      longitude || null,
      osm_id || null
    );
    
    const street = db.prepare('SELECT * FROM streets WHERE id = ?').get(result.lastInsertRowid);
    return createApiResponse(street, 201);
  } catch (error) {
    return createApiResponse({ error: error.message }, 500);
  }
}

/**
 * Test helper: Create survey (simulates POST /api/streets/:id/surveys)
 */
export function testCreateSurvey(db, streetId, data) {
  try {
    const street = db.prepare('SELECT * FROM streets WHERE id = ?').get(streetId);
    if (!street) {
      return createApiResponse({ error: 'Street not found' }, 404);
    }
    
    const {
      resident_name,
      address,
      email,
      noise_level,
      sociability,
      events,
      kids_friendly,
      walkability,
      cookouts,
      nightlife,
      additional_notes
    } = data;
    
    const neighborhoodId = street.neighborhood_id;
    
    const stmt = db.prepare(`
      INSERT INTO resident_surveys 
      (street_id, neighborhood_id, resident_name, address, submitter_email, noise_level, sociability, events, 
       kids_friendly, walkability, cookouts, nightlife, additional_notes, address_verified, verification_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'pending')
    `);
    
    const result = stmt.run(
      streetId,
      neighborhoodId,
      resident_name || null,
      address || null,
      email || null,
      noise_level,
      sociability,
      events,
      kids_friendly,
      walkability,
      cookouts,
      nightlife,
      additional_notes || null
    );
    
    const survey = db.prepare('SELECT * FROM resident_surveys WHERE id = ?').get(result.lastInsertRowid);
    
    return createApiResponse({
      success: true,
      survey,
      surveyId: survey.id,
      requiresDocumentVerification: true,
      message: 'Survey saved! Please upload proof of residency to complete verification.'
    }, 201);
  } catch (error) {
    return createApiResponse({ error: error.message }, 500);
  }
}

/**
 * Test helper: Calculate match score (simulates POST /api/matches logic)
 */
export function testCalculateMatchScore(neighborhoodProfile, preferences) {
  let score = 0;
  let totalCriteria = 0;

  const fieldMapping = {
    noise: 'noise_level',
    sociability: 'sociability',
    events: 'events',
    kids_friendly: 'kids_friendly',
    walkability: 'walkability',
    cookouts: 'cookouts',
    nightlife: 'nightlife'
  };
  
  Object.keys(fieldMapping).forEach(prefKey => {
    const dbKey = fieldMapping[prefKey];
    if (preferences[prefKey] && neighborhoodProfile[dbKey]) {
      totalCriteria++;
      const pref = preferences[prefKey].toLowerCase();
      const neigh = neighborhoodProfile[dbKey].toLowerCase();
      
      // Exact match
      if (pref === neigh) {
        score += 100;
      } 
      // Partial match
      else if (
        (pref.includes('very') && neigh.includes('very')) ||
        (pref.includes('quiet') && neigh.includes('quiet')) ||
        (pref.includes('social') && neigh.includes('social'))
      ) {
        score += 80;
      } 
      // Somewhat related
      else if (
        (pref.includes('moderate') && neigh.includes('moderate')) ||
        (pref.includes('somewhat') && neigh.includes('somewhat'))
      ) {
        score += 60;
      }
      // Default partial score
      else {
        score += 40;
      }
    }
  });

  return totalCriteria > 0 ? Math.round(score / totalCriteria) : 0;
}

/**
 * Test helper: Get matches (simulates POST /api/matches)
 */
export function testGetMatches(db, preferences) {
  try {
    const matches = [];
    
    // Get neighborhoods with surveys
    const neighborhoods = db.prepare('SELECT * FROM neighborhoods ORDER BY name').all();
    neighborhoods.forEach(neighborhood => {
      const surveys = db.prepare('SELECT * FROM resident_surveys WHERE neighborhood_id = ?').all(neighborhood.id);
      
      if (surveys.length > 0) {
        // Aggregate survey data (simplified)
        const profile = {};
        ['noise_level', 'sociability', 'events', 'kids_friendly', 'walkability', 'cookouts', 'nightlife'].forEach(field => {
          const values = surveys.map(s => s[field]).filter(v => v);
          if (values.length > 0) {
            const counts = {};
            values.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
            let maxCount = 0;
            let mostCommon = null;
            Object.keys(counts).forEach(key => {
              if (counts[key] > maxCount) {
                maxCount = counts[key];
                mostCommon = key;
              }
            });
            profile[field] = mostCommon;
          }
        });
        
        const matchScore = testCalculateMatchScore(profile, preferences);
        
        matches.push({
          id: neighborhood.id,
          name: neighborhood.name,
          city: neighborhood.city,
          state: neighborhood.state,
          location: neighborhood.location,
          type: 'neighborhood',
          ...profile,
          matchScore,
          survey_count: surveys.length
        });
      }
    });
    
    // Sort by match score
    const sortedMatches = matches
      .filter(match => match.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);
    
    return createApiResponse(sortedMatches);
  } catch (error) {
    return createApiResponse({ error: error.message }, 500);
  }
}

/**
 * Run a complete test scenario
 */
export async function runTestScenario(testFn) {
  const db = createTestDatabase(true); // In-memory database
  
  try {
    // Set up test data
    const testData = {
      neighborhoods: [generateMockNeighborhood(), generateMockNeighborhood()],
      streets: [generateMockStreet(), generateMockStreet()],
      surveys: [generateMockSurvey(), generateMockSurvey()],
      users: [generateMockUser()],
      preferences: [generateMockPreferences()]
    };
    
    insertTestData(db, testData);
    
    // Run test function
    await testFn(db);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    closeTestDatabase(db);
  }
}

