# LinkedIn OAuth Setup Guide

This guide will help you set up LinkedIn authentication for your Happy Neighbor app.

## Step 1: Create a LinkedIn Developer App

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Click **"Create app"**
3. Fill in the app details:
   - **App name**: Happy Neighbor (or your preferred name)
   - **Company**: Your company name
   - **App logo**: Upload a logo (optional)
   - **Privacy policy URL**: `http://localhost:3000/privacy` (update for production)
   - **Terms of service URL**: `http://localhost:3000/terms` (update for production)
   - **App use**: Select appropriate option
   - **Sign the API Terms**: Check the box and continue

## Step 2: Configure OAuth Settings

1. In your LinkedIn app, go to the **"Auth"** tab
2. Under **"Redirect URLs"**, add:
   - `http://localhost:3001/auth/linkedin/callback` (for development)
   - `https://yourdomain.com/auth/linkedin/callback` (for production - update when deploying)

3. Under **"Products"**, request access to:
   - **Sign In with LinkedIn using OpenID Connect** (required)
   - **r_emailaddress** - to get user email
   - **r_liteprofile** or **r_basicprofile** - to get basic profile info

## Step 3: Get Your Credentials

1. In the **"Auth"** tab, you'll see:
   - **Client ID** (copy this)
   - **Client Secret** (copy this - keep it secret!)

## Step 4: Configure Environment Variables

1. Create a `.env` file in your project root (copy from `.env.example` if available)
2. Add your LinkedIn credentials:

```env
LINKEDIN_CLIENT_ID=your_client_id_here
LINKEDIN_CLIENT_SECRET=your_client_secret_here
LINKEDIN_CALLBACK_URL=http://localhost:3001/auth/linkedin/callback
SESSION_SECRET=your-random-secret-key-change-this
```

**Important:** 
- Never commit `.env` to Git (it's already in `.gitignore`)
- Generate a random string for `SESSION_SECRET` (you can use: `openssl rand -base64 32`)

## Step 5: Test the Integration

1. Make sure both servers are running:
   ```bash
   npm run dev:all
   ```

2. Visit `http://localhost:3000/login`
3. Click "Continue with LinkedIn"
4. You should be redirected to LinkedIn to authorize
5. After authorization, you'll be redirected back to your profile page

## Troubleshooting

### "LinkedIn authentication failed"
- Check that your Client ID and Secret are correct in `.env`
- Verify the callback URL matches exactly in LinkedIn app settings
- Make sure the backend server is running on port 3001

### "Redirect URI mismatch"
- The callback URL in your `.env` must exactly match the one in LinkedIn app settings
- Check for trailing slashes or http vs https issues

### Session not persisting
- Make sure `credentials: 'include'` is set in fetch requests
- Check that CORS is configured correctly in `api-server.js`
- Verify cookies are enabled in your browser

## Production Deployment

When deploying to production:

1. Update LinkedIn app redirect URLs to your production domain
2. Update `.env` with production values:
   ```env
   LINKEDIN_CALLBACK_URL=https://yourdomain.com/auth/linkedin/callback
   SESSION_SECRET=your-production-secret-key
   ```
3. Set `secure: true` in session cookie settings (requires HTTPS)
4. Use environment variables on your hosting platform (Vercel, Heroku, etc.)

## Data Collected

The app collects the following data from LinkedIn:
- Email address
- First name and last name
- Profile picture
- Headline
- Profile URL
- Additional profile data (if available)

This data is stored securely in your SQLite database and is used to:
- Personalize the user experience
- Save user preferences
- Provide neighborhood recommendations
