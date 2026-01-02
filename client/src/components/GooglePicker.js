import React, { useEffect, useState, useCallback, useRef } from 'react';
import { API_BASE_URL } from '../config';
import './GooglePicker.css';

// Global guard to prevent double Picker/consent in React StrictMode (dev mounts twice)
// We use a timestamp to allow re-opening after a legitimate close
let globalPickerActive = false;
let globalPickerLastShown = 0;

function GooglePicker({ userEmail, spreadsheetId, onFileSelected, onCancel }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const isMountedRef = useRef(true);
  const pickerInitializedRef = useRef(false); // Track if picker is already showing
  const pickerInstanceRef = useRef(null); // Hold picker instance to close programmatically

  // Store file ID on backend
  const storeFileId = useCallback(async (fileId) => {
    console.log('📤 storeFileId called with:', fileId, 'for user:', userEmail);
    try {
      const response = await fetch(`${API_BASE_URL}/api/google-sheets/oauth/file-id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          fileId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to store file ID');
      }
      console.log('✅ storeFileId successful for:', fileId);
    } catch (err) {
      console.error('❌ Error storing file ID:', err);
      setError('Failed to save file selection');
    }
  }, [userEmail]);

  // Get access token from backend
  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/google-sheets/oauth/access-token?email=${encodeURIComponent(userEmail)}`);
        const data = await response.json();
        
        if (!isMountedRef.current) return;

        if (data.error) {
          setError(data.error);
          setLoading(false);
          return;
        }
        
        setAccessToken(data.accessToken);
        setLoading(false);
      } catch (err) {
        if (isMountedRef.current) {
          setError('Failed to get access token. Please ensure you are signed in.');
          setLoading(false);
        }
      }
    };

    if (userEmail) {
      fetchAccessToken();
    }
  }, [userEmail]);

  // Load Google Picker API and show picker
  useEffect(() => {
    if (!accessToken || !spreadsheetId || !isMountedRef.current) return;

    // Prevent a second picker instance (StrictMode double-mount)
    const now = Date.now();
    if (globalPickerActive && (now - globalPickerLastShown < 2000)) {
      console.log('🚫 Global picker guard active, skipping initialization.');
      return;
    }

    if (pickerInitializedRef.current) {
      console.log('⚠️ Picker already initialized, skipping re-initialization');
      return;
    }
    
    console.log('🎬 GooglePicker useEffect: Starting picker initialization');
    pickerInitializedRef.current = true; // Mark as initialized
    globalPickerActive = true; // Mark globally to block duplicates
    globalPickerLastShown = now;

    // Load Google API script
    const loadGoogleAPI = () => {
      if (window.gapi && window.gapi.load && window.google && window.google.picker) {
        initializePicker();
        return;
      }

      if (document.querySelector('script[src="https://apis.google.com/js/api.js"]')) {
        const checkInterval = setInterval(() => {
          if (window.gapi && window.gapi.load) {
            clearInterval(checkInterval);
            window.gapi.load('picker', initializePicker);
          }
        }, 100);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (!isMountedRef.current) return;
        if (window.gapi && window.gapi.load) {
          window.gapi.load('picker', {
            callback: initializePicker,
            onerror: () => {
              if (isMountedRef.current) {
                setError('Failed to load Google Picker API');
                setLoading(false);
              }
            }
          });
        }
      };
      script.onerror = () => {
        if (isMountedRef.current) {
          setError('Failed to load Google Picker API script');
          setLoading(false);
        }
      };
      document.head.appendChild(script);
    };

    const initializePicker = () => {
      if (!isMountedRef.current) return;
      
      setTimeout(() => {
        if (!isMountedRef.current) return;
        
        try {
          if (!window.google || !window.google.picker) {
            throw new Error('Google Picker API not loaded.');
          }

          const developerKey = process.env.REACT_APP_GOOGLE_API_KEY;
          const appId = process.env.REACT_APP_GOOGLE_PROJECT_NUMBER;
          
          console.log('Initializing Google Picker with Project Number:', appId);
          
          const view = new window.google.picker.DocsView(window.google.picker.ViewId.SPREADSHEETS)
            .setMimeTypes('application/vnd.google-apps.spreadsheet');

          // Critical: Apply API Key and App ID to the builder BEFORE calling build()
          const builder = new window.google.picker.PickerBuilder()
            .setOAuthToken(accessToken)
            .addView(view)
            .setCallback((data) => {
              if (!isMountedRef.current) return;
              
              if (data[window.google.picker.Response.ACTION] === window.google.picker.Action.PICKED) {
                const file = data[window.google.picker.Response.DOCUMENTS][0];
                if (file && file.id) {
                  console.log('✅ File selected:', file.id);
                  try { pickerInstanceRef.current?.setVisible(false); } catch (e) {}
                  storeFileId(file.id).catch(err => console.error(err));
                  setTimeout(() => { onFileSelected(file.id); }, 100);
                }
              } else if (data[window.google.picker.Response.ACTION] === window.google.picker.Action.CANCEL) {
                try { pickerInstanceRef.current?.setVisible(false); } catch (e) {}
                onCancel();
              }
            })
            .setTitle('Select Vector Results Spreadsheet');

          if (developerKey) builder.setDeveloperKey(developerKey);
          if (appId) builder.setAppId(appId);
          
          const picker = builder.build();
          pickerInstanceRef.current = picker;
          picker.setVisible(true);
          setLoading(false);
        } catch (err) {
          console.error('Error initializing Google Picker:', err);
          if (isMountedRef.current) {
            setError(`Failed to initialize file picker: ${err.message}`);
            setLoading(false);
          }
        }
      }, 500);
    };

    loadGoogleAPI();

    return () => {
      isMountedRef.current = false;
      pickerInitializedRef.current = false;
      globalPickerActive = false;
      try { pickerInstanceRef.current?.setVisible(false); } catch (e) {}
    };
  }, [accessToken, spreadsheetId, onFileSelected, onCancel, storeFileId]);

  if (loading) {
    return (
      <div className="google-picker-container">
        <div className="google-picker-loading">
          <div className="spinner"></div>
          <p>Loading file picker...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="google-picker-container">
        <div className="google-picker-error">
          <p>{error}</p>
          <button onClick={onCancel}>Close</button>
        </div>
      </div>
    );
  }

  return null;
}

export default GooglePicker;
