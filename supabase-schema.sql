-- AutoComment.AI Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User personas table
create table public.personas (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  tone text not null check (tone in ('professional', 'casual', 'friendly', 'expert', 'enthusiastic')),
  industry text,
  writing_style text,
  emoji_usage text default 'minimal' check (emoji_usage in ('none', 'minimal', 'moderate', 'frequent')),
  is_active boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Token packages table
create table public.token_packages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  total_tokens integer not null default 50,
  used_tokens integer not null default 0,
  remaining_tokens integer generated always as (total_tokens - used_tokens) stored,
  package_type text default 'free' check (package_type in ('free', 'pro', 'premium')),
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- LinkedIn posts table (for storing post context)
create table public.linkedin_posts (
  id uuid default uuid_generate_v4() primary key,
  post_url text unique not null,
  post_content text not null,
  author_name text,
  author_profile text,
  post_type text default 'text' check (post_type in ('text', 'image', 'video', 'article', 'poll')),
  engagement_count integer default 0,
  scraped_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Generated comments table
create table public.generated_comments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  persona_id uuid references public.personas(id) on delete set null,
  post_id uuid references public.linkedin_posts(id) on delete cascade not null,
  generated_text text not null,
  is_approved boolean default false,
  is_posted boolean default false,
  feedback_rating integer check (feedback_rating between 1 and 5),
  feedback_notes text,
  tokens_used integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  posted_at timestamp with time zone
);

-- Subscriptions table
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  plan_type text not null check (plan_type in ('free', 'pro', 'premium')),
  status text default 'active' check (status in ('active', 'cancelled', 'expired', 'paused')),
  current_period_start timestamp with time zone not null,
  current_period_end timestamp with time zone not null,
  stripe_subscription_id text unique,
  stripe_customer_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Usage analytics table
create table public.usage_analytics (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  action_type text not null check (action_type in ('comment_generated', 'comment_approved', 'comment_posted', 'token_purchased')),
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Policies
alter table public.profiles enable row level security;
alter table public.personas enable row level security;
alter table public.token_packages enable row level security;
alter table public.generated_comments enable row level security;
alter table public.subscriptions enable row level security;
alter table public.usage_analytics enable row level security;

-- Profiles policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Personas policies
create policy "Users can manage own personas" on public.personas for all using (auth.uid() = user_id);

-- Token packages policies
create policy "Users can view own tokens" on public.token_packages for select using (auth.uid() = user_id);
create policy "Users can update own tokens" on public.token_packages for update using (auth.uid() = user_id);
create policy "Users can insert own tokens" on public.token_packages for insert with check (auth.uid() = user_id);

-- Generated comments policies
create policy "Users can manage own comments" on public.generated_comments for all using (auth.uid() = user_id);

-- Subscriptions policies
create policy "Users can view own subscriptions" on public.subscriptions for select using (auth.uid() = user_id);
create policy "Users can update own subscriptions" on public.subscriptions for update using (auth.uid() = user_id);
create policy "Users can insert own subscriptions" on public.subscriptions for insert with check (auth.uid() = user_id);

-- Usage analytics policies
create policy "Users can view own analytics" on public.usage_analytics for select using (auth.uid() = user_id);
create policy "Service can insert analytics" on public.usage_analytics for insert with check (true);

-- LinkedIn posts can be read by all authenticated users
create policy "Authenticated users can read posts" on public.linkedin_posts for select using (auth.role() = 'authenticated');
create policy "Service can manage posts" on public.linkedin_posts for all using (auth.role() = 'service_role');

-- Functions for automatic profile creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  
  -- Create default token package
  insert into public.token_packages (user_id, total_tokens, package_type)
  values (new.id, 50, 'free');
  
  -- Create default persona
  insert into public.personas (user_id, name, tone, is_active)
  values (new.id, 'Professional', 'professional', true);
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user setup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Add update triggers
create trigger update_profiles_updated_at before update on public.profiles for each row execute procedure update_updated_at_column();
create trigger update_personas_updated_at before update on public.personas for each row execute procedure update_updated_at_column();
create trigger update_token_packages_updated_at before update on public.token_packages for each row execute procedure update_updated_at_column();
create trigger update_subscriptions_updated_at before update on public.subscriptions for each row execute procedure update_updated_at_column();

-- Insert sample data for testing (optional)
-- You can remove this section if you don't want sample data

-- Sample LinkedIn posts
insert into public.linkedin_posts (post_url, post_content, author_name, post_type) values
('https://linkedin.com/posts/sample1', 'Excited to share our latest product launch! We''ve been working hard on this for months.', 'John Doe', 'text'),
('https://linkedin.com/posts/sample2', 'Just completed an amazing workshop on AI and machine learning. The future is bright!', 'Jane Smith', 'text'),
('https://linkedin.com/posts/sample3', 'Thoughts on the current state of remote work and its impact on productivity...', 'Alex Johnson', 'text');