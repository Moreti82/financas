import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types/database';

interface UserProfileContextType {
  userProfile: UserProfile | null;
  authUser: any;
  loading: boolean;
  isAdmin: boolean;
  isUser: boolean;
  currentPlan: string;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile | null>;
  refreshProfile: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authUser, setAuthUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setAuthUser(user);
      
      if (!user) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setUserProfile(data);
      } else {
        const userEmail = user.email?.toLowerCase() || '';
        const { data: newProfile } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            role: userEmail === 'engmoreti@gmail.com' ? 'admin' : 'user',
            plan: 'free'
          })
          .select()
          .single();
        if (newProfile) setUserProfile(newProfile);
      }
    } catch (error) {
      console.error('Error loading user profile context:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserProfile();
    
    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUserProfile();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('UpdateProfile: No authenticated user found');
      return null;
    }

    try {
      console.log('Attempting upsert with updates:', updates, 'for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          email: user.email, // Garantir que o email nunca seja nulo
          role: userProfile?.role || 'user', // Garantir que o papel não se perca
          ...updates,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        console.error('Supabase Upsert Error:', error);
        throw error;
      }

      console.log('Upsert Success! New Profile Data:', data);
      setUserProfile(data);
      return data;
    } catch (error) {
      console.error('Error in centralized updateProfile:', error);
      throw error;
    }
  };

  const isAdmin = userProfile?.role === 'admin' || authUser?.email?.toLowerCase() === 'engmoreti@gmail.com';
  const isUser = userProfile?.role === 'user';
  const currentPlan = userProfile?.plan || 'free';

  return (
    <UserProfileContext.Provider value={{
      userProfile,
      authUser,
      loading,
      isAdmin,
      isUser,
      currentPlan,
      updateProfile,
      refreshProfile: loadUserProfile
    }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfileContext() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfileContext must be used within a UserProfileProvider');
  }
  return context;
}
