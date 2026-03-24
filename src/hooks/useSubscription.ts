import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Subscription, PlanType } from '../types/database';

interface PlanLimits {
  transactions: number;
  categories: number;
  features: string[];
}

const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    transactions: 10,
    categories: 3,
    features: ['basic_dashboard', 'manual_entry']
  },
  pro: {
    transactions: Infinity,
    categories: Infinity,
    features: ['basic_dashboard', 'manual_entry', 'reports', 'export', 'analytics']
  },
  enterprise: {
    transactions: Infinity,
    categories: Infinity,
    features: ['basic_dashboard', 'manual_entry', 'reports', 'export', 'analytics', 'api_access', 'team_management', 'priority_support']
  }
};

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setSubscription(null);
        setLoading(false);
        return;
      }

      // Mock subscription até configurar Supabase real
      const mockSubscription: Subscription = {
        id: 'mock-subscription',
        user_id: user.id,
        plan: 'free',
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setSubscription(mockSubscription);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentPlan = subscription?.plan || 'free';
  const limits = PLAN_LIMITS[currentPlan];
  const isPro = currentPlan === 'pro' || currentPlan === 'enterprise';
  const isEnterprise = currentPlan === 'enterprise';

  const canAddTransaction = (currentCount: number) => {
    return currentCount < limits.transactions;
  };

  const canAddCategory = (currentCount: number) => {
    return currentCount < limits.categories;
  };

  const hasFeature = (feature: string) => {
    return limits.features.includes(feature);
  };

  return {
    subscription,
    loading,
    currentPlan,
    limits,
    isPro,
    isEnterprise,
    canAddTransaction,
    canAddCategory,
    hasFeature,
    refreshSubscription: loadSubscription
  };
}
