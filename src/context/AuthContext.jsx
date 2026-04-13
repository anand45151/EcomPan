import React, { createContext, useContext, useEffect, useState } from 'react';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import { upsertUser, getUser } from '../services/firestoreService';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

// Decode a Google JWT id_token (base64) — no library needed
function decodeJwt(token) {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64));
}

// Fetch the user's Google profile using the access token
async function fetchGoogleProfile(accessToken) {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.json();
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // merged Google profile + Firestore role
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on page load
  useEffect(() => {
    const stored = localStorage.getItem('paan-user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  async function handleGoogleSuccess(tokenResponse) {
    try {
      // 1. Get Google profile (name, email, picture, sub)
      const profile = await fetchGoogleProfile(tokenResponse.access_token);

      // 2. Use Google's "sub" (subject) as the stable unique user ID
      const uid = profile.sub;

      // 3. Sync to Firestore (creates doc if new, updates if existing)
      await upsertUser(uid, {
        email: profile.email,
        name: profile.name,
        photoURL: profile.picture,
      });

      // 4. Fetch full profile (includes role set by admin)
      const firestoreProfile = await getUser(uid);

      const fullUser = {
        uid,
        email: profile.email,
        name: profile.name,
        photoURL: profile.picture,
        ...firestoreProfile,
      };

      setUser(fullUser);
      localStorage.setItem('paan-user', JSON.stringify(fullUser));
      toast.success(`Welcome, ${profile.name.split(' ')[0]}!`);
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Sign-in failed. Please try again.');
    }
  }

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error('Google sign-in was cancelled or failed.'),
  });

  function logout() {
    googleLogout();
    setUser(null);
    localStorage.removeItem('paan-user');
    toast.success('Signed out successfully.');
  }

  const isAdmin = user?.role === 'admin';
  const isCustomer = user?.role === 'customer';

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout, isAdmin, isCustomer }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
