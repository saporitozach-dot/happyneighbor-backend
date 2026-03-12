/**
 * Local Testing Script
 * Run this to test your code locally without external APIs
 * Usage: node scripts/test-local.js
 */

import { createTestDatabase, insertTestData, getAllTestData, clearTestDatabase, closeTestDatabase } from '../test-utils/dbHelpers.js';
import { 
  generateMockNeighborhoods, 
  generateMockStreets, 
  generateMockSurveys,
  generateMockUsers,
  generateMockPreferences,
  generateTestScenario
} from '../test-utils/mockData.js';
import {
  testGetNeighborhoods,
  testGetNeighborhood,
  testCreateNeighborhood,
  testGetStreets,
  testCreateStreet,
  testCreateSurvey,
  testGetMatches,
  testCalculateMatchScore
} from '../test-utils/apiTestHelpers.js';

console.log('🧪 Starting Local Tests...\n');

// Test 1: Database Creation
console.log('Test 1: Database Creation');
try {
  const db = createTestDatabase(true); // In-memory
  console.log('✅ Database created successfully');
  closeTestDatabase(db);
} catch (error) {
  console.error('❌ Database creation failed:', error.message);
  process.exit(1);
}

// Test 2: Insert Test Data
console.log('\nTest 2: Insert Test Data');
try {
  const db = createTestDatabase(true);
  const testData = {
    neighborhoods: generateMockNeighborhoods(3),
    streets: generateMockStreets(5),
    surveys: generateMockSurveys(10),
    users: generateMockUsers(2),
    preferences: generateMockPreferences()
  };
  
  const ids = insertTestData(db, testData);
  console.log(`✅ Inserted ${ids.neighborhoodIds.length} neighborhoods`);
  console.log(`✅ Inserted ${ids.streetIds.length} streets`);
  console.log(`✅ Inserted ${ids.userIds.length} users`);
  
  const allData = getAllTestData(db);
  console.log(`✅ Verified: ${allData.neighborhoods.length} neighborhoods in DB`);
  console.log(`✅ Verified: ${allData.streets.length} streets in DB`);
  console.log(`✅ Verified: ${allData.surveys.length} surveys in DB`);
  
  closeTestDatabase(db);
} catch (error) {
  console.error('❌ Data insertion failed:', error.message);
  process.exit(1);
}

// Test 3: API Helpers - Get Neighborhoods
console.log('\nTest 3: API Helper - Get Neighborhoods');
try {
  const db = createTestDatabase(true);
  const testData = {
    neighborhoods: generateMockNeighborhoods(3),
    streets: [],
    surveys: [],
    users: [],
    preferences: []
  };
  insertTestData(db, testData);
  
  const response = await testGetNeighborhoods(db);
  const data = await response.json();
  
  if (response.ok && data.length === 3) {
    console.log('✅ Get neighborhoods works correctly');
  } else {
    throw new Error('Unexpected response');
  }
  
  closeTestDatabase(db);
} catch (error) {
  console.error('❌ Get neighborhoods test failed:', error.message);
  process.exit(1);
}

// Test 4: API Helpers - Create Neighborhood
console.log('\nTest 4: API Helper - Create Neighborhood');
try {
  const db = createTestDatabase(true);
  
  const newNeighborhood = {
    name: 'Test Neighborhood',
    location: 'Test City, TS',
    description: 'A test neighborhood'
  };
  
  const response = await testCreateNeighborhood(db, newNeighborhood);
  const data = await response.json();
  
  if (response.ok && data.name === 'Test Neighborhood') {
    console.log('✅ Create neighborhood works correctly');
  } else {
    throw new Error('Unexpected response');
  }
  
  closeTestDatabase(db);
} catch (error) {
  console.error('❌ Create neighborhood test failed:', error.message);
  process.exit(1);
}

// Test 5: API Helpers - Create Street
console.log('\nTest 5: API Helper - Create Street');
try {
  const db = createTestDatabase(true);
  
  const newStreet = {
    name: 'Test Street',
    city: 'Test City',
    state: 'TS',
    full_address: '123 Test Street, Test City, TS'
  };
  
  const response = await testCreateStreet(db, newStreet);
  const data = await response.json();
  
  if (response.ok && data.name === 'Test Street') {
    console.log('✅ Create street works correctly');
  } else {
    throw new Error('Unexpected response');
  }
  
  closeTestDatabase(db);
} catch (error) {
  console.error('❌ Create street test failed:', error.message);
  process.exit(1);
}

// Test 6: API Helpers - Create Survey
console.log('\nTest 6: API Helper - Create Survey');
try {
  const db = createTestDatabase(true);
  
  // Create a street first
  const streetData = {
    name: 'Survey Test Street',
    city: 'Test City',
    state: 'TS'
  };
  const streetResponse = await testCreateStreet(db, streetData);
  const street = await streetResponse.json();
  
  // Create a survey
  const surveyData = {
    resident_name: 'Test Resident',
    address: '123 Test St',
    noise_level: 'Quiet',
    sociability: 'Friendly',
    events: 'Occasional',
    kids_friendly: 'Family-Friendly',
    walkability: 'Walkable',
    cookouts: 'Regular',
    nightlife: 'Quiet'
  };
  
  const response = await testCreateSurvey(db, street.id, surveyData);
  const data = await response.json();
  
  if (response.ok && data.success && data.survey) {
    console.log('✅ Create survey works correctly');
  } else {
    throw new Error('Unexpected response');
  }
  
  closeTestDatabase(db);
} catch (error) {
  console.error('❌ Create survey test failed:', error.message);
  process.exit(1);
}

// Test 7: Match Calculation
console.log('\nTest 7: Match Score Calculation');
try {
  const neighborhoodProfile = {
    noise_level: 'Quiet',
    sociability: 'Friendly',
    events: 'Occasional',
    kids_friendly: 'Family-Friendly',
    walkability: 'Walkable',
    cookouts: 'Regular',
    nightlife: 'Quiet'
  };
  
  const preferences = {
    noise: 'Quiet',
    sociability: 'Friendly',
    events: 'Occasional',
    kids_friendly: 'Family-Friendly',
    walkability: 'Walkable',
    cookouts: 'Regular',
    nightlife: 'Quiet'
  };
  
  const score = testCalculateMatchScore(neighborhoodProfile, preferences);
  
  if (score > 0 && score <= 100) {
    console.log(`✅ Match score calculation works (score: ${score})`);
  } else {
    throw new Error('Invalid match score');
  }
} catch (error) {
  console.error('❌ Match calculation test failed:', error.message);
  process.exit(1);
}

// Test 8: Get Matches
console.log('\nTest 8: Get Matches');
try {
  const db = createTestDatabase(true);
  
  // Create test scenario
  const scenario = generateTestScenario();
  const testData = {
    neighborhoods: [scenario.neighborhood],
    streets: scenario.streets,
    surveys: scenario.surveys,
    users: [],
    preferences: []
  };
  insertTestData(db, testData);
  
  const preferences = generateMockPreferences();
  const response = await testGetMatches(db, preferences);
  const matches = await response.json();
  
  if (response.ok && Array.isArray(matches)) {
    console.log(`✅ Get matches works correctly (found ${matches.length} matches)`);
  } else {
    throw new Error('Unexpected response');
  }
  
  closeTestDatabase(db);
} catch (error) {
  console.error('❌ Get matches test failed:', error.message);
  process.exit(1);
}

// Test 9: Complete Test Scenario
console.log('\nTest 9: Complete Test Scenario');
try {
  const db = createTestDatabase(true);
  const scenario = generateTestScenario();
  
  const testData = {
    neighborhoods: [scenario.neighborhood],
    streets: scenario.streets,
    surveys: scenario.surveys,
    users: generateMockUsers(2),
    preferences: [generateMockPreferences()]
  };
  
  insertTestData(db, testData);
  
  const allData = getAllTestData(db);
  console.log(`✅ Complete scenario created:`);
  console.log(`   - ${allData.neighborhoods.length} neighborhood(s)`);
  console.log(`   - ${allData.streets.length} street(s)`);
  console.log(`   - ${allData.surveys.length} survey(s)`);
  console.log(`   - ${allData.users.length} user(s)`);
  
  closeTestDatabase(db);
} catch (error) {
  console.error('❌ Complete scenario test failed:', error.message);
  process.exit(1);
}

console.log('\n✅ All local tests passed!');
console.log('\n💡 You can use these test utilities in your code:');
console.log('   - test-utils/mockData.js - Generate mock data');
console.log('   - test-utils/dbHelpers.js - Database test helpers');
console.log('   - test-utils/apiTestHelpers.js - API test helpers');





