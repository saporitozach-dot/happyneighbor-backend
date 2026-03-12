import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import passport from 'passport';
import linkedinOAuth2Module from 'passport-linkedin-oauth2';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import multer from 'multer';
import Stripe from 'stripe';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Password hashing for email/password auth
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};
const verifyPassword = (password, stored) => {
  if (!stored || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  const verify = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return hash === verify;
};

// Fix for ES module import - passport-linkedin-oauth2 exports differently in ES modules
const LinkedInStrategy = linkedinOAuth2Module.default?.Strategy || linkedinOAuth2Module.Strategy || linkedinOAuth2Module;

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Stripe (optional for local development)
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
  });
} else {
  console.log('⚠️  Stripe not configured. Payment features will be disabled.');
}

// Initialize email transporter (using Gmail for demo - configure with your email service)
let emailTransporter = null;
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  emailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// Email helper functions
const sendEmail = async (to, subject, html) => {
  if (!emailTransporter) {
    console.log('Email not configured. Would send:', { to, subject });
    return false;
  }
  
  try {
    await emailTransporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

const sendSurveyVerifiedEmail = async (email, streetName, city, state) => {
  const subject = 'Your Street Review Has Been Verified! 🎉';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316;">Your Review is Live!</h2>
      <p>Great news! Your review for <strong>${streetName}</strong> in ${city}, ${state} has been verified and is now live on Happy Neighbor.</p>
      <p>Your insights are helping others find their perfect neighborhood match. Thank you for contributing!</p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/street/${streetName}" 
         style="display: inline-block; padding: 12px 24px; background: #f97316; color: white; text-decoration: none; border-radius: 8px; margin-top: 20px;">
        View Your Street Profile
      </a>
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        - The Happy Neighbor Team
      </p>
    </div>
  `;
  return await sendEmail(email, subject, html);
};

const sendWelcomeEmail = async (email, name) => {
  const subject = 'Welcome to Happy Neighbor! 🏠';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316;">Welcome, ${name || 'there'}!</h2>
      <p>Thanks for joining Happy Neighbor! We're excited to help you find streets that match your lifestyle.</p>
      <p>Get started by taking our quick survey to see your personalized street matches.</p>
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/survey" 
         style="display: inline-block; padding: 12px 24px; background: #f97316; color: white; text-decoration: none; border-radius: 8px; margin-top: 20px;">
        Take the Survey
      </a>
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        - The Happy Neighbor Team
      </p>
    </div>
  `;
  return await sendEmail(email, subject, html);
};

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const ALLOWED_ORIGINS = [
  FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  ...(process.env.ADDITIONAL_ORIGINS ? process.env.ADDITIONAL_ORIGINS.split(',').map(s => s.trim()).filter(Boolean) : [])
].filter(Boolean);
const isLocalNetwork = (origin) => /^http:\/\/(localhost|127\.0\.0\.1|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(origin);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin) || isLocalNetwork(origin)) cb(null, true);
    else cb(null, false);
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
const isProduction = process.env.NODE_ENV === 'production';
app.use(session({
  secret: process.env.SESSION_SECRET || 'happy-neighbor-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: isProduction ? 'lax' : 'lax'
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

// Add payment/premium columns to users table
try {
  db.prepare('ALTER TABLE users ADD COLUMN premium_access INTEGER DEFAULT 0').run();
} catch (e) {}
try {
  db.prepare('ALTER TABLE users ADD COLUMN premium_expires_at DATETIME').run();
} catch (e) {}
try {
  db.prepare('ALTER TABLE users ADD COLUMN stripe_customer_id TEXT').run();
} catch (e) {}
try {
  db.prepare('ALTER TABLE users ADD COLUMN password_hash TEXT').run();
} catch (e) {}
try {
  db.prepare('ALTER TABLE users ADD COLUMN verified_address TEXT').run();
} catch (e) {}
try {
  db.prepare('ALTER TABLE users ADD COLUMN verified_street_id INTEGER').run();
} catch (e) {}

// Create payments table
db.exec(`
  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    stripe_payment_intent_id TEXT UNIQUE,
    amount INTEGER,
    currency TEXT DEFAULT 'usd',
    status TEXT,
    product_type TEXT DEFAULT 'matches_unlock',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS saved_streets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    street_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (street_id) REFERENCES streets(id) ON DELETE CASCADE,
    UNIQUE(user_id, street_id)
  );

  CREATE TABLE IF NOT EXISTS review_votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    survey_id INTEGER NOT NULL,
    user_id INTEGER,
    vote_type TEXT CHECK(vote_type IN ('upvote', 'downvote')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (survey_id) REFERENCES resident_surveys(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, survey_id)
  );

  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    source TEXT,
    street_ids TEXT,
    metadata_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    plan_type TEXT DEFAULT 'premium',
    status TEXT DEFAULT 'active',
    stripe_subscription_id TEXT,
    current_period_start DATETIME,
    current_period_end DATETIME,
    cancel_at_period_end INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

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

// Add public_education column to user_preferences
try {
  db.prepare('ALTER TABLE user_preferences ADD COLUMN public_education TEXT').run();
} catch (e) {}

// Add public_education column to resident_surveys
try {
  db.prepare('ALTER TABLE resident_surveys ADD COLUMN public_education TEXT').run();
} catch (e) {}

// Add new survey fields: safety, neighbor_familiarity, lawn_space
try {
  db.prepare('ALTER TABLE resident_surveys ADD COLUMN safety TEXT').run();
} catch (e) {}
try {
  db.prepare('ALTER TABLE resident_surveys ADD COLUMN neighbor_familiarity TEXT').run();
} catch (e) {}
try {
  db.prepare('ALTER TABLE resident_surveys ADD COLUMN lawn_space TEXT').run();
} catch (e) {}

// Add new fields to user_preferences
try {
  db.prepare('ALTER TABLE user_preferences ADD COLUMN safety TEXT').run();
} catch (e) {}
try {
  db.prepare('ALTER TABLE user_preferences ADD COLUMN neighbor_familiarity TEXT').run();
} catch (e) {}
try {
  db.prepare('ALTER TABLE user_preferences ADD COLUMN lawn_space TEXT').run();
} catch (e) {}

// Add pricing columns to streets table
try {
  db.prepare('ALTER TABLE streets ADD COLUMN avg_home_price INTEGER').run();
} catch (e) {}
try {
  db.prepare('ALTER TABLE streets ADD COLUMN avg_price_per_sqft INTEGER').run();
} catch (e) {}

// Populate mock pricing data for streets that don't have it
try {
  const streetsWithoutPricing = db.prepare('SELECT id, city, state FROM streets WHERE avg_home_price IS NULL').all();
  
  if (streetsWithoutPricing.length > 0) {
    console.log(`Populating mock pricing data for ${streetsWithoutPricing.length} streets...`);
    
    // State-based price multipliers (relative to national average)
    const statePriceMultipliers = {
      'CA': 2.2, 'NY': 1.8, 'MA': 1.7, 'WA': 1.6, 'CO': 1.5,
      'NJ': 1.5, 'CT': 1.4, 'MD': 1.3, 'VA': 1.2, 'FL': 1.1,
      'TX': 0.95, 'AZ': 1.1, 'NC': 0.9, 'GA': 0.95, 'PA': 0.85,
      'IL': 0.9, 'OH': 0.7, 'MI': 0.7, 'IN': 0.7, 'TN': 0.85,
      'MO': 0.75, 'WI': 0.8, 'MN': 0.9, 'OR': 1.4, 'NV': 1.2,
      'UT': 1.3, 'SC': 0.85, 'AL': 0.65, 'KY': 0.7, 'LA': 0.75
    };
    
    const updateStmt = db.prepare('UPDATE streets SET avg_home_price = ?, avg_price_per_sqft = ? WHERE id = ?');
    
    for (const street of streetsWithoutPricing) {
      const multiplier = statePriceMultipliers[street.state] || 1.0;
      // Base price around $350,000 with variance
      const basePrice = 350000;
      const variance = (Math.random() - 0.5) * 150000; // +/- $75,000
      const avgPrice = Math.round((basePrice * multiplier + variance) / 1000) * 1000;
      
      // Price per sqft: typically $150-400 depending on market
      const basePricePerSqft = 200;
      const sqftVariance = (Math.random() - 0.5) * 100;
      const avgPricePerSqft = Math.round(basePricePerSqft * multiplier + sqftVariance);
      
      updateStmt.run(avgPrice, avgPricePerSqft, street.id);
    }
    
    console.log('Mock pricing data populated successfully!');
  }
} catch (e) {
  console.error('Error populating pricing data:', e);
}

// Populate demo survey data for testing matching
try {
  const existingSurveys = db.prepare("SELECT COUNT(*) as count FROM resident_surveys WHERE verification_status = 'verified'").get();
  
  // Only populate if we have less than 50 verified surveys
  if (existingSurveys.count < 50) {
    console.log('Populating demo survey data...');
    
    const streets = db.prepare('SELECT id, name, city, state, neighborhood_id FROM streets LIMIT 100').all();
    
    if (streets.length > 0) {
      // Define diverse survey response profiles
      const surveyProfiles = [
        // Quiet, family-friendly, suburban profile
        {
          noise_level: 'Very Quiet',
          walkability: 'Somewhat Walkable',
          safety: 'Very Safe',
          kids_friendly: 'Very Family-Friendly',
          public_education: 'Excellent',
          events: 'Occasional',
          lawn_space: 'Very Large Yards',
          neighbor_familiarity: 'Often',
          notes: 'Perfect for families with young children. Great schools and safe environment.'
        },
        // Urban, walkable, social profile
        {
          noise_level: 'Lively',
          walkability: 'Very Walkable',
          safety: 'Safe',
          kids_friendly: 'Some Families',
          public_education: 'Good',
          events: 'Very Active',
          lawn_space: 'Small Yards',
          neighbor_familiarity: 'Sometimes',
          notes: 'Vibrant neighborhood with lots of restaurants and cafes nearby.'
        },
        // Suburban, quiet, private profile
        {
          noise_level: 'Quiet',
          walkability: 'Not Walkable',
          safety: 'Very Safe',
          kids_friendly: 'Family-Friendly',
          public_education: 'Good',
          events: 'None',
          lawn_space: 'Large Yards',
          neighbor_familiarity: 'Rarely',
          notes: 'Peaceful and private. Everyone keeps to themselves.'
        },
        // Active community, family-oriented
        {
          noise_level: 'Moderate',
          walkability: 'Walkable',
          safety: 'Safe',
          kids_friendly: 'Very Family-Friendly',
          public_education: 'Good',
          events: 'Regular',
          lawn_space: 'Large Yards',
          neighbor_familiarity: 'Often',
          notes: 'Great sense of community! Block parties every summer and regular BBQs.'
        },
        // Urban, very social, young professionals
        {
          noise_level: 'Lively',
          walkability: 'Very Walkable',
          safety: 'Somewhat Safe',
          kids_friendly: 'Not Family-Friendly',
          public_education: 'Average',
          events: 'Very Active',
          lawn_space: 'Small Yards',
          neighbor_familiarity: 'Sometimes',
          notes: 'Lots of nightlife and social events. Great for young professionals.'
        },
        // Quiet, walkable, family-friendly
        {
          noise_level: 'Quiet',
          walkability: 'Very Walkable',
          safety: 'Very Safe',
          kids_friendly: 'Very Family-Friendly',
          public_education: 'Excellent',
          events: 'Regular',
          lawn_space: 'Moderate Yards',
          neighbor_familiarity: 'Often',
          notes: 'Best of both worlds - quiet but walkable. Excellent schools and community.'
        },
        // Moderate everything, balanced
        {
          noise_level: 'Moderate',
          walkability: 'Walkable',
          safety: 'Safe',
          kids_friendly: 'Family-Friendly',
          public_education: 'Good',
          events: 'Occasional',
          lawn_space: 'Moderate Yards',
          neighbor_familiarity: 'Sometimes',
          notes: 'Nice balanced neighborhood. Not too quiet, not too loud.'
        },
        // Very quiet, private, suburban
        {
          noise_level: 'Very Quiet',
          walkability: 'Somewhat Walkable',
          safety: 'Very Safe',
          kids_friendly: 'Family-Friendly',
          public_education: 'Good',
          events: 'None',
          lawn_space: 'Large Yards',
          neighbor_familiarity: 'Rarely',
          notes: 'Extremely quiet and peaceful. Perfect for those who value privacy.'
        },
        // Active, social, community-focused
        {
          noise_level: 'Moderate',
          walkability: 'Walkable',
          safety: 'Safe',
          kids_friendly: 'Very Family-Friendly',
          public_education: 'Good',
          events: 'Very Active',
          lawn_space: 'Moderate Yards',
          neighbor_familiarity: 'Often',
          notes: 'Incredible community spirit! Everyone knows everyone and there are always events happening.'
        },
        // Urban, walkable, moderate social
        {
          noise_level: 'Lively',
          walkability: 'Very Walkable',
          safety: 'Safe',
          kids_friendly: 'Some Families',
          public_education: 'Average',
          events: 'Regular',
          lawn_space: 'Small Yards',
          neighbor_familiarity: 'Sometimes',
          notes: 'Great location with lots of amenities within walking distance.'
        }
      ];
      
      const insertStmt = db.prepare(`
        INSERT INTO resident_surveys 
        (street_id, neighborhood_id, resident_name, address, submitter_email, noise_level, walkability, safety, 
         kids_friendly, public_education, events, lawn_space, neighbor_familiarity, additional_notes, 
         address_verified, verification_status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'verified', datetime('now', '-' || ? || ' days'))
      `);
      
      let surveyCount = 0;
      const residentNames = ['Sarah M.', 'Michael C.', 'Jennifer R.', 'David L.', 'Emily K.', 
                            'Robert T.', 'Lisa P.', 'James W.', 'Maria G.', 'Thomas H.'];
      
      // Add 2-4 surveys per street with different profiles
      for (const street of streets) {
        const numSurveys = Math.floor(Math.random() * 3) + 2; // 2-4 surveys per street
        
        for (let i = 0; i < numSurveys; i++) {
          const profile = surveyProfiles[Math.floor(Math.random() * surveyProfiles.length)];
          const residentName = residentNames[Math.floor(Math.random() * residentNames.length)];
          const houseNumber = Math.floor(Math.random() * 500) + 1;
          const address = `${houseNumber} ${street.name}`;
          const daysAgo = Math.floor(Math.random() * 90); // Surveys from last 90 days
          
          try {
            const email = `demo${surveyCount}@happyneighbor.com`;
            insertStmt.run(
              street.id,
              street.neighborhood_id,
              residentName,
              address,
              email,
              profile.noise_level,
              profile.walkability,
              profile.safety,
              profile.kids_friendly,
              profile.public_education,
              profile.events,
              profile.lawn_space,
              profile.neighbor_familiarity,
              profile.notes,
              daysAgo
            );
            surveyCount++;
          } catch (e) {
            // Skip duplicates or errors
            console.warn(`Skipped survey for street ${street.id}: ${e.message}`);
          }
        }
      }
      
      console.log(`✅ Populated ${surveyCount} demo surveys across ${streets.length} streets!`);
    }
  } else {
    console.log(`Demo surveys already exist (${existingSurveys.count} verified surveys found).`);
  }
} catch (e) {
  console.error('Error populating demo survey data:', e);
}

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


// Helper function to aggregate survey responses into neighborhood profile
function aggregateSurveys(neighborhoodId, includePending = true) {
  // Include pending surveys for matching/demo purposes
  let query = `SELECT * FROM resident_surveys WHERE neighborhood_id = ?`;
  if (!includePending) {
    query += ` AND verification_status = 'verified'`;
  }
  const surveys = db.prepare(query).all(neighborhoodId);
  
  if (surveys.length === 0) {
    return null;
  }

  const criteria = ['noise_level', 'walkability', 'safety', 'kids_friendly', 'public_education', 'events', 'lawn_space', 'neighbor_familiarity'];
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

// Helper function to aggregate survey responses for a street
function aggregateStreetSurveys(streetId, includePending = true) {
  // Get surveys for this street (include pending for matching/demo purposes)
  let query = `SELECT * FROM resident_surveys WHERE street_id = ?`;
  let params = [streetId];
  
  if (!includePending) {
    query += ` AND verification_status = 'verified'`;
  }
  
  const surveys = db.prepare(query).all(...params);
  
  if (surveys.length === 0) {
    return null;
  }

  const criteria = ['noise_level', 'walkability', 'safety', 'kids_friendly', 'public_education', 'events', 'lawn_space', 'neighbor_familiarity'];
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

// Helper function to calculate match score with category breakdowns
function calculateMatchScore(neighborhoodProfile, preferences) {
  let totalScore = 0;
  let totalCriteria = 0;
  const categoryScores = {};

  const fieldMapping = {
    noise: 'noise_level',
    walkability: 'walkability',
    safety: 'safety',
    kids_friendly: 'kids_friendly',
    public_education: 'public_education',
    events: 'events',
    lawn_space: 'lawn_space',
    neighbor_familiarity: 'neighbor_familiarity'
  };
  
  Object.keys(fieldMapping).forEach(prefKey => {
    const dbKey = fieldMapping[prefKey];
    if (preferences[prefKey] && neighborhoodProfile[dbKey]) {
      totalCriteria++;
      const pref = preferences[prefKey].toLowerCase();
      const neigh = neighborhoodProfile[dbKey].toLowerCase();
      
      let categoryScore = 0;
      
      // Special handling for fields where user provides importance and street provides reality
      if (prefKey === 'kids_friendly') {
        // User: "Very Important" -> Street: "Very Family-Friendly" = perfect match
        // User: "Important" -> Street: "Family-Friendly" = good match
        // User: "Not Important" -> Street: "Not Family-Friendly" = good match (they don't care, so it's fine)
        if ((pref.includes('very important') && (neigh.includes('very') && neigh.includes('friendly'))) ||
            (pref.includes('important') && neigh.includes('family-friendly') && !neigh.includes('not'))) {
          categoryScore = 100;
        } else if ((pref.includes('somewhat important') && neigh.includes('family-friendly')) ||
                   (pref.includes('not important'))) {
          categoryScore = 80; // They don't care much, so any answer is acceptable
        } else if (pref.includes('important') && neigh.includes('some families')) {
          categoryScore = 70;
        } else {
          categoryScore = 40; // Mismatch
        }
      } else if (prefKey === 'neighbor_familiarity') {
        // User: "Very Important" -> Street: "Often" = perfect match
        // User: "Important" -> Street: "Sometimes" or "Often" = good match
        // User: "Not Important" -> Street: "Never" or "Rarely" = good match (they don't care)
        if ((pref.includes('very important') && neigh.includes('often')) ||
            (pref.includes('important') && (neigh.includes('sometimes') || neigh.includes('often'))) ||
            (pref.includes('not important') && (neigh.includes('never') || neigh.includes('rarely')))) {
          categoryScore = 100;
        } else if ((pref.includes('somewhat important') && (neigh.includes('sometimes') || neigh.includes('often'))) ||
                   (pref.includes('not important'))) {
          categoryScore = 80;
        } else {
          categoryScore = 50; // Partial mismatch
        }
      } else if (prefKey === 'lawn_space') {
        // User: "Very Important" -> Street: "Very Large Yards" = perfect match
        // User: "Important" -> Street: "Large Yards" or "Very Large Yards" = good match
        // User: "Not Important" -> Street: "Small Yards" = good match (they don't care)
        if ((pref.includes('very important') && neigh.includes('very large')) ||
            (pref.includes('important') && neigh.includes('large') && !neigh.includes('small'))) {
          categoryScore = 100;
        } else if ((pref.includes('somewhat important') && (neigh.includes('large') || neigh.includes('moderate'))) ||
                   (pref.includes('not important'))) {
          categoryScore = 80;
        } else if (pref.includes('important') && neigh.includes('moderate')) {
          categoryScore = 70;
        } else {
          categoryScore = 50; // Partial mismatch
        }
      } else if (prefKey === 'safety') {
        // User: "Very Important" -> Street: "Very Safe" = perfect match
        // User: "Important" -> Street: "Safe" or "Very Safe" = good match
        // User: "Not Important" -> Street: any = acceptable (they don't care)
        if ((pref.includes('very important') && neigh.includes('very safe')) ||
            (pref.includes('important') && (neigh.includes('safe') && !neigh.includes('not')))) {
          categoryScore = 100;
        } else if ((pref.includes('somewhat important') && (neigh.includes('safe') || neigh.includes('somewhat safe'))) ||
                   (pref.includes('not important'))) {
          categoryScore = 80;
        } else if (pref.includes('important') && neigh.includes('somewhat safe')) {
          categoryScore = 70;
        } else {
          categoryScore = 40; // Mismatch - they care about safety but street isn't safe
        }
      } else if (prefKey === 'public_education') {
        // User: "Very Important" -> Street: "Excellent" = perfect match
        // User: "Important" -> Street: "Good" or "Excellent" = good match
        // User: "Not Important" -> Street: any = acceptable (they don't care)
        if ((pref.includes('very important') && neigh.includes('excellent')) ||
            (pref.includes('important') && (neigh.includes('good') || neigh.includes('excellent')))) {
          categoryScore = 100;
        } else if ((pref.includes('somewhat important') && (neigh.includes('good') || neigh.includes('average'))) ||
                   (pref.includes('not important'))) {
          categoryScore = 80;
        } else if (pref.includes('important') && neigh.includes('average')) {
          categoryScore = 70;
        } else if (pref.includes('important') && (neigh.includes('poor') || neigh.includes('below average'))) {
          categoryScore = 30; // They care but schools are poor
        } else {
          categoryScore = 50; // Partial mismatch
        }
      } else {
        // Standard matching for other fields (noise, walkability, safety, events, public_education)
        // Exact match
        if (pref === neigh) {
          categoryScore = 100;
        } 
        // Partial match (similar meanings)
        else if (
          (pref.includes('very') && neigh.includes('very')) ||
          (pref.includes('quiet') && neigh.includes('quiet')) ||
          (pref.includes('social') && neigh.includes('social')) ||
          (pref.includes('active') && neigh.includes('active')) ||
          (pref.includes('important') && neigh.includes('important')) ||
          (pref.includes('safe') && neigh.includes('safe')) ||
          (pref.includes('regular') && neigh.includes('regular')) ||
          (pref.includes('lively') && neigh.includes('lively')) ||
          (pref.includes('walkable') && neigh.includes('walkable'))
        ) {
          categoryScore = 80;
        } 
        // Somewhat related
        else if (
          (pref.includes('moderate') && neigh.includes('moderate')) ||
          (pref.includes('somewhat') && neigh.includes('somewhat')) ||
          (pref.includes('occasional') && neigh.includes('occasional')) ||
          (pref.includes('sometimes') && neigh.includes('sometimes'))
        ) {
          categoryScore = 60;
        }
        // Default partial score
        else {
          categoryScore = 40;
        }
      }
      
      totalScore += categoryScore;
      categoryScores[prefKey] = categoryScore;
    } else {
      categoryScores[prefKey] = null;
    }
  });

  const overallScore = totalCriteria > 0 ? Math.round(totalScore / totalCriteria) : 0;
  
  return {
    overall: overallScore,
    categories: categoryScores
  };
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
      
      // Send welcome email
      if (email) {
        sendWelcomeEmail(email, fullName || firstName).catch(err => 
          console.error('Failed to send welcome email:', err)
        );
      }
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

// Register (email + password)
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, full_name, address } = req.body;
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    const emailNorm = email.trim().toLowerCase();
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(emailNorm);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }
    const linkedinId = 'local_' + emailNorm;
    const passwordHash = hashPassword(password);
    const nameParts = (full_name || '').trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    db.prepare(`
      INSERT INTO users (linkedin_id, email, first_name, last_name, full_name, password_hash, auth_provider, verified_address)
      VALUES (?, ?, ?, ?, ?, ?, 'local', ?)
    `).run(linkedinId, emailNorm, firstName, lastName, (full_name || '').trim(), passwordHash, address ? String(address).trim() : null);
    const user = db.prepare('SELECT id, email, first_name, last_name, full_name FROM users WHERE id = ?').get(db.prepare('SELECT last_insert_rowid()').pluck().get());
    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: 'Session creation failed' });
      res.json({ success: true, user: { id: user.id, email: user.email, full_name: user.full_name } });
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login (email + password)
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const emailNorm = email.trim().toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE (LOWER(email) = ? OR linkedin_id = ?) AND password_hash IS NOT NULL').get(emailNorm, 'local_' + emailNorm);
    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
    const { password_hash, access_token, refresh_token, ...safeUser } = user;
    req.login(safeUser, (err) => {
      if (err) return res.status(500).json({ error: 'Session creation failed' });
      res.json({ success: true, user: { id: safeUser.id, email: safeUser.email, full_name: safeUser.full_name } });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Dev: Seed database with sample streets and surveys (for prototype demos)
app.post('/api/dev/seed', (req, res) => {
  try {
    const streets = [
      { name: 'Maple Avenue', city: 'Boston', state: 'MA', full_address: 'Maple Avenue, Boston, MA', lat: 42.3601, lng: -71.0589 },
      { name: 'Oak Street', city: 'Portland', state: 'OR', full_address: 'Oak Street, Portland, OR', lat: 45.5152, lng: -122.6784 },
      { name: 'Park Boulevard', city: 'Seattle', state: 'WA', full_address: 'Park Boulevard, Seattle, WA', lat: 47.6062, lng: -122.3321 },
      { name: 'Elm Drive', city: 'Austin', state: 'TX', full_address: 'Elm Drive, Austin, TX', lat: 30.2672, lng: -97.7431 },
      { name: 'Main Street', city: 'Denver', state: 'CO', full_address: 'Main Street, Denver, CO', lat: 39.7392, lng: -104.9903 },
      { name: 'Cedar Lane', city: 'Boston', state: 'MA', full_address: 'Cedar Lane, Boston, MA', lat: 42.3601, lng: -71.0589 },
      { name: 'Pine Avenue', city: 'Portland', state: 'OR', full_address: 'Pine Avenue, Portland, OR', lat: 45.5152, lng: -122.6784 },
      { name: 'First Street', city: 'Seattle', state: 'WA', full_address: 'First Street, Seattle, WA', lat: 47.6062, lng: -122.3321 },
    ];
    let added = 0;
    const checkStreet = db.prepare('SELECT id FROM streets WHERE name = ? AND city = ? AND state = ?');
    const insStreet = db.prepare(`INSERT INTO streets (name, city, state, full_address, latitude, longitude) VALUES (?,?,?,?,?,?)`);
    for (const s of streets) {
      if (checkStreet.get(s.name, s.city, s.state)) continue;
      insStreet.run(s.name, s.city, s.state, s.full_address, s.lat, s.lng);
      added++;
    }
    const streetRows = db.prepare('SELECT id, name, city, state FROM streets').all();
    const surveyProfiles = [
      { noise_level: 'Very Quiet', sociability: 'Friendly', events: 'Occasional', kids_friendly: 'Very Family-Friendly', walkability: 'Very Walkable', cookouts: 'Regular', nightlife: 'Quiet' },
      { noise_level: 'Lively', sociability: 'Very Social', events: 'Very Active', kids_friendly: 'Some Families', walkability: 'Walkable', cookouts: 'Regular', nightlife: 'Active' },
      { noise_level: 'Moderate', sociability: 'Social', events: 'Regular', kids_friendly: 'Family-Friendly', walkability: 'Very Walkable', cookouts: 'Regular', nightlife: 'Moderate' },
      { noise_level: 'Very Quiet', sociability: 'Mostly Private', events: 'Rare', kids_friendly: 'Family-Friendly', walkability: 'Not Walkable', cookouts: 'Occasional', nightlife: 'None' },
    ];
    const countSurveys = db.prepare("SELECT COUNT(*) as c FROM resident_surveys WHERE street_id = ? AND verification_status = 'verified'");
    const insSurvey = db.prepare(`INSERT INTO resident_surveys (street_id, noise_level, sociability, events, kids_friendly, walkability, cookouts, nightlife, address_verified, verification_status) VALUES (?,?,?,?,?,?,?,?,1,'verified')`);
    let surveysAdded = 0;
    for (const st of streetRows) {
      if (countSurveys.get(st.id).c > 0) continue;
      const profile = surveyProfiles[streetRows.indexOf(st) % surveyProfiles.length];
      try { insSurvey.run(st.id, profile.noise_level, profile.sociability, profile.events, profile.kids_friendly, profile.walkability, profile.cookouts, profile.nightlife); surveysAdded++; } catch (e) {}
    }
    const totalStreets = db.prepare('SELECT COUNT(*) as c FROM streets').get().c;
    const totalSurveys = db.prepare("SELECT COUNT(*) as c FROM resident_surveys WHERE verification_status = 'verified'").get().c;
    res.json({ success: true, streetsAdded: added, surveysAdded, totalStreets, totalSurveys });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Business partnership inquiries (Local Shops)
app.post('/api/partnerships/shop', (req, res) => {
  try {
    const { business_name, contact_name, email, phone, business_type, city, state, menu, target_cities } = req.body;
    if (!email || !business_name || !contact_name) {
      return res.status(400).json({ error: 'Business name, contact name, and email are required' });
    }
    const metadata = { type: 'shop', business_name, contact_name, phone, business_type, city, state, menu: menu || [], target_cities };
    db.prepare(`INSERT INTO leads (email, source, street_ids, metadata_json) VALUES (?, 'shop_partnership', '', ?)`).run(email.trim().toLowerCase(), JSON.stringify(metadata));
    res.json({ success: true });
  } catch (err) {
    console.error('Shop partnership error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Realtor partnership inquiries
app.post('/api/partnerships/realtor', (req, res) => {
  try {
    const { realtor_name, agency_name, email, phone, license_number, target_areas, target_cities, description, website } = req.body;
    if (!email || !realtor_name || !agency_name) {
      return res.status(400).json({ error: 'Realtor name, agency name, and email are required' });
    }
    const metadata = { type: 'realtor', realtor_name, agency_name, phone, license_number, target_areas, target_cities, description, website };
    db.prepare(`INSERT INTO leads (email, source, street_ids, metadata_json) VALUES (?, 'realtor_partnership', '', ?)`).run(email.trim().toLowerCase(), JSON.stringify(metadata));
    res.json({ success: true });
  } catch (err) {
    console.error('Realtor partnership error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Capture leads (email signup, save favorites, etc.) - no auth required
app.post('/api/leads', (req, res) => {
  try {
    const { email, source = 'signup', streetIds = [], metadata = {} } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }
    const streetIdsStr = Array.isArray(streetIds) ? streetIds.join(',') : String(streetIds || '');
    const metadataStr = typeof metadata === 'object' ? JSON.stringify(metadata) : '{}';
    db.prepare(`
      INSERT INTO leads (email, source, street_ids, metadata_json)
      VALUES (?, ?, ?, ?)
    `).run(email.trim().toLowerCase(), source, streetIdsStr, metadataStr);
    res.json({ success: true });
  } catch (error) {
    console.error('Leads error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save user preferences
app.post('/api/user/preferences', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { noise, walkability, safety, kids_friendly, public_education, events, lawn_space, neighbor_familiarity } = req.body;
    
    // Check if preferences exist
    const existing = db.prepare('SELECT * FROM user_preferences WHERE user_id = ?').get(req.user.id);
    
    if (existing) {
      // Update
      db.prepare(`
        UPDATE user_preferences 
        SET noise = ?, walkability = ?, safety = ?, kids = ?, public_education = ?,
            events = ?, lawn_space = ?, neighbor_familiarity = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(noise, walkability, safety, kids_friendly, public_education, events, lawn_space, neighbor_familiarity, req.user.id);
    } else {
      // Insert
      db.prepare(`
        INSERT INTO user_preferences (user_id, noise, walkability, safety, kids, public_education, events, lawn_space, neighbor_familiarity)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(req.user.id, noise, walkability, safety, kids_friendly, public_education, events, lawn_space, neighbor_familiarity);
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
    const user = db.prepare('SELECT id, email, first_name, last_name, full_name, profile_picture, headline, job_title, company, industry, location, profile_url, neighborhood_id, neighborhood_name, verified_address, verified_street_id, premium_access, created_at, last_login FROM users WHERE id = ?').get(req.user.id);
    const preferences = db.prepare('SELECT * FROM user_preferences WHERE user_id = ?').get(req.user.id);
    const neighborhood = user.neighborhood_id ? db.prepare('SELECT * FROM neighborhoods WHERE id = ?').get(user.neighborhood_id) : null;
    const savedStreets = db.prepare(`
      SELECT s.*, n.name as neighborhood_name,
        (SELECT COUNT(*) FROM resident_surveys WHERE street_id = s.id AND verification_status = 'verified') as survey_count
      FROM saved_streets ss
      JOIN streets s ON ss.street_id = s.id
      LEFT JOIN neighborhoods n ON s.neighborhood_id = n.id
      WHERE ss.user_id = ?
      ORDER BY ss.created_at DESC
    `).all(req.user.id);
    const savedCount = savedStreets.length;
    const savedLimit = user.premium_access ? 999 : FREE_SAVED_LIMIT;
    
    res.json({
      ...user,
      preferences: preferences || null,
      neighborhood: neighborhood || null,
      savedStreets,
      savedCount,
      savedLimit,
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
      walkability,
      safety,
      kids_friendly, 
      public_education,
      events,
      lawn_space,
      neighbor_familiarity,
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
      (neighborhood_id, street_id, resident_name, address, noise_level, walkability, safety, kids_friendly, public_education, events, lawn_space, neighbor_familiarity, additional_notes, address_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      neighborhoodId, 
      finalStreetId || null,
      resident_name || null, 
      address || null, 
      noise_level, 
      walkability,
      safety,
      kids_friendly, 
      public_education,
      events,
      lawn_space,
      neighbor_familiarity,
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
    const { resident_name, address, noise_level, walkability, safety, kids_friendly, public_education, events, lawn_space, neighbor_familiarity, additional_notes } = req.body;
    
    const stmt = db.prepare(`
      UPDATE resident_surveys 
      SET resident_name = ?, address = ?, noise_level = ?, walkability = ?, safety = ?, kids_friendly = ?, 
          public_education = ?, events = ?, lawn_space = ?, neighbor_familiarity = ?, additional_notes = ?
      WHERE id = ?
    `);
    
    stmt.run(resident_name || null, address || null, noise_level, walkability, safety, kids_friendly, public_education, events, lawn_space, neighbor_familiarity, additional_notes, req.params.id);
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
    const addressPattern = /^(\d+)\s+\w+/;
    const match = address.trim().match(addressPattern);
    if (!match) {
      return res.json({
        success: false,
        error: 'Please enter a valid street address starting with a house number (e.g., "123 Main Street, City, State")'
      });
    }

    // Extract house number from input (normalize by removing commas)
    const inputHouseNumber = parseInt(match[1].replace(/,/g, ''), 10);
    if (isNaN(inputHouseNumber) || inputHouseNumber < 1) {
      return res.json({
        success: false,
        error: 'Please enter a valid house number.'
      });
    }

    // Use SmartyStreets US Address Validation API (validates against USPS data)
    // Free tier: 250 lookups/month - sign up at smartystreets.com
    const SMARTY_AUTH_ID = process.env.SMARTY_AUTH_ID || '';
    const SMARTY_AUTH_TOKEN = process.env.SMARTY_AUTH_TOKEN || '';
    
    let geocodeData = [];
    let validatedAddress = null;
    
    if (SMARTY_AUTH_ID && SMARTY_AUTH_TOKEN) {
      // Use SmartyStreets for validation (more accurate)
      try {
        const smartyUrl = `https://us-street.api.smartystreets.com/street-address?auth-id=${SMARTY_AUTH_ID}&auth-token=${SMARTY_AUTH_TOKEN}&street=${encodeURIComponent(address)}&candidates=1`;
        const smartyResponse = await fetch(smartyUrl);
        
        if (smartyResponse.ok) {
          const smartyData = await smartyResponse.json();
          if (smartyData && smartyData.length > 0 && smartyData[0].components) {
            validatedAddress = smartyData[0];
            // Convert SmartyStreets format to our expected format
            const comp = validatedAddress.components;
            const meta = validatedAddress.metadata || {};
            geocodeData = [{
              address: {
                house_number: comp.primary_number,
                road: comp.street_name + (comp.street_suffix ? ' ' + comp.street_suffix : ''),
                city: comp.city_name,
                state: comp.state_abbreviation,
                postcode: comp.zipcode,
                'ISO3166-2-lvl4': `US-${comp.state_abbreviation}`
              },
              lat: validatedAddress.metadata?.latitude,
              lon: validatedAddress.metadata?.longitude,
              display_name: validatedAddress.delivery_line_1 + ', ' + comp.city_name + ', ' + comp.state_abbreviation,
              type: 'house'
            }];
          }
        }
      } catch (error) {
        console.error('SmartyStreets API error:', error);
        // Fall back to Nominatim if SmartyStreets fails
      }
    }
    
    // Fallback to Nominatim if SmartyStreets not configured or failed
    if (geocodeData.length === 0) {
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

      geocodeData = await geocodeResponse.json();
    }
    
    if (!geocodeData || geocodeData.length === 0) {
      return res.json({
        success: false,
        error: 'Address not found. Please check the address and include city/state.'
      });
    }

    // LENIENT VALIDATION: Must be a real street, accept any house number on valid streets
    // We trust users to enter their real address - the document verification step validates residency
    let bestResult = null;
    let exactMatch = null;
    
    for (const result of geocodeData) {
      const addr = result.address || {};
      
      // Must have a street/road name
      const hasStreet = addr.road || addr.street || addr.highway;
      
      // Reject PO boxes
      const resultType = (result.type || '').toLowerCase();
      const isPOBox = resultType.includes('post_office') || resultType.includes('post_box');
      
      if (!hasStreet || isPOBox) {
        continue;
      }
      
      // Check for exact house number match (preferred)
      if (addr.house_number) {
        const geocodedHouseNumber = parseInt(String(addr.house_number).replace(/,/g, ''), 10);
        if (!isNaN(geocodedHouseNumber) && geocodedHouseNumber === inputHouseNumber) {
          exactMatch = result;
          break;
        }
      }
      
      // Accept any result with a valid street name
      // The document verification step will confirm they actually live there
      if (!bestResult) {
        bestResult = result;
      }
    }
    
    // Use exact match if found, otherwise use best street match
    bestResult = exactMatch || bestResult;
    
    // If no street-level results found, try to create from the input directly
    if (!bestResult) {
      // Parse the input address manually as a fallback
      const inputParts = address.trim().split(',').map(p => p.trim());
      if (inputParts.length >= 2) {
        // Try to extract street name from the first part (after house number)
        const streetPart = inputParts[0].replace(/^\d+\s+/, '').trim();
        const cityPart = inputParts[1]?.trim();
        const statePart = inputParts[2]?.trim() || inputParts[1]?.split(/\s+/).pop();
        
        if (streetPart && cityPart) {
          bestResult = {
            address: {
              road: streetPart,
              city: cityPart.replace(/\s+\w{2}$/, '').trim(), // Remove state abbrev if present
              state: statePart || '',
              house_number: match[1]
            },
            display_name: address.trim(),
            lat: null,
            lon: null
          };
        }
      }
    }
    
    // Final check - reject if still no result
    if (!bestResult) {
      return res.json({
        success: false,
        error: 'Could not find that address. Please enter a complete street address (e.g., "123 Main St, Boston, MA").'
      });
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
      walkability,
      safety,
      kids_friendly,
      public_education,
      events,
      lawn_space,
      neighbor_familiarity,
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
        (street_id, neighborhood_id, resident_name, address, submitter_email, noise_level, walkability, safety,
         kids_friendly, public_education, events, lawn_space, neighbor_familiarity, additional_notes, address_verified, verification_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'pending')
      `);
      result = stmt.run(
        streetId, neighborhoodId, resident_name || null, address || null, email || null,
        noise_level, walkability, safety, kids_friendly, public_education, events, lawn_space, neighbor_familiarity, additional_notes
      );
    } else {
      // Insert without neighborhood_id to avoid NOT NULL constraint
      const stmt = db.prepare(`
        INSERT INTO resident_surveys 
        (street_id, resident_name, address, submitter_email, noise_level, walkability, safety,
         kids_friendly, public_education, events, lawn_space, neighbor_familiarity, additional_notes, address_verified, verification_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'pending')
      `);
      result = stmt.run(
        streetId, resident_name || null, address || null, email || null,
        noise_level, walkability, safety, kids_friendly, public_education, events, lawn_space, neighbor_familiarity, additional_notes
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
    
    // If approved, update street aggregates and send email
    if (action === 'approve' && survey.street_id) {
      updateStreetAggregates(survey.street_id);
      
      // Send verification email if email is available
      if (survey.submitter_email) {
        const street = db.prepare('SELECT name, city, state FROM streets WHERE id = ?').get(survey.street_id);
        if (street) {
          sendSurveyVerifiedEmail(
            survey.submitter_email,
            street.name,
            street.city,
            street.state
          ).catch(err => console.error('Failed to send verification email:', err));
        }
      }
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
      walkability: aggregate('walkability'),
      safety: aggregate('safety'),
      kids_friendly: aggregate('kids_friendly'),
      public_education: aggregate('public_education'),
      events: aggregate('events'),
      lawn_space: aggregate('lawn_space'),
      neighbor_familiarity: aggregate('neighbor_familiarity')
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

// Get matches based on preferences (STREETS ONLY)
app.post('/api/matches', (req, res) => {
  try {
    const preferences = req.body;
    const matches = [];
    
    // Get streets with verified surveys
    const streets = db.prepare(`
      SELECT s.*, n.name as neighborhood_name
      FROM streets s 
      LEFT JOIN neighborhoods n ON s.neighborhood_id = n.id
      ORDER BY s.name
    `).all();
    
    streets.forEach(street => {
      // Only include streets with VERIFIED surveys for matching
      const profile = aggregateStreetSurveys(street.id, false); // false = only verified
      if (profile && profile.survey_count > 0) {
        const matchResult = calculateMatchScore(profile, preferences);
        matches.push({
          id: street.id,
          name: street.name || `${street.city}, ${street.state}`,
          city: street.city,
          state: street.state,
          location: `${street.city}, ${street.state}`,
          street_name: street.name,
          neighborhood_name: street.neighborhood_name,
          type: 'street',
          avg_home_price: street.avg_home_price,
          avg_price_per_sqft: street.avg_price_per_sqft,
          ...profile,
          matchScore: matchResult.overall,
          matchCategories: matchResult.categories,
          survey_count: profile.survey_count
        });
      }
    });
    
    // Sort by match score and return all (frontend will handle limiting)
    const sortedMatches = matches
      .filter(match => match.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);
    
    res.json(sortedMatches);
  } catch (error) {
    console.error('Matches error:', error);
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
      if (req.user?.id) {
        db.prepare('UPDATE users SET verified_address = ?, verified_street_id = ? WHERE id = ?').run(survey.address, parseInt(streetId), req.user.id);
      }
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
      if (req.user?.id) {
        db.prepare('UPDATE users SET verified_address = ?, verified_street_id = ? WHERE id = ?').run(surveyById.address, parseInt(streetId), req.user.id);
      }
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

// Check if logged-in user has Community Hub access (via verified address)
app.get('/api/community/has-access/:streetId', (req, res) => {
  try {
    const streetId = parseInt(req.params.streetId);
    if (!req.user?.id) {
      return res.json({ hasAccess: false });
    }
    const user = db.prepare('SELECT verified_street_id FROM users WHERE id = ?').get(req.user.id);
    const hasAccess = user?.verified_street_id === streetId;
    res.json({ hasAccess: !!hasAccess });
  } catch (error) {
    res.json({ hasAccess: false });
  }
});

// Check returning neighbor by address
app.post('/api/community/check-returning', async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({ success: false, error: 'Address is required' });
    }
    
    // Look up the address in verified surveys
    const survey = db.prepare(`
      SELECT s.*, st.id as street_id, st.name as street_name, st.city, st.state
      FROM resident_surveys s
      JOIN streets st ON s.street_id = st.id
      WHERE LOWER(s.address) = LOWER(?)
      AND s.verification_status = 'verified'
      ORDER BY s.created_at DESC
      LIMIT 1
    `).get(address.trim());
    
    if (survey) {
      return res.json({
        success: true,
        streetId: survey.street_id,
        streetName: survey.street_name,
        city: survey.city,
        state: survey.state,
        message: 'Welcome back!'
      });
    }
    
    // Try a fuzzy match on the address (normalize spaces, punctuation)
    const normalizedAddress = address.trim().toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/,\s*/g, ', ')
      .replace(/\./g, '');
    
    const allVerifiedSurveys = db.prepare(`
      SELECT s.*, st.id as street_id, st.name as street_name, st.city, st.state
      FROM resident_surveys s
      JOIN streets st ON s.street_id = st.id
      WHERE s.verification_status = 'verified'
    `).all();
    
    for (const s of allVerifiedSurveys) {
      if (s.address) {
        const surveyAddr = s.address.toLowerCase()
          .replace(/\s+/g, ' ')
          .replace(/,\s*/g, ', ')
          .replace(/\./g, '');
        
        if (surveyAddr === normalizedAddress || surveyAddr.includes(normalizedAddress) || normalizedAddress.includes(surveyAddr)) {
          return res.json({
            success: true,
            streetId: s.street_id,
            streetName: s.street_name,
            city: s.city,
            state: s.state,
            message: 'Welcome back!'
          });
        }
      }
    }
    
    return res.json({ 
      success: false, 
      error: "We couldn't find your address in our verified residents list. Please complete the survey to join your Community Hub." 
    });
  } catch (error) {
    console.error('Check returning neighbor error:', error);
    res.status(500).json({ success: false, error: error.message });
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

// ============== PAYMENT ENDPOINTS (STRIPE) ==============

// Create Stripe payment intent for matches unlock
app.post('/api/payments/create-intent', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Payment service not configured' });
    }
    
    const { amount = 1000 } = req.body; // $10.00 in cents
    
    // Get user ID from session (optional - can work without auth for demo)
    const userId = req.user?.id || null;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      metadata: {
        userId: userId?.toString() || 'anonymous',
        productType: 'matches_unlock'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify payment and unlock premium access
app.post('/api/payments/verify', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Payment service not configured' });
    }
    
    const { paymentIntentId } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID required' });
    }
    
    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ 
        error: 'Payment not completed',
        status: paymentIntent.status 
      });
    }
    
    // Get user ID from metadata or session
    const userId = paymentIntent.metadata.userId !== 'anonymous' 
      ? parseInt(paymentIntent.metadata.userId) 
      : req.user?.id;
    
    // Record payment in database
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);
    
    db.prepare(`
      INSERT INTO payments (user_id, stripe_payment_intent_id, amount, status, product_type)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      userId || null,
      paymentIntentId,
      paymentIntent.amount,
      paymentIntent.status,
      paymentIntent.metadata.productType || 'matches_unlock'
    );
    
    // Grant premium access for 1 month
    if (userId) {
      db.prepare(`
        UPDATE users 
        SET premium_access = 1, premium_expires_at = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(expiresAt.toISOString(), userId);
    }
    
    // Send confirmation email if user has email
    if (userId) {
      const user = db.prepare('SELECT email, full_name FROM users WHERE id = ?').get(userId);
      if (user?.email && emailTransporter) {
        try {
          await emailTransporter.sendMail({
            from: process.env.SMTP_USER,
            to: user.email,
            subject: 'Welcome to Happy Neighbor Premium!',
            html: `
              <h2>Thank you for your purchase!</h2>
              <p>Hi ${user.full_name || 'there'},</p>
              <p>Your premium access has been activated. You now have full access to:</p>
              <ul>
                <li>All street matches (beyond the top 3)</li>
                <li>Advanced search and filtering</li>
                <li>Priority support</li>
              </ul>
              <p>Start exploring your matches at: <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/results">View Matches</a></p>
              <p>Happy house hunting!</p>
              <p>- The Happy Neighbor Team</p>
            `
          });
        } catch (emailError) {
          console.error('Email send error:', emailError);
          // Don't fail the payment if email fails
        }
      }
    }
    
    // Return success response
    res.json({
      success: true,
      premiumAccess: true,
      paymentIntentId: paymentIntentId,
      expiresAt: expiresAt.toISOString(),
      message: 'Payment verified! Premium access activated.'
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check if user has premium access
app.get('/api/user/premium-status', (req, res) => {
  try {
    // For anonymous users, check localStorage (handled on frontend)
    if (!req.user) {
      return res.json({ premiumAccess: false, message: 'Login required for premium features' });
    }
    
    const user = db.prepare('SELECT premium_access, premium_expires_at FROM users WHERE id = ?').get(req.user.id);
    
    if (!user) {
      return res.json({ premiumAccess: false });
    }
    
    // Check if premium has expired
    let premiumAccess = user.premium_access === 1;
    if (user.premium_expires_at) {
      const expiresAt = new Date(user.premium_expires_at);
      premiumAccess = premiumAccess && expiresAt > new Date();
    }
    
    res.json({
      premiumAccess,
      expiresAt: user.premium_expires_at
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============== PREMIUM VERIFICATION (ANONYMOUS USERS) ==============

// Verify premium access by payment intent ID (for anonymous users)
app.post('/api/premium/verify', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    
    if (!paymentIntentId) {
      return res.json({ premiumAccess: false, error: 'Payment intent ID required' });
    }
    
    // Look up payment in database
    const payment = db.prepare(`
      SELECT created_at, status, product_type 
      FROM payments 
      WHERE stripe_payment_intent_id = ? AND status = 'succeeded'
    `).get(paymentIntentId);
    
    if (!payment) {
      return res.json({ premiumAccess: false });
    }
    
    // Calculate expiration (1 month from payment date)
    const paymentDate = new Date(payment.created_at);
    const expiresAt = new Date(paymentDate);
    expiresAt.setMonth(expiresAt.getMonth() + 1);
    
    // Check if still valid
    const now = new Date();
    const isValid = expiresAt > now;
    
    res.json({
      premiumAccess: isValid,
      expiresAt: expiresAt.toISOString(),
      isValid: isValid
    });
  } catch (error) {
    console.error('Premium verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============== SEARCH & FILTERING (PREMIUM ONLY) ==============

// Search streets with filters (premium feature)
app.post('/api/streets/search', async (req, res) => {
  try {
    const { query, filters, preferences } = req.body;
    
    // Check premium access
    const userId = req.user?.id;
    let hasPremium = false;
    
    if (userId) {
      const user = db.prepare('SELECT premium_access, premium_expires_at FROM users WHERE id = ?').get(userId);
      if (user) {
        hasPremium = user.premium_access === 1;
        if (user.premium_expires_at) {
          const expiresAt = new Date(user.premium_expires_at);
          hasPremium = hasPremium && expiresAt > new Date();
        }
      }
    }
    
    // Check localStorage premium (for anonymous users who paid)
    // This is handled on frontend, but we'll allow if they have a valid payment
    const hasLocalPremium = req.headers['x-premium-access'] === 'true';
    
    if (!hasPremium && !hasLocalPremium) {
      return res.status(403).json({ 
        error: 'Premium access required',
        requiresPayment: true 
      });
    }
    
    // Build search query
    let sqlQuery = `
      SELECT s.*, n.name as neighborhood_name,
        (SELECT COUNT(*) FROM resident_surveys WHERE street_id = s.id AND verification_status = 'verified') as survey_count
      FROM streets s
      LEFT JOIN neighborhoods n ON s.neighborhood_id = n.id
      WHERE 1=1
    `;
    const params = [];
    
    // Text search
    if (query && query.trim().length > 0) {
      sqlQuery += ` AND (s.name LIKE ? OR s.city LIKE ? OR s.state LIKE ?)`;
      const searchTerm = `%${query}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    // Filters
    if (filters?.city) {
      sqlQuery += ` AND s.city LIKE ?`;
      params.push(`%${filters.city}%`);
    }
    if (filters?.state) {
      sqlQuery += ` AND s.state = ?`;
      params.push(filters.state);
    }
    
    sqlQuery += ` ORDER BY s.name LIMIT 50`;
    
    const streets = db.prepare(sqlQuery).all(...params);
    
    // If preferences provided, calculate match scores
    if (preferences && streets.length > 0) {
      const streetsWithScores = streets.map(street => {
        const profile = aggregateStreetSurveys(street.id, false);
        if (profile && profile.survey_count > 0) {
          const matchScore = calculateMatchScore(profile, preferences);
          return {
            ...street,
            ...profile,
            matchScore
          };
        }
        return { ...street, matchScore: 0 };
      });
      
      // Sort by match score if preferences provided
      streetsWithScores.sort((a, b) => b.matchScore - a.matchScore);
      return res.json(streetsWithScores);
    }
    
    res.json(streets);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============== SAVED STREETS ENDPOINTS ==============

// Free tier: max 3 saved streets
const FREE_SAVED_LIMIT = 3;

// Save a street to favorites
app.post('/api/streets/:id/save', (req, res) => {
  try {
    const streetId = parseInt(req.params.id);
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Login required to save streets' });
    }
    
    const existing = db.prepare('SELECT * FROM saved_streets WHERE user_id = ? AND street_id = ?').get(userId, streetId);
    if (existing) {
      return res.json({ message: 'Street already saved', saved: true });
    }
    
    const count = db.prepare('SELECT COUNT(*) as c FROM saved_streets WHERE user_id = ?').get(userId)?.c || 0;
    const isPremium = db.prepare('SELECT premium_access FROM users WHERE id = ?').get(userId)?.premium_access;
    if (count >= FREE_SAVED_LIMIT && !isPremium) {
      return res.status(402).json({ error: `Free accounts can save up to ${FREE_SAVED_LIMIT} streets. Upgrade to save more.`, limitReached: true });
    }
    
    db.prepare('INSERT INTO saved_streets (user_id, street_id) VALUES (?, ?)').run(userId, streetId);
    res.json({ message: 'Street saved successfully', saved: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unsave a street
app.delete('/api/streets/:id/save', (req, res) => {
  try {
    const streetId = parseInt(req.params.id);
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Login required' });
    }
    
    db.prepare('DELETE FROM saved_streets WHERE user_id = ? AND street_id = ?').run(userId, streetId);
    res.json({ message: 'Street removed from saved', saved: false });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get saved streets
app.get('/api/user/saved-streets', (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.json([]);
    }
    
    const savedStreets = db.prepare(`
      SELECT s.*, n.name as neighborhood_name,
        (SELECT COUNT(*) FROM resident_surveys WHERE street_id = s.id AND verification_status = 'verified') as survey_count
      FROM saved_streets ss
      JOIN streets s ON ss.street_id = s.id
      LEFT JOIN neighborhoods n ON s.neighborhood_id = n.id
      WHERE ss.user_id = ?
      ORDER BY ss.created_at DESC
    `).all(userId);
    
    res.json(savedStreets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check if street is saved
app.get('/api/streets/:id/saved', (req, res) => {
  try {
    const streetId = parseInt(req.params.id);
    const userId = req.user?.id;
    
    if (!userId) {
      return res.json({ saved: false });
    }
    
    const saved = db.prepare('SELECT * FROM saved_streets WHERE user_id = ? AND street_id = ?').get(userId, streetId);
    res.json({ saved: !!saved });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============== REVIEW VOTING ENDPOINTS ==============

// Vote on a review
app.post('/api/surveys/:id/vote', (req, res) => {
  try {
    const surveyId = parseInt(req.params.id);
    const { voteType } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Login required to vote' });
    }
    
    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote type' });
    }
    
    const existing = db.prepare('SELECT * FROM review_votes WHERE user_id = ? AND survey_id = ?').get(userId, surveyId);
    
    if (existing) {
      if (existing.vote_type === voteType) {
        db.prepare('DELETE FROM review_votes WHERE user_id = ? AND survey_id = ?').run(userId, surveyId);
        return res.json({ message: 'Vote removed', voteType: null });
      } else {
        db.prepare('UPDATE review_votes SET vote_type = ? WHERE user_id = ? AND survey_id = ?').run(voteType, userId, surveyId);
      }
    } else {
      db.prepare('INSERT INTO review_votes (survey_id, user_id, vote_type) VALUES (?, ?, ?)').run(surveyId, userId, voteType);
    }
    
    const upvotes = db.prepare('SELECT COUNT(*) as count FROM review_votes WHERE survey_id = ? AND vote_type = "upvote"').get(surveyId).count;
    const downvotes = db.prepare('SELECT COUNT(*) as count FROM review_votes WHERE survey_id = ? AND vote_type = "downvote"').get(surveyId).count;
    
    res.json({ 
      message: 'Vote recorded',
      voteType,
      upvotes,
      downvotes,
      score: upvotes - downvotes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get votes for a survey
app.get('/api/surveys/:id/votes', (req, res) => {
  try {
    const surveyId = parseInt(req.params.id);
    const userId = req.user?.id;
    
    const upvotes = db.prepare('SELECT COUNT(*) as count FROM review_votes WHERE survey_id = ? AND vote_type = "upvote"').get(surveyId).count;
    const downvotes = db.prepare('SELECT COUNT(*) as count FROM review_votes WHERE survey_id = ? AND vote_type = "downvote"').get(surveyId).count;
    const userVote = userId ? db.prepare('SELECT vote_type FROM review_votes WHERE user_id = ? AND survey_id = ?').get(userId, surveyId) : null;
    
    res.json({
      upvotes,
      downvotes,
      score: upvotes - downvotes,
      userVote: userVote?.vote_type || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============== STREET RECOMMENDATIONS ==============

// Helper function to get most common value from vibe category
function getMostCommonValue(vibeCategory) {
  if (!vibeCategory || Object.keys(vibeCategory).length === 0) return null;
  const sorted = Object.entries(vibeCategory).sort((a, b) => b[1] - a[1]);
  return sorted[0][0];
}

// Get similar streets
app.get('/api/streets/:id/similar', (req, res) => {
  try {
    const streetId = parseInt(req.params.id);
    const limit = parseInt(req.query.limit) || 5;
    
    const targetProfile = aggregateStreetSurveys(streetId, false);
    if (!targetProfile || !targetProfile.survey_count) {
      return res.json([]);
    }
    
    const streets = db.prepare(`
      SELECT s.*, n.name as neighborhood_name
      FROM streets s
      LEFT JOIN neighborhoods n ON s.neighborhood_id = n.id
      WHERE s.id != ?
      ORDER BY s.name
    `).all(streetId);
    
    const similarStreets = streets.map(street => {
      const profile = aggregateStreetSurveys(street.id, false);
      if (!profile || profile.survey_count === 0) return null;
      
      let similarity = 0;
      const attributes = ['noise_level', 'walkability', 'safety', 'kids_friendly', 'public_education', 'events', 'lawn_space', 'neighbor_familiarity'];
      
      attributes.forEach(attr => {
        const targetValue = getMostCommonValue(targetProfile.vibe?.[attr]);
        const streetValue = getMostCommonValue(profile.vibe?.[attr]);
        if (targetValue && streetValue && targetValue === streetValue) {
          similarity += 1;
        }
      });
      
      if (similarity === 0) return null;
      
      return {
        ...street,
        ...profile,
        similarity: Math.round((similarity / attributes.length) * 100)
      };
    }).filter(s => s !== null).sort((a, b) => b.similarity - a.similarity).slice(0, limit);
    
    res.json(similarStreets);
  } catch (error) {
    console.error('Similar streets error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============== SUBSCRIPTION TIERS ==============

// Get user subscription
app.get('/api/user/subscription', (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.json({ hasSubscription: false });
    }
    
    const subscription = db.prepare('SELECT * FROM subscriptions WHERE user_id = ? AND status = "active" ORDER BY created_at DESC').get(userId);
    
    if (subscription) {
      const periodEnd = new Date(subscription.current_period_end);
      const isActive = periodEnd > new Date();
      
      return res.json({
        hasSubscription: isActive,
        planType: subscription.plan_type,
        periodEnd: subscription.current_period_end,
        isActive
      });
    }
    
    res.json({ hasSubscription: false });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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
      verification: '/api/surveys/:id/verify',
      payments: '/api/payments/create-intent',
      search: '/api/streets/search (premium)',
      savedStreets: '/api/user/saved-streets',
      similarStreets: '/api/streets/:id/similar',
      reviewVotes: '/api/surveys/:id/vote'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
