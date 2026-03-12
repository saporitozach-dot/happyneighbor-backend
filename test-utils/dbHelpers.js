/**
 * Database Test Helpers
 * Utilities for testing database operations locally without external dependencies
 */

import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Create a test database (in-memory or file-based)
 * @param {boolean} inMemory - If true, creates in-memory database (faster, but data is lost on close)
 * @param {string} dbPath - Optional path for file-based test database
 * @returns {Database} SQLite database instance
 */
export function createTestDatabase(inMemory = true, dbPath = null) {
  const db = inMemory 
    ? new Database(':memory:')
    : new Database(dbPath || join(__dirname, '../test-neighborhoods.db'));
  
  // Create all tables (same schema as production)
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

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      linkedin_id TEXT UNIQUE NOT NULL,
      google_id TEXT,
      email TEXT,
      first_name TEXT,
      last_name TEXT,
      full_name TEXT,
      profile_picture TEXT,
      headline TEXT,
      job_title TEXT,
      company TEXT,
      industry TEXT,
      location TEXT,
      profile_url TEXT,
      neighborhood_id INTEGER,
      neighborhood_name TEXT,
      access_token TEXT,
      refresh_token TEXT,
      auth_provider TEXT DEFAULT 'linkedin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME,
      FOREIGN KEY (neighborhood_id) REFERENCES neighborhoods(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS user_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      noise TEXT,
      sociability TEXT,
      events TEXT,
      kids TEXT,
      walkability TEXT,
      cookouts TEXT,
      nightlife TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  
  return db;
}

/**
 * Clear all data from test database (keeps schema)
 */
export function clearTestDatabase(db) {
  db.exec(`
    DELETE FROM resident_surveys;
    DELETE FROM user_preferences;
    DELETE FROM users;
    DELETE FROM streets;
    DELETE FROM neighborhoods;
  `);
}

/**
 * Close test database
 */
export function closeTestDatabase(db) {
  db.close();
}

/**
 * Insert test data into database
 */
export function insertTestData(db, data) {
  const { neighborhoods = [], streets = [], surveys = [], users = [], preferences = [] } = data;
  
  // Insert neighborhoods
  const insertNeighborhood = db.prepare(`
    INSERT INTO neighborhoods (name, city, state, location, description, latitude, longitude, school_district)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const neighborhoodIds = [];
  for (const neighborhood of neighborhoods) {
    const result = insertNeighborhood.run(
      neighborhood.name,
      neighborhood.city,
      neighborhood.state,
      neighborhood.location,
      neighborhood.description || null,
      neighborhood.latitude || null,
      neighborhood.longitude || null,
      neighborhood.school_district || null
    );
    neighborhoodIds.push(result.lastInsertRowid);
  }
  
  // Insert streets
  const insertStreet = db.prepare(`
    INSERT INTO streets (name, neighborhood_id, city, state, full_address, description, latitude, longitude, osm_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const streetIds = [];
  for (let i = 0; i < streets.length; i++) {
    const street = streets[i];
    const neighborhoodId = street.neighborhood_id !== null && street.neighborhood_id !== undefined
      ? street.neighborhood_id
      : (neighborhoodIds.length > 0 ? neighborhoodIds[i % neighborhoodIds.length] : null);
    
    const result = insertStreet.run(
      street.name,
      neighborhoodId,
      street.city,
      street.state,
      street.full_address || null,
      street.description || null,
      street.latitude || null,
      street.longitude || null,
      street.osm_id || null
    );
    streetIds.push(result.lastInsertRowid);
  }
  
  // Insert surveys
  const insertSurvey = db.prepare(`
    INSERT INTO resident_surveys 
    (street_id, neighborhood_id, resident_name, address, submitter_email, noise_level, sociability, 
     events, kids_friendly, walkability, cookouts, nightlife, additional_notes, address_verified, verification_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  for (let i = 0; i < surveys.length; i++) {
    const survey = surveys[i];
    const streetId = survey.street_id !== null && survey.street_id !== undefined
      ? survey.street_id
      : (streetIds.length > 0 ? streetIds[i % streetIds.length] : null);
    const neighborhoodId = survey.neighborhood_id !== null && survey.neighborhood_id !== undefined
      ? survey.neighborhood_id
      : (neighborhoodIds.length > 0 ? neighborhoodIds[Math.floor(i / 2) % neighborhoodIds.length] : null);
    
    insertSurvey.run(
      streetId,
      neighborhoodId,
      survey.resident_name || null,
      survey.address || null,
      survey.submitter_email || null,
      survey.noise_level,
      survey.sociability,
      survey.events,
      survey.kids_friendly,
      survey.walkability,
      survey.cookouts,
      survey.nightlife,
      survey.additional_notes || null,
      survey.address_verified !== undefined ? survey.address_verified : 1,
      survey.verification_status || 'verified'
    );
  }
  
  // Insert users
  const insertUser = db.prepare(`
    INSERT INTO users 
    (linkedin_id, google_id, email, first_name, last_name, full_name, profile_picture, headline, 
     job_title, company, industry, location, profile_url, neighborhood_id, neighborhood_name, auth_provider)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const userIds = [];
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const neighborhoodId = user.neighborhood_id !== null && user.neighborhood_id !== undefined
      ? user.neighborhood_id
      : (neighborhoodIds.length > 0 ? neighborhoodIds[i % neighborhoodIds.length] : null);
    
    const result = insertUser.run(
      user.linkedin_id,
      user.google_id || null,
      user.email || null,
      user.first_name || null,
      user.last_name || null,
      user.full_name || null,
      user.profile_picture || null,
      user.headline || null,
      user.job_title || null,
      user.company || null,
      user.industry || null,
      user.location || null,
      user.profile_url || null,
      neighborhoodId,
      user.neighborhood_name || null,
      user.auth_provider || 'linkedin'
    );
    userIds.push(result.lastInsertRowid);
  }
  
  // Insert preferences
  const insertPreference = db.prepare(`
    INSERT INTO user_preferences (user_id, noise, sociability, events, kids, walkability, cookouts, nightlife)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  for (let i = 0; i < preferences.length; i++) {
    const pref = preferences[i];
    const userId = pref.user_id !== null && pref.user_id !== undefined
      ? pref.user_id
      : (userIds.length > 0 ? userIds[i % userIds.length] : null);
    
    insertPreference.run(
      userId,
      pref.noise || null,
      pref.sociability || null,
      pref.events || null,
      pref.kids || null,
      pref.walkability || null,
      pref.cookouts || null,
      pref.nightlife || null
    );
  }
  
  return {
    neighborhoodIds,
    streetIds,
    userIds
  };
}

/**
 * Get all data from database (for verification)
 */
export function getAllTestData(db) {
  return {
    neighborhoods: db.prepare('SELECT * FROM neighborhoods').all(),
    streets: db.prepare('SELECT * FROM streets').all(),
    surveys: db.prepare('SELECT * FROM resident_surveys').all(),
    users: db.prepare('SELECT * FROM users').all(),
    preferences: db.prepare('SELECT * FROM user_preferences').all()
  };
}

