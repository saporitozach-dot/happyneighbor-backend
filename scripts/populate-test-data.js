/**
 * Populate database with test data for matching algorithm
 * Run this to add sample neighborhoods and surveys so you can test matching
 */

import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { generateMockNeighborhoods, generateMockSurveys, generateMockStreets } from '../test-utils/mockData.js';
import { createTestDatabase, insertTestData } from '../test-utils/dbHelpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use the actual production database
const db = new Database(join(__dirname, '../neighborhoods.db'));

console.log('📊 Populating database with test data...\n');

try {
  // Create tables if they don't exist (same as api-server.js)
  db.exec(`
    CREATE TABLE IF NOT EXISTS neighborhoods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      location TEXT NOT NULL,
      description TEXT,
      latitude REAL,
      longitude REAL,
      bounds_json TEXT,
      school_district TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

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

  // Check if we already have data
  const existingCount = db.prepare('SELECT COUNT(*) as count FROM neighborhoods').get();
  
  if (existingCount.count > 0) {
    console.log(`⚠️  Database already has ${existingCount.count} neighborhoods.`);
    console.log('   Add more test data? (This will add additional neighborhoods)\n');
  }

  // Generate diverse test neighborhoods with different characteristics
  const neighborhoods = [
    {
      name: 'Quiet Family Haven',
      city: 'Boston',
      state: 'MA',
      location: 'Boston, MA',
      description: 'A peaceful, family-friendly neighborhood with excellent schools',
      latitude: 42.3601,
      longitude: -71.0589
    },
    {
      name: 'Social Downtown District',
      city: 'Portland',
      state: 'OR',
      location: 'Portland, OR',
      description: 'Vibrant urban area with active nightlife and regular community events',
      latitude: 45.5152,
      longitude: -122.6784
    },
    {
      name: 'Walkable Community',
      city: 'Seattle',
      state: 'WA',
      location: 'Seattle, WA',
      description: 'Highly walkable neighborhood with great public transit and local shops',
      latitude: 47.6062,
      longitude: -122.3321
    },
    {
      name: 'Suburban Retreat',
      city: 'Austin',
      state: 'TX',
      location: 'Austin, TX',
      description: 'Quiet suburban area perfect for families seeking a peaceful lifestyle',
      latitude: 30.2672,
      longitude: -97.7431
    },
    {
      name: 'Active Social Hub',
      city: 'Denver',
      state: 'CO',
      location: 'Denver, CO',
      description: 'Community-focused neighborhood with regular cookouts and social events',
      latitude: 39.7392,
      longitude: -104.9903
    }
  ];

  // Insert neighborhoods
  const insertNeighborhood = db.prepare(`
    INSERT INTO neighborhoods (name, city, state, location, description, latitude, longitude)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const neighborhoodIds = [];
  for (const neighborhood of neighborhoods) {
    try {
      const result = insertNeighborhood.run(
        neighborhood.name,
        neighborhood.city,
        neighborhood.state,
        neighborhood.location,
        neighborhood.description,
        neighborhood.latitude,
        neighborhood.longitude
      );
      neighborhoodIds.push(result.lastInsertRowid);
      console.log(`✅ Added neighborhood: ${neighborhood.name}`);
    } catch (error) {
      // Neighborhood might already exist, skip
      console.log(`⏭️  Skipped: ${neighborhood.name} (may already exist)`);
    }
  }

  // Generate surveys with matching characteristics for each neighborhood
  const surveyData = [
    // Quiet Family Haven - Very Quiet, Family-Friendly, Walkable
    { neighborhood_id: neighborhoodIds[0], noise_level: 'Very Quiet', sociability: 'Friendly', events: 'Occasional', kids_friendly: 'Very Family-Friendly', walkability: 'Very Walkable', cookouts: 'Regular', nightlife: 'Quiet' },
    { neighborhood_id: neighborhoodIds[0], noise_level: 'Quiet', sociability: 'Social', events: 'Occasional', kids_friendly: 'Family-Friendly', walkability: 'Walkable', cookouts: 'Regular', nightlife: 'None' },
    { neighborhood_id: neighborhoodIds[0], noise_level: 'Very Quiet', sociability: 'Friendly', events: 'Rare', kids_friendly: 'Very Family-Friendly', walkability: 'Very Walkable', cookouts: 'Occasional', nightlife: 'Quiet' },
    
    // Social Downtown District - Lively, Very Social, Active Nightlife
    { neighborhood_id: neighborhoodIds[1], noise_level: 'Lively', sociability: 'Very Social', events: 'Very Active', kids_friendly: 'Some Families', walkability: 'Walkable', cookouts: 'Regular', nightlife: 'Active' },
    { neighborhood_id: neighborhoodIds[1], noise_level: 'Moderate', sociability: 'Very Social', events: 'Regular', kids_friendly: 'Not Family-Friendly', walkability: 'Very Walkable', cookouts: 'Regular', nightlife: 'Active' },
    { neighborhood_id: neighborhoodIds[1], noise_level: 'Lively', sociability: 'Social', events: 'Very Active', kids_friendly: 'Some Families', walkability: 'Walkable', cookouts: 'Very Common', nightlife: 'Active' },
    
    // Walkable Community - Very Walkable, Social, Regular Events
    { neighborhood_id: neighborhoodIds[2], noise_level: 'Moderate', sociability: 'Social', events: 'Regular', kids_friendly: 'Family-Friendly', walkability: 'Very Walkable', cookouts: 'Regular', nightlife: 'Moderate' },
    { neighborhood_id: neighborhoodIds[2], noise_level: 'Quiet', sociability: 'Friendly', events: 'Regular', kids_friendly: 'Family-Friendly', walkability: 'Very Walkable', cookouts: 'Occasional', nightlife: 'Quiet' },
    
    // Suburban Retreat - Very Quiet, Mostly Private, Not Walkable
    { neighborhood_id: neighborhoodIds[3], noise_level: 'Very Quiet', sociability: 'Mostly Private', events: 'Rare', kids_friendly: 'Family-Friendly', walkability: 'Not Walkable', cookouts: 'Occasional', nightlife: 'None' },
    { neighborhood_id: neighborhoodIds[3], noise_level: 'Quiet', sociability: 'Very Private', events: 'Rare', kids_friendly: 'Very Family-Friendly', walkability: 'Somewhat Walkable', cookouts: 'Rare', nightlife: 'None' },
    
    // Active Social Hub - Moderate, Very Social, Regular Cookouts
    { neighborhood_id: neighborhoodIds[4], noise_level: 'Moderate', sociability: 'Very Social', events: 'Regular', kids_friendly: 'Family-Friendly', walkability: 'Walkable', cookouts: 'Very Common', nightlife: 'Moderate' },
    { neighborhood_id: neighborhoodIds[4], noise_level: 'Moderate', sociability: 'Social', events: 'Regular', kids_friendly: 'Family-Friendly', walkability: 'Walkable', cookouts: 'Very Common', nightlife: 'Quiet' },
  ];

  // Insert surveys
  const insertSurvey = db.prepare(`
    INSERT INTO resident_surveys 
    (neighborhood_id, noise_level, sociability, events, kids_friendly, walkability, cookouts, nightlife, address_verified, verification_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 'verified')
  `);

  let surveyCount = 0;
  for (const survey of surveyData) {
    if (survey.neighborhood_id) {
      try {
        insertSurvey.run(
          survey.neighborhood_id,
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
        console.error(`Error inserting survey: ${error.message}`);
      }
    }
  }

  console.log(`\n✅ Added ${surveyCount} surveys`);
  console.log(`\n📊 Database Summary:`);
  const finalCount = db.prepare('SELECT COUNT(*) as count FROM neighborhoods').get();
  const finalSurveyCount = db.prepare('SELECT COUNT(*) as count FROM resident_surveys').get();
  console.log(`   - Neighborhoods: ${finalCount.count}`);
  console.log(`   - Surveys: ${finalSurveyCount.count}`);
  
  console.log(`\n🎉 Test data populated! You can now test the matching algorithm.`);
  console.log(`   Try different preferences in the survey to see different matches!`);

} catch (error) {
  console.error('❌ Error populating database:', error);
  process.exit(1);
} finally {
  db.close();
}





