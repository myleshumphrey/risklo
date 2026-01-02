import React, { useEffect, useState, useCallback, useRef } from 'react';
import { API_BASE_URL } from '../config';
import './GooglePicker.css';

// Global guard to prevent double Picker/consent in React StrictMode
let globalPickerActive = false;
let globalPickerLastShown = 0;

function GooglePicker({ userEmail, spreadsheetId, onFileSelected, onCancel }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const isMountedRef = useRef(true);
  const pickerInitializedRef = useRef(false);
  const pickerInstanceRef = useRef(null);

  const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
  const GOOGLE_PROJECT_NUMBER = process.env.REACT_APP_GOOGLE_PROJECT_NUMBER;

  const storeFileId = useCallback(async (fileId) => {
    try {
      await fetch(`${API_BASE_URL}/api/google-sheets/oauth/file-id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, fileId }),
      });
    } catch (err) {
      console.error('❌ Error storing file ID:', err);
    }
  }, [userEmail]);

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/google-sheets/oauth/access-token?email=${encodeURIComponent(userEmail)}`);
        if (response.status === 401) {
          throw new Error('Your session has expired. Please sign out and sign back in.');
        }
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
          setError(err.message || 'Failed to get access token.');
          setLoading(false);
        }
      }
    };
    if (userEmail) fetchAccessToken();
  }, [userEmail]);

  useEffect(() => {
    if (!accessToken || !spreadsheetId || !isMountedRef.current) return;

    const now = Date.now();
    if (globalPickerActive && (now - globalPickerLastShown < 2000)) return;
    if (pickerInitializedRef.current) return;
    
    pickerInitializedRef.current = true;
    globalPickerActive = true;
    globalPickerLastShown = now;

    const loadGoogleAPI = () => {
      if (window.gapi && window.google?.picker) {
        initializePicker();
      } else {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => window.gapi.load('picker', { callback: initializePicker });
        document.head.appendChild(script);
      }
    };

    const initializePicker = () => {
      if (!isMountedRef.current) return;
      
      setTimeout(() => {
        try {
          console.log('🛠 Picker Debug:', {
            hasToken: !!accessToken,
            hasKey: !!GOOGLE_API_KEY,
            projectNumber: GOOGLE_PROJECT_NUMBER,
            origin: window.location.protocol + '//' + window.location.host
          });

          if (!GOOGLE_API_KEY) {
            throw new Error('REACT_APP_GOOGLE_API_KEY is missing.');
          }

          const view = new window.google.picker.DocsView(window.google.picker.ViewId.SPREADSHEETS)
            .setMimeTypes('application/vnd.google-apps.spreadsheet')
            .setFileIds(spreadsheetId);

          const builder = new window.google.picker.PickerBuilder()
            .setOAuthToken(accessToken)
            .setDeveloperKey(GOOGLE_API_KEY)
            .setAppId(GOOGLE_PROJECT_NUMBER)
            // CRITICAL for Production: Tell Google exactly which domain is opening the picker
            .setOrigin(window.location.protocol + '//' + window.location.host)
            .addView(view)
            .setCallback((data) => {
              if (data[window.google.picker.Response.ACTION] === window.google.picker.Action.PICKED) {
                const file = data[window.google.picker.Response.DOCUMENTS][0];
                if (file?.id) {
                  storeFileId(file.id);
                  onFileSelected(file.id);
                }
              } else if (data[window.google.picker.Response.ACTION] === window.google.picker.Action.CANCEL) {
                onCancel();
              }
            })
            .setTitle('Select Vector Results Spreadsheet');

          const picker = builder.build();
          pickerInstanceRef.current = picker;
          picker.setVisible(true);
        } catch (err) {
          console.error('❌ Picker Error:', err);
          setError(err.message);
        }
      }, 800);
    };

    loadGoogleAPI();

    return () => {
      isMountedRef.current = false;
      globalPickerActive = false;
      try { pickerInstanceRef.current?.setVisible(false); } catch (e) {}
    };
  }, [accessToken, spreadsheetId, onFileSelected, onCancel, storeFileId, GOOGLE_API_KEY, GOOGLE_PROJECT_NUMBER]);

  if (loading) return <div className="google-picker-container"><div className="google-picker-loading"><div className="spinner"></div><p>Loading file picker...</p></div></div>;
  if (error) return <div className="google-picker-container"><div className="google-picker-error"><p>{error}</p><button onClick={onCancel}>Close</button></div></div>;
  return null;
}

export default GooglePicker;
