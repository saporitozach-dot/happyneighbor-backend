# Data Import Guide

This guide explains how to bulk import real neighborhood, HOA, and apartment complex data into Happy Neighbor.

## Quick Start

### Option 1: Import from OpenStreetMap (Free, No API Key Required)

Import real neighborhoods from OpenStreetMap database:

```bash
# Import neighborhoods from specific cities
node scripts/import-neighborhoods.js osm "Portland,OR" "Seattle,WA" "Austin,TX"

# Single city
node scripts/import-neighborhoods.js osm "St. Louis,MO"
```

**How it works:**
- Searches OpenStreetMap for neighborhoods, subdivisions, and residential areas
- Automatically extracts neighborhood names and locations
- No API key or account needed
- Free and open data source

**Note:** OpenStreetMap has rate limiting (1 request per second). Be patient when importing many cities.

### Option 2: Import from CSV File

Create a CSV file with your neighborhood data:

```csv
name,location,description
"Downtown Portland","Portland, OR","Urban core neighborhood with great walkability"
"Pearl District","Portland, OR","Modern neighborhood known for art galleries"
```

Then import it:

```bash
node scripts/import-neighborhoods.js csv data/neighborhoods-example.csv
```

**CSV Format:**
- First row must be headers: `name`, `location`, `description`
- `name`: Neighborhood/HOA/Apartment complex name (required)
- `location`: City and state, e.g., "Portland, OR" (required)
- `description`: Optional description

### Option 3: Import from JSON File

Create a JSON file:

```json
[
  {
    "name": "Downtown Portland",
    "location": "Portland, OR",
    "description": "Urban core neighborhood"
  }
]
```

Then import it:

```bash
node scripts/import-neighborhoods.js json data/neighborhoods-example.json
```

## Data Sources for Neighborhood/HOA/Apartment Data

### Free Sources:

1. **OpenStreetMap** (Already integrated)
   - Free, no API key
   - Contains neighborhoods, suburbs, and residential areas
   - Use the `osm` command above

2. **Wikipedia Neighborhood Lists**
   - Many cities have Wikipedia pages listing neighborhoods
   - Example: "List of neighborhoods in Portland, Oregon"
   - You can copy these into CSV format

3. **City/County Open Data Portals**
   - Many cities publish neighborhood boundaries as open data
   - Look for your city's open data portal
   - Often available as GeoJSON or CSV

4. **Census Bureau Data**
   - Census tracts and block groups
   - More granular than neighborhoods but comprehensive

### Paid APIs (Free Trials Available):

1. **ATTOM Data Solutions**
   - Neighborhood Data API with demographics, crime stats
   - 30-day free trial, 500 calls/day
   - https://www.attomdata.com

2. **RentCast API**
   - Property data including HOAs
   - Public records for 140M+ properties
   - https://developers.rentcast.io

3. **HelloData**
   - Multifamily/apartment data
   - Real-time rent and availability
   - https://www.hellodata.ai

## Building Your Dataset

### Step 1: Start with Major Cities

```bash
# Import neighborhoods from major cities
node scripts/import-neighborhoods.js osm \
  "New York,NY" \
  "Los Angeles,CA" \
  "Chicago,IL" \
  "Houston,TX" \
  "Phoenix,AZ" \
  "Philadelphia,PA" \
  "San Antonio,TX" \
  "San Diego,CA" \
  "Dallas,TX" \
  "San Jose,CA"
```

### Step 2: Add Regional Cities

Focus on specific regions or states you're targeting.

### Step 3: Combine Multiple Sources

1. Use OpenStreetMap for bulk import
2. Manually add specific HOAs/apartment complexes from CSV
3. Add unique neighborhoods you know about

### Step 4: Enrich with Survey Data

Once neighborhoods are imported, use the Admin panel to:
- Add resident survey responses
- Add personality quiz data
- Add detailed descriptions

## Example: Complete Import Workflow

```bash
# 1. Import from OpenStreetMap for major cities
node scripts/import-neighborhoods.js osm \
  "Portland,OR" \
  "Seattle,WA" \
  "Denver,CO" \
  "Austin,TX"

# 2. Import specific neighborhoods/HOAs from CSV
node scripts/import-neighborhoods.js csv data/my-hoas.csv

# 3. Import apartment complexes from JSON
node scripts/import-neighborhoods.js json data/apartments.json

# 4. Check what was imported (view in Admin panel at http://localhost:3000/admin)
```

## Tips for Large Datasets

1. **Import in batches**: Don't import 100+ cities at once. Do 5-10 at a time.

2. **Verify data**: Check the Admin panel after importing to verify neighborhoods look correct.

3. **Deduplication**: The script automatically skips duplicates (same name + location).

4. **Error handling**: If an import fails, check the console output for errors.

5. **Backup first**: Consider backing up your `neighborhoods.db` file before bulk imports.

## Custom Data Format

If you have data in a different format, you can:

1. **Convert to CSV**: Use Excel, Google Sheets, or a script to convert your data to CSV format
2. **Convert to JSON**: Use a JSON editor or script to format your data
3. **Modify the script**: Edit `scripts/import-neighborhoods.js` to support your custom format

## Next Steps After Import

1. **Review imported neighborhoods** in the Admin panel
2. **Add survey data** by clicking on neighborhoods and adding resident surveys
3. **Add descriptions** to make neighborhoods more appealing
4. **Test matching** by taking the survey and seeing which neighborhoods match

## Troubleshooting

**"No neighborhoods found"**
- Check that your city/state format is correct: "City,State" (no space after comma)
- Try a different city - some cities may not have neighborhood data in OpenStreetMap

**"Error connecting to API"**
- OpenStreetMap rate limits - wait a moment and try again
- Check your internet connection

**"Duplicate entries"**
- The script automatically skips duplicates
- If you see many "skipped" entries, that's normal

**CSV/JSON import errors**
- Check file format matches examples
- Ensure file encoding is UTF-8
- Verify required fields (name, location) are present

## Need Help?

If you're having trouble:
1. Check the console output for specific error messages
2. Verify your data format matches the examples
3. Test with a small dataset first (2-3 neighborhoods)
