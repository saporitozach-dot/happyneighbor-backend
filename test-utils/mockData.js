/**
 * Local Mock Data Generators for Testing
 * These generate test data without requiring external APIs or internet
 */

// Mock neighborhood data generator
export function generateMockNeighborhood(overrides = {}) {
  const cities = ['Boston', 'Portland', 'Seattle', 'Austin', 'Denver', 'Chicago', 'New York', 'San Francisco'];
  const states = ['MA', 'OR', 'WA', 'TX', 'CO', 'IL', 'NY', 'CA'];
  const neighborhoods = ['Riverside', 'Downtown', 'Parkview', 'Hillside', 'Oakwood', 'Maple Heights', 'Sunset', 'Greenwood'];
  
  const randomCity = cities[Math.floor(Math.random() * cities.length)];
  const randomState = states[Math.floor(Math.random() * states.length)];
  const randomNeighborhood = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
  
  return {
    name: overrides.name || `${randomNeighborhood} Community`,
    city: overrides.city || randomCity,
    state: overrides.state || randomState,
    location: overrides.location || `${randomCity}, ${randomState}`,
    description: overrides.description || `A vibrant ${randomNeighborhood.toLowerCase()} community in ${randomCity}`,
    latitude: overrides.latitude || (40 + Math.random() * 10),
    longitude: overrides.longitude || (-100 + Math.random() * 20),
    school_district: overrides.school_district || `${randomCity} School District`,
    ...overrides
  };
}

// Mock street data generator
export function generateMockStreet(overrides = {}) {
  const streetNames = ['Main St', 'Oak Ave', 'Elm Dr', 'Park Blvd', 'Maple Ln', 'Cedar Rd', 'Pine St', 'First Ave'];
  const streetTypes = ['St', 'Ave', 'Dr', 'Blvd', 'Ln', 'Rd', 'Ct', 'Pl'];
  const cities = ['Boston', 'Portland', 'Seattle', 'Austin'];
  const states = ['MA', 'OR', 'WA', 'TX'];
  
  const randomStreet = streetNames[Math.floor(Math.random() * streetNames.length)];
  const randomCity = cities[Math.floor(Math.random() * cities.length)];
  const randomState = states[Math.floor(Math.random() * states.length)];
  
  return {
    name: overrides.name || randomStreet,
    city: overrides.city || randomCity,
    state: overrides.state || randomState,
    full_address: overrides.full_address || `123 ${randomStreet}, ${randomCity}, ${randomState}`,
    neighborhood_id: overrides.neighborhood_id || null,
    latitude: overrides.latitude || (40 + Math.random() * 10),
    longitude: overrides.longitude || (-100 + Math.random() * 20),
    description: overrides.description || null,
    osm_id: overrides.osm_id || `osm_${Math.random().toString(36).substr(2, 9)}`,
    survey_count: overrides.survey_count || 0,
    avg_noise_score: overrides.avg_noise_score || null,
    avg_social_score: overrides.avg_social_score || null,
    avg_family_score: overrides.avg_family_score || null,
    vibe_summary: overrides.vibe_summary || null,
    ...overrides
  };
}

// Mock survey data generator
export function generateMockSurvey(overrides = {}) {
  const noiseLevels = ['Very Quiet', 'Quiet', 'Moderate', 'Lively'];
  const sociabilityLevels = ['Very Private', 'Mostly Private', 'Friendly', 'Social', 'Very Social'];
  const eventLevels = ['Rare', 'Occasional', 'Regular', 'Very Active'];
  const kidsLevels = ['Not Family-Friendly', 'Some Families', 'Family-Friendly', 'Very Family-Friendly'];
  const walkabilityLevels = ['Not Walkable', 'Somewhat Walkable', 'Walkable', 'Very Walkable'];
  const cookoutLevels = ['Rare', 'Occasional', 'Regular', 'Very Common'];
  const nightlifeLevels = ['None', 'Quiet', 'Moderate', 'Active'];
  
  const names = ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Emily Chen', 'David Brown', 'Lisa Wilson'];
  const addresses = ['123 Main St', '456 Oak Ave', '789 Elm Dr', '321 Park Blvd'];
  
  return {
    resident_name: overrides.resident_name || names[Math.floor(Math.random() * names.length)],
    address: overrides.address || addresses[Math.floor(Math.random() * addresses.length)],
    street_id: overrides.street_id || null,
    neighborhood_id: overrides.neighborhood_id || null,
    noise_level: overrides.noise_level || noiseLevels[Math.floor(Math.random() * noiseLevels.length)],
    sociability: overrides.sociability || sociabilityLevels[Math.floor(Math.random() * sociabilityLevels.length)],
    events: overrides.events || eventLevels[Math.floor(Math.random() * eventLevels.length)],
    kids_friendly: overrides.kids_friendly || kidsLevels[Math.floor(Math.random() * kidsLevels.length)],
    walkability: overrides.walkability || walkabilityLevels[Math.floor(Math.random() * walkabilityLevels.length)],
    cookouts: overrides.cookouts || cookoutLevels[Math.floor(Math.random() * cookoutLevels.length)],
    nightlife: overrides.nightlife || nightlifeLevels[Math.floor(Math.random() * nightlifeLevels.length)],
    additional_notes: overrides.additional_notes || null,
    address_verified: overrides.address_verified !== undefined ? overrides.address_verified : 1,
    verification_status: overrides.verification_status || 'verified',
    submitter_email: overrides.submitter_email || null,
    ...overrides
  };
}

// Mock user data generator
export function generateMockUser(overrides = {}) {
  const firstNames = ['John', 'Sarah', 'Mike', 'Emily', 'David', 'Lisa', 'Chris', 'Jessica'];
  const lastNames = ['Smith', 'Johnson', 'Davis', 'Chen', 'Brown', 'Wilson', 'Taylor', 'Martinez'];
  const companies = ['Tech Corp', 'Design Studio', 'Consulting Group', 'Marketing Agency'];
  const industries = ['Technology', 'Design', 'Consulting', 'Marketing', 'Finance', 'Healthcare'];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return {
    linkedin_id: overrides.linkedin_id || `linkedin_${Math.random().toString(36).substr(2, 9)}`,
    google_id: overrides.google_id || null,
    email: overrides.email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    first_name: overrides.first_name || firstName,
    last_name: overrides.last_name || lastName,
    full_name: overrides.full_name || `${firstName} ${lastName}`,
    profile_picture: overrides.profile_picture || `https://i.pravatar.cc/150?u=${firstName}`,
    headline: overrides.headline || `Senior Developer at ${companies[Math.floor(Math.random() * companies.length)]}`,
    job_title: overrides.job_title || 'Software Engineer',
    company: overrides.company || companies[Math.floor(Math.random() * companies.length)],
    industry: overrides.industry || industries[Math.floor(Math.random() * industries.length)],
    location: overrides.location || 'Boston, MA',
    profile_url: overrides.profile_url || `https://linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}`,
    neighborhood_id: overrides.neighborhood_id || null,
    neighborhood_name: overrides.neighborhood_name || null,
    auth_provider: overrides.auth_provider || 'linkedin',
    ...overrides
  };
}

// Mock user preferences generator
export function generateMockPreferences(overrides = {}) {
  const noiseOptions = ['Very Quiet', 'Quiet', 'Moderate', 'Lively'];
  const sociabilityOptions = ['Very Private', 'Mostly Private', 'Friendly', 'Social', 'Very Social'];
  const eventOptions = ['Rare', 'Occasional', 'Regular', 'Very Active'];
  const kidsOptions = ['Not Important', 'Somewhat Important', 'Important', 'Very Important'];
  const walkabilityOptions = ['Not Important', 'Somewhat Important', 'Important', 'Very Important'];
  const cookoutOptions = ['Rare', 'Occasional', 'Regular', 'Very Common'];
  const nightlifeOptions = ['None', 'Quiet', 'Moderate', 'Active'];
  
  return {
    noise: overrides.noise || noiseOptions[Math.floor(Math.random() * noiseOptions.length)],
    sociability: overrides.sociability || sociabilityOptions[Math.floor(Math.random() * sociabilityOptions.length)],
    events: overrides.events || eventOptions[Math.floor(Math.random() * eventOptions.length)],
    kids: overrides.kids || kidsOptions[Math.floor(Math.random() * kidsOptions.length)],
    walkability: overrides.walkability || walkabilityOptions[Math.floor(Math.random() * walkabilityOptions.length)],
    cookouts: overrides.cookouts || cookoutOptions[Math.floor(Math.random() * cookoutOptions.length)],
    nightlife: overrides.nightlife || nightlifeOptions[Math.floor(Math.random() * nightlifeOptions.length)],
    ...overrides
  };
}

// Generate multiple mock items
export function generateMockNeighborhoods(count = 5) {
  return Array.from({ length: count }, () => generateMockNeighborhood());
}

export function generateMockStreets(count = 10) {
  return Array.from({ length: count }, () => generateMockStreet());
}

export function generateMockSurveys(count = 5) {
  return Array.from({ length: count }, () => generateMockSurvey());
}

export function generateMockUsers(count = 5) {
  return Array.from({ length: count }, () => generateMockUser());
}

// Generate a complete test scenario (neighborhood with streets and surveys)
export function generateTestScenario() {
  const neighborhood = generateMockNeighborhood();
  const streets = generateMockStreets(3).map(street => ({
    ...street,
    city: neighborhood.city,
    state: neighborhood.state,
    neighborhood_id: null // Will be set when inserted
  }));
  
  const surveys = [];
  streets.forEach((street, idx) => {
    const streetSurveys = generateMockSurveys(2).map(survey => ({
      ...survey,
      street_id: null, // Will be set when inserted
      neighborhood_id: null
    }));
    surveys.push(...streetSurveys);
  });
  
  return {
    neighborhood,
    streets,
    surveys
  };
}





