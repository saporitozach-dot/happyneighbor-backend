import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import passport from 'passport';
import linkedinOAuth2Module from 'passport-linkedin-oauth2';
import googleOAuth2Module from 'passport-google-oauth20';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import multer from 'multer';

// Fix for ES module import - passport-linkedin-oauth2 exports differently in ES modules
const LinkedInStrategy = linkedinOAuth2Module.default?.Strategy || linkedinOAuth2Module.Strategy || linkedinOAuth2Module;
const GoogleStrategy = googleOAuth2Module.default?.Strategy || googleOAuth2Module.Strategy || googleOAuth2Module;

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://frabjous-kangaroo-1ef6be.netlify.app';
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5173', 'https://frabjous-kangaroo-1ef6be.netlify.app'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'happy-neighbor-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// ============== FILE UPLOAD SETUP ==============
// Create uploads directory if it doesn't exist
const uploadsDir = join(__dirname, 'uploads', 'verifications');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically (for admin review)
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Configure multer for verification document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename: surveyId-timestamp-originalname
    const surveyId = req.params.surveyId || 'unknown';
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${surveyId}-${timestamp}-${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload an image (JPEG, PNG, GIF, WebP) or PDF.'));
    }
  }
});

// Initialize database
const db = new Database(join(__dirname, 'neighborhoods.db'));

// Create tables if they don't exist
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
    noise_level TEXT,
    sociability TEXT,
    events TEXT,
    kids_friendly TEXT,
    walkability TEXT,
    cookouts TEXT,
    nightlife TEXT,
    additional_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (street_id) REFERENCES streets(id) ON DELETE SET NULL,
    FOREIGN KEY (neighborhood_id) REFERENCES neighborhoods(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    linkedin_id TEXT UNIQUE NOT NULL,
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

// Add neighborhood columns to existing users table if they don't exist
try {
  db.prepare('ALTER TABLE users ADD COLUMN neighborhood_id INTEGER').run();
} catch (e) {
  // Column already exists, ignore
}
try {
  db.prepare('ALTER TABLE users ADD COLUMN neighborhood_name TEXT').run();
} catch (e) {
  // Column already exists, ignore
}

// Add school_district column to neighborhoods table if it doesn't exist
try {
  db.prepare('ALTER TABLE neighborhoods ADD COLUMN school_district TEXT').run();
} catch (e) {
  // Column already exists, ignore
}

// Add address column to resident_surveys table if it doesn't exist
try {
  db.prepare('ALTER TABLE resident_surveys ADD COLUMN address TEXT').run();
} catch (e) {
  // Column already exists, ignore
}

// Add address_verified column to resident_surveys table if it doesn't exist
try {
  db.prepare('ALTER TABLE resident_surveys ADD COLUMN address_verified INTEGER DEFAULT 0').run();
} catch (e) {
  // Column already exists, ignore
}

// Add google_id column to users table for Google OAuth
try {
  db.prepare('ALTER TABLE users ADD COLUMN google_id TEXT').run();
} catch (e) {
  // Column already exists, ignore
}

// Add auth_provider column to users table
try {
  db.prepare('ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT "linkedin"').run();
} catch (e) {
  // Column already exists, ignore
}

// Add new columns to neighborhoods table
try {
  db.prepare('ALTER TABLE neighborhoods ADD COLUMN city TEXT').run();
} catch (e) {}
try {
  db.prepare('ALTER TABLE neighborhoods ADD COLUMN state TEXT').run();
} catch (e) {}
try {
  db.prepare('ALTER TABLE neighborhoods ADD COLUMN latitude REAL').run();
} catch (e) {}
try {
  db.prepare('ALTER TABLE neighborhoods ADD COLUMN longitude REAL').run();
} catch (e) {}
try {
  db.prepare('ALTER TABLE neighborhoods ADD COLUMN bounds_json TEXT').run();
} catch (e) {}

// Add street_id to resident_surveys
try {
  db.prepare('ALTER TABLE resident_surveys ADD COLUMN street_id INTEGER').run();
} catch (e) {}

// Fix: Ensure neighborhood_id can be NULL (recreate if needed)
try {
  // Check if any surveys exist without neighborhood_id being nullable
  const tableInfo = db.prepare("PRAGMA table_info(resident_surveys)").all();
  const neighborhoodCol = tableInfo.find(col => col.name === 'neighborhood_id');
  if (neighborhoodCol && neighborhoodCol.notnull === 1) {
    console.log('Fixing neighborhood_id constraint...');
    // SQLite doesn't support ALTER COLUMN, so we work around it
    db.exec(`
      CREATE TABLE IF NOT EXISTS resident_surveys_new (
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
      INSERT OR IGNORE INTO resident_surveys_new SELECT 
        id, street_id, neighborhood_id, resident_name, address, 
        NULL as submitter_email, noise_level, sociability, events, kids_friendly, 
        walkability, cookouts, nightlife, additional_notes, address_verified,
        'pending' as verification_status, NULL as verification_type, 
        NULL as verification_document, NULL as verified_at, NULL as verification_notes,
        created_at
      FROM resident_surveys;
      DROP TABLE resident_surveys;
      ALTER TABLE resident_surveys_new RENAME TO resident_surveys;
    `);
    console.log('Fixed neighborhood_id constraint!');
  }
} catch (e) {
  console.log('Table migration note:', e.message);
}

// ============== VERIFICATION SYSTEM COLUMNS ==============
// Add verification status columns to resident_surveys
try {
  db.prepare('ALTER TABLE resident_surveys ADD COLUMN verification_status TEXT DEFAULT "pending"').run();
} catch (e) {}
try {
  db.prepare('ALTER TABLE resident_surveys ADD COLUMN verification_type TEXT').run();
} catch (e) {}
try {
  db.prepare('ALTER TABLE resident_surveys ADD COLUMN verification_document TEXT').run();
} catch (e) {}
try {
  db.prepare('ALTER TABLE resident_surveys ADD COLUMN verified_at DATETIME').run();
} catch (e) {}
try {
  db.prepare('ALTER TABLE resident_surveys ADD COLUMN verification_notes TEXT').run();
} catch (e) {}
try {
  db.prepare('ALTER TABLE resident_surveys ADD COLUMN submitter_email TEXT').run();
} catch (e) {}

// Make linkedin_id nullable for Google users (SQLite doesn't support this directly, so we handle it in code)
try {
  // Add foreign key constraint if it doesn't exist (SQLite doesn't support ALTER TABLE ADD CONSTRAINT)
  // This is handled in the table definition above
} catch (e) {
  // Ignore
}

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  try {
    const user = db.prepare('SELECT id, email, first_name, last_name, full_name, profile_picture, headline, job_title, company FROM users WHERE id = ?').get(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// LinkedIn OAuth Strategy
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
  passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: process.env.LINKEDIN_CALLBACK_URL || "http://localhost:3001/auth/linkedin/callback",
    scope: ['openid', 'profile', 'email'],
    state: true
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // With OpenID Connect, profile structure is different
      // If profile is empty, manually fetch using access token
      let profileData = profile;
      
      // Always try to fetch from OpenID Connect endpoint since package may fail
      // The access token should work with the new endpoint
      try {
        const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        });
        
        if (profileResponse.ok) {
          const fetchedData = await profileResponse.json();
          // Merge fetched data with profile data (fetched data takes precedence)
          profileData = { ...profileData, ...fetchedData };
        } else {
          const errorText = await profileResponse.text();
          console.error('LinkedIn profile API error:', profileResponse.status, errorText);
        }
      } catch (fetchError) {
        console.error('Error fetching profile from LinkedIn OpenID endpoint:', fetchError.message);
        // Continue with profile data we have (might be empty, but we'll handle it)
      }
      
      // Extract profile data (OpenID Connect format)
      const linkedinId = profileData?.sub || profileData?.id || null;
      const email = profileData?.email || (profileData?.emails && profileData.emails[0] ? profileData.emails[0].value : null);
      const firstName = profileData?.given_name || profileData?.name?.givenName || null;
      const lastName = profileData?.family_name || profileData?.name?.familyName || null;
      const fullName = profileData?.name || profileData?.displayName || `${firstName} ${lastName}`.trim();
      const profilePicture = profileData?.picture || (profileData?.photos && profileData.photos[0] ? profileData.photos[0].value : null);
      const headline = profileData?.headline || null;
      
      // Get additional profile data if available
      const jobTitle = profileData?.job_title || null;
      const company = profileData?.company || null;
      const industry = profileData?.industry || null;
      const location = profileData?.locale || profileData?.location || null;
      const profileUrl = profileData?.profileUrl || profileData?.profile_url || (linkedinId ? `https://www.linkedin.com/in/${linkedinId}` : null);

      // Check if user exists
      let user = db.prepare('SELECT * FROM users WHERE linkedin_id = ?').get(linkedinId);

      if (user) {
        // Update existing user
        db.prepare(`
          UPDATE users 
          SET email = ?, first_name = ?, last_name = ?, full_name = ?, 
              profile_picture = ?, headline = ?, profile_url = ?,
              access_token = ?, refresh_token = ?, 
              last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(email, firstName, lastName, fullName, profilePicture, headline, profileUrl, accessToken, refreshToken, user.id);
        
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
      } else {
        // Create new user
        const result = db.prepare(`
          INSERT INTO users (linkedin_id, email, first_name, last_name, full_name, 
                           profile_picture, headline, job_title, company, industry, 
                           location, profile_url, access_token, refresh_token, last_login)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).run(linkedinId, email, firstName, lastName, fullName, profilePicture, headline, 
                jobTitle, company, industry, location, profileUrl, accessToken, refreshToken);
        
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
  ));
} else {
  console.warn('⚠️  LinkedIn OAuth credentials not set. Please set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in .env file');
}

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3001/auth/google/callback",
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const googleId = profile.id;
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      const firstName = profile.name?.givenName || null;
      const lastName = profile.name?.familyName || null;
      const fullName = profile.displayName || `${firstName} ${lastName}`.trim();
      const profilePicture = profile.photos && profile.photos[0] ? profile.photos[0].value : null;

      // Check if user exists by google_id or email
      let user = db.prepare('SELECT * FROM users WHERE google_id = ?').get(googleId);
      
      // Also check by email in case they previously signed up with LinkedIn
      if (!user && email) {
        user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (user) {
          // Link Google account to existing user
          db.prepare('UPDATE users SET google_id = ?, auth_provider = ? WHERE id = ?').run(googleId, 'google', user.id);
        }
      }

      if (user) {
        // Update existing user
        db.prepare(`
          UPDATE users 
          SET email = ?, first_name = ?, last_name = ?, full_name = ?, 
              profile_picture = ?, google_id = ?, auth_provider = ?,
              access_token = ?, refresh_token = ?, 
              last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(email, firstName, lastName, fullName, profilePicture, googleId, 'google', accessToken, refreshToken || null, user.id);
        
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
      } else {
        // Create new user with Google
        const result = db.prepare(`
          INSERT INTO users (google_id, linkedin_id, email, first_name, last_name, full_name, 
                           profile_picture, auth_provider, access_token, refresh_token, last_login)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).run(googleId, 'google-' + googleId, email, firstName, lastName, fullName, profilePicture, 'google', accessToken, refreshToken || null);
        
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
      }

      return done(null, user);
    } catch (error) {
      console.error('Google OAuth error:', error);
      return done(error, null);
    }
  }
  ));
} else {
  console.warn('⚠️  Google OAuth credentials not set. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env file');
}

// Helper function to aggregate survey responses into neighborhood profile
function aggregateSurveys(neighborhoodId) {
  const surveys = db.prepare('SELECT * FROM resident_surveys WHERE neighborhood_id = ?').all(neighborhoodId);
  
  if (surveys.length === 0) {
    return null;
  }

  const criteria = ['noise_level', 'sociability', 'events', 'kids_friendly', 'walkability', 'cookouts', 'nightlife'];
  const aggregated = {};

  criteria.forEach(criterion => {
    const values = surveys.map(s => s[criterion]).filter(v => v);
    if (values.length > 0) {
      // Count occurrences of each value
      const counts = {};
      values.forEach(v => {
        counts[v] = (counts[v] || 0) + 1;
      });
      
      // Find the most common value (mode)
      let maxCount = 0;
      let mostCommon = null;
      Object.keys(counts).forEach(key => {
        if (counts[key] > maxCount) {
          maxCount = counts[key];
          mostCommon = key;
        }
      });
      
      aggregated[criterion] = mostCommon;
    }
  });

  return {
    ...aggregated,
    survey_count: surveys.length
  };
}

// Helper function to calculate match score
function calculateMatchScore(neighborhoodProfile, preferences) {
  let score = 0;
  let totalCriteria = 0;

  const fieldMapping = {
    noise: 'noise_level',
    sociability: 'sociability',
    events: 'events',
    kids: 'kids_friendly',
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
      // Partial match (similar meanings)
      else if (
        (pref.includes('very') && neigh.includes('very')) ||
        (pref.includes('quiet') && neigh.includes('quiet')) ||
        (pref.includes('social') && neigh.includes('social')) ||
        (pref.includes('active') && neigh.includes('active')) ||
        (pref.includes('important') && neigh.includes('important'))
      ) {
        score += 80;
      } 
      // Somewhat related
      else if (
        (pref.includes('moderate') && neigh.includes('moderate')) ||
        (pref.includes('somewhat') && neigh.includes('somewhat')) ||
        (pref.includes('occasional') && neigh.includes('occasional'))
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

// Authentication Routes

// LinkedIn OAuth Routes
app.get('/auth/linkedin',
  passport.authenticate('linkedin', { state: true })
);

// Custom callback handler to manually fetch profile since package fails with OpenID Connect
app.get('/auth/linkedin/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.redirect(`${FRONTEND_URL}/login?error=no_code`);
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.LINKEDIN_CALLBACK_URL || 'http://localhost:3001/auth/linkedin/callback',
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', tokenResponse.status, errorText);
      return res.redirect(`${FRONTEND_URL}/login?error=token_exchange_failed`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return res.redirect(`${FRONTEND_URL}/login?error=no_access_token`);
    }

    // Fetch user profile from OpenID Connect endpoint
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error('Profile fetch failed:', profileResponse.status, errorText);
      return res.redirect(`${FRONTEND_URL}/login?error=profile_fetch_failed`);
    }

    const profileData = await profileResponse.json();

    // Extract profile data (OpenID Connect format)
    const linkedinId = profileData?.sub || profileData?.id || null;
    const email = profileData?.email || null;
    const firstName = profileData?.given_name || null;
    const lastName = profileData?.family_name || null;
    const fullName = profileData?.name || `${firstName} ${lastName}`.trim() || email || 'LinkedIn User';
    const profilePicture = profileData?.picture || null;
    const profileUrl = profileData?.profile || null;

    if (!linkedinId) {
      console.error('No LinkedIn ID in profile:', profileData);
      return res.redirect(`${FRONTEND_URL}/login?error=no_linkedin_id`);
    }

    // Check if user exists
    let user = db.prepare('SELECT * FROM users WHERE linkedin_id = ?').get(linkedinId);

    if (user) {
      // Update existing user
      db.prepare(`
        UPDATE users 
        SET email = ?, first_name = ?, last_name = ?, full_name = ?, 
            profile_picture = ?, profile_url = ?,
            access_token = ?, refresh_token = ?,
            last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(email, firstName, lastName, fullName, profilePicture, profileUrl, 
              accessToken, tokenData.refresh_token || null, user.id);
      
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
    } else {
      // Create new user
      const result = db.prepare(`
        INSERT INTO users (linkedin_id, email, first_name, last_name, full_name, 
                         profile_picture, profile_url, access_token, refresh_token, last_login)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).run(linkedinId, email, firstName, lastName, fullName, profilePicture, 
              profileUrl, accessToken, tokenData.refresh_token || null);
      
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    }

    // Log user in
    req.login(user, (err) => {
      if (err) {
        console.error('Session login error:', err);
        return res.redirect(`${FRONTEND_URL}/login?error=session_failed`);
      }
      res.redirect(`${FRONTEND_URL}/profile?login=success`);
    });

  } catch (error) {
    console.error('LinkedIn callback error:', error);
    res.redirect(`${FRONTEND_URL}/login?error=callback_error`);
  }
});

// Google OAuth Routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/login?error=google_failed` }),
  (req, res) => {
    // Successful authentication
    res.redirect(`${FRONTEND_URL}/profile?login=success`);
  }
);

// Get current user
app.get('/api/auth/me', (req, res) => {
  if (req.user) {
    // Remove sensitive data
    const { access_token, refresh_token, ...safeUser } = req.user;
    res.json(safeUser);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Session destruction failed' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });
});

// Save user preferences
app.post('/api/user/preferences', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { noise, sociability, events, kids, walkability, cookouts, nightlife } = req.body;
    
    // Check if preferences exist
    const existing = db.prepare('SELECT * FROM user_preferences WHERE user_id = ?').get(req.user.id);
    
    if (existing) {
      // Update
      db.prepare(`
        UPDATE user_preferences 
        SET noise = ?, sociability = ?, events = ?, kids = ?, 
            walkability = ?, cookouts = ?, nightlife = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(noise, sociability, events, kids, walkability, cookouts, nightlife, req.user.id);
    } else {
      // Insert
      db.prepare(`
        INSERT INTO user_preferences (user_id, noise, sociability, events, kids, walkability, cookouts, nightlife)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(req.user.id, noise, sociability, events, kids, walkability, cookouts, nightlife);
    }
    
    const preferences = db.prepare('SELECT * FROM user_preferences WHERE user_id = ?').get(req.user.id);
    res.json(preferences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user preferences
app.get('/api/user/preferences', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const preferences = db.prepare('SELECT * FROM user_preferences WHERE user_id = ?').get(req.user.id);
    res.json(preferences || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user profile with preferences
app.get('/api/user/profile', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const user = db.prepare('SELECT id, email, first_name, last_name, full_name, profile_picture, headline, job_title, company, industry, location, profile_url, neighborhood_id, neighborhood_name, created_at, last_login FROM users WHERE id = ?').get(req.user.id);
    const preferences = db.prepare('SELECT * FROM user_preferences WHERE user_id = ?').get(req.user.id);
    const neighborhood = user.neighborhood_id ? db.prepare('SELECT * FROM neighborhoods WHERE id = ?').get(user.neighborhood_id) : null;
    
    res.json({
      ...user,
      preferences: preferences || null,
      neighborhood: neighborhood || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user's neighborhood
app.put('/api/user/neighborhood', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { neighborhood_id, neighborhood_name } = req.body;
    
    db.prepare(`
      UPDATE users 
      SET neighborhood_id = ?, neighborhood_name = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(neighborhood_id || null, neighborhood_name || null, req.user.id);
    
    const user = db.prepare('SELECT id, neighborhood_id, neighborhood_name FROM users WHERE id = ?').get(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get LinkedIn connections (requires additional permission: r_network)
app.get('/api/user/connections', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const user = db.prepare('SELECT access_token FROM users WHERE id = ?').get(req.user.id);
    
    if (!user || !user.access_token) {
      return res.status(400).json({ error: 'No access token available. Please re-authenticate.' });
    }

    // Fetch connections from LinkedIn API
    // Note: This requires the r_network permission in your LinkedIn app
    const connectionsResponse = await fetch('https://api.linkedin.com/v2/networkSizes/edges?edgeType=CompanyFollowedByMember', {
      headers: {
        'Authorization': `Bearer ${user.access_token}`,
        'Accept': 'application/json',
      },
    });

    // For now, we'll return connections from our database (users who have connected LinkedIn)
    // The actual LinkedIn Connections API is complex and requires specific permissions
    // Get connections - for now, show other users in the same neighborhood(s)
    // In the future, this can be enhanced with actual LinkedIn connections API
    const userNeighborhood = db.prepare('SELECT neighborhood_id FROM users WHERE id = ?').get(req.user.id);
    
    let connections;
    if (userNeighborhood?.neighborhood_id) {
      connections = db.prepare(`
        SELECT id, first_name, last_name, full_name, profile_picture, headline, 
               neighborhood_id, neighborhood_name, company, industry, profile_url
        FROM users 
        WHERE id != ? AND neighborhood_id = ?
        ORDER BY full_name
      `).all(req.user.id, userNeighborhood.neighborhood_id);
    } else {
      connections = [];
    }

    res.json({ connections });
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get users by neighborhood
app.get('/api/neighborhoods/:id/users', (req, res) => {
  try {
    const users = db.prepare(`
      SELECT id, first_name, last_name, full_name, profile_picture, headline, 
             company, industry, profile_url
      FROM users 
      WHERE neighborhood_id = ?
      ORDER BY full_name
    `).all(req.params.id);
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API Routes

// Get all neighborhoods with aggregated survey data
app.get('/api/neighborhoods', (req, res) => {
  try {
    const neighborhoods = db.prepare('SELECT * FROM neighborhoods ORDER BY name').all();
    const neighborhoodsWithSurveys = neighborhoods.map(neighborhood => {
      const profile = aggregateSurveys(neighborhood.id);
      return {
        ...neighborhood,
        ...profile,
        survey_count: profile ? profile.survey_count : 0
      };
    });
    res.json(neighborhoodsWithSurveys);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single neighborhood with all survey responses
app.get('/api/neighborhoods/:id', (req, res) => {
  try {
    const neighborhood = db.prepare('SELECT * FROM neighborhoods WHERE id = ?').get(req.params.id);
    if (!neighborhood) {
      return res.status(404).json({ error: 'Neighborhood not found' });
    }
    
    const surveys = db.prepare('SELECT * FROM resident_surveys WHERE neighborhood_id = ? ORDER BY created_at DESC').all(req.params.id);
    const profile = aggregateSurveys(req.params.id);
    
    res.json({
      ...neighborhood,
      surveys,
      profile,
      survey_count: surveys.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new neighborhood
app.post('/api/neighborhoods', (req, res) => {
  try {
    const { name, location, description, school_district } = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO neighborhoods (name, location, description, school_district)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(name, location, description || null, school_district || null);
    const neighborhood = db.prepare('SELECT * FROM neighborhoods WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(neighborhood);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update neighborhood
app.put('/api/neighborhoods/:id', (req, res) => {
  try {
    const { name, location, description, school_district } = req.body;
    
    const stmt = db.prepare(`
      UPDATE neighborhoods 
      SET name = ?, location = ?, description = ?, school_district = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(name, location, description || null, school_district || null, req.params.id);
    const neighborhood = db.prepare('SELECT * FROM neighborhoods WHERE id = ?').get(req.params.id);
    
    if (!neighborhood) {
      return res.status(404).json({ error: 'Neighborhood not found' });
    }
    res.json(neighborhood);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete neighborhood
app.delete('/api/neighborhoods/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM neighborhoods WHERE id = ?');
    const result = stmt.run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Neighborhood not found' });
    }
    
    res.json({ message: 'Neighborhood deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============== STREETS API ==============

// Get all streets (optionally filtered by neighborhood or city)
app.get('/api/streets', (req, res) => {
  try {
    const { neighborhood_id, city, state } = req.query;
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
    res.json(streets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get streets for a specific neighborhood
app.get('/api/neighborhoods/:id/streets', (req, res) => {
  try {
    const streets = db.prepare(`
      SELECT s.*, 
        (SELECT COUNT(*) FROM resident_surveys WHERE street_id = s.id) as survey_count
      FROM streets s 
      WHERE s.neighborhood_id = ? 
      ORDER BY s.name
    `).all(req.params.id);
    res.json(streets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single street with surveys
app.get('/api/streets/:id', (req, res) => {
  try {
    const street = db.prepare(`
      SELECT s.*, n.name as neighborhood_name, n.city, n.state
      FROM streets s 
      LEFT JOIN neighborhoods n ON s.neighborhood_id = n.id
      WHERE s.id = ?
    `).get(req.params.id);
    
    if (!street) {
      return res.status(404).json({ error: 'Street not found' });
    }
    
    const surveys = db.prepare('SELECT * FROM resident_surveys WHERE street_id = ? ORDER BY created_at DESC').all(req.params.id);
    
    res.json({
      ...street,
      surveys,
      survey_count: surveys.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new street
app.post('/api/streets', (req, res) => {
  try {
    const { name, neighborhood_id, city, state, full_address, description, latitude, longitude, osm_id } = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO streets (name, neighborhood_id, city, state, full_address, description, latitude, longitude, osm_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(name, neighborhood_id || null, city, state, full_address || null, description || null, latitude || null, longitude || null, osm_id || null);
    const street = db.prepare('SELECT * FROM streets WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(street);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk create streets (for importing from OpenStreetMap)
app.post('/api/streets/bulk', (req, res) => {
  try {
    const { streets } = req.body;
    
    if (!Array.isArray(streets) || streets.length === 0) {
      return res.status(400).json({ error: 'Streets array is required' });
    }
    
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO streets (name, neighborhood_id, city, state, full_address, latitude, longitude, osm_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const insertMany = db.transaction((streetList) => {
      for (const street of streetList) {
        stmt.run(
          street.name,
          street.neighborhood_id || null,
          street.city,
          street.state,
          street.full_address || `${street.name}, ${street.city}, ${street.state}`,
          street.latitude || null,
          street.longitude || null,
          street.osm_id || null
        );
      }
    });
    
    insertMany(streets);
    
    res.status(201).json({ message: `${streets.length} streets imported successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update street
app.put('/api/streets/:id', (req, res) => {
  try {
    const { name, neighborhood_id, city, state, full_address, description, latitude, longitude, vibe_summary } = req.body;
    
    const stmt = db.prepare(`
      UPDATE streets 
      SET name = ?, neighborhood_id = ?, city = ?, state = ?, full_address = ?, 
          description = ?, latitude = ?, longitude = ?, vibe_summary = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(name, neighborhood_id || null, city, state, full_address || null, description || null, latitude || null, longitude || null, vibe_summary || null, req.params.id);
    const street = db.prepare('SELECT * FROM streets WHERE id = ?').get(req.params.id);
    
    if (!street) {
      return res.status(404).json({ error: 'Street not found' });
    }
    res.json(street);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete street
app.delete('/api/streets/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM streets WHERE id = ?');
    const result = stmt.run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Street not found' });
    }
    
    res.json({ message: 'Street deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search streets and neighborhoods
app.get('/api/search', (req, res) => {
  try {
    const { q, city, state } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ neighborhoods: [], streets: [] });
    }
    
    const searchTerm = `%${q}%`;
    
    // Search neighborhoods
    let neighborhoodQuery = 'SELECT * FROM neighborhoods WHERE name LIKE ?';
    const neighborhoodParams = [searchTerm];
    if (city) {
      neighborhoodQuery += ' AND city LIKE ?';
      neighborhoodParams.push(`%${city}%`);
    }
    if (state) {
      neighborhoodQuery += ' AND state = ?';
      neighborhoodParams.push(state);
    }
    neighborhoodQuery += ' ORDER BY name LIMIT 10';
    
    const neighborhoods = db.prepare(neighborhoodQuery).all(...neighborhoodParams);
    
    // Search streets
    let streetQuery = `
      SELECT s.*, n.name as neighborhood_name 
      FROM streets s 
      LEFT JOIN neighborhoods n ON s.neighborhood_id = n.id
      WHERE s.name LIKE ?
    `;
    const streetParams = [searchTerm];
    if (city) {
      streetQuery += ' AND s.city LIKE ?';
      streetParams.push(`%${city}%`);
    }
    if (state) {
      streetQuery += ' AND s.state = ?';
      streetParams.push(state);
    }
    streetQuery += ' ORDER BY s.name LIMIT 20';
    
    const streets = db.prepare(streetQuery).all(...streetParams);
    
    res.json({ neighborhoods, streets });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all surveys for a neighborhood
app.get('/api/neighborhoods/:id/surveys', (req, res) => {
  try {
    const surveys = db.prepare('SELECT * FROM resident_surveys WHERE neighborhood_id = ? ORDER BY created_at DESC').all(req.params.id);
    res.json(surveys);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add resident survey to a neighborhood
app.post('/api/neighborhoods/:id/surveys', (req, res) => {
  try {
    const { 
      resident_name, 
      address, 
      street_id,
      street_name,
      noise_level, 
      sociability, 
      events, 
      kids_friendly, 
      walkability, 
      cookouts, 
      nightlife, 
      additional_notes,
      verification_token,
      address_verified 
    } = req.body;
    const neighborhoodId = req.params.id;
    
    // Verify neighborhood exists
    const neighborhood = db.prepare('SELECT * FROM neighborhoods WHERE id = ?').get(neighborhoodId);
    if (!neighborhood) {
      return res.status(404).json({ error: 'Neighborhood not found' });
    }
    
    // Validate verification token if provided
    let isVerified = false;
    if (verification_token && address_verified) {
      try {
        const tokenData = JSON.parse(Buffer.from(verification_token, 'base64').toString());
        // Check token validity (within last hour and location matches)
        const tokenAge = Date.now() - tokenData.timestamp;
        const tokenValid = tokenAge < 60 * 60 * 1000; // 1 hour
        const locationMatches = tokenData.location === neighborhood.location;
        
        if (tokenValid && locationMatches) {
          isVerified = true;
        } else {
          console.warn('Invalid verification token:', { tokenAge, locationMatches });
        }
      } catch (e) {
        console.warn('Failed to parse verification token:', e.message);
      }
    }
    
    // Require address verification for submissions
    if (!isVerified) {
      return res.status(400).json({ 
        error: 'Address verification is required. Please verify your address before submitting.',
        requiresVerification: true
      });
    }

    // If custom street name provided but no street_id, create the street
    let finalStreetId = street_id;
    if (!street_id && street_name) {
      const insertStreet = db.prepare(`
        INSERT INTO streets (neighborhood_id, name, city, state)
        VALUES (?, ?, ?, ?)
      `);
      const streetResult = insertStreet.run(
        neighborhoodId,
        street_name,
        neighborhood.city || neighborhood.location?.split(',')[0]?.trim(),
        neighborhood.state || neighborhood.location?.split(',')[1]?.trim()
      );
      finalStreetId = streetResult.lastInsertRowid;
    }
    
    const stmt = db.prepare(`
      INSERT INTO resident_surveys 
      (neighborhood_id, street_id, resident_name, address, noise_level, sociability, events, kids_friendly, walkability, cookouts, nightlife, additional_notes, address_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      neighborhoodId, 
      finalStreetId || null,
      resident_name || null, 
      address || null, 
      noise_level, 
      sociability, 
      events, 
      kids_friendly, 
      walkability, 
      cookouts, 
      nightlife, 
      additional_notes,
      isVerified ? 1 : 0
    );
    const survey = db.prepare('SELECT * FROM resident_surveys WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json(survey);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update resident survey
app.put('/api/surveys/:id', (req, res) => {
  try {
    const { resident_name, address, noise_level, sociability, events, kids_friendly, walkability, cookouts, nightlife, additional_notes } = req.body;
    
    const stmt = db.prepare(`
      UPDATE resident_surveys 
      SET resident_name = ?, address = ?, noise_level = ?, sociability = ?, events = ?, kids_friendly = ?, 
          walkability = ?, cookouts = ?, nightlife = ?, additional_notes = ?
      WHERE id = ?
    `);
    
    stmt.run(resident_name || null, address || null, noise_level, sociability, events, kids_friendly, walkability, cookouts, nightlife, additional_notes, req.params.id);
    const survey = db.prepare('SELECT * FROM resident_surveys WHERE id = ?').get(req.params.id);
    
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    res.json(survey);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete resident survey
app.delete('/api/surveys/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM resident_surveys WHERE id = ?');
    const result = stmt.run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    
    res.json({ message: 'Survey deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify address matches neighborhood - STRICT verification
app.post('/api/verify-address', async (req, res) => {
  try {
    const { address, neighborhoodLocation } = req.body;
    
    if (!address || !neighborhoodLocation) {
      return res.status(400).json({ 
        verified: false,
        error: 'Address and neighborhood location are required',
        canRetry: true
      });
    }

    // Basic address format validation - must have at least a number and street name
    const addressPattern = /^\d+\s+\w+/;
    if (!addressPattern.test(address.trim())) {
      return res.json({
        verified: false,
        error: 'Please enter a valid street address (e.g., "123 Main Street, City, State")',
        canRetry: true
      });
    }

    // Parse neighborhood location (e.g., "Boston, MA" -> city: "Boston", state: "MA")
    const locationParts = neighborhoodLocation.split(',').map(s => s.trim());
    if (locationParts.length < 2) {
      return res.status(400).json({ 
        verified: false,
        error: 'Invalid neighborhood location format',
        canRetry: false
      });
    }
    
    const [city, state] = locationParts;
    const stateAbbrev = state?.toUpperCase();
    
    // Complete state name mapping
    const stateNames = {
      'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
      'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
      'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
      'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
      'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
      'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
      'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
      'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
      'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
      'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
      'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
      'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
      'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia'
    };
    const stateName = stateNames[stateAbbrev] || state;

    // Geocode the address using OpenStreetMap Nominatim (free, no API key required)
    const encodedAddress = encodeURIComponent(address);
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&addressdetails=1&limit=5`;
    
    const geocodeResponse = await fetch(geocodeUrl, {
      headers: {
        'User-Agent': 'HappyNeighbor/1.0 (neighborhood-survey-app)'
      }
    });

    if (!geocodeResponse.ok) {
      return res.json({ 
        verified: false,
        error: 'Address verification service temporarily unavailable. Please try again in a moment.',
        canRetry: true
      });
    }

    const geocodeData = await geocodeResponse.json();
    
    if (!geocodeData || geocodeData.length === 0) {
      return res.json({
        verified: false,
        error: 'Address not found. Please enter a complete, valid street address including city and state.',
        canRetry: true,
        suggestions: [
          'Include the full street address (e.g., "123 Main St")',
          'Add the city and state (e.g., "Boston, MA")',
          'Check for typos in the street name'
        ]
      });
    }

    // Check all returned results for a match (Nominatim returns multiple possibilities)
    let bestMatch = null;
    let matchDetails = null;
    
    for (const result of geocodeData) {
      const addressDetails = result.address || {};
      
      // Extract location components from geocoded result
      const geocodedCity = (
        addressDetails.city || 
        addressDetails.town || 
        addressDetails.village || 
        addressDetails.municipality ||
        addressDetails.county ||
        ''
      ).toLowerCase();
      
      const geocodedState = (addressDetails.state || '').toLowerCase();
      const geocodedStateCode = (addressDetails.state_code || addressDetails['ISO3166-2-lvl4'] || '').toUpperCase().replace('US-', '');
      const geocodedCountry = (addressDetails.country_code || '').toUpperCase();
      
      // Must be in USA
      if (geocodedCountry && geocodedCountry !== 'US') {
        continue;
      }
      
      // Verify it's an actual street address (has house number or road)
      const hasStreetAddress = addressDetails.house_number || addressDetails.road || addressDetails.street;
      if (!hasStreetAddress) {
        continue;
      }
      
      // Normalize city names for comparison
      const normalizeCity = (cityName) => {
        return cityName
          .toLowerCase()
          .replace(/\s+(city|town|village|township)$/i, '')
          .replace(/[^a-z0-9\s]/g, '')
          .trim();
      };
      
      const normalizedExpectedCity = normalizeCity(city);
      const normalizedGeocodedCity = normalizeCity(geocodedCity);
      
      // City matching with multiple strategies
      const cityMatch = 
        normalizedGeocodedCity === normalizedExpectedCity ||
        normalizedGeocodedCity.includes(normalizedExpectedCity) ||
        normalizedExpectedCity.includes(normalizedGeocodedCity) ||
        // Handle cases like "St. Louis" vs "Saint Louis"
        normalizedGeocodedCity.replace(/\bst\b/g, 'saint') === normalizedExpectedCity.replace(/\bst\b/g, 'saint');
      
      // State matching
      const stateMatch = 
        geocodedStateCode === stateAbbrev ||
        geocodedState === stateName.toLowerCase() ||
        geocodedState === state.toLowerCase();
      
      if (cityMatch && stateMatch) {
        bestMatch = result;
        matchDetails = {
          geocodedCity,
          geocodedState,
          geocodedStateCode,
          addressDetails
        };
        break;
      }
      
      // Track closest match for error message
      if (!bestMatch && stateMatch) {
        bestMatch = result;
        matchDetails = {
          geocodedCity,
          geocodedState,
          geocodedStateCode,
          addressDetails,
          cityMismatch: true
        };
      }
    }

    if (bestMatch && !matchDetails?.cityMismatch) {
      // Generate a verification token for this address
      const verificationToken = Buffer.from(
        JSON.stringify({
          address: address.trim(),
          location: neighborhoodLocation,
          timestamp: Date.now(),
          geocoded: bestMatch.display_name
        })
      ).toString('base64');
      
      return res.json({
        verified: true,
        verificationToken,
        geocodedAddress: bestMatch.display_name,
        city: matchDetails.geocodedCity,
        state: matchDetails.geocodedState || matchDetails.geocodedStateCode,
        expectedCity: city,
        expectedState: state,
        message: 'Address verified successfully! Your address is confirmed to be in ' + city + ', ' + state + '.',
        streetName: matchDetails.addressDetails.road || matchDetails.addressDetails.street || null
      });
    }

    // No match found - return detailed error
    const closestResult = bestMatch || geocodeData[0];
    const closestDetails = closestResult?.address || {};
    const detectedCity = closestDetails.city || closestDetails.town || closestDetails.village || closestDetails.municipality || 'Unknown';
    const detectedState = closestDetails.state_code || closestDetails.state || 'Unknown';
    
    return res.json({
      verified: false,
      error: `This address appears to be in ${detectedCity}, ${detectedState}, not in ${city}, ${state}. Please enter an address that is actually located in ${city}.`,
      canRetry: true,
      detectedLocation: {
        city: detectedCity,
        state: detectedState,
        fullAddress: closestResult?.display_name
      },
      expectedLocation: {
        city: city,
        state: state
      }
    });
    
  } catch (error) {
    console.error('Address verification error:', error);
    res.json({ 
      verified: false,
      error: 'Address verification failed. Please check your address and try again.',
      canRetry: true
    });
  }
});

// ============== ADDRESS-BASED STREET LOOKUP/CREATE ==============
// This is the key endpoint for the "address-first" flow
// User enters address → we find/create the street → survey attaches to street

app.post('/api/lookup-address', async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address || address.trim().length < 5) {
      return res.status(400).json({ 
        success: false,
        error: 'Please enter a valid street address'
      });
    }

    // Basic address format validation - must have at least a number and street name
    const addressPattern = /^\d+\s+\w+/;
    if (!addressPattern.test(address.trim())) {
      return res.json({
        success: false,
        error: 'Please enter a valid street address starting with a house number (e.g., "123 Main Street, City, State")'
      });
    }

    // Geocode the address using OpenStreetMap Nominatim (free, no API key required)
    const encodedAddress = encodeURIComponent(address);
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&addressdetails=1&limit=5&countrycodes=us`;
    
    const geocodeResponse = await fetch(geocodeUrl, {
      headers: {
        'User-Agent': 'HappyNeighbor/1.0 (neighborhood-survey-app)'
      }
    });

    if (!geocodeResponse.ok) {
      return res.json({ 
        success: false,
        error: 'Address verification service temporarily unavailable. Please try again.'
      });
    }

    const geocodeData = await geocodeResponse.json();
    
    if (!geocodeData || geocodeData.length === 0) {
      return res.json({
        success: false,
        error: 'Address not found. Please check the address and include city/state.'
      });
    }

    // Find the best result with a street address
    let bestResult = null;
    for (const result of geocodeData) {
      const addr = result.address || {};
      // Must have a road/street and house number for a valid street address
      if ((addr.road || addr.street) && addr.house_number) {
        bestResult = result;
        break;
      }
    }
    
    if (!bestResult) {
      // Fall back to first result with road
      bestResult = geocodeData.find(r => r.address?.road || r.address?.street) || geocodeData[0];
    }

    const addressDetails = bestResult.address || {};
    
    // Extract components
    const streetName = addressDetails.road || addressDetails.street || null;
    const city = addressDetails.city || addressDetails.town || addressDetails.village || 
                 addressDetails.municipality || addressDetails.county || null;
    const state = addressDetails.state || null;
    const stateCode = (addressDetails['ISO3166-2-lvl4'] || '').replace('US-', '') || 
                      getStateAbbrev(state);
    const zipCode = addressDetails.postcode || null;
    const lat = parseFloat(bestResult.lat);
    const lon = parseFloat(bestResult.lon);
    
    if (!streetName || !city || !state) {
      return res.json({
        success: false,
        error: 'Could not parse address. Please include street, city, and state.'
      });
    }

    // Normalize street name (remove directional prefixes for matching)
    const normalizedStreetName = normalizeStreetName(streetName);
    const location = `${city}, ${stateCode || state}`;

    // Look for existing street (fuzzy match on normalized name + city + state)
    let street = db.prepare(`
      SELECT s.*, n.name as neighborhood_name 
      FROM streets s 
      LEFT JOIN neighborhoods n ON s.neighborhood_id = n.id
      WHERE LOWER(s.name) = LOWER(?) 
        AND LOWER(s.city) = LOWER(?)
        AND (LOWER(s.state) = LOWER(?) OR LOWER(s.state) = LOWER(?))
    `).get(normalizedStreetName, city, state, stateCode);

    // Also try original street name if normalized didn't match
    if (!street) {
      street = db.prepare(`
        SELECT s.*, n.name as neighborhood_name 
        FROM streets s 
        LEFT JOIN neighborhoods n ON s.neighborhood_id = n.id
        WHERE LOWER(s.name) = LOWER(?) 
          AND LOWER(s.city) = LOWER(?)
          AND (LOWER(s.state) = LOWER(?) OR LOWER(s.state) = LOWER(?))
      `).get(streetName, city, state, stateCode);
    }

    let isNewStreet = false;
    
    if (!street) {
      // Create new street - this is the organic growth part!
      // First, try to find or create a neighborhood for this city
      let neighborhood = db.prepare(`
        SELECT * FROM neighborhoods 
        WHERE LOWER(location) = LOWER(?) OR LOWER(location) = LOWER(?)
      `).get(location, `${city}, ${state}`);

      let neighborhoodId = neighborhood?.id || null;

      // Create the street
      const insertResult = db.prepare(`
        INSERT INTO streets (name, neighborhood_id, city, state, latitude, longitude, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(streetName, neighborhoodId, city, stateCode || state, lat || null, lon || null);
      
      street = db.prepare('SELECT * FROM streets WHERE id = ?').get(insertResult.lastInsertRowid);
      isNewStreet = true;
    }

    // Get survey count for this street
    const surveyCount = db.prepare('SELECT COUNT(*) as count FROM resident_surveys WHERE street_id = ?').get(street.id);

    // Generate verification token
    const verificationToken = Buffer.from(
      JSON.stringify({
        streetId: street.id,
        address: address.trim(),
        streetName: streetName,
        city: city,
        state: stateCode || state,
        timestamp: Date.now(),
        geocoded: bestResult.display_name
      })
    ).toString('base64');

    res.json({
      success: true,
      street: {
        id: street.id,
        name: street.name,
        city: street.city,
        state: street.state,
        neighborhood_name: street.neighborhood_name || null,
        survey_count: surveyCount?.count || 0,
        isNew: isNewStreet
      },
      geocoded: {
        fullAddress: bestResult.display_name,
        streetName,
        city,
        state: stateCode || state,
        zipCode,
        lat,
        lon
      },
      verificationToken,
      message: isNewStreet 
        ? `You're the first to share about ${streetName}! 🎉` 
        : `Join ${surveyCount?.count || 0} other${surveyCount?.count === 1 ? '' : 's'} who've shared about ${streetName}!`
    });

  } catch (error) {
    console.error('Address lookup error:', error);
    res.status(500).json({ 
      success: false,
      error: 'An error occurred. Please try again.'
    });
  }
});

// Helper to get state abbreviation
function getStateAbbrev(stateName) {
  const stateMap = {
    'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
    'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
    'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
    'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
    'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
    'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
    'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
    'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
    'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
    'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
    'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
    'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV',
    'wisconsin': 'WI', 'wyoming': 'WY', 'district of columbia': 'DC'
  };
  return stateMap[(stateName || '').toLowerCase()] || stateName;
}

// Helper to normalize street names for matching
function normalizeStreetName(streetName) {
  return streetName
    .replace(/\bStreet\b/gi, 'St')
    .replace(/\bAvenue\b/gi, 'Ave')
    .replace(/\bBoulevard\b/gi, 'Blvd')
    .replace(/\bDrive\b/gi, 'Dr')
    .replace(/\bRoad\b/gi, 'Rd')
    .replace(/\bLane\b/gi, 'Ln')
    .replace(/\bCourt\b/gi, 'Ct')
    .replace(/\bPlace\b/gi, 'Pl')
    .replace(/\bCircle\b/gi, 'Cir')
    .replace(/\bNorth\b/gi, 'N')
    .replace(/\bSouth\b/gi, 'S')
    .replace(/\bEast\b/gi, 'E')
    .replace(/\bWest\b/gi, 'W')
    .trim();
}

// Submit survey directly to a street (saves as PENDING until verified)
app.post('/api/streets/:id/surveys', (req, res) => {
  try {
    const streetId = req.params.id;
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
      additional_notes,
      verification_token
    } = req.body;
    
    // Verify street exists
    const street = db.prepare('SELECT * FROM streets WHERE id = ?').get(streetId);
    if (!street) {
      return res.status(404).json({ error: 'Street not found' });
    }
    
    // Validate address verification token (geocoding check)
    let addressVerified = false;
    if (verification_token) {
      try {
        const tokenData = JSON.parse(Buffer.from(verification_token, 'base64').toString());
        const tokenAge = Date.now() - tokenData.timestamp;
        const tokenValid = tokenAge < 60 * 60 * 1000; // 1 hour
        const streetMatches = tokenData.streetId === parseInt(streetId);
        
        if (tokenValid && streetMatches) {
          addressVerified = true;
        }
      } catch (e) {
        console.warn('Failed to parse verification token:', e.message);
      }
    }
    
    if (!addressVerified) {
      return res.status(400).json({ 
        error: 'Address verification required. Please verify your address first.',
        requiresVerification: true
      });
    }

    // Insert the survey as PENDING - requires document verification
    // Handle case where neighborhood_id might be NULL
    const neighborhoodId = street.neighborhood_id ? street.neighborhood_id : null;
    
    let result;
    if (neighborhoodId) {
      const stmt = db.prepare(`
        INSERT INTO resident_surveys 
        (street_id, neighborhood_id, resident_name, address, submitter_email, noise_level, sociability, events, 
         kids_friendly, walkability, cookouts, nightlife, additional_notes, address_verified, verification_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'pending')
      `);
      result = stmt.run(
        streetId, neighborhoodId, resident_name || null, address || null, email || null,
        noise_level, sociability, events, kids_friendly, walkability, cookouts, nightlife, additional_notes
      );
    } else {
      // Insert without neighborhood_id to avoid NOT NULL constraint
      const stmt = db.prepare(`
        INSERT INTO resident_surveys 
        (street_id, resident_name, address, submitter_email, noise_level, sociability, events, 
         kids_friendly, walkability, cookouts, nightlife, additional_notes, address_verified, verification_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'pending')
      `);
      result = stmt.run(
        streetId, resident_name || null, address || null, email || null,
        noise_level, sociability, events, kids_friendly, walkability, cookouts, nightlife, additional_notes
      );
    }

    const survey = db.prepare('SELECT * FROM resident_surveys WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json({
      success: true,
      survey,
      surveyId: survey.id,
      requiresDocumentVerification: true,
      message: 'Survey saved! Please upload proof of residency to complete verification.'
    });
  } catch (error) {
    console.error('Survey submission error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============== VERIFICATION ENDPOINTS ==============

// Upload verification document for a survey
app.post('/api/surveys/:surveyId/verify', upload.single('document'), (req, res) => {
  try {
    const { surveyId } = req.params;
    const { verification_type } = req.body;
    
    // Check if survey exists
    const survey = db.prepare('SELECT * FROM resident_surveys WHERE id = ?').get(surveyId);
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a verification document' });
    }
    
    // Validate verification type
    const validTypes = ['mail', 'utility_bill', 'lease', 'photo_id', 'mortgage_statement', 'other'];
    if (!validTypes.includes(verification_type)) {
      return res.status(400).json({ 
        error: 'Invalid verification type',
        validTypes 
      });
    }
    
    // Update survey with document info (still pending admin review)
    db.prepare(`
      UPDATE resident_surveys 
      SET verification_type = ?, verification_document = ?, verification_status = 'pending_review'
      WHERE id = ?
    `).run(verification_type, req.file.filename, surveyId);
    
    const updatedSurvey = db.prepare('SELECT id, verification_status, verification_type FROM resident_surveys WHERE id = ?').get(surveyId);
    
    res.json({
      success: true,
      survey: updatedSurvey,
      message: 'Document uploaded successfully! Your submission is pending review.'
    });
  } catch (error) {
    console.error('Verification upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check verification status
app.get('/api/surveys/:surveyId/status', (req, res) => {
  try {
    const { surveyId } = req.params;
    
    const survey = db.prepare(`
      SELECT id, street_id, verification_status, verification_type, verified_at, verification_notes, created_at
      FROM resident_surveys WHERE id = ?
    `).get(surveyId);
    
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    
    // Get street info
    const street = db.prepare('SELECT name, city, state FROM streets WHERE id = ?').get(survey.street_id);
    
    res.json({
      surveyId: survey.id,
      status: survey.verification_status || 'pending',
      verificationType: survey.verification_type,
      verifiedAt: survey.verified_at,
      notes: survey.verification_notes,
      submittedAt: survey.created_at,
      street: street ? `${street.name}, ${street.city}, ${street.state}` : null,
      statusMessage: getStatusMessage(survey.verification_status)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function getStatusMessage(status) {
  const messages = {
    'pending': 'Awaiting document upload',
    'pending_review': 'Document uploaded, awaiting review',
    'verified': 'Verified resident ✓',
    'rejected': 'Verification rejected - please resubmit'
  };
  return messages[status] || 'Unknown status';
}

// Admin: Get all pending verifications
app.get('/api/admin/pending-verifications', (req, res) => {
  try {
    const pending = db.prepare(`
      SELECT rs.*, s.name as street_name, s.city, s.state
      FROM resident_surveys rs
      LEFT JOIN streets s ON rs.street_id = s.id
      WHERE rs.verification_status = 'pending_review'
      ORDER BY rs.created_at DESC
    `).all();
    
    res.json(pending);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Approve or reject verification
app.post('/api/admin/verify/:surveyId', (req, res) => {
  try {
    const { surveyId } = req.params;
    const { action, notes } = req.body;
    
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Action must be "approve" or "reject"' });
    }
    
    const survey = db.prepare('SELECT * FROM resident_surveys WHERE id = ?').get(surveyId);
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }
    
    const newStatus = action === 'approve' ? 'verified' : 'rejected';
    
    db.prepare(`
      UPDATE resident_surveys 
      SET verification_status = ?, verified_at = CURRENT_TIMESTAMP, verification_notes = ?
      WHERE id = ?
    `).run(newStatus, notes || null, surveyId);
    
    // If approved, update street aggregates
    if (action === 'approve' && survey.street_id) {
      updateStreetAggregates(survey.street_id);
    }
    
    res.json({
      success: true,
      surveyId,
      newStatus,
      message: action === 'approve' ? 'Survey verified and data added to street profile' : 'Survey rejected'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to update street aggregates after a survey (ONLY counts verified surveys)
function updateStreetAggregates(streetId) {
  const surveys = db.prepare(`
    SELECT * FROM resident_surveys 
    WHERE street_id = ? AND verification_status = 'verified'
  `).all(streetId);
  
  if (surveys.length === 0) return;

  // Calculate mode (most common value) for each attribute
  const getMode = (values) => {
    const counts = {};
    values.forEach(v => { if (v) counts[v] = (counts[v] || 0) + 1; });
    let maxCount = 0, mode = null;
    Object.keys(counts).forEach(k => {
      if (counts[k] > maxCount) { maxCount = counts[k]; mode = k; }
    });
    return mode;
  };

  // Convert descriptive values to numeric scores
  const scoreMap = {
    // Noise
    'Very Quiet': 1, 'Quiet': 2, 'Moderate': 3, 'Lively': 4,
    // Sociability (updated scale)
    'Very Private': 1, 'Mostly Private': 2, 'Friendly': 3, 'Social': 4, 'Very Social': 5,
    // Family
    'Not Family-Friendly': 1, 'Some Families': 2, 'Family-Friendly': 3, 'Very Family-Friendly': 4
  };

  const getAvgScore = (values) => {
    const scores = values.filter(v => v && scoreMap[v]).map(v => scoreMap[v]);
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
  };

  const noiseValues = surveys.map(s => s.noise_level);
  const socialValues = surveys.map(s => s.sociability);
  const familyValues = surveys.map(s => s.kids_friendly);

  const avgNoise = getAvgScore(noiseValues);
  const avgSocial = getAvgScore(socialValues);
  const avgFamily = getAvgScore(familyValues);

  // Generate vibe summary
  const noiseMode = getMode(noiseValues);
  const socialMode = getMode(socialValues);
  const familyMode = getMode(familyValues);
  const vibeSummary = [noiseMode, socialMode, familyMode].filter(Boolean).join(' • ');

  db.prepare(`
    UPDATE streets 
    SET survey_count = ?, avg_noise_score = ?, avg_social_score = ?, avg_family_score = ?,
        vibe_summary = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(surveys.length, avgNoise, avgSocial, avgFamily, vibeSummary || null, streetId);
}

// Get street vibe profile with all aggregated data (ONLY verified surveys)
app.get('/api/streets/:id/vibe', (req, res) => {
  try {
    const street = db.prepare(`
      SELECT s.*, n.name as neighborhood_name
      FROM streets s 
      LEFT JOIN neighborhoods n ON s.neighborhood_id = n.id
      WHERE s.id = ?
    `).get(req.params.id);
    
    if (!street) {
      return res.status(404).json({ error: 'Street not found' });
    }

    // Only get VERIFIED surveys for public display
    const surveys = db.prepare(`
      SELECT * FROM resident_surveys 
      WHERE street_id = ? AND verification_status = 'verified' 
      ORDER BY created_at DESC
    `).all(req.params.id);
    
    // Also get count of pending surveys
    const pendingCount = db.prepare(`
      SELECT COUNT(*) as count FROM resident_surveys 
      WHERE street_id = ? AND verification_status IN ('pending', 'pending_review')
    `).get(req.params.id)?.count || 0;
    
    // Aggregate all survey responses
    const aggregate = (field) => {
      const values = surveys.map(s => s[field]).filter(Boolean);
      const counts = {};
      values.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
      return counts;
    };

    const vibe = {
      noise_level: aggregate('noise_level'),
      sociability: aggregate('sociability'),
      events: aggregate('events'),
      kids_friendly: aggregate('kids_friendly'),
      walkability: aggregate('walkability'),
      cookouts: aggregate('cookouts'),
      nightlife: aggregate('nightlife')
    };

    // Get recent notes (last 5, anonymized) - only from verified surveys
    const recentNotes = surveys
      .filter(s => s.additional_notes)
      .slice(0, 5)
      .map(s => ({
        note: s.additional_notes,
        date: s.created_at
      }));

    res.json({
      street: {
        id: street.id,
        name: street.name,
        city: street.city,
        state: street.state,
        neighborhood_name: street.neighborhood_name,
        survey_count: surveys.length,
        pending_count: pendingCount,
        vibe_summary: street.vibe_summary
      },
      vibe,
      recentNotes,
      message: surveys.length > 0 
        ? `Based on ${surveys.length} verified resident${surveys.length === 1 ? '' : 's'}`
        : (pendingCount > 0 ? `${pendingCount} review${pendingCount === 1 ? '' : 's'} pending verification` : 'No resident data yet')
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get matches based on preferences
app.post('/api/matches', (req, res) => {
  try {
    const preferences = req.body;
    const neighborhoods = db.prepare('SELECT * FROM neighborhoods ORDER BY name').all();
    
    const matches = neighborhoods.map(neighborhood => {
      const profile = aggregateSurveys(neighborhood.id);
      if (!profile || profile.survey_count === 0) {
        return null;
      }
      
      return {
        ...neighborhood,
        ...profile,
        matchScore: calculateMatchScore(profile, preferences),
        survey_count: profile.survey_count
      };
    })
    .filter(match => match !== null && match.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10); // Top 10 matches
    
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============== COMMUNITY HUB ENDPOINTS ==============

// Verify access to community hub
app.post('/api/community/verify', (req, res) => {
  try {
    const { streetId, code } = req.body;
    
    if (!code || !streetId) {
      return res.status(400).json({ verified: false, error: 'Missing verification code or street ID' });
    }
    
    // Check if this is a valid survey verification code
    // The code format is: surveyId-timestamp (simple format for demo)
    // In production, this would be a secure token sent via email
    
    // For now, accept the survey ID as the verification code
    const survey = db.prepare(`
      SELECT * FROM resident_surveys 
      WHERE id = ? AND street_id = ? AND verification_status = 'verified'
    `).get(code, streetId);
    
    if (survey) {
      return res.json({ 
        verified: true, 
        message: 'Welcome to your Community Hub!',
        streetId: parseInt(streetId)
      });
    }
    
    // Also check by survey ID alone (for demo purposes)
    const surveyById = db.prepare(`
      SELECT * FROM resident_surveys 
      WHERE id = ? AND verification_status = 'verified'
    `).get(code);
    
    if (surveyById && surveyById.street_id === parseInt(streetId)) {
      return res.json({ 
        verified: true, 
        message: 'Welcome to your Community Hub!',
        streetId: parseInt(streetId)
      });
    }
    
    // For demo: also allow "DEMO" code for testing
    if (code.toUpperCase() === 'DEMO') {
      return res.json({ 
        verified: true, 
        message: 'Demo access granted!',
        streetId: parseInt(streetId)
      });
    }
    
    return res.json({ verified: false, error: 'Invalid verification code' });
  } catch (error) {
    console.error('Community verification error:', error);
    res.status(500).json({ verified: false, error: error.message });
  }
});

// Get community events for a street
app.get('/api/community/:streetId/events', (req, res) => {
  // Placeholder - would fetch from events table
  res.json([
    { id: 1, title: "Summer Block Party 🎉", date: "2024-07-15", time: "4:00 PM", host: "Sarah M.", description: "Annual summer cookout! Bring a dish to share.", attendees: 12, type: "party" },
    { id: 2, title: "Neighborhood Garage Sale", date: "2024-06-22", time: "8:00 AM", host: "Multiple Homes", description: "Multi-family garage sale.", attendees: 8, type: "sale" },
  ]);
});

// Get crowdfunding campaigns for a street
app.get('/api/community/:streetId/crowdfunds', (req, res) => {
  // Placeholder - would fetch from crowdfunds table
  res.json([
    { id: 1, title: "Street Holiday Lights", goal: 500, raised: 325, backers: 12, description: "Let's make our street sparkle!", deadline: "2024-11-15", status: "active" },
  ]);
});

// Get task board for a street
app.get('/api/community/:streetId/tasks', (req, res) => {
  // Placeholder - would fetch from tasks table
  res.json([
    { id: 1, title: "Help setting up new computer", category: "tech", poster: "Mary K.", urgency: "low", description: "Need help with new laptop", offers: 2 },
  ]);
});

// Health check / root route
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: '🏠 Happy Neighbor API is running!',
    version: '1.0.0',
    endpoints: {
      neighborhoods: '/api/neighborhoods',
      streets: '/api/streets',
      survey: '/api/streets/:id/surveys',
      addressLookup: '/api/lookup-address',
      verification: '/api/surveys/:id/verify'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
