-- Create user_preferences table for onboarding data
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id uuid NOT NULL,
  tone_style text,
  industry_domain text,
  sample_feedback jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_preferences_pkey PRIMARY KEY (user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Policies: users can manage their own preferences
CREATE POLICY IF NOT EXISTS "Users can view own preferences"
ON public.user_preferences
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own preferences"
ON public.user_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own preferences"
ON public.user_preferences
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for maintaining updated_at
DROP TRIGGER IF EXISTS handle_updated_at_user_prefs ON public.user_preferences;
CREATE TRIGGER handle_updated_at_user_prefs
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();