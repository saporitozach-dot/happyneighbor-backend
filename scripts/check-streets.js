import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, '../neighborhoods.db'));

console.log('Checking streets with verified surveys...\n');

const streets = db.prepare(`
  SELECT s.id, s.name, s.city, s.state, COUNT(rs.id) as survey_count 
  FROM streets s 
  LEFT JOIN resident_surveys rs ON s.id = rs.street_id AND rs.verification_status = 'verified'
  GROUP BY s.id 
  HAVING survey_count > 0 
  ORDER BY survey_count DESC 
  LIMIT 10
`).all();

console.log('Streets with verified surveys:');
streets.forEach(s => {
  console.log(`  ${s.name}, ${s.city} (ID: ${s.id}) - ${s.survey_count} surveys`);
});

db.close();





