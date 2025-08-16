import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface TokenData {
  current: number;
  total: number;
  plan: string;
}

export const useTokens = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current token data
  const { data: tokenData, isLoading, error } = useQuery({
    queryKey: ['tokens', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('tokens_remaining, tokens_total, subscription_plan')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching tokens:', error);
        throw error;
      }

      return {
        current: data.tokens_remaining || 0,
        total: data.tokens_total || 50,
        plan: data.subscription_plan || 'free'
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutation to refresh tokens (for monthly reset)
  const refreshTokensMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('No user found');

      const newTokenCount = tokenData?.plan === 'pro' ? 500 : 50;

      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          tokens_remaining: newTokenCount,
          tokens_total: newTokenCount
        })
        .eq('user_id', user.id);

      if (error) throw error;

      return { current: newTokenCount, total: newTokenCount, plan: tokenData?.plan || 'free' };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['tokens', user?.id], data);
      toast({
        title: "Tokens refreshed!",
        description: "Your monthly token balance has been reset.",
      });
    },
    onError: (error) => {
      console.error('Error refreshing tokens:', error);
      toast({
        title: "Error refreshing tokens",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Function to deduct a token (called after AI generation)
  const deductToken = async () => {
    if (!user || !tokenData) return false;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ tokens_remaining: Math.max(0, tokenData.current - 1) })
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local cache
      queryClient.setQueryData(['tokens', user?.id], {
        ...tokenData,
        current: Math.max(0, tokenData.current - 1)
      });

      return true;
    } catch (error) {
      console.error('Error deducting token:', error);
      return false;
    }
  };

  const refreshTokens = () => {
    refreshTokensMutation.mutate();
  };

  return {
    tokenData: tokenData || { current: 0, total: 0, plan: 'free' },
    isLoading,
    error,
    refreshTokens,
    isRefreshing: refreshTokensMutation.isPending,
    deductToken,
    hasTokens: (tokenData?.current || 0) > 0
  };
};
