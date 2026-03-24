import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types/database';

export function useUserProfile() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      // Verificar se está em modo desenvolvimento
      const isDevMode = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === '';
      
      if (isDevMode) {
        // Modo desenvolvimento - criar perfil mockado baseado no usuário atual
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const mockProfile: UserProfile = {
            id: 'mock-profile-id',
            user_id: user.id,
            role: user.email === 'admin@financaspro.com' ? 'admin' : 'user',
            plan: 'free',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setUserProfile(mockProfile);
        }
        setLoading(false);
        return;
      }

      // Modo produção - usar Supabase real
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      // Por enquanto, criar perfil mockado até configurar as tabelas no Supabase
      const mockProfile: UserProfile = {
        id: 'mock-id',
        user_id: user.id,
        role: user.email === 'admin@financaspro.com' ? 'admin' : 'user',
        plan: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setUserProfile(mockProfile);
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!userProfile) return;

    try {
      // Mock update até configurar Supabase
      const updatedProfile = { ...userProfile, ...updates, updated_at: new Date().toISOString() };
      setUserProfile(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const isAdmin = userProfile?.role === 'admin';
  const isUser = userProfile?.role === 'user';
  const currentPlan = userProfile?.plan || 'free';

  return {
    userProfile,
    loading,
    isAdmin,
    isUser,
    currentPlan,
    updateProfile,
    refreshProfile: loadUserProfile
  };
}
