# Important Files Guide for Happy Neighbor

## 🎯 **FILES YOU'LL ACTUALLY EDIT** (Most Important!)

### React App Code (`src/` folder)
- **`src/App.jsx`** - Main app component with routing (add/remove pages here)
- **`src/pages/Homepage.jsx`** - Landing page
- **`src/pages/Survey.jsx`** - User survey form
- **`src/pages/Results.jsx`** - Shows neighborhood matches
- **`src/pages/Admin.jsx`** - Admin panel to add/edit neighborhoods
- **`src/pages/*.jsx`** - All other pages (About, Contact, FAQ, etc.)
- **`src/components/StructuredData.jsx`** - SEO component
- **`src/index.css`** - Global styles
- **`src/main.jsx`** - React entry point (rarely edit)

### Backend
- **`api-server.js`** - Backend API server (Express routes, database stuff)

### Entry Point
- **`index.html`** - HTML entry point for React (only edit if you need to change meta tags)

---

## ⚙️ **CONFIGURATION FILES** (Edit if you need to change settings)

- **`package.json`** - Dependencies and npm scripts (edit to add packages)
- **`vite.config.js`** - Vite/React build config (rarely edit)
- **`tailwind.config.js`** - Tailwind CSS settings (edit to customize colors/styling)
- **`postcss.config.js`** - CSS processing (rarely edit)

---

## 🚀 **SCRIPTS** (Run these, don't edit)

- **`start-dev.sh`** - Quick script to start dev server
- **`move-to-local.sh`** - Script to move project out of OneDrive

---

## 📚 **DOCUMENTATION** (Read for help, rarely edit)

- **`README.md`** - Main project documentation
- **`SETUP.md`** - Installation instructions
- **`GITHUB_SETUP.md`** - How to push to GitHub

---

## 🌐 **DEPLOYMENT FILES** (Only edit if deploying)

- **`netlify.toml`** - Netlify deployment config (if using Netlify)
- **`vercel.json`** - Vercel deployment config (if using Vercel)
- **`public/robots.txt`** - SEO crawler rules
- **`public/sitemap.xml`** - Site map for SEO

---

## 🔧 **GIT FILES** (Rarely touch)

- **`.gitignore`** - Tells git what files to ignore
- **`.gitattributes`** - Git file handling rules

---

## ❌ **FILES YOU CAN IGNORE** (Auto-generated/Hidden)

- **`.vscode/`** - VS Code settings (auto-generated, can ignore - it's in .gitignore anyway)
- **`node_modules/`** - Installed packages (auto-generated, huge folder)
- **`dist/`** - Built files (auto-generated)
- **`*.db`** - Database files (auto-generated)
- **`.DS_Store`** - macOS system file (ignored)
- **`package-lock.json`** - Auto-generated dependency lock file

---

## 📝 **SUMMARY**

**Focus on these folders:**
1. **`src/`** - Your React code (95% of your edits will be here!)
2. **`api-server.js`** - Backend logic

**Everything else** is just config, documentation, or auto-generated files you can mostly ignore.
