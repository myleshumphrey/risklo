import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('risklo_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        checkProStatus(userData.email);
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
        localStorage.removeItem('risklo_user');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Check Pro status from backend
  const checkProStatus = async (email) => {
    if (!email) {
      setIsPro(false);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.proStatus(email));
      const data = await response.json();
      setIsPro(data.isPro || false);
      setIsDevMode(data.devMode || false);
    } catch (error) {
      console.error('Error checking Pro status:', error);
      setIsPro(false);
      setIsDevMode(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = (credential) => {
    try {
      // Decode JWT credential (client-side only, no verification needed for display)
      const base64Url = credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);

      const userData = {
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        picture: payload.picture || null,
      };

      setUser(userData);
      localStorage.setItem('risklo_user', JSON.stringify(userData));
      checkProStatus(userData.email);
    } catch (error) {
      console.error('Error decoding Google credential:', error);
      alert('Failed to sign in. Please try again.');
    }
  };

  // Handle Sign Out
  const signOut = () => {
    setUser(null);
    setIsPro(false);
    setIsDevMode(false);
    localStorage.removeItem('risklo_user');
  };

  // Refresh Pro status (call after successful payment)
  const refreshProStatus = () => {
    if (user?.email) {
      checkProStatus(user.email);
    }
  };

  const value = {
    user,
    isPro,
    isDevMode,
    loading,
    handleGoogleSignIn,
    signOut,
    refreshProStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

