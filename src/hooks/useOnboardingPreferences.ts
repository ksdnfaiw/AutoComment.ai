import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type SampleFeedback = { id: string; text: string; liked?: boolean };

export const useOnboardingPreferences = () => {
  const { toast } = useToast();

  const getUserId = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save your onboarding preferences.",
        variant: "destructive",
      });
      return null;
    }
    return data.user.id;
  };

  const upsert = async (partial: {
    tone_style?: string;
    industry_domain?: string;
    sample_feedback?: SampleFeedback[];
  }) => {
    const userId = await getUserId();
    if (!userId) return;

    const payload: any = { user_id: userId, ...partial };

    const { error } = await supabase
      .from("user_preferences")
      .upsert(payload, { onConflict: "user_id" });

    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Your preferences were updated." });
    }
  };

  return {
    saveToneStyle: async (tone: string) => upsert({ tone_style: tone }),
    saveIndustryDomain: async (industry: string) => upsert({ industry_domain: industry }),
    saveSampleFeedback: async (feedback: SampleFeedback[]) => upsert({ sample_feedback: feedback }),
    loadPreferences: async () => {
      const userId = await getUserId();
      if (!userId) return null;
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) {
        toast({ title: "Load failed", description: error.message, variant: "destructive" });
        return null;
      }
      return data;
    },
  };
};
