// API configuration
// For mobile/local network access, detect if we should use local IP
const getApiBaseUrl = () => {
  // If explicitly set via environment variable, use that (for production)
  if (process.env.REACT_APP_API_URL) {
    console.log('Using production API URL:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }
  
  // For local development, check if we're on a mobile device or need network access
  // If hostname is not localhost, we're likely on mobile/network, use the computer's IP
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Desktop browser - use localhost
    console.log('Using localhost API URL');
    return 'http://localhost:5000';
  } else {
    // Mobile device or network access - use the same hostname with port 5000
    // This assumes your computer's IP is accessible from the network
    const apiUrl = `http://${hostname}:5000`;
    console.log('Using network API URL:', apiUrl, '(hostname:', hostname, ')');
    return apiUrl;
  }
};

const API_BASE_URL = getApiBaseUrl();
console.log('API_BASE_URL initialized to:', API_BASE_URL);

export const API_ENDPOINTS = {
  sheets: `${API_BASE_URL}/api/sheets`,
  analyze: `${API_BASE_URL}/api/analyze`,
  health: `${API_BASE_URL}/api/health`,
  proStatus: (email) => `${API_BASE_URL}/api/auth/pro-status?email=${encodeURIComponent(email)}`,
  createCheckoutSession: `${API_BASE_URL}/api/stripe/create-checkout-session`,
  verifySession: (sessionId) => `${API_BASE_URL}/api/stripe/verify-session?session_id=${encodeURIComponent(sessionId)}`,
  sendRiskSummary: `${API_BASE_URL}/api/send-risk-summary`,
};

