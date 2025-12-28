# LinkedIn Connections Integration Guide

## Current Implementation

### ✅ What's Working

1. **User Neighborhood Assignment**
   - Users can select their neighborhood from the dropdown on their profile
   - Neighborhood is saved to their user account
   - Displayed on profile page

2. **Connections by Neighborhood**
   - Shows other users who live in the same neighborhood
   - Displays connection names, photos, and job titles
   - Automatically updates when users set their neighborhood

### 🔄 LinkedIn Connections API (Future Enhancement)

To fetch actual LinkedIn connections, you'll need:

#### 1. Request Additional LinkedIn Permission

In your LinkedIn Developer App:
- Go to **Products** tab
- Request access to **"Read connections"** or **`r_network`** scope
- Note: LinkedIn has strict requirements for this permission - you may need to submit a use case

#### 2. Update OAuth Scopes

Once approved, update the scopes in `api-server.js`:

```javascript
scope: ['openid', 'profile', 'email', 'r_network']
```

#### 3. Fetch Connections API

The LinkedIn Connections API endpoint:
```
GET https://api.linkedin.com/v2/networkSizes/edges?edgeType=CompanyFollowedByMember
```

Or for direct connections:
```
GET https://api.linkedin.com/v2/connections?q=viewer&projection=(elements*(person~))
```

#### 4. Map Connections to Neighborhoods

Once you fetch connections, you can:
- Match LinkedIn profile IDs with users in your database
- Show which connections live in which neighborhoods
- Filter connections by neighborhood

## Current Workaround

Right now, the app shows **other Happy Neighbor users** who have set the same neighborhood. This is actually useful because:

1. ✅ Users can see who else in their neighborhood is using the platform
2. ✅ Creates a sense of community
3. ✅ Doesn't require LinkedIn's connections permission
4. ✅ Privacy-friendly (only shows users who've opted in)

## Example: Enhanced Connections (Future)

If you get LinkedIn connections permission, you could:

```javascript
// Fetch LinkedIn connections
const connectionsResponse = await fetch('https://api.linkedin.com/v2/connections', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
});

const linkedInConnections = await connectionsResponse.json();

// Match with users in database by LinkedIn ID
const matchedConnections = linkedInConnections.elements
  .map(conn => conn.person)
  .filter(person => {
    const user = db.prepare('SELECT * FROM users WHERE linkedin_id = ?').get(person.id);
    return user && user.neighborhood_id;
  })
  .map(person => {
    const user = db.prepare('SELECT * FROM users WHERE linkedin_id = ?').get(person.id);
    return { ...person, ...user };
  });
```

## Privacy Considerations

- Users should opt-in to sharing their neighborhood
- Consider adding privacy settings
- Only show connections who have also opted in
- Allow users to hide their neighborhood if desired
