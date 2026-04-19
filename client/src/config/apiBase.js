/**
 * VITE_API_URL must be set at build time on Vercel (e.g. https://api.onrender.com/api).
 * Never fall back to localhost in production — that breaks deployed OAuth and API calls.
 */
export function getApiBaseUrl() {
  const v = import.meta.env.VITE_API_URL;
  if (typeof v === 'string' && v.trim()) return v.trim().replace(/\/$/, '');
  if (import.meta.env.DEV) return 'http://localhost:5000/api';
  return '';
}
