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

  // ... (rest of the component)

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
        
        if (data.error) {
          setError(data.error);
          setLoading(false);
          return;
        }
        
        setAccessToken(data.accessToken);
        setLoading(false);
      } catch (err) {
        setError('Failed to get access token');
        setLoading(false);
      }
    };

    if (userEmail) {
      fetchAccessToken();
    }
  }, [userEmail]);

  // Load Google Picker API and show picker
  useEffect(() => {
    if (!accessToken || !spreadsheetId) return;

    // Prevent a second picker instance (StrictMode double-mount)
    // We allow initialization if it's been more than 2 seconds since the last one
    const now = Date.now();
    if (globalPickerActive && (now - globalPickerLastShown < 2000)) {
      console.log('🚫 Global picker guard active, skipping initialization.');
      setLoading(false);
      return;
    }

    if (pickerInitializedRef.current) {
      console.log('⚠️ Picker already initialized, skipping re-initialization');
      return;
    }
    
    console.log('🎬 GooglePicker useEffect: Starting picker initialization');
    isMountedRef.current = true;
    pickerInitializedRef.current = true; // Mark as initialized
    globalPickerActive = true; // Mark globally to block duplicates
    globalPickerLastShown = now;

    // Load Google API script
    const loadGoogleAPI = () => {
      // Check if script is already loaded
      if (window.gapi && window.gapi.load && window.google && window.google.picker) {
        // API already loaded, initialize picker
        initializePicker();
        return;
      }

      // Check if script is already being loaded
      if (document.querySelector('script[src="https://apis.google.com/js/api.js"]')) {
        // Script exists, wait for it to load
        const checkInterval = setInterval(() => {
          if (window.gapi && window.gapi.load) {
            clearInterval(checkInterval);
            window.gapi.load('picker', initializePicker);
          }
        }, 100);
        return;
      }

      // Load the script
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
        } else {
          if (isMountedRef.current) {
            setError('Google API failed to initialize');
            setLoading(false);
          }
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
      if (!isMountedRef.current) {
        console.log('⚠️ initializePicker: Component unmounted, skipping');
        return;
      }
      
      // Wait a bit for the API to be fully ready
      setTimeout(() => {
        if (!isMountedRef.current) {
          console.log('⚠️ initializePicker setTimeout: Component unmounted, skipping');
          return;
        }
        
        try {
          // Check if picker API is available
          if (!window.google) {
            throw new Error('Google API not loaded');
          }
          
          if (!window.google.picker) {
            throw new Error('Google Picker API not loaded. Make sure the picker library is loaded.');
          }

          console.log('Initializing Google Picker with file ID:', spreadsheetId);
          
          // Get developer key and app ID from environment (critical for drive.file per-file authorization)
          const developerKey = process.env.REACT_APP_GOOGLE_API_KEY;
          const appId = process.env.REACT_APP_GOOGLE_PROJECT_NUMBER;
          
          if (!developerKey) {
            console.warn('⚠️ REACT_APP_GOOGLE_API_KEY not set - Picker may work without it, but per-file auth is more reliable with it');
          }
          if (!appId) {
            console.warn('⚠️ REACT_APP_GOOGLE_PROJECT_NUMBER not set - Per-file authorization may not work');
          }
          
          const builder = new window.google.picker.PickerBuilder()
            .setOAuthToken(accessToken);
          
          // Set developer key (recommended but optional for testing)
          if (developerKey) {
            try {
              builder.setDeveloperKey(developerKey);
              console.log('✅ Developer key set');
            } catch (err) {
              console.warn('⚠️ Failed to set developer key (will try without it):', err.message);
            }
          }
          
          // Set app ID (CRITICAL for drive.file per-file authorization)
          // This must be your Google Cloud Project Number (numeric)
          if (appId) {
            builder.setAppId(appId);
            console.log('✅ App ID set:', appId);
          }
          
          // Add spreadsheets view
          builder.addView(window.google.picker.ViewId.SPREADSHEETS)
            .setCallback((data) => {
              if (!isMountedRef.current) {
                console.log('⚠️ Picker callback fired but component unmounted');
                return;
              }
              
              console.log('📞 Picker callback fired. Action:', data[window.google.picker.Response.ACTION]);
              
              if (data[window.google.picker.Response.ACTION] === window.google.picker.Action.PICKED) {
                const file = data[window.google.picker.Response.DOCUMENTS][0];
                console.log('📄 File data:', file);
                if (file && file.id) {
                  console.log('✅ File selected:', file.id, 'Name:', file.name);
                  // Close the picker immediately
                  try {
                    pickerInstanceRef.current?.setVisible(false);
                  } catch (e) {
                    console.warn('Unable to close picker programmatically:', e.message);
                  }
                  // Store file ID first (async, but don't wait)
                  storeFileId(file.id).catch(err => {
                    console.error('Failed to store file ID:', err);
                  });
                  // Immediately notify parent to close picker and refresh
                  // Use setTimeout to ensure picker closes first
                  setTimeout(() => {
                    console.log('🔄 Calling onFileSelected with:', file.id);
                    onFileSelected(file.id);
                  }, 100);
                } else {
                  console.error('❌ No file ID in picker response:', data);
                  onCancel();
                }
              } else if (data[window.google.picker.Response.ACTION] === window.google.picker.Action.CANCEL) {
                console.log('🚫 Picker cancelled');
                try {
                  pickerInstanceRef.current?.setVisible(false);
                } catch (e) {
                  console.warn('Unable to close picker programmatically on cancel:', e.message);
                }
                onCancel();
              } else {
                console.log('ℹ️ Other picker action:', data[window.google.picker.Response.ACTION]);
              }
            })
            .setTitle('Select Vector Results Spreadsheet');

          // Try to use setFileIds if available (newer API - introduced Jan 2025)
          if (typeof builder.setFileIds === 'function') {
            console.log('Using setFileIds to pre-select file');
            builder.setFileIds([spreadsheetId]);
          } else {
            console.warn('setFileIds not available, picker will show all files');
          }
          
          const picker = builder.build();
          pickerInstanceRef.current = picker;
          picker.setVisible(true);
          console.log('Picker shown successfully');
        } catch (err) {
          console.error('Error initializing Google Picker:', err);
          console.error('Window.google:', window.google);
          console.error('Window.google.picker:', window.google?.picker);
          
          // Fallback: If picker fails but we have the spreadsheet ID, just use it directly
          if (isMountedRef.current && spreadsheetId) {
            console.log('Using fallback: storing spreadsheet ID directly');
            storeFileId(spreadsheetId);
            onFileSelected(spreadsheetId);
            return;
          }
          
          if (isMountedRef.current) {
            setError(`Failed to initialize file picker: ${err.message}. Please check the browser console for more details.`);
            setLoading(false);
          }
        }
      }, 500); // Small delay to ensure API is ready
    };

    loadGoogleAPI();

    return () => {
      console.log('🧹 GooglePicker cleanup: Setting isMountedRef to false');
      try {
        pickerInstanceRef.current?.setVisible(false);
      } catch (e) {
        // ignore
      }
      pickerInstanceRef.current = null;
      isMountedRef.current = false;
      pickerInitializedRef.current = false; // Reset on unmount
      // We DON'T reset globalPickerActive here because we want it to persist 
      // through double-mounts. It will be allowed again after the timeout.
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

  // Picker is shown via Google's UI, so we don't need to show anything
  // The picker dialog itself is the UI
  return null;
}

export default GooglePicker;

