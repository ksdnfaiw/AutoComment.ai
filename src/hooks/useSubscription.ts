import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { SubscriptionPlan, UserSubscription, SUBSCRIPTION_PLANS } from '@/types/subscription';

export const useSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's current subscription
  const { data: subscription, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('subscription_tier, tokens_limit, tokens_used, created_at')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching subscription:', error);
        // Return default free plan data
        return {
          planId: 'free',
          status: 'active' as const,
          tokensLimit: 50,
          tokensUsed: 0,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };
      }

      return {
        planId: data.subscription_tier || 'free',
        status: 'active' as const,
        tokensLimit: data.tokens_limit || 50,
        tokensUsed: data.tokens_used || 0,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get current plan details
  const currentPlan = subscription ? 
    SUBSCRIPTION_PLANS.find(plan => plan.id === subscription.planId) || SUBSCRIPTION_PLANS[0] :
    SUBSCRIPTION_PLANS[0];

  // Check if user has access to a feature based on their plan
  const hasFeatureAccess = (feature: string): boolean => {
    if (!subscription || !currentPlan) return false;
    
    // Basic feature checks
    switch (feature) {
      case 'advanced_personas':
        return currentPlan.id !== 'free';
      case 'custom_templates':
        return currentPlan.id === 'pro' || currentPlan.id === 'enterprise';
      case 'api_access':
        return currentPlan.id === 'enterprise';
      case 'team_management':
        return currentPlan.id === 'enterprise';
      case 'priority_support':
        return currentPlan.id !== 'free';
      default:
        return true;
    }
  };

  // Check if user has remaining tokens
  const hasRemainingTokens = (): boolean => {
    if (!subscription) return false;
    return (subscription.tokensLimit - subscription.tokensUsed) > 0;
  };

  // Get remaining tokens
  const getRemainingTokens = (): number => {
    if (!subscription) return 0;
    return Math.max(0, subscription.tokensLimit - subscription.tokensUsed);
  };

  // Usage percentage
  const getUsagePercentage = (): number => {
    if (!subscription || subscription.tokensLimit === 0) return 0;
    return (subscription.tokensUsed / subscription.tokensLimit) * 100;
  };

  // Upgrade/downgrade subscription
  const changePlanMutation = useMutation({
    mutationFn: async (newPlanId: string) => {
      if (!user) throw new Error('No user found');

      const newPlan = SUBSCRIPTION_PLANS.find(plan => plan.id === newPlanId);
      if (!newPlan) throw new Error('Invalid plan');

      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          subscription_tier: newPlanId,
          tokens_limit: newPlan.tokensPerMonth,
          // Reset tokens if upgrading
          tokens_used: 0
        })
        .eq('id', user.id);

      if (error) throw error;

      return { planId: newPlanId, plan: newPlan };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subscription', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['tokens', user?.id] });
      
      toast({
        title: "Plan updated!",
        description: `Successfully ${data.planId === 'free' ? 'downgraded to' : 'upgraded to'} ${data.plan.name} plan.`,
      });
    },
    onError: (error) => {
      console.error('Error changing plan:', error);
      toast({
        title: "Error updating plan",
        description: "Please try again later or contact support.",
        variant: "destructive",
      });
    },
  });

  // Mock payment processing (in real app, integrate with Stripe)
  const initiatePayment = async (planId: string) => {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan || plan.id === 'free') {
      changePlanMutation.mutate(planId);
      return;
    }

    // Simulate payment processing
    toast({
      title: "Processing payment...",
      description: "Redirecting to payment processor.",
    });

    // In a real app, you would integrate with Stripe here
    setTimeout(() => {
      changePlanMutation.mutate(planId);
    }, 2000);
  };

  return {
    subscription,
    currentPlan,
    subscriptionLoading,
    hasFeatureAccess,
    hasRemainingTokens,
    getRemainingTokens,
    getUsagePercentage,
    changePlan: changePlanMutation.mutate,
    isChangingPlan: changePlanMutation.isPending,
    initiatePayment,
    plans: SUBSCRIPTION_PLANS
  };
};
