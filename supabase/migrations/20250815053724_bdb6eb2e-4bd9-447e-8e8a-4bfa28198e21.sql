-- Create feedback table for storing comment approvals/rejections
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  comment_text TEXT NOT NULL,
  post_content TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('approved', 'rejected')),
  persona_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage own feedback" 
ON public.feedback 
FOR ALL 
USING (auth.uid() = user_id);