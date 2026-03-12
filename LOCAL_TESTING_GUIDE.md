# Local Testing Guide

This guide explains how to use the local testing utilities that work completely offline without requiring external APIs or internet connectivity.

## Quick Start

Run all local tests:
```bash
npm run test:local
```

Or directly:
```bash
node scripts/test-local.js
```

## What Was Created

### 1. Mock Data Generators (`test-utils/mockData.js`)
Generate realistic test data for:
- Neighborhoods
- Streets
- Surveys
- Users
- User Preferences

**Example:**
```javascript
import { generateMockNeighborhood, generateMockStreets } from './test-utils/mockData.js';

const neighborhood = generateMockNeighborhood({ name: 'Custom Name', city: 'Boston' });
const streets = generateMockStreets(10); // Generate 10 streets
```

### 2. Database Test Helpers (`test-utils/dbHelpers.js`)
Work with test databases (in-memory or file-based):
- Create test databases
- Insert test data
- Clear test data
- Query test data

**Example:**
```javascript
import { createTestDatabase, insertTestData, closeTestDatabase } from './test-utils/dbHelpers.js';

const db = createTestDatabase(true); // In-memory (fast!)
// ... use database ...
closeTestDatabase(db);
```

### 3. API Test Helpers (`test-utils/apiTestHelpers.js`)
Test API logic without HTTP requests:
- Get neighborhoods
- Create neighborhoods
- Get/create streets
- Create surveys
- Calculate match scores
- Get matches

**Example:**
```javascript
import { testGetNeighborhoods, testCreateNeighborhood } from './test-utils/apiTestHelpers.js';

const response = await testGetNeighborhoods(db);
const neighborhoods = await response.json();
```

## Use Cases

### 1. Quick Development Testing
Test database operations without starting the full server:
```javascript
import { createTestDatabase } from './test-utils/dbHelpers.js';
import { generateMockNeighborhoods } from './test-utils/mockData.js';

const db = createTestDatabase(true);
const neighborhoods = generateMockNeighborhoods(5);
// Test your code here...
```

### 2. Unit Testing
Test individual functions with mock data:
```javascript
import { testCalculateMatchScore } from './test-utils/apiTestHelpers.js';

const score = testCalculateMatchScore(neighborhoodProfile, preferences);
console.log('Match score:', score);
```

### 3. Data Generation
Quickly populate test data for development:
```javascript
import { generateTestScenario } from './test-utils/mockData.js';
import { createTestDatabase, insertTestData } from './test-utils/dbHelpers.js';

const db = createTestDatabase(true);
const scenario = generateTestScenario();
insertTestData(db, {
  neighborhoods: [scenario.neighborhood],
  streets: scenario.streets,
  surveys: scenario.surveys
});
```

## Test Results

When you run `npm run test:local`, you'll see:
- ✅ Database creation test
- ✅ Data insertion test
- ✅ API helper tests (get/create operations)
- ✅ Match calculation test
- ✅ Complete scenario test

All tests run in-memory, so they're fast and don't affect your production database.

## Benefits

- **No Internet Required** - All tests run completely offline
- **Fast** - In-memory databases are very fast
- **Isolated** - Each test uses a fresh database
- **Safe** - Tests don't affect production data
- **Repeatable** - Tests produce consistent results

## Next Steps

1. **Run the tests** to verify everything works:
   ```bash
   npm run test:local
   ```

2. **Explore the test utilities** in the `test-utils/` directory

3. **Use in your development** - Import and use these utilities in your code

4. **Extend as needed** - Add more test utilities as your project grows

## Files Created

- `test-utils/mockData.js` - Mock data generators
- `test-utils/dbHelpers.js` - Database test helpers
- `test-utils/apiTestHelpers.js` - API test helpers
- `test-utils/README.md` - Detailed documentation
- `scripts/test-local.js` - Test runner script
- `LOCAL_TESTING_GUIDE.md` - This file

All utilities are ready to use and fully tested! 🎉





