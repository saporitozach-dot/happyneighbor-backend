import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, '..', 'neighborhoods.db'));

console.log('Fixing database...');

try {
  // Recreate table without NOT NULL on neighborhood_id
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // Copy existing data
  const existingData = db.prepare('SELECT * FROM resident_surveys').all();
  console.log(`Found ${existingData.length} existing surveys`);
  
  if (existingData.length > 0) {
    const insert = db.prepare(`
      INSERT INTO resident_surveys_new (id, street_id, neighborhood_id, resident_name, address, noise_level, sociability, events, kids_friendly, walkability, cookouts, nightlife, additional_notes, address_verified, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const row of existingData) {
      insert.run(row.id, row.street_id, row.neighborhood_id, row.resident_name, row.address, row.noise_level, row.sociability, row.events, row.kids_friendly, row.walkability, row.cookouts, row.nightlife, row.additional_notes, row.address_verified, row.created_at);
    }
  }
  
  // Swap tables
  db.exec('DROP TABLE resident_surveys;');
  db.exec('ALTER TABLE resident_surveys_new RENAME TO resident_surveys;');
  
  console.log('✅ Database fixed! neighborhood_id is now nullable.');
} catch(e) {
  console.log('Error:', e.message);
}

db.close();

