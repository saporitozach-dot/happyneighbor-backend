import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../neighborhoods.db');
const db = new Database(dbPath);

// Comprehensive street data for all cities
const cityStreets = {
  'Cambridge': [
    'Massachusetts Avenue', 'Broadway', 'Main Street', 'Hampshire Street', 'Cambridge Street',
    'Memorial Drive', 'Mount Auburn Street', 'Brattle Street', 'Garden Street', 'Kirkland Street',
    'Oxford Street', 'Quincy Street', 'Harvard Street', 'Prospect Street', 'Pearl Street',
    'Inman Street', 'Norfolk Street', 'Columbia Street', 'Windsor Street', 'Albany Street',
    'Portland Street', 'Cardinal Medeiros Avenue', 'Binney Street', 'Bent Street', 'Rogers Street',
    'Sixth Street', 'Fifth Street', 'Fourth Street', 'Third Street', 'Second Street', 'First Street',
    'Ames Street', 'Vassar Street', 'Amherst Street', 'Wadsworth Street', 'Erie Street',
    'Fayette Street', 'Lee Street', 'Antrim Street', 'Sciarappa Street', 'Lopez Street',
    'Hurley Street', 'Spring Street', 'Willow Street', 'Cherry Street', 'Otis Street',
    'School Street', 'Green Street', 'Magazine Street', 'Auburn Street', 'Putnam Avenue',
    'Western Avenue', 'River Street', 'Allston Street', 'Franklin Street', 'Sidney Street'
  ],
  'Brookline': [
    'Beacon Street', 'Commonwealth Avenue', 'Harvard Street', 'Washington Street', 'Boylston Street',
    'Brookline Avenue', 'Longwood Avenue', 'Chapel Street', 'School Street', 'High Street',
    'Walnut Street', 'Davis Avenue', 'Kent Street', 'Pleasant Street', 'Cypress Street',
    'Newton Street', 'Chestnut Street', 'Pond Avenue', 'Jamaica Road', 'Lee Street',
    'Freeman Street', 'Gibbs Street', 'Tappan Street', 'Coolidge Street', 'Centre Street',
    'Aspinwall Avenue', 'Thatcher Street', 'Stedman Street', 'Fuller Street', 'Clark Road',
    'Cottage Street', 'Pearl Street', 'Summit Avenue', 'Salisbury Road', 'Winthrop Road',
    'Addington Road', 'Bowker Street', 'St Paul Street', 'Carlton Street', 'Naples Road',
    'Egmont Street', 'Sewall Avenue', 'Babcock Street', 'Amory Street', 'Green Street',
    'Monmouth Street', 'Browne Street', 'Winchester Street', 'University Road', 'Ivy Street'
  ],
  'Somerville': [
    'Broadway', 'Highland Avenue', 'Somerville Avenue', 'Medford Street', 'Washington Street',
    'McGrath Highway', 'Mystic Avenue', 'Powder House Boulevard', 'College Avenue', 'Holland Street',
    'Davis Square', 'Porter Street', 'Elm Street', 'Summer Street', 'School Street',
    'Pearl Street', 'Cross Street', 'Bow Street', 'Union Square', 'Webster Avenue',
    'Prospect Street', 'Central Street', 'Spring Street', 'Winter Street', 'Cameron Avenue',
    'Lowell Street', 'Vernon Street', 'Walnut Street', 'Cedar Street', 'Willow Avenue',
    'Morrison Avenue', 'Curtis Street', 'Tufts Street', 'Glen Street', 'Alpine Street',
    'Berkeley Street', 'Bonner Avenue', 'Boston Street', 'Cutter Avenue', 'Day Street',
    'Dimick Street', 'Dover Street', 'Flint Street', 'Gorham Street', 'Grant Street',
    'Hall Avenue', 'Hinckley Street', 'Irving Street', 'Jaques Street', 'Kidder Avenue'
  ],
  'Newton': [
    'Washington Street', 'Centre Street', 'Commonwealth Avenue', 'Beacon Street', 'Walnut Street',
    'Chestnut Street', 'Boylston Street', 'Newton Street', 'Highland Avenue', 'Grove Street',
    'Oak Street', 'Lake Avenue', 'Ward Street', 'Pearl Street', 'Watertown Street',
    'Auburn Street', 'California Street', 'Crafts Street', 'Dedham Street', 'Elliot Street',
    'Forest Avenue', 'Grant Avenue', 'Homer Street', 'Islington Road', 'Jackson Street',
    'Kenrick Street', 'Langley Road', 'Maple Street', 'Nevada Street', 'Oxford Road',
    'Pine Street', 'Quinobequin Road', 'Reservoir Street', 'School Street', 'Temple Street',
    'Union Street', 'Vernon Street', 'Webster Street', 'York Road', 'Adams Avenue',
    'Albemarle Road', 'Beverly Road', 'Cabot Street', 'Derby Street', 'Eden Avenue',
    'Farlow Road', 'Glen Avenue', 'Harvard Street', 'Independence Drive', 'Jefferson Street'
  ],
  'Clayton': [
    'Forsyth Boulevard', 'Central Avenue', 'Hanley Road', 'Brentwood Boulevard', 'Maryland Avenue',
    'Wydown Boulevard', 'Big Bend Boulevard', 'DeMun Avenue', 'Skinker Boulevard', 'Carondelet Avenue',
    'Clayton Road', 'Shaw Park', 'Bonhomme Avenue', 'Concordia Lane', 'Davis Place',
    'Ellenwood Avenue', 'Gay Avenue', 'Harvard Avenue', 'Ivy Avenue', 'Jackson Avenue',
    'Kingsbury Boulevard', 'Lay Road', 'Linden Avenue', 'Lydia Avenue', 'Meramec Avenue',
    'North Brentwood Boulevard', 'North Central Avenue', 'North Hanley Road', 'North Meramec Avenue',
    'Oak Knoll Park', 'Olympian Way', 'Pershing Place', 'South Brentwood Boulevard', 'South Central Avenue',
    'South Hanley Road', 'South Meramec Avenue', 'Stratford Lane', 'Topton Way', 'Westmoreland Drive',
    'York Drive', 'Price Road', 'Rosedale Avenue', 'Warson Road', 'Glen Road'
  ],
  'Kirkwood': [
    'Kirkwood Road', 'Manchester Road', 'Big Bend Boulevard', 'Geyer Road', 'Adams Avenue',
    'Argonne Drive', 'Bodley Avenue', 'Clay Avenue', 'Clinton Place', 'Couch Avenue',
    'Essex Avenue', 'Fillmore Avenue', 'Harrison Avenue', 'Holmes Avenue', 'Jefferson Avenue',
    'Jewel Avenue', 'Leffingwell Avenue', 'Madison Avenue', 'Main Street', 'Maple Avenue',
    'Monroe Avenue', 'Rose Hill Avenue', 'Scott Avenue', 'Taylor Avenue', 'Woodlawn Avenue',
    'East Adams Avenue', 'East Argonne Drive', 'East Essex Avenue', 'East Jefferson Avenue',
    'East Monroe Avenue', 'West Adams Avenue', 'West Argonne Drive', 'West Essex Avenue',
    'West Jefferson Avenue', 'West Monroe Avenue', 'North Fillmore Avenue', 'North Harrison Avenue',
    'North Kirkwood Road', 'North Taylor Avenue', 'North Woodlawn Avenue', 'South Fillmore Avenue',
    'South Harrison Avenue', 'South Kirkwood Road', 'South Taylor Avenue', 'Gill Avenue',
    'Dickson Street', 'Edgar Road', 'Simmons Avenue', 'Webster Avenue', 'Woodbine Avenue'
  ],
  'University City': [
    'Delmar Boulevard', 'Olive Boulevard', 'Big Bend Boulevard', 'Skinker Boulevard', 'Forsyth Boulevard',
    'Pershing Avenue', 'Vernon Avenue', 'Washington Boulevard', 'Kingsbury Boulevard', 'Enright Avenue',
    'Etzel Avenue', 'Amherst Avenue', 'Blackberry Avenue', 'Bloomfield Place', 'Brittany Place',
    'Cabanne Avenue', 'Canton Avenue', 'Cates Avenue', 'Cornell Avenue', 'Dartmouth Avenue',
    'Eastgate Avenue', 'Fairview Avenue', 'Ferguson Avenue', 'Groby Road', 'Harvard Avenue',
    'Kingsland Avenue', 'Limit Avenue', 'Lyle Avenue', 'Melville Avenue', 'Midland Boulevard',
    'Northwood Avenue', 'Plymouth Avenue', 'Princeton Avenue', 'Purdue Avenue', 'Trinity Avenue',
    'University Drive', 'Waterman Boulevard', 'Yale Avenue', 'Westgate Avenue', 'Ruth Drive',
    'Shaftesbury Avenue', 'Maryland Avenue', 'Jackson Avenue', 'Pennsylvania Avenue', 'Partridge Avenue'
  ],
  'Webster Groves': [
    'Lockwood Avenue', 'Big Bend Boulevard', 'Elm Avenue', 'Gore Avenue', 'Rock Hill Road',
    'Allen Avenue', 'Baker Avenue', 'Bompart Avenue', 'Bristol Avenue', 'Clark Avenue',
    'Concord School Road', 'Fairview Avenue', 'Flora Avenue', 'Gray Avenue', 'Glendale Road',
    'Hazel Avenue', 'Jackson Road', 'Jewel Avenue', 'Lee Avenue', 'Marshall Place',
    'Newport Avenue', 'North Gore Avenue', 'Oak Street', 'Oakwood Avenue', 'Old Orchard Avenue',
    'Pacific Avenue', 'Park Avenue', 'Plant Avenue', 'Selma Avenue', 'Shady Avenue',
    'South Elm Avenue', 'Summit Avenue', 'Swon Avenue', 'Tuxedo Boulevard', 'West Kirkham Avenue',
    'Woodlawn Avenue', 'Edgar Road', 'Laclede Station Road', 'Berry Road', 'Simmons Avenue',
    'Kirkham Avenue', 'Maple Avenue', 'Newport Road', 'Orchard Avenue', 'Westwood Drive'
  ],
  'Maplewood': [
    'Manchester Road', 'Big Bend Boulevard', 'Sutton Avenue', 'Yale Avenue', 'Marshall Avenue',
    'Cambridge Avenue', 'Flora Avenue', 'Oxford Avenue', 'Prather Avenue', 'Prospect Avenue',
    'Arsenal Street', 'Bellevue Avenue', 'Blendon Place', 'Boro Avenue', 'Cardinal Avenue',
    'Commonwealth Avenue', 'Greenwood Boulevard', 'Hazel Avenue', 'Henner Avenue', 'Laclede Station Road',
    'Leland Avenue', 'Maple Avenue', 'Morgan Ford Road', 'Murdoch Avenue', 'Newport Avenue',
    'Richmond Avenue', 'Roseland Terrace', 'Sappington Avenue', 'Victor Street', 'Bruno Avenue',
    'Hanley Road', 'Sutton Boulevard', 'Marietta Avenue', 'Elm Avenue', 'Highland Avenue'
  ]
};

// Major Boston suburbs comprehensive streets
const bostonSuburbs = {
  'Quincy': [
    'Hancock Street', 'Washington Street', 'Southern Artery', 'Newport Avenue', 'Quincy Avenue',
    'Sea Street', 'Atlantic Street', 'Beale Street', 'Burgin Parkway', 'Centre Street',
    'Coddington Street', 'Common Street', 'Copeland Street', 'Crown Colony Drive', 'East Squantum Street',
    'Franklin Street', 'Granite Street', 'Independence Avenue', 'McGrath Highway', 'Merrymount Road',
    'Penn Street', 'Presidents Lane', 'Revere Road', 'School Street', 'Squantum Street',
    'Temple Street', 'Victory Road', 'Water Street', 'West Street', 'Willard Street'
  ],
  'Milton': [
    'Canton Avenue', 'Blue Hill Avenue', 'Adams Street', 'Randolph Avenue', 'Brook Road',
    'Centre Street', 'Edge Hill Road', 'Eliot Street', 'Governor Stoughton Lane', 'Highland Street',
    'Hillside Street', 'Hutchinson Street', 'Milton Street', 'Pleasant Street', 'Reedsdale Road',
    'Thacher Street', 'Truman Parkway', 'Unquity Road', 'Vose Hill Road', 'Wendell Park'
  ],
  'Dedham': [
    'High Street', 'Washington Street', 'Eastern Avenue', 'Providence Highway', 'Bussey Street',
    'Cedar Street', 'Central Avenue', 'Church Street', 'Common Street', 'Court Street',
    'East Street', 'Elm Street', 'Greenhood Street', 'Highland Street', 'Milton Street',
    'Mount Vernon Street', 'Needham Street', 'Oak Street', 'Pine Street', 'School Street',
    'Sprague Street', 'Summer Street', 'Village Avenue', 'Walnut Street', 'Whiting Avenue'
  ],
  'Wellesley': [
    'Washington Street', 'Central Street', 'Worcester Street', 'Grove Street', 'Linden Street',
    'Forest Street', 'Oakland Street', 'Abbott Road', 'Benvenue Street', 'Brook Street',
    'Cedar Street', 'Church Street', 'Cliff Road', 'College Road', 'Cottage Street',
    'Cross Street', 'Dover Road', 'Eisenhower Circle', 'Elm Street', 'Glen Road',
    'Great Plain Avenue', 'Hundreds Road', 'Kingsbury Street', 'Leighton Road', 'Lowell Road',
    'Maugus Avenue', 'Norfolk Terrace', 'Oakland Circle', 'Parker Road', 'Rice Street',
    'School Street', 'Seaward Road', 'Turner Road', 'Walnut Street', 'Weston Road'
  ],
  'Lexington': [
    'Massachusetts Avenue', 'Bedford Street', 'Waltham Street', 'Concord Avenue', 'Marrett Road',
    'Lincoln Street', 'Maple Street', 'Burlington Street', 'East Street', 'Grove Street',
    'Hancock Street', 'Hill Street', 'Lowell Street', 'Meriam Street', 'Muzzey Street',
    'Oak Street', 'Percy Road', 'Pleasant Street', 'Raymond Street', 'Reed Street',
    'School Street', 'Spring Street', 'Vine Street', 'Wachusett Drive', 'Worthen Road'
  ],
  'Arlington': [
    'Massachusetts Avenue', 'Broadway', 'Mystic Street', 'Pleasant Street', 'Park Avenue',
    'Summer Street', 'Academy Street', 'Appleton Street', 'Brattle Street', 'Chandler Street',
    'Cleveland Street', 'Cottage Street', 'Decatur Street', 'Drake Road', 'Edgehill Road',
    'Forest Street', 'Gardner Street', 'Gray Street', 'Highland Avenue', 'Jason Street',
    'Lake Street', 'Maple Street', 'Marathon Street', 'Medford Street', 'Mill Street',
    'Oakland Avenue', 'Palmer Street', 'Paul Revere Road', 'Rawson Road', 'Teel Street',
    'Warren Street', 'Water Street', 'Wollaston Avenue', 'Academy Street', 'Alpine Street'
  ],
  'Watertown': [
    'Mount Auburn Street', 'Arsenal Street', 'Main Street', 'Belmont Street', 'School Street',
    'Charles River Road', 'Common Street', 'Crawford Street', 'Dexter Avenue', 'Edenfield Avenue',
    'Fayette Street', 'Galen Street', 'Grove Street', 'Hawthorn Street', 'Irving Street',
    'Leonard Street', 'Lexington Street', 'Marshall Street', 'Morton Street', 'Nichols Avenue',
    'Orchard Street', 'Palfrey Street', 'Pequossette Street', 'Pleasant Street', 'Spring Street',
    'Standish Road', 'Summer Street', 'Templeton Parkway', 'Union Street', 'Warren Street',
    'Waverley Avenue', 'Westminster Avenue', 'Whites Avenue', 'Wilson Street', 'Windsor Street'
  ],
  'Belmont': [
    'Concord Avenue', 'Pleasant Street', 'Trapelo Road', 'Leonard Street', 'Common Street',
    'School Street', 'Waverley Street', 'Alexander Avenue', 'Beech Street', 'Belmont Street',
    'Brighton Street', 'Cedar Street', 'Centre Street', 'Channing Road', 'Church Street',
    'Clark Street', 'Cross Street', 'Cushing Avenue', 'Day School Lane', 'Elm Street',
    'Fairview Avenue', 'Flett Road', 'Frost Street', 'Goden Street', 'Grove Street',
    'Harris Street', 'Hastings Road', 'Hewitt Road', 'Highland Road', 'Homer Road',
    'Hurd Road', 'Kilburn Road', 'Lexington Street', 'Linden Avenue', 'Long Avenue'
  ]
};

async function importBulkStreets() {
  console.log('🏘️  BULK STREET IMPORT');
  console.log('======================\n');
  
  const insertStreet = db.prepare(`
    INSERT OR IGNORE INTO streets (neighborhood_id, name, city, state)
    VALUES (?, ?, ?, ?)
  `);
  
  let totalAdded = 0;
  
  // Import St. Louis suburbs
  console.log('📍 Importing St. Louis area streets...');
  for (const [city, streets] of Object.entries(cityStreets)) {
    const neighborhoods = db.prepare(
      'SELECT id FROM neighborhoods WHERE city = ? OR city LIKE ?'
    ).all(city, `%${city}%`);
    
    if (neighborhoods.length === 0) {
      console.log(`   ⚠️ ${city}: No neighborhoods found`);
      continue;
    }
    
    let added = 0;
    for (const n of neighborhoods) {
      for (const street of streets) {
        try {
          const r = insertStreet.run(n.id, street, city, 'MO');
          if (r.changes > 0) added++;
        } catch (e) {}
      }
    }
    console.log(`   ✅ ${city}: ${added} streets added`);
    totalAdded += added;
  }
  
  // Import Boston suburbs
  console.log('\n📍 Importing Boston area streets...');
  for (const [city, streets] of Object.entries(bostonSuburbs)) {
    const neighborhoods = db.prepare(
      'SELECT id FROM neighborhoods WHERE city = ? OR city LIKE ? OR name = ?'
    ).all(city, `%${city}%`, city);
    
    if (neighborhoods.length === 0) {
      console.log(`   ⚠️ ${city}: No neighborhoods found`);
      continue;
    }
    
    let added = 0;
    for (const n of neighborhoods) {
      for (const street of streets) {
        try {
          const r = insertStreet.run(n.id, street, city, 'MA');
          if (r.changes > 0) added++;
        } catch (e) {}
      }
    }
    console.log(`   ✅ ${city}: ${added} streets added`);
    totalAdded += added;
  }
  
  // Summary
  const stats = db.prepare(`
    SELECT COUNT(*) as total FROM streets
  `).get();
  
  console.log('\n' + '='.repeat(40));
  console.log(`✅ Total streets now: ${stats.total}`);
  console.log(`➕ Added this run: ${totalAdded}`);
}

importBulkStreets();

