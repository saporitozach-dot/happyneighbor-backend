const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== "undefined")
    return `http://${window.location.hostname}:3005/api`;
  return "http://localhost:3005/api";
};

export const API_URL = getApiUrl();
