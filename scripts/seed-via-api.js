/**
 * Seed the database via the API (no sqlite native module needed).
 * Run this AFTER starting the API server: npm run dev:server
 */
const API = process.env.API_URL || 'http://localhost:3005';

async function seed() {
  try {
    const res = await fetch(`${API}/api/dev/seed`, { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || res.statusText);
    console.log('✅ Seed complete:', data);
  } catch (err) {
    console.error('❌ Seed failed. Is the API server running? Try: npm run dev:server');
    console.error(err.message);
    process.exit(1);
  }
}

seed();
