/**
 * Populate database with test STREETS for matching algorithm
 * Run this to add sample streets and surveys so you can test matching
 */

import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use the actual production database
const db = new Database(join(__dirname, '../neighborhoods.db'));

console.log('📊 Populating database with test STREETS...\n');

try {
  // Create tables if they don't exist (same as api-server.js)
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
      osm_id TEXT,
      survey_count INTEGER DEFAULT 0,
      avg_noise_score REAL,
      avg_social_score REAL,
      avg_family_score REAL,
      vibe_summary TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (neighborhood_id) REFERENCES neighborhoods(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS resident_surveys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      street_id INTEGER,
      neighborhood_id INTEGER,
      resident_name TEXT,
      address TEXT,
      submitter_email TEXT,
      noise_level TEXT,
      sociability TEXT,
      events TEXT,
      kids_friendly TEXT,
      walkability TEXT,
      cookouts TEXT,
      nightlife TEXT,
      additional_notes TEXT,
      address_verified INTEGER DEFAULT 0,
      verification_status TEXT DEFAULT 'pending',
      verification_type TEXT,
      verification_document TEXT,
      verified_at DATETIME,
      verification_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (street_id) REFERENCES streets(id) ON DELETE SET NULL,
      FOREIGN KEY (neighborhood_id) REFERENCES neighborhoods(id) ON DELETE SET NULL
    );
  `);

  // Generate diverse test streets with different characteristics
  const streets = [
    {
      name: 'Maple Avenue',
      city: 'Boston',
      state: 'MA',
      full_address: 'Maple Avenue, Boston, MA',
      latitude: 42.3601,
      longitude: -71.0589
    },
    {
      name: 'Oak Street',
      city: 'Portland',
      state: 'OR',
      full_address: 'Oak Street, Portland, OR',
      latitude: 45.5152,
      longitude: -122.6784
    },
    {
      name: 'Park Boulevard',
      city: 'Seattle',
      state: 'WA',
      full_address: 'Park Boulevard, Seattle, WA',
      latitude: 47.6062,
      longitude: -122.3321
    },
    {
      name: 'Elm Drive',
      city: 'Austin',
      state: 'TX',
      full_address: 'Elm Drive, Austin, TX',
      latitude: 30.2672,
      longitude: -97.7431
    },
    {
      name: 'Main Street',
      city: 'Denver',
      state: 'CO',
      full_address: 'Main Street, Denver, CO',
      latitude: 39.7392,
      longitude: -104.9903
    },
    {
      name: 'Cedar Lane',
      city: 'Boston',
      state: 'MA',
      full_address: 'Cedar Lane, Boston, MA',
      latitude: 42.3601,
      longitude: -71.0589
    },
    {
      name: 'Pine Avenue',
      city: 'Portland',
      state: 'OR',
      full_address: 'Pine Avenue, Portland, OR',
      latitude: 45.5152,
      longitude: -122.6784
    },
    {
      name: 'First Street',
      city: 'Seattle',
      state: 'WA',
      full_address: 'First Street, Seattle, WA',
      latitude: 47.6062,
      longitude: -122.3321
    }
  ];

  // Insert streets
  const insertStreet = db.prepare(`
    INSERT OR IGNORE INTO streets (name, city, state, full_address, latitude, longitude)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const streetIds = [];
  for (const street of streets) {
    try {
      const result = insertStreet.run(
        street.name,
        street.city,
        street.state,
        street.full_address,
        street.latitude,
        street.longitude
      );
      
      // Get the street ID (either from insert or existing)
      const existingStreet = db.prepare('SELECT id FROM streets WHERE name = ? AND city = ? AND state = ?')
        .get(street.name, street.city, street.state);
      
      if (existingStreet) {
        streetIds.push(existingStreet.id);
        console.log(`✅ Street exists: ${street.name}, ${street.city}`);
      } else if (result.lastInsertRowid) {
        streetIds.push(result.lastInsertRowid);
        console.log(`✅ Added street: ${street.name}, ${street.city}`);
      }
    } catch (error) {
      console.error(`Error with street ${street.name}:`, error.message);
    }
  }

  // Generate surveys with matching characteristics for each street
  const surveyData = [
    // Maple Avenue - Very Quiet, Family-Friendly, Walkable
    { street_id: streetIds[0], noise_level: 'Very Quiet', sociability: 'Friendly', events: 'Occasional', kids_friendly: 'Very Family-Friendly', walkability: 'Very Walkable', cookouts: 'Regular', nightlife: 'Quiet' },
    { street_id: streetIds[0], noise_level: 'Quiet', sociability: 'Social', events: 'Occasional', kids_friendly: 'Family-Friendly', walkability: 'Walkable', cookouts: 'Regular', nightlife: 'None' },
    { street_id: streetIds[0], noise_level: 'Very Quiet', sociability: 'Friendly', events: 'Rare', kids_friendly: 'Very Family-Friendly', walkability: 'Very Walkable', cookouts: 'Occasional', nightlife: 'Quiet' },
    
    // Oak Street - Lively, Very Social, Active Nightlife
    { street_id: streetIds[1], noise_level: 'Lively', sociability: 'Very Social', events: 'Very Active', kids_friendly: 'Some Families', walkability: 'Walkable', cookouts: 'Regular', nightlife: 'Active' },
    { street_id: streetIds[1], noise_level: 'Moderate', sociability: 'Very Social', events: 'Regular', kids_friendly: 'Not Family-Friendly', walkability: 'Very Walkable', cookouts: 'Regular', nightlife: 'Active' },
    { street_id: streetIds[1], noise_level: 'Lively', sociability: 'Social', events: 'Very Active', kids_friendly: 'Some Families', walkability: 'Walkable', cookouts: 'Very Common', nightlife: 'Active' },
    
    // Park Boulevard - Very Walkable, Social, Regular Events
    { street_id: streetIds[2], noise_level: 'Moderate', sociability: 'Social', events: 'Regular', kids_friendly: 'Family-Friendly', walkability: 'Very Walkable', cookouts: 'Regular', nightlife: 'Moderate' },
    { street_id: streetIds[2], noise_level: 'Quiet', sociability: 'Friendly', events: 'Regular', kids_friendly: 'Family-Friendly', walkability: 'Very Walkable', cookouts: 'Occasional', nightlife: 'Quiet' },
    
    // Elm Drive - Very Quiet, Mostly Private, Not Walkable
    { street_id: streetIds[3], noise_level: 'Very Quiet', sociability: 'Mostly Private', events: 'Rare', kids_friendly: 'Family-Friendly', walkability: 'Not Walkable', cookouts: 'Occasional', nightlife: 'None' },
    { street_id: streetIds[3], noise_level: 'Quiet', sociability: 'Very Private', events: 'Rare', kids_friendly: 'Very Family-Friendly', walkability: 'Somewhat Walkable', cookouts: 'Rare', nightlife: 'None' },
    
    // Main Street - Moderate, Very Social, Regular Cookouts
    { street_id: streetIds[4], noise_level: 'Moderate', sociability: 'Very Social', events: 'Regular', kids_friendly: 'Family-Friendly', walkability: 'Walkable', cookouts: 'Very Common', nightlife: 'Moderate' },
    { street_id: streetIds[4], noise_level: 'Moderate', sociability: 'Social', events: 'Regular', kids_friendly: 'Family-Friendly', walkability: 'Walkable', cookouts: 'Very Common', nightlife: 'Quiet' },
    
    // Cedar Lane - Quiet, Friendly, Walkable
    { street_id: streetIds[5], noise_level: 'Quiet', sociability: 'Friendly', events: 'Occasional', kids_friendly: 'Family-Friendly', walkability: 'Walkable', cookouts: 'Regular', nightlife: 'Quiet' },
    
    // Pine Avenue - Moderate, Social, Active
    { street_id: streetIds[6], noise_level: 'Moderate', sociability: 'Social', events: 'Regular', kids_friendly: 'Some Families', walkability: 'Walkable', cookouts: 'Regular', nightlife: 'Moderate' },
    
    // First Street - Lively, Very Social, Active
    { street_id: streetIds[7], noise_level: 'Lively', sociability: 'Very Social', events: 'Very Active', kids_friendly: 'Not Family-Friendly', walkability: 'Very Walkable', cookouts: 'Regular', nightlife: 'Active' },
  ];

  // Insert surveys
  const insertSurvey = db.prepare(`
    INSERT INTO resident_surveys 
    (street_id, noise_level, sociability, events, kids_friendly, walkability, cookouts, nightlife, address_verified, verification_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 'verified')
  `);

  let surveyCount = 0;
  for (const survey of surveyData) {
    if (survey.street_id) {
      try {
        insertSurvey.run(
          survey.street_id,
          survey.noise_level,
          survey.sociability,
          survey.events,
          survey.kids_friendly,
          survey.walkability,
          survey.cookouts,
          survey.nightlife
        );
        surveyCount++;
      } catch (error) {
        console.error(`Error inserting survey for street ${survey.street_id}: ${error.message}`);
      }
    }
  }

  // Update street aggregates
  const updateStreetAggregates = db.prepare(`
    UPDATE streets 
    SET survey_count = (
      SELECT COUNT(*) FROM resident_surveys 
      WHERE street_id = streets.id AND verification_status = 'verified'
    )
    WHERE id = ?
  `);

  for (const streetId of streetIds) {
    updateStreetAggregates.run(streetId);
  }

  console.log(`\n✅ Added ${surveyCount} surveys`);
  console.log(`\n📊 Database Summary:`);
  const finalStreetCount = db.prepare('SELECT COUNT(*) as count FROM streets').get();
  const finalSurveyCount = db.prepare("SELECT COUNT(*) as count FROM resident_surveys WHERE verification_status = 'verified'").get();
  console.log(`   - Streets: ${finalStreetCount.count}`);
  console.log(`   - Verified Surveys: ${finalSurveyCount.count}`);
  
  console.log(`\n🎉 Test streets populated! You can now test the matching algorithm.`);
  console.log(`   Try different preferences in the survey to see different street matches!`);

} catch (error) {
  console.error('❌ Error populating database:', error);
  process.exit(1);
} finally {
  db.close();
}

