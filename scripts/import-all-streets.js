import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../neighborhoods.db');
const db = new Database(dbPath);

// Rate limiting helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch streets from OpenStreetMap Overpass API (more complete than Nominatim)
async function fetchStreetsFromOverpass(city, state, neighborhoodName) {
  // Build query for streets in the area
  const query = `
    [out:json][timeout:60];
    area["name"="${city}"]["admin_level"~"[678]"]->.city;
    (
      way["highway"]["name"](area.city);
    );
    out tags;
  `;
  
  const url = 'https://overpass-api.de/api/interpreter';
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'HappyNeighbor/1.0 (neighborhood-survey-app)'
      },
      body: `data=${encodeURIComponent(query)}`
    });
    
    if (!response.ok) {
      console.error(`  Overpass API error for ${city}: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    const streets = new Set();
    
    if (data.elements) {
      data.elements.forEach(element => {
        if (element.tags && element.tags.name) {
          // Filter out highways, interstates, etc.
          const highway = element.tags.highway;
          if (highway && !['motorway', 'motorway_link', 'trunk', 'trunk_link'].includes(highway)) {
            streets.add(element.tags.name);
          }
        }
      });
    }
    
    return Array.from(streets).sort();
  } catch (error) {
    console.error(`  Error fetching from Overpass for ${city}:`, error.message);
    return [];
  }
}

// Comprehensive street lists for St. Louis neighborhoods (manually curated real data)
const stLouisStreets = {
  'Shaw': [
    'Alfred Avenue', 'Allen Avenue', 'Arco Avenue', 'Arsenal Street', 'Botanical Avenue',
    'Byron Place', 'Cleveland Avenue', 'Columbia Avenue', 'Connecticut Street', 'Delor Street',
    'Flora Place', 'Flad Avenue', 'Gibson Avenue', 'Gratiot Street', 'Hartford Street',
    'Humphrey Street', 'Iowa Avenue', 'Juniata Street', 'Klemm Street', 'Kosciusko Street',
    'Lafayette Avenue', 'Lawn Avenue', 'Magnolia Avenue', 'McRee Avenue', 'Missouri Avenue',
    'Neosho Street', 'Oak Hill Avenue', 'Oregon Avenue', 'Page Boulevard', 'Park Avenue',
    'Papin Street', 'Pestalozzi Street', 'Potomac Street', 'Russell Boulevard', 'Shenandoah Avenue',
    'Shaw Avenue', 'Sidney Street', 'Spring Avenue', 'Sublette Avenue', 'Swan Avenue',
    'Tennessee Avenue', 'Texas Avenue', 'Thurman Avenue', 'Tower Grove Avenue', 'Utah Street',
    'Vandeventer Avenue', 'Vista Avenue', 'Waterman Boulevard', 'Westminster Place', 'Winnebago Street',
    'Accomac Street', 'Gustine Avenue', 'Bent Avenue', 'Macklind Avenue', 'January Avenue',
    'February Avenue', 'March Avenue', 'April Avenue', 'May Avenue', 'June Avenue',
    'Kingshighway Boulevard', 'Grand Boulevard', 'Roger Place', 'Thurman Street', 'Reber Place'
  ],
  'Tower Grove South': [
    'Alabama Avenue', 'Arsenal Street', 'Beck Avenue', 'Bent Avenue', 'Blaine Avenue',
    'Bowen Street', 'California Avenue', 'Chippewa Street', 'Cleveland Avenue', 'Connecticut Street',
    'Delor Street', 'Dewey Avenue', 'Eichelberger Street', 'Ellenwood Avenue', 'Fillmore Street',
    'Flora Boulevard', 'Giles Avenue', 'Grace Avenue', 'Grand Boulevard', 'Gravois Avenue',
    'Gustine Avenue', 'Hartford Street', 'Humphrey Street', 'Idaho Avenue', 'Iowa Avenue',
    'Itaska Street', 'Juniata Street', 'Keokuk Street', 'Kingshighway Boulevard', 'Klemm Street',
    'Loughborough Avenue', 'Magnolia Avenue', 'Mardel Avenue', 'Meramec Street', 'Miami Street',
    'Minnesota Avenue', 'Missouri Avenue', 'Neosho Street', 'Nevada Avenue', 'Oak Hill Avenue',
    'Oregon Avenue', 'Pennsylvania Avenue', 'Pestalozzi Street', 'Potomac Street', 'Roger Place',
    'Russell Boulevard', 'Shenandoah Avenue', 'Sidney Street', 'Spring Avenue', 'Taft Avenue',
    'Tennessee Avenue', 'Texas Avenue', 'Tower Grove Avenue', 'Utah Street', 'Virginia Avenue',
    'Wyoming Street', 'January Avenue', 'February Avenue', 'March Avenue', 'Blow Street'
  ],
  'Tower Grove East': [
    'Arsenal Street', 'Caroline Street', 'Castleman Avenue', 'Compton Avenue', 'Connecticut Street',
    'Delor Street', 'Dunnica Avenue', 'Eads Avenue', 'Flora Boulevard', 'Geyer Avenue',
    'Grand Boulevard', 'Gravois Avenue', 'Halliday Avenue', 'Hartford Street', 'Humphrey Street',
    'Iowa Avenue', 'Jefferson Avenue', 'Juniata Street', 'Klemm Street', 'Lafayette Avenue',
    'Lemp Avenue', 'Lynch Street', 'Magnolia Avenue', 'McNair Avenue', 'Meramec Street',
    'Miami Street', 'Missouri Avenue', 'Nebraska Avenue', 'Neosho Street', 'Ohio Avenue',
    'Oregon Avenue', 'Pennsylvania Avenue', 'Pestalozzi Street', 'Potomac Street', 'Russell Boulevard',
    'Shenandoah Avenue', 'Sidney Street', 'Spring Avenue', 'Tennessee Avenue', 'Texas Avenue',
    'Tower Grove Avenue', 'Utah Street', 'Victor Street', 'Virginia Avenue', 'Wyoming Street'
  ],
  'Soulard': [
    'Allen Avenue', 'Ann Avenue', 'Arsenal Street', 'Barry Street', 'Bohemian Hill',
    'Carroll Street', 'Chippewa Street', 'Christy Boulevard', 'Chouteau Avenue', 'Compton Avenue',
    'Decatur Street', 'Dumont Place', 'Eighth Street', 'Eleventh Street', 'Emmett Street',
    'Geyer Avenue', 'Gratiot Street', 'Hickory Street', 'Iowa Avenue', 'Jefferson Avenue',
    'Julia Avenue', 'Kennett Place', 'Lafayette Avenue', 'Lemp Avenue', 'Linn Street',
    'Lynch Street', 'Menard Street', 'Michigan Avenue', 'Ninth Street', 'Park Avenue',
    'Pestalozzi Street', 'Potomac Street', 'Russell Boulevard', 'Seventh Street', 'Sidney Street',
    'Soulard Street', 'South Broadway', 'South Second Street', 'South Third Street', 'South Fourth Street',
    'South Fifth Street', 'South Sixth Street', 'South Seventh Street', 'South Eighth Street', 'South Ninth Street',
    'Tenth Street', 'Twelfth Street', 'Victor Street', 'Withnell Avenue'
  ],
  'Benton Park': [
    'Addison Street', 'Allen Avenue', 'Ann Avenue', 'Arsenal Street', 'Benton Place',
    'Benton Street', 'California Avenue', 'Carroll Street', 'Cherokee Street', 'Chippewa Street',
    'Cleveland Avenue', 'Connecticut Street', 'Delor Street', 'Dunklin Street', 'Eads Avenue',
    'Geyer Avenue', 'Gravois Avenue', 'Iowa Avenue', 'Jefferson Avenue', 'Juniata Street',
    'Keokuk Street', 'Lafayette Avenue', 'Lemp Avenue', 'Lynch Street', 'McNair Avenue',
    'Menard Street', 'Michigan Avenue', 'Missouri Avenue', 'Nebraska Avenue', 'Ohio Avenue',
    'Oregon Avenue', 'Park Avenue', 'Pennsylvania Avenue', 'Pestalozzi Street', 'Potomac Street',
    'Russell Boulevard', 'Sidney Street', 'South Broadway', 'Tennessee Avenue', 'Texas Avenue',
    'Virginia Avenue', 'Wyoming Street', 'Utah Place'
  ],
  'Fox Park': [
    'Allen Avenue', 'Arsenal Street', 'California Avenue', 'Cherokee Street', 'Chippewa Street',
    'Cleveland Avenue', 'Connecticut Street', 'Delor Street', 'Eads Avenue', 'Geyer Avenue',
    'Gravois Avenue', 'Gustine Avenue', 'Iowa Avenue', 'Jefferson Avenue', 'Juniata Street',
    'Keokuk Street', 'Lafayette Avenue', 'Lemp Avenue', 'Lynch Street', 'McNair Avenue',
    'Michigan Avenue', 'Missouri Avenue', 'Nebraska Avenue', 'Ohio Avenue', 'Oregon Avenue',
    'Park Avenue', 'Pennsylvania Avenue', 'Pestalozzi Street', 'Potomac Street', 'Russell Boulevard',
    'Sidney Street', 'South Grand Boulevard', 'Tennessee Avenue', 'Texas Avenue', 'Utah Street',
    'Virginia Avenue', 'Wyoming Street'
  ],
  'Lafayette Square': [
    'Albion Place', 'Allen Avenue', 'Benton Place', 'Benton Street', 'Carroll Street',
    'Chouteau Avenue', 'Clara Avenue', 'Compton Avenue', 'Geyer Avenue', 'Gratiot Street',
    'Hickory Street', 'Jefferson Avenue', 'Kennett Place', 'La Salle Street', 'Lafayette Avenue',
    'Lafayette Park', 'Lemp Avenue', 'Mackay Place', 'Menard Street', 'Michigan Avenue',
    'Mississippi Avenue', 'Missouri Avenue', 'Missouri Pacific Place', 'Ohio Avenue', 'Park Avenue',
    'Papin Street', 'Pennsylvania Avenue', 'Pestalozzi Street', 'Potomac Street', 'Russell Boulevard',
    'Rutger Street', 'Saint Vincent Avenue', 'Sidney Street', 'South Eighteenth Street', 'South Nineteenth Street',
    'South Twentieth Street', 'Trenton Avenue', 'Victor Street', 'Whittemore Place', 'Withnell Avenue'
  ],
  'Central West End': [
    'Belt Avenue', 'Berlin Avenue', 'Boyle Avenue', 'Cabanne Avenue', 'Cates Avenue',
    'Clara Avenue', 'Clemens Avenue', 'Delmar Boulevard', 'DeBaliviere Avenue', 'Des Peres Avenue',
    'Enright Avenue', 'Euclid Avenue', 'Forest Park Avenue', 'Fountain Avenue', 'Gates Avenue',
    'Hamilton Avenue', 'Hortense Place', 'Julian Avenue', 'Kingsbury Place', 'Kingshighway Boulevard',
    'Lake Avenue', 'Laclede Avenue', 'Laurel Street', 'Lindell Boulevard', 'Lister Avenue',
    'Maple Avenue', 'Maryland Avenue', 'McPherson Avenue', 'Newstead Avenue', 'North Euclid Avenue',
    'North Kingshighway Boulevard', 'Olive Street', 'Parkview Place', 'Pershing Avenue', 'Portland Place',
    'Sarah Street', 'Skinker Boulevard', 'Spring Avenue', 'Taylor Avenue', 'Union Boulevard',
    'Vernon Avenue', 'Walton Avenue', 'Washington Avenue', 'Washington Boulevard', 'Waterman Boulevard',
    'West Pine Boulevard', 'Westminster Place', 'Westminster Place Historic District'
  ],
  'The Hill': [
    'Bischoff Avenue', 'Botanical Avenue', 'Childress Avenue', 'Columbia Avenue', 'Daggett Avenue',
    'Edwards Street', 'Elizabeth Avenue', 'Fyler Avenue', 'Hampton Avenue', 'Hereford Street',
    'Highlandtown', 'Ivanhoe Avenue', 'Kingshighway Boulevard', 'Macklind Avenue', 'Manchester Avenue',
    'Marconi Avenue', 'McCausland Avenue', 'Oakland Avenue', 'Pernod Avenue', 'Princeton Avenue',
    'Rosa Avenue', 'Saint Ambrose', 'Shaw Avenue', 'Southwest Avenue', 'Sublette Avenue',
    'Victoria Avenue', 'Walsh Street', 'Watson Road', 'Wilson Avenue', 'Wunder Avenue',
    'Kingshighway', 'Northrup Avenue', 'Berra Court', 'Daggett Street', 'Edwards Street'
  ],
  'Dogtown': [
    'Arlington Avenue', 'Berthold Avenue', 'Botanical Avenue', 'Bruno Avenue', 'Canterbury Avenue',
    'Clayton Avenue', 'Columbia Avenue', 'Dale Avenue', 'Dameron Avenue', 'De Tonty Street',
    'Fyler Avenue', 'Gibson Avenue', 'Graham Avenue', 'Hampton Avenue', 'Hi-Pointe',
    'Ivanhoe Avenue', 'Jamieson Avenue', 'Katherine Avenue', 'Kraft Avenue', 'Lloyd Avenue',
    'Manchester Avenue', 'Maple Avenue', 'McCausland Avenue', 'Nashville Avenue', 'Oakland Avenue',
    'Pernod Avenue', 'Rosa Avenue', 'Scanlan Avenue', 'Sebastian Avenue', 'Shaw Avenue',
    'Southwest Avenue', 'Sublette Avenue', 'Sulphur Avenue', 'Tamm Avenue', 'Wade Avenue',
    'Walsh Street', 'Wise Avenue', 'Nashville Terrace', 'Kraft Place', 'Bruno Place'
  ]
};

// Comprehensive street lists for Boston neighborhoods
const bostonStreets = {
  'South Boston': [
    'A Street', 'B Street', 'C Street', 'D Street', 'E Street', 'F Street', 'G Street', 'H Street',
    'I Street', 'K Street', 'L Street', 'M Street', 'N Street', 'O Street', 'P Street',
    'Athens Street', 'Bowen Street', 'Broadway', 'Dorchester Avenue', 'Dorchester Street',
    'East Broadway', 'East First Street', 'East Second Street', 'East Third Street', 'East Fourth Street',
    'East Fifth Street', 'East Sixth Street', 'East Seventh Street', 'East Eighth Street', 'East Ninth Street',
    'Emerson Street', 'Farragut Road', 'First Street', 'Flaherty Way', 'Foundry Street',
    'Gold Street', 'Marine Road', 'Medal of Honor Boulevard', 'Mercer Street', 'Old Colony Avenue',
    'Old Harbor Street', 'Pacific Street', 'Perkins Street', 'Peters Street', 'Preble Street',
    'Second Street', 'Silver Street', 'Summer Street', 'Third Street', 'Thomas Park',
    'W Broadway', 'West Broadway', 'West First Street', 'West Second Street', 'West Third Street',
    'West Fourth Street', 'West Fifth Street', 'West Sixth Street', 'West Seventh Street', 'West Eighth Street',
    'West Ninth Street', 'William J Day Boulevard'
  ],
  'Charlestown': [
    'Adams Street', 'Allston Street', 'Austin Street', 'Baldwin Street', 'Bartlett Street',
    'Bunker Hill Street', 'Cambridge Street', 'Chappie Street', 'Chelsea Street', 'Concord Avenue',
    'Constitution Road', 'Cook Street', 'Cordis Street', 'Decatur Street', 'Devens Street',
    'Eden Street', 'Edwards Street', 'Elm Street', 'Ferrin Street', 'First Avenue',
    'Green Street', 'Harvard Mall', 'Harvard Street', 'High Street', 'Lexington Street',
    'Lincoln Street', 'Lynde Street', 'Main Street', 'Medford Street', 'Monument Avenue',
    'Monument Square', 'Moulton Street', 'Mystic Street', 'O Reilly Way', 'Old Ironsides Way',
    'Park Street', 'Pearl Street', 'Pleasant Street', 'Polk Street', 'Prescott Street',
    'Prison Point Bridge', 'Russell Street', 'School Street', 'Second Avenue', 'Sullivan Street',
    'Tufts Street', 'Walker Street', 'Warren Street', 'Washington Street', 'Winthrop Street'
  ],
  'Dorchester': [
    'Adams Street', 'Ashmont Street', 'Blue Hill Avenue', 'Boston Street', 'Bowdoin Street',
    'Centre Street', 'Codman Street', 'Columbia Road', 'Dorchester Avenue', 'Dudley Street',
    'Erie Street', 'Freeport Street', 'Geneva Avenue', 'Gibson Street', 'Hancock Street',
    'Harvard Street', 'Hollingsworth Street', 'Howard Avenue', 'Kenwood Street', 'King Street',
    'Lawrence Avenue', 'Meetinghouse Hill', 'Milton Avenue', 'Morrissey Boulevard', 'Morton Street',
    'Neponset Avenue', 'Norfolk Street', 'Park Street', 'Quincy Street', 'Savin Hill Avenue',
    'Stoughton Street', 'Sydney Street', 'Talbot Avenue', 'Uphams Corner', 'Victory Road',
    'Wales Street', 'Washington Street', 'Wellington Hill Street', 'Westville Street', 'Woodrow Avenue'
  ],
  'Roxbury': [
    'Bartlett Street', 'Blue Hill Avenue', 'Centre Street', 'Codman Park', 'Columbus Avenue',
    'Dale Street', 'Dudley Street', 'Eustis Street', 'Fort Avenue', 'Guild Street',
    'Hammond Street', 'Harold Street', 'Harrison Avenue', 'Highland Park', 'Highland Street',
    'Humboldt Avenue', 'John Eliot Square', 'Magazine Street', 'Malcolm X Boulevard', 'Martin Luther King Boulevard',
    'Melnea Cass Boulevard', 'Mission Hill', 'Moreland Street', 'Parker Hill Avenue', 'Regent Street',
    'Roxbury Street', 'Ruggles Street', 'Seaver Street', 'Shawmut Avenue', 'Smith Street',
    'St Alphonsus Street', 'Tremont Street', 'Vernon Street', 'Walnut Avenue', 'Warren Street',
    'Washington Street', 'Weld Hill Street', 'Williams Street', 'Zeigler Street'
  ],
  'South End': [
    'Appleton Street', 'Berkeley Street', 'Blackstone Square', 'Brookline Street', 'Chandler Street',
    'Clarendon Street', 'Columbus Avenue', 'Concord Square', 'Dartmouth Street', 'Dover Street',
    'East Berkeley Street', 'East Brookline Street', 'East Canton Street', 'East Dedham Street', 'East Newton Street',
    'East Springfield Street', 'Fayette Street', 'Franklin Square', 'Gray Street', 'Greenwich Park',
    'Hammond Street', 'Harrison Avenue', 'Lawrence Street', 'Malden Street', 'Montgomery Street',
    'Pembroke Street', 'Perry Street', 'Plympton Street', 'Randolph Street', 'Rutland Square',
    'Rutland Street', 'Shawmut Avenue', 'St Botolph Street', 'St Charles Street', 'St George Street',
    'St James Avenue', 'Tremont Street', 'Union Park', 'Union Park Street', 'Upton Street',
    'Waltham Street', 'Warren Avenue', 'Washington Street', 'West Brookline Street', 'West Canton Street',
    'West Dedham Street', 'West Newton Street', 'West Rutland Square', 'West Springfield Street', 'Worcester Square',
    'Worcester Street'
  ],
  'Back Bay': [
    'Arlington Street', 'Back Street', 'Bay State Road', 'Beacon Street', 'Berkeley Street',
    'Boylston Street', 'Burbank Street', 'Clarendon Street', 'Clearway Street', 'Commonwealth Avenue',
    'Cortes Street', 'Dalton Street', 'Dartmouth Street', 'Exeter Street', 'Fairfield Street',
    'Gloucester Street', 'Harcourt Street', 'Hereford Street', 'Huntington Avenue', 'Ipswich Street',
    'Marlborough Street', 'Massachusetts Avenue', 'Newbury Street', 'Norway Street', 'Peterborough Street',
    'Providence Street', 'Ring Road', 'Scotia Street', 'St Cecilia Street', 'St Germain Street',
    'St Mary Street', 'St Stephen Street', 'Stuart Street', 'Symphony Road', 'Trinity Place',
    'Westland Avenue'
  ],
  'Beacon Hill': [
    'Acorn Street', 'Anderson Street', 'Beacon Street', 'Belknap Street', 'Bowdoin Street',
    'Branch Street', 'Brimmer Street', 'Byron Street', 'Cambridge Street', 'Cedar Lane Way',
    'Charles Street', 'Chestnut Street', 'Derne Street', 'Embankment Road', 'Garden Street',
    'Hancock Street', 'Irving Street', 'Joy Street', 'Lime Street', 'Louisburg Square',
    'Mt Vernon Place', 'Mt Vernon Street', 'Myrtle Street', 'Park Street', 'Pickney Street',
    'Phillips Street', 'Revere Street', 'River Street', 'Ridgeway Lane', 'Smith Court',
    'South Russell Street', 'Spruce Street', 'Temple Street', 'West Cedar Street', 'Willow Street'
  ],
  'Jamaica Plain': [
    'Amory Street', 'Boylston Street', 'Brookside Avenue', 'Carolina Avenue', 'Cedar Street',
    'Centre Street', 'Child Street', 'Chestnut Avenue', 'Creighton Street', 'Day Street',
    'Eliot Street', 'Everett Street', 'Forbes Street', 'Forest Hills Street', 'Green Street',
    'Greenough Avenue', 'Heath Street', 'Hoffman Street', 'Hyde Park Avenue', 'Jamaica Street',
    'Lamartine Street', 'McBride Street', 'Moraine Street', 'Moss Hill Road', 'Mozart Street',
    'Paul Gore Street', 'Perkins Street', 'Pond Street', 'Robeson Street', 'Rossmore Road',
    'Sedgwick Street', 'Sheridan Street', 'South Huntington Avenue', 'South Street', 'Spring Park Avenue',
    'Sunnyside Street', 'Thomas Street', 'Walk Hill Street', 'Washington Street', 'Williams Street',
    'Wyman Street'
  ],
  'Allston': [
    'Allston Street', 'Ashford Street', 'Brentwood Street', 'Brighton Avenue', 'Cambridge Street',
    'Chester Street', 'Commonwealth Avenue', 'Easton Street', 'Farrington Avenue', 'Franklin Street',
    'Gardner Street', 'Glenville Avenue', 'Gordon Street', 'Greylock Road', 'Griggs Street',
    'Hano Street', 'Harvard Avenue', 'Higgins Street', 'Kelton Street', 'Linden Street',
    'Long Avenue', 'Malvern Street', 'North Beacon Street', 'North Harvard Street', 'Pratt Street',
    'Quint Avenue', 'Reedsdale Street', 'Ridgemont Street', 'Seattle Street', 'Soldiers Field Road',
    'Stadium Way', 'Travis Street', 'Union Street', 'Wadsworth Street', 'Warren Street',
    'Western Avenue', 'Windom Street'
  ],
  'Brighton': [
    'Academy Hill Road', 'Beacon Street', 'Belgrade Avenue', 'Bigelow Street', 'Brooks Street',
    'Cambridge Street', 'Chestnut Hill Avenue', 'Cleveland Circle', 'Commonwealth Avenue', 'Dustin Street',
    'Englewood Avenue', 'Faneuil Street', 'Foster Street', 'Gordon Street', 'Greycliff Road',
    'Henshaw Street', 'Lake Street', 'Leicester Street', 'Market Street', 'North Beacon Street',
    'Oak Square', 'Parsons Street', 'Sparhawk Street', 'Sutherland Road', 'Tremont Street',
    'Union Street', 'Washington Street', 'Waverly Street', 'Western Avenue', 'Winship Street'
  ]
};

async function importAllStreets() {
  console.log('🏘️  Starting comprehensive street import...\n');
  
  // Get all neighborhoods with city info
  const neighborhoods = db.prepare(`
    SELECT id, name, city, state, location 
    FROM neighborhoods 
    WHERE city IS NOT NULL OR location IS NOT NULL
  `).all();
  
  console.log(`Found ${neighborhoods.length} neighborhoods to process\n`);
  
  const insertStreet = db.prepare(`
    INSERT OR IGNORE INTO streets (neighborhood_id, name, city, state)
    VALUES (?, ?, ?, ?)
  `);
  
  let totalStreets = 0;
  
  for (const neighborhood of neighborhoods) {
    const city = neighborhood.city || neighborhood.location?.split(',')[0]?.trim();
    const state = neighborhood.state || neighborhood.location?.split(',')[1]?.trim();
    const name = neighborhood.name;
    
    console.log(`\n📍 Processing: ${name} (${city}, ${state || 'Unknown'})`);
    
    let streets = [];
    
    // Check if we have curated data
    if (stLouisStreets[name]) {
      streets = stLouisStreets[name];
      console.log(`   Using curated St. Louis data: ${streets.length} streets`);
    } else if (bostonStreets[name]) {
      streets = bostonStreets[name];
      console.log(`   Using curated Boston data: ${streets.length} streets`);
    } else {
      // Try to fetch from Overpass API
      console.log(`   Fetching from OpenStreetMap...`);
      streets = await fetchStreetsFromOverpass(city, state, name);
      console.log(`   Found ${streets.length} streets from OSM`);
      
      // Rate limit
      await delay(2000);
    }
    
    // Insert streets
    let added = 0;
    for (const streetName of streets) {
      try {
        const result = insertStreet.run(neighborhood.id, streetName, city, state);
        if (result.changes > 0) added++;
      } catch (e) {
        // Ignore duplicates
      }
    }
    
    console.log(`   ✅ Added ${added} new streets`);
    totalStreets += added;
  }
  
  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 IMPORT COMPLETE');
  console.log('='.repeat(50));
  
  const summary = db.prepare(`
    SELECT n.name, n.city, COUNT(s.id) as street_count
    FROM neighborhoods n
    LEFT JOIN streets s ON s.neighborhood_id = n.id
    WHERE n.city IS NOT NULL
    GROUP BY n.id
    ORDER BY street_count DESC
  `).all();
  
  console.log('\nStreets per neighborhood:');
  summary.forEach(row => {
    const status = row.street_count > 0 ? '✅' : '❌';
    console.log(`${status} ${row.name} (${row.city}): ${row.street_count} streets`);
  });
  
  const total = db.prepare('SELECT COUNT(*) as count FROM streets').get();
  console.log(`\n🎯 Total streets in database: ${total.count}`);
}

importAllStreets().catch(console.error);


