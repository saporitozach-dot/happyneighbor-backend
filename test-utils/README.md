# Local Testing Utilities

This directory contains utilities for testing your Happy Neighbor application locally without requiring external APIs or internet connectivity.

## Files

### `mockData.js`
Mock data generators for creating test data:
- `generateMockNeighborhood()` - Generate a single mock neighborhood
- `generateMockStreet()` - Generate a single mock street
- `generateMockSurvey()` - Generate a single mock survey
- `generateMockUser()` - Generate a single mock user
- `generateMockPreferences()` - Generate mock user preferences
- `generateMockNeighborhoods(count)` - Generate multiple neighborhoods
- `generateMockStreets(count)` - Generate multiple streets
- `generateMockSurveys(count)` - Generate multiple surveys
- `generateMockUsers(count)` - Generate multiple users
- `generateTestScenario()` - Generate a complete test scenario (neighborhood + streets + surveys)

### `dbHelpers.js`
Database test helpers for working with test databases:
- `createTestDatabase(inMemory, dbPath)` - Create a test database (in-memory or file-based)
- `clearTestDatabase(db)` - Clear all data from test database
- `closeTestDatabase(db)` - Close test database connection
- `insertTestData(db, data)` - Insert test data into database
- `getAllTestData(db)` - Get all data from database for verification

### `apiTestHelpers.js`
API test helpers that simulate API behavior without HTTP requests:
- `testGetNeighborhoods(db)` - Simulate GET /api/neighborhoods
- `testGetNeighborhood(db, id)` - Simulate GET /api/neighborhoods/:id
- `testCreateNeighborhood(db, data)` - Simulate POST /api/neighborhoods
- `testGetStreets(db, filters)` - Simulate GET /api/streets
- `testCreateStreet(db, data)` - Simulate POST /api/streets
- `testCreateSurvey(db, streetId, data)` - Simulate POST /api/streets/:id/surveys
- `testGetMatches(db, preferences)` - Simulate POST /api/matches
- `testCalculateMatchScore(profile, preferences)` - Calculate match score
- `runTestScenario(testFn)` - Run a complete test scenario

## Usage Examples

### Generate Mock Data

```javascript
import { generateMockNeighborhood, generateMockStreets } from './test-utils/mockData.js';

// Generate a single neighborhood
const neighborhood = generateMockNeighborhood({
  name: 'Custom Neighborhood',
  city: 'Boston',
  state: 'MA'
});

// Generate 10 streets
const streets = generateMockStreets(10);
```

### Test Database Operations

```javascript
import { createTestDatabase, insertTestData, closeTestDatabase } from './test-utils/dbHelpers.js';
import { generateMockNeighborhoods, generateMockStreets } from './test-utils/mockData.js';

// Create in-memory test database
const db = createTestDatabase(true);

// Insert test data
const testData = {
  neighborhoods: generateMockNeighborhoods(5),
  streets: generateMockStreets(10),
  surveys: [],
  users: [],
  preferences: []
};

insertTestData(db, testData);

// Test your code here...

// Clean up
closeTestDatabase(db);
```

### Test API Logic

```javascript
import { createTestDatabase } from './test-utils/dbHelpers.js';
import { testGetNeighborhoods, testCreateNeighborhood } from './test-utils/apiTestHelpers.js';

const db = createTestDatabase(true);

// Test getting neighborhoods
const response = await testGetNeighborhoods(db);
const neighborhoods = await response.json();
console.log('Neighborhoods:', neighborhoods);

// Test creating a neighborhood
const newNeighborhood = {
  name: 'Test Neighborhood',
  location: 'Test City, TS',
  description: 'A test neighborhood'
};

const createResponse = await testCreateNeighborhood(db, newNeighborhood);
const created = await createResponse.json();
console.log('Created:', created);
```

## Running Tests

Run the local test script:

```bash
node scripts/test-local.js
```

This will run a suite of tests that verify:
1. Database creation
2. Data insertion
3. API helper functions
4. Match calculation
5. Complete test scenarios

All tests run locally without requiring external APIs or internet connectivity.

## Benefits

- ✅ **No External Dependencies** - Tests run completely offline
- ✅ **Fast** - In-memory databases are very fast
- ✅ **Isolated** - Each test can use a fresh database
- ✅ **Repeatable** - Tests produce consistent results
- ✅ **Safe** - Tests don't affect production data

## Integration with Your Code

You can use these utilities in your development workflow:

1. **Quick Testing** - Test database operations without starting the full server
2. **Unit Testing** - Test individual functions with mock data
3. **Development** - Quickly populate test data for development
4. **Debugging** - Isolate and test specific functionality





