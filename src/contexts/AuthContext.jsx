import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Update last_login for existing session
      if (session?.user) {
        updateLastLogin(session.user.id).catch(err => {
          console.error('Failed to update last login:', err);
        });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Update last_login on sign in
        if (event === 'SIGNED_IN' && session?.user) {
          updateLastLogin(session.user.id).catch(err => {
            console.error('Failed to update last login:', err);
          });
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const updateLastLogin = async (userId) => {
    try {
      // Update last_login timestamp using RPC function
      const { error } = await supabase.rpc('update_user_last_login', { 
        user_id: userId 
      });

      if (error) {
        console.error('Error updating last login:', error);
        // Fallback: try direct update
        await supabase
          .from('profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('id', userId);
      }
    } catch (error) {
      console.error('Failed to update last login:', error);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
    }
    return { error };
  };

  const value = {
    user,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};