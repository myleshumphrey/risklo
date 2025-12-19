const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// Minimal persistent store (JSON file). For production, prefer a real DB.
const DATA_DIR = path.join(__dirname, '..', 'data');
const TOKENS_PATH = path.join(DATA_DIR, 'google_oauth_tokens.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(TOKENS_PATH)) fs.writeFileSync(TOKENS_PATH, JSON.stringify({}), 'utf8');
}

function readStore() {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(TOKENS_PATH, 'utf8');
    return JSON.parse(raw || '{}');
  } catch {
    return {};
  }
}

function writeStore(store) {
  ensureDataDir();
  fs.writeFileSync(TOKENS_PATH, JSON.stringify(store, null, 2), 'utf8');
}

function getEncryptionKey() {
  // Expect base64 32 bytes
  const keyB64 = process.env.TOKEN_ENCRYPTION_KEY;
  if (!keyB64) return null;
  try {
    const key = Buffer.from(keyB64, 'base64');
    if (key.length !== 32) return null;
    return key;
  } catch {
    return null;
  }
}

function encryptString(plain) {
  const key = getEncryptionKey();
  if (!key) return { enc: false, value: plain };
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    enc: true,
    value: Buffer.concat([iv, tag, ciphertext]).toString('base64'),
  };
}

function decryptString(payload) {
  const key = getEncryptionKey();
  if (!payload || typeof payload !== 'object') return null;
  if (!payload.enc) return payload.value || null;
  if (!key) return null;
  const buf = Buffer.from(payload.value, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ciphertext = buf.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
  return plain;
}

function getOAuthClient() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Missing GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET / GOOGLE_OAUTH_REDIRECT_URI');
  }
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

function signState(stateObj) {
  const secret = process.env.OAUTH_STATE_SECRET || process.env.TOKEN_ENCRYPTION_KEY || 'dev_state_secret';
  const payload = Buffer.from(JSON.stringify(stateObj)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyState(state) {
  const secret = process.env.OAUTH_STATE_SECRET || process.env.TOKEN_ENCRYPTION_KEY || 'dev_state_secret';
  const parts = String(state || '').split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

function getAuthUrlForEmail(email) {
  const oauth2 = getOAuthClient();
  const state = signState({
    email,
    ts: Date.now(),
    nonce: crypto.randomBytes(8).toString('hex'),
  });

  const url = oauth2.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    state,
  });

  return url;
}

function storeRefreshToken(email, refreshToken) {
  const store = readStore();
  store[email] = {
    refreshToken: encryptString(refreshToken),
    updatedAt: new Date().toISOString(),
  };
  writeStore(store);
}

function getRefreshToken(email) {
  const store = readStore();
  const entry = store[email];
  if (!entry || !entry.refreshToken) return null;
  return decryptString(entry.refreshToken);
}

function deleteRefreshToken(email) {
  const store = readStore();
  delete store[email];
  writeStore(store);
}

async function exchangeCodeAndStore(code, state) {
  const stateObj = verifyState(state);
  if (!stateObj || !stateObj.email) {
    throw new Error('Invalid OAuth state');
  }
  const email = stateObj.email;

  const oauth2 = getOAuthClient();
  const { tokens } = await oauth2.getToken(code);

  // Google may not return refresh_token on subsequent consents.
  const existing = getRefreshToken(email);
  const refreshToken = tokens.refresh_token || existing;
  if (!refreshToken) {
    throw new Error('No refresh token received. Try again with prompt=consent and ensure you are not reusing an already-consented app without revoking.');
  }

  storeRefreshToken(email, refreshToken);
  return { email, hasRefreshToken: !!tokens.refresh_token };
}

function getAuthorizedClientForEmail(email) {
  const refreshToken = getRefreshToken(email);
  if (!refreshToken) return null;
  const oauth2 = getOAuthClient();
  oauth2.setCredentials({ refresh_token: refreshToken });
  return oauth2;
}

function hasToken(email) {
  return !!getRefreshToken(email);
}

module.exports = {
  getAuthUrlForEmail,
  exchangeCodeAndStore,
  getAuthorizedClientForEmail,
  hasToken,
  deleteRefreshToken,
  verifyState,
};


