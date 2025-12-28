# Happy Neighbor

A neighborhood matching platform that helps homebuyers find communities that fit their lifestyle preferences.

## Features

- **User Survey**: Multi-step survey to capture lifestyle preferences
- **Neighborhood Matching**: Algorithm matches users with neighborhoods based on their preferences
- **Admin Panel**: Backend interface to add and manage neighborhood data
- **Bulk Data Import**: Import neighborhoods/HOAs/apartment complexes from OpenStreetMap, CSV, or JSON files
- **LinkedIn Integration**: Sign in with LinkedIn and connect with neighbors
- **Interactive US Map**: Visualize neighborhoods on a map
- **Database**: SQLite database stores all neighborhood information

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Development Servers

You have two options:

**Option A: Run both frontend and backend together**
```bash
npm run dev:all
```

**Option B: Run them separately**

Terminal 1 (Backend):
```bash
npm run dev:server
```

Terminal 2 (Frontend):
```bash
npm run dev
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Admin Panel**: http://localhost:3000/admin

## Bulk Data Import

Import real neighborhoods, HOAs, and apartment complexes in bulk:

```bash
# Import from OpenStreetMap (free, no API key)
node scripts/import-neighborhoods.js osm "Portland,OR" "Seattle,WA"

# Import from CSV file
node scripts/import-neighborhoods.js csv data/neighborhoods-example.csv

# Import from JSON file
node scripts/import-neighborhoods.js json data/neighborhoods-example.json
```

See [DATA_IMPORT_GUIDE.md](./DATA_IMPORT_GUIDE.md) for detailed instructions on importing data from various sources.

## How to Use

### For Administrators

1. Navigate to `/admin` in your browser
2. Fill out the form to add a new neighborhood:
   - Neighborhood Name (e.g., "Riverside Community")
   - Location (e.g., "Portland, OR")
   - Description (optional)
   - Survey data for all criteria:
     - Noise Level
     - Sociability
     - Events
     - Kids Friendly
     - Walkability
     - Cookouts
     - Nightlife
3. Click "Add Neighborhood" to save
4. You can edit or delete neighborhoods from the list below

### For Users

1. Go to the homepage and click "Get Started"
2. Complete the 3-step survey with your preferences
3. View your personalized neighborhood matches
4. Each match shows a compatibility score and key features

## Database

The application uses SQLite, which creates a `neighborhoods.db` file automatically when you first start the backend server. This file stores all neighborhood data.

## API Endpoints

- `GET /api/neighborhoods` - Get all neighborhoods
- `GET /api/neighborhoods/:id` - Get single neighborhood
- `POST /api/neighborhoods` - Create new neighborhood
- `PUT /api/neighborhoods/:id` - Update neighborhood
- `DELETE /api/neighborhoods/:id` - Delete neighborhood
- `POST /api/matches` - Get matches based on preferences

## Project Structure

```
HappyNeighbor/
├── api-server.js          # Backend Express API server
├── neighborhoods.db       # SQLite database (auto-created)
├── src/
│   ├── App.jsx            # Main app with routing
│   ├── pages/
│   │   ├── Homepage.jsx   # Landing page
│   │   ├── Survey.jsx     # User survey
│   │   ├── Results.jsx    # Match results
│   │   └── Admin.jsx      # Admin panel
│   └── ...
└── package.json
```

## Saving Your Code to GitHub

### Initial Setup

1. **Create a GitHub account** (if you don't have one): https://github.com

2. **Create a new repository** on GitHub:
   - Click "New repository"
   - Name it (e.g., "HappyNeighbor")
   - Don't initialize with README (you already have one)
   - Click "Create repository"

3. **Initialize Git and push your code**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Happy Neighbor app"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

### Important Notes

- **Database files are excluded** - The `.gitignore` file prevents committing your `neighborhoods.db` file
- **Node modules are excluded** - Dependencies are saved in `package.json`, not committed
- **Your code is safe** - All your React components, backend server, and configuration files will be saved

### Future Updates

When you make changes:
```bash
git add .
git commit -m "Description of your changes"
git push
```

## Hosting Your App Online

**Note:** GitHub stores your code, but to make your app live online, you'll need a hosting service:

### Recommended Hosting Options:

1. **Vercel** (Easiest for React apps)
   - Free tier available
   - Automatic deployments from GitHub
   - Great for frontend

2. **Railway** or **Render** (Good for full-stack apps)
   - Free tier available
   - Can host both frontend and backend
   - Supports databases

3. **Netlify** (Frontend focused)
   - Free tier available
   - Easy GitHub integration

### For Production Deployment:

- You'll need to set up a production database (PostgreSQL, MySQL, etc.)
- Configure environment variables
- Set up proper authentication for admin panel
- Use a process manager like PM2 for the backend

## Next Steps

- Add authentication for admin panel
- Enhance matching algorithm
- Add more neighborhood criteria
- Implement user accounts
- Add neighborhood photos and detailed profiles
- Set up production database

