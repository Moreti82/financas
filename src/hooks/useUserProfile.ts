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
            role: user.email === 'engmoreti@gmail.com' ? 'admin' : 'user',
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

      // Buscar perfil do Supabase
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user profile:', error);
      }

      if (data) {
        setUserProfile(data);
      } else {
        // Se não existir perfil, criar um padrão
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            role: user.email === 'engmoreti@gmail.com' ? 'admin' : 'user',
            plan: 'free'
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating user profile:', createError);
        } else {
          setUserProfile(newProfile);
        }
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!userProfile) return;

    try {
      const isDevMode = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === '';
      
      if (isDevMode) {
        // Mock update
        const updatedProfile = { ...userProfile, ...updates, updated_at: new Date().toISOString() };
        setUserProfile(updatedProfile);
        return updatedProfile;
      }

      // Update real no Supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfile.id)
        .select()
        .single();

      if (error) throw error;
      setUserProfile(data);
      return data;
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
