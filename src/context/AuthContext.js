// context/AuthContext.js
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import supabase from '@/utils/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Single state to track user
  const [authAlert, setAuthAlert] = useState({ message: '', type: '' });

  const showAlert = (message, type) => {
    setAuthAlert({ message, type });
    setTimeout(() => {
      setAuthAlert({ message: '', type: '' });
    }, 3000);
  };

  // Check for session on app load
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        setUser(data.session.user); // Update user state with session data
      }
    };

    checkSession();

    // Add listener to handle auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user); // Update user state on sign-in
        showAlert('Signed in successfully!', 'success');
      } else {
        setUser(null); // Clear user on sign-out
      }
    });

    // Clean up listener
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, authAlert, showAlert }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);
