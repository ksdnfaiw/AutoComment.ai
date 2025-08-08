-- AutoComment.AI Database Schema
-- Run this SQL in your Supabase SQL Editor to create all necessary tables

-- Enable Row Level Security
-- This will be set up table by table below

-- 1. User Profiles Table (extends auth.users)
create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  linkedin_profile text,
  persona text default 'professional',
  tokens_used integer default 0,
  tokens_limit integer default 50,
  subscription_tier text default 'free',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. User Personas Table
create table public.personas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.user_profiles(id) on delete cascade,
  name text not null,
  description text,
  tone text default 'professional',
  style_keywords text[],
  example_comments text[],
  is_default boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 3. LinkedIn Posts Table
create table public.linkedin_posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.user_profiles(id) on delete cascade,
  post_url text,
  post_content text not null,
  author_name text,
  author_profile text,
  industry text,
  hashtags text[],
  engagement_metrics jsonb,
  created_at timestamp with time zone default now()
);

-- 4. Generated Comments Table
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.user_profiles(id) on delete cascade,
  post_id uuid references public.linkedin_posts(id) on delete cascade,
  post_content text not null, -- denormalized for quick access
  generated_comment text not null,
  persona_used text,
  feedback text check (feedback in ('pending', 'approved', 'rejected', 'posted')),
  ai_confidence_score decimal(3,2),
  user_rating integer check (user_rating >= 1 and user_rating <= 5),
  posted_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 5. Comment Templates Table
create table public.comment_templates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.user_profiles(id) on delete cascade,
  template_name text not null,
  template_content text not null,
  category text,
  usage_count integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 6. User Settings Table
create table public.user_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.user_profiles(id) on delete cascade,
  notification_preferences jsonb default '{}',
  ai_settings jsonb default '{}',
  extension_settings jsonb default '{}',
  privacy_settings jsonb default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 7. Usage Analytics Table
create table public.usage_analytics (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.user_profiles(id) on delete cascade,
  action_type text not null, -- 'comment_generated', 'comment_approved', 'comment_posted', etc.
  metadata jsonb,
  timestamp timestamp with time zone default now()
);

-- Create indexes for better performance
create index idx_user_profiles_id on public.user_profiles(id);
create index idx_personas_user_id on public.personas(user_id);
create index idx_linkedin_posts_user_id on public.linkedin_posts(user_id);
create index idx_comments_user_id on public.comments(user_id);
create index idx_comments_created_at on public.comments(created_at desc);
create index idx_comment_templates_user_id on public.comment_templates(user_id);
create index idx_user_settings_user_id on public.user_settings(user_id);
create index idx_usage_analytics_user_id on public.usage_analytics(user_id);
create index idx_usage_analytics_timestamp on public.usage_analytics(timestamp desc);

-- Set up Row Level Security (RLS)
alter table public.user_profiles enable row level security;
alter table public.personas enable row level security;
alter table public.linkedin_posts enable row level security;
alter table public.comments enable row level security;
alter table public.comment_templates enable row level security;
alter table public.user_settings enable row level security;
alter table public.usage_analytics enable row level security;

-- RLS Policies for user_profiles
create policy "Users can view own profile" on public.user_profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.user_profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.user_profiles
  for insert with check (auth.uid() = id);

-- RLS Policies for personas
create policy "Users can manage own personas" on public.personas
  for all using (auth.uid() = user_id);

-- RLS Policies for linkedin_posts
create policy "Users can manage own posts" on public.linkedin_posts
  for all using (auth.uid() = user_id);

-- RLS Policies for comments
create policy "Users can manage own comments" on public.comments
  for all using (auth.uid() = user_id);

-- RLS Policies for comment_templates
create policy "Users can manage own templates" on public.comment_templates
  for all using (auth.uid() = user_id);

-- RLS Policies for user_settings
create policy "Users can manage own settings" on public.user_settings
  for all using (auth.uid() = user_id);

-- RLS Policies for usage_analytics
create policy "Users can view own analytics" on public.usage_analytics
  for select using (auth.uid() = user_id);

create policy "System can insert analytics" on public.usage_analytics
  for insert with check (true);

-- Create triggers for updated_at timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_user_profiles_updated_at
  before update on public.user_profiles
  for each row execute function public.handle_updated_at();

create trigger handle_personas_updated_at
  before update on public.personas
  for each row execute function public.handle_updated_at();

create trigger handle_comments_updated_at
  before update on public.comments
  for each row execute function public.handle_updated_at();

create trigger handle_comment_templates_updated_at
  before update on public.comment_templates
  for each row execute function public.handle_updated_at();

create trigger handle_user_settings_updated_at
  before update on public.user_settings
  for each row execute function public.handle_updated_at();

-- Function to automatically create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Insert default personas for new users
create or replace function public.create_default_personas()
returns trigger as $$
begin
  -- Create default personas for new user
  insert into public.personas (user_id, name, description, tone, style_keywords, is_default) values
  (new.id, 'Professional', 'Professional and insightful comments', 'professional', 
   array['insights', 'experience', 'perspective', 'valuable'], true),
  (new.id, 'Thought Leader', 'Industry expertise and thought leadership', 'authoritative', 
   array['expertise', 'trends', 'innovation', 'leadership'], false),
  (new.id, 'Supportive', 'Encouraging and supportive comments', 'friendly', 
   array['great', 'excellent', 'inspiring', 'congratulations'], false);
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create default personas
create trigger on_user_profile_created
  after insert on public.user_profiles
  for each row execute function public.create_default_personas();

-- Create some sample data (optional - remove if not needed)
-- This is just for testing purposes
