# How to Install Node.js and Run Your React App

## Quick Installation Steps:

### Option 1: Install Node.js directly (Easiest - Recommended)

1. **Download Node.js:**
   - Go to: https://nodejs.org/
   - Download the **LTS version** (Long Term Support)
   - It will be a `.pkg` file for Mac

2. **Install it:**
   - Double-click the downloaded `.pkg` file
   - Follow the installation wizard
   - Enter your password when prompted

3. **Verify installation:**
   - Open Terminal
   - Run: `node --version`
   - You should see something like `v20.x.x`

4. **Run your React app:**
   ```bash
   cd "/Users/zachsap/Library/CloudStorage/OneDrive-IndianaUniversity/Cursor stuff/HappyNeighbor"
   npm install
   npm run dev
   ```

### Option 2: Install via Homebrew (If you prefer command line)

1. **Install Homebrew first:**
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
   - Enter your password when prompted
   - Follow the on-screen instructions

2. **Then install Node.js:**
   ```bash
   brew install node
   ```

3. **Run your React app:**
   ```bash
   cd "/Users/zachsap/Library/CloudStorage/OneDrive-IndianaUniversity/Cursor stuff/HappyNeighbor"
   npm install
   npm run dev
   ```

## After Installation:

Once Node.js is installed, you can run your React homepage with:

```bash
cd "/Users/zachsap/Library/CloudStorage/OneDrive-IndianaUniversity/Cursor stuff/HappyNeighbor"
npm install
npm run dev
```

This will:
- Install all required packages (first time only)
- Start a development server at http://localhost:3000
- Open it in your browser automatically
- Allow you to see changes live as you edit the code

