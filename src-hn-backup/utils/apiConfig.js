/**
 * API base URL. Uses VITE_API_URL if set (production), otherwise derives from
 * current hostname so it works when accessing from phone on same network.
 * e.g. http://10.20.32.234:3000 → API at http://10.20.32.234:3005/api
 */
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') return `http://${window.location.hostname}:3005/api`;
  return 'http://localhost:3005/api';
};

export const API_URL = getApiUrl();
