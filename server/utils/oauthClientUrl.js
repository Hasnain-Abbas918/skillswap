/**
 * OAuth success/failure redirects must point at a real frontend origin.
 * CLIENT_URL alone breaks deploys when it still says localhost; the browser
 * sends ?origin= which we store in OAuth state after allowlist validation.
 */

function normalizeBase(u) {
  if (!u) return '';
  return String(u).trim().replace(/\/$/, '');
}

function getAllowedOrigins() {
  const extra = process.env.ALLOWED_CLIENT_ORIGINS;
  if (extra && extra.trim()) {
    return extra.split(',').map((s) => normalizeBase(s)).filter(Boolean);
  }
  const c = normalizeBase(process.env.CLIENT_URL);
  return c ? [c] : [];
}

function isAllowedOrigin(origin) {
  const n = normalizeBase(origin);
  if (!n) return false;
  return getAllowedOrigins().includes(n);
}

/** Base URL to embed in OAuth state for GET /google */
function pickStateForGoogleStart(req) {
  const q = req.query && req.query.origin;
  let requested = '';
  if (q) {
    try {
      requested = normalizeBase(decodeURIComponent(q));
    } catch {
      requested = normalizeBase(q);
    }
  }
  if (requested && isAllowedOrigin(requested)) return requested;
  const env = normalizeBase(process.env.CLIENT_URL);
  if (env && isAllowedOrigin(env)) return env;
  const allowed = getAllowedOrigins();
  return allowed[0] || env || '';
}

/** Redirect base after successful Google callback (uses returned state) */
function pickClientBaseFromCallback(req) {
  const st = req.query && req.query.state;
  let fromState = '';
  if (st) {
    try {
      fromState = normalizeBase(decodeURIComponent(st));
    } catch {
      fromState = normalizeBase(st);
    }
  }
  if (fromState && isAllowedOrigin(fromState)) return fromState;
  const env = normalizeBase(process.env.CLIENT_URL);
  if (env && isAllowedOrigin(env)) return env;
  const allowed = getAllowedOrigins();
  return allowed[0] || env || '';
}

function getDefaultFailureRedirect(req) {
  const base = pickClientBaseFromCallback(req);
  return `${base}/login?error=oauth_failed`;
}

/** Express `cors` origin callback — same allowlist as OAuth */
function corsOriginValidator(origin, cb) {
  const allowed = getAllowedOrigins();
  if (!origin) return cb(null, true);
  if (allowed.length === 0) return cb(null, true);
  return cb(null, allowed.includes(origin));
}

module.exports = {
  normalizeBase,
  getAllowedOrigins,
  isAllowedOrigin,
  pickStateForGoogleStart,
  pickClientBaseFromCallback,
  getDefaultFailureRedirect,
  corsOriginValidator,
};
