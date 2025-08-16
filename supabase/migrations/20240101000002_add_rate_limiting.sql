-- Create rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'comment_generation', 'api_call', etc.
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient rate limit queries
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action ON rate_limits(user_id, action_type);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start, action_type);

-- Enable RLS
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS policies for rate_limits
CREATE POLICY "Users can view own rate limits" ON rate_limits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rate limits" ON rate_limits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rate limits" ON rate_limits
  FOR UPDATE USING (auth.uid() = user_id);

-- Rate limiting function
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_action_type TEXT,
  p_max_requests INTEGER DEFAULT 10,
  p_window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  window_start TIMESTAMPTZ;
BEGIN
  -- Calculate window start time
  window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Get current request count in the window
  SELECT COALESCE(SUM(request_count), 0)
  INTO current_count
  FROM rate_limits
  WHERE user_id = p_user_id
    AND action_type = p_action_type
    AND window_start > window_start;
  
  -- Check if limit exceeded
  IF current_count >= p_max_requests THEN
    RETURN FALSE;
  END IF;
  
  -- Update or insert rate limit record
  INSERT INTO rate_limits (user_id, action_type, request_count, window_start)
  VALUES (p_user_id, p_action_type, 1, NOW())
  ON CONFLICT (user_id, action_type) 
  DO UPDATE SET
    request_count = rate_limits.request_count + 1,
    updated_at = NOW()
  WHERE rate_limits.window_start > window_start;
  
  -- If no recent record exists, create new one
  IF NOT FOUND THEN
    INSERT INTO rate_limits (user_id, action_type, request_count, window_start)
    VALUES (p_user_id, p_action_type, 1, NOW());
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get remaining requests
CREATE OR REPLACE FUNCTION get_rate_limit_status(
  p_user_id UUID,
  p_action_type TEXT,
  p_max_requests INTEGER DEFAULT 10,
  p_window_minutes INTEGER DEFAULT 60
) RETURNS JSON AS $$
DECLARE
  current_count INTEGER;
  window_start TIMESTAMPTZ;
  remaining INTEGER;
  reset_time TIMESTAMPTZ;
BEGIN
  -- Calculate window start time
  window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Get current request count in the window
  SELECT COALESCE(SUM(request_count), 0)
  INTO current_count
  FROM rate_limits
  WHERE user_id = p_user_id
    AND action_type = p_action_type
    AND window_start > window_start;
  
  -- Calculate remaining requests
  remaining := GREATEST(0, p_max_requests - current_count);
  
  -- Calculate reset time (start of next window)
  SELECT MAX(window_start) + (p_window_minutes || ' minutes')::INTERVAL
  INTO reset_time
  FROM rate_limits
  WHERE user_id = p_user_id
    AND action_type = p_action_type
    AND window_start > window_start;
  
  -- If no records, reset time is now + window
  IF reset_time IS NULL THEN
    reset_time := NOW() + (p_window_minutes || ' minutes')::INTERVAL;
  END IF;
  
  RETURN json_build_object(
    'current_count', current_count,
    'max_requests', p_max_requests,
    'remaining', remaining,
    'reset_time', reset_time,
    'window_minutes', p_window_minutes
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup old rate limit records (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits() RETURNS VOID AS $$
BEGIN
  DELETE FROM rate_limits
  WHERE window_start < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Add rate limiting columns to user_profiles for plan-based limits
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS daily_request_limit INTEGER DEFAULT 50;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS hourly_request_limit INTEGER DEFAULT 10;

-- Update limits based on subscription plan
UPDATE user_profiles SET 
  daily_request_limit = CASE 
    WHEN subscription_plan = 'free' THEN 50
    WHEN subscription_plan = 'pro' THEN 500
    WHEN subscription_plan = 'enterprise' THEN 9999
    ELSE 50
  END,
  hourly_request_limit = CASE 
    WHEN subscription_plan = 'free' THEN 10
    WHEN subscription_plan = 'pro' THEN 50
    WHEN subscription_plan = 'enterprise' THEN 200
    ELSE 10
  END;

-- Function to get user's rate limits based on their plan
CREATE OR REPLACE FUNCTION get_user_rate_limits(p_user_id UUID) 
RETURNS JSON AS $$
DECLARE
  user_plan TEXT;
  daily_limit INTEGER;
  hourly_limit INTEGER;
BEGIN
  SELECT subscription_plan, daily_request_limit, hourly_request_limit
  INTO user_plan, daily_limit, hourly_limit
  FROM user_profiles
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    -- Default limits for new users
    daily_limit := 50;
    hourly_limit := 10;
    user_plan := 'free';
  END IF;
  
  RETURN json_build_object(
    'plan', user_plan,
    'daily_limit', daily_limit,
    'hourly_limit', hourly_limit
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced rate limiting policy
CREATE POLICY "Rate limit enforcement" ON comment_history
  FOR INSERT WITH CHECK (
    -- Check hourly rate limit
    check_rate_limit(
      auth.uid(), 
      'comment_generation', 
      (SELECT hourly_request_limit FROM user_profiles WHERE user_id = auth.uid()),
      60
    )
    AND
    -- Check daily rate limit
    check_rate_limit(
      auth.uid(), 
      'daily_comment_generation', 
      (SELECT daily_request_limit FROM user_profiles WHERE user_id = auth.uid()),
      1440 -- 24 hours in minutes
    )
  );

-- Add trigger to update user profile limits when plan changes
CREATE OR REPLACE FUNCTION update_rate_limits_on_plan_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Update rate limits when subscription plan changes
  IF OLD.subscription_plan != NEW.subscription_plan THEN
    NEW.daily_request_limit := CASE 
      WHEN NEW.subscription_plan = 'free' THEN 50
      WHEN NEW.subscription_plan = 'pro' THEN 500
      WHEN NEW.subscription_plan = 'enterprise' THEN 9999
      ELSE 50
    END;
    
    NEW.hourly_request_limit := CASE 
      WHEN NEW.subscription_plan = 'free' THEN 10
      WHEN NEW.subscription_plan = 'pro' THEN 50
      WHEN NEW.subscription_plan = 'enterprise' THEN 200
      ELSE 10
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_rate_limits ON user_profiles;
CREATE TRIGGER trigger_update_rate_limits
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_rate_limits_on_plan_change();

-- Add updated_at trigger for rate_limits
DROP TRIGGER IF EXISTS handle_updated_at ON rate_limits;
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON rate_limits
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
