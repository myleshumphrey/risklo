// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export const API_ENDPOINTS = {
  sheets: `${API_BASE_URL}/api/sheets`,
  analyze: `${API_BASE_URL}/api/analyze`,
  health: `${API_BASE_URL}/api/health`,
};

