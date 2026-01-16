const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// Token store (JSON file).
// Local: defaults to server/data/
// Production: set RISKLO_DATA_DIR to a persistent volume mount (recommended).
const DATA_DIR = process.env.RISKLO_DATA_DIR
  ? path.resolve(process.env.RISKLO_DATA_DIR)
  : path.join(__dirname, '..', 'data');
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

function getAuthUrlForEmail(email, includeSignIn = false, frontendUrl = null) {
  const oauth2 = getOAuthClient();
  const state = signState({
    email,
    ts: Date.now(),
    nonce: crypto.randomBytes(8).toString('hex'),
    includeSignIn, // Flag to indicate this is a combined sign-in + Sheets flow
    frontendUrl, // Frontend URL to redirect back to (for mobile support)
  });

  // Use drive.file only (no spreadsheets.readonly as requested)
  // drive.file + Picker grants per-file access after user selection.
  const scopes = includeSignIn
    ? [
        'openid',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/drive.file',
      ]
    : [
        'https://www.googleapis.com/auth/drive.file',
      ];

  const url = oauth2.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // Force consent screen to always get refresh token
    scope: scopes,
    state,
  });

  return url;
}

function storeRefreshToken(email, refreshToken, fileId = null) {
  const store = readStore();
  store[email] = {
    refreshToken: encryptString(refreshToken),
    accessToken: null,
    accessTokenExpiry: null,
    fileId: fileId || store[email]?.fileId || null, // Preserve existing fileId if not provided
    updatedAt: new Date().toISOString(),
  };
  writeStore(store);
}

function storeFileId(email, fileId) {
  const store = readStore();
  if (!store[email]) {
    throw new Error('No token found for email. Complete OAuth flow first.');
  }
  store[email].fileId = fileId;
  store[email].updatedAt = new Date().toISOString();
  writeStore(store);
}

function getFileId(email) {
  const store = readStore();
  const entry = store[email];
  return entry?.fileId || null;
}

function getRefreshToken(email) {
  const store = readStore();
  const entry = store[email];
  if (!entry || !entry.refreshToken) return null;
  return decryptString(entry.refreshToken);
}

function storeAccessToken(email, accessToken, accessTokenExpiry = null) {
  const store = readStore();
  store[email] = {
    ...(store[email] || {}),
    accessToken: accessToken || null,
    accessTokenExpiry: accessTokenExpiry || null,
    updatedAt: new Date().toISOString(),
  };
  writeStore(store);
}

function getAccessToken(email) {
  const store = readStore();
  const entry = store[email];
  return entry?.accessToken || null;
}

function getAccessTokenExpiry(email) {
  const store = readStore();
  const entry = store[email];
  return entry?.accessTokenExpiry || null;
}

function deleteRefreshToken(email) {
  const store = readStore();
  delete store[email];
  writeStore(store);
}

async function exchangeCodeAndStore(code, state) {
  const stateObj = verifyState(state);
  if (!stateObj) {
    throw new Error('Invalid OAuth state');
  }
  const includeSignIn = stateObj.includeSignIn || false;

  const oauth2 = getOAuthClient();
  const { tokens } = await oauth2.getToken(code);

  // If this was a combined sign-in flow, decode ID token to get user info FIRST
  // This gives us the actual email, even if state had a placeholder
  let email = stateObj.email;
  let userInfo = null;
  
  if (includeSignIn && tokens.id_token) {
    try {
      // Decode JWT ID token (simple base64 decode, no verification needed for display)
      const base64Url = tokens.id_token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
      const payload = JSON.parse(jsonPayload);
      
      // Use email from ID token (most reliable)
      email = payload.email || email || 'unknown@example.com';
      
      userInfo = {
        email: email,
        name: payload.name || payload.email?.split('@')[0] || email.split('@')[0],
        picture: payload.picture || null,
      };
    } catch (err) {
      console.error('Error decoding ID token:', err);
      // Fallback to state email or placeholder
      if (!email || email === 'placeholder@example.com') {
        throw new Error('Could not determine user email from OAuth response');
      }
      userInfo = {
        email,
        name: email.split('@')[0],
        picture: null,
      };
    }
  } else {
    // Not a combined flow, must have email in state
    if (!email || email === 'placeholder@example.com') {
      throw new Error('Missing email in OAuth state');
    }
  }

  // Google may not return refresh_token on subsequent consents.
  const existing = getRefreshToken(email);
  const refreshToken = tokens.refresh_token || existing;
  
  console.log('🔑 exchangeCodeAndStore: Email:', email);
  console.log('🔑 exchangeCodeAndStore: Has refresh_token in response:', !!tokens.refresh_token);
  console.log('🔑 exchangeCodeAndStore: Has existing token:', !!existing);
  console.log('🔑 exchangeCodeAndStore: Final refreshToken:', refreshToken ? 'EXISTS' : 'MISSING');
  
  if (!refreshToken) {
    if (tokens.access_token) {
      console.warn('⚠️ exchangeCodeAndStore: No refresh token. Storing access token for short-lived session.');
      storeAccessToken(email, tokens.access_token, tokens.expiry_date || null);
    } else {
      console.error('❌ exchangeCodeAndStore: No refresh token or access token available!');
      throw new Error('No refresh token received. Try again with prompt=consent and ensure you are not reusing an already-consented app without revoking.');
    }
  } else {
    console.log('💾 exchangeCodeAndStore: Storing refresh token for:', email);
    storeRefreshToken(email, refreshToken);
  }
  
  // Verify it was stored
  const verifyToken = getRefreshToken(email);
  console.log('✅ exchangeCodeAndStore: Token stored successfully:', verifyToken ? 'YES' : 'NO');

  return { 
    email, 
    hasRefreshToken: !!tokens.refresh_token,
    userInfo, // Include user info if this was a combined flow
  };
}

function getAuthorizedClientForEmail(email) {
  const refreshToken = getRefreshToken(email);
  const oauth2 = getOAuthClient();
  if (refreshToken) {
    oauth2.setCredentials({ refresh_token: refreshToken });
    return oauth2;
  }
  const accessToken = getAccessToken(email);
  if (!accessToken) return null;
  const expiry = getAccessTokenExpiry(email);
  oauth2.setCredentials({
    access_token: accessToken,
    expiry_date: expiry || null,
  });
  return oauth2;
}

// Get access token for Google Picker API (frontend use)
async function getAccessTokenForEmail(email) {
  const refreshToken = getRefreshToken(email);
  if (refreshToken) {
    const oauth2 = getOAuthClient();
    oauth2.setCredentials({ refresh_token: refreshToken });
    try {
      const { credentials } = await oauth2.refreshAccessToken();
      return credentials.access_token;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      return null;
    }
  }
  const accessToken = getAccessToken(email);
  const expiry = getAccessTokenExpiry(email);
  if (!accessToken) return null;
  if (expiry && Date.now() > Number(expiry) - 60000) {
    console.warn('⚠️ Stored access token expired or expiring soon');
    return null;
  }
  return accessToken;
}

function hasToken(email) {
  return !!getRefreshToken(email) || !!getAccessToken(email);
}

module.exports = {
  getAuthUrlForEmail,
  exchangeCodeAndStore,
  getAuthorizedClientForEmail,
  hasToken,
  getRefreshToken,
  getAccessToken,
  getAccessTokenExpiry,
  deleteRefreshToken,
  verifyState,
  storeFileId,
  getFileId,
  getAccessTokenForEmail,
  storeAccessToken,
};


