import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, AlertCircle, Loader2, Database, ExternalLink } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SetupStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'error'
  error?: string
}

export function DatabaseSetup() {
  const [setupSteps, setSetupSteps] = useState<SetupStep[]>([
    {
      id: 'connection',
      title: 'Test Connection',
      description: 'Verify Supabase connection is working',
      status: 'pending'
    },
    {
      id: 'user_profiles',
      title: 'Create User Profiles Table',
      description: 'Table for extended user information',
      status: 'pending'
    },
    {
      id: 'personas',
      title: 'Create Personas Table',
      description: 'AI comment styles and tones',
      status: 'pending'
    },
    {
      id: 'comments',
      title: 'Create Comments Table',
      description: 'Generated comments and feedback',
      status: 'pending'
    },
    {
      id: 'policies',
      title: 'Setup Security Policies',
      description: 'Row Level Security (RLS) policies',
      status: 'pending'
    },
    {
      id: 'user_preferences',
      title: 'Create User Preferences Table',
      description: 'Onboarding and user preferences storage',
      status: 'pending'
    },
    {
      id: 'triggers',
      title: 'Create Triggers',
      description: 'Automatic user profile creation',
      status: 'pending'
    }
  ])

  const [isRunning, setIsRunning] = useState(false)
  const { toast } = useToast()

  const updateStep = (stepId: string, status: SetupStep['status'], error?: string) => {
    setSetupSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, error } : step
    ))
  }

  const executeSQL = async (sql: string, stepId: string, description: string) => {
    try {
      updateStep(stepId, 'running')
      
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })
      
      if (error) {
        // If RPC doesn't exist, try direct approach
        throw error
      }
      
      updateStep(stepId, 'completed')
      return true
    } catch (error: any) {
      console.error(`Failed to execute ${description}:`, error)
      updateStep(stepId, 'error', error.message)
      return false
    }
  }

  const runAutomaticSetup = async () => {
    setIsRunning(true)
    
    try {
      // Step 1: Test connection
      updateStep('connection', 'running')
      const { data, error } = await supabase.from('_realtime_schema').select('*').limit(1)
      if (error && error.code !== '42P01') {
        throw new Error('Connection failed: ' + error.message)
      }
      updateStep('connection', 'completed')

      // Step 2: Create user_profiles table
      const userProfilesSQL = `
        create table if not exists public.user_profiles (
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
      `
      await executeSQL(userProfilesSQL, 'user_profiles', 'User Profiles Table')

      // Step 3: Create personas table
      const personasSQL = `
        create table if not exists public.personas (
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
      `
      await executeSQL(personasSQL, 'personas', 'Personas Table')

      // Step 4: Create comments table
      const commentsSQL = `
        create table if not exists public.comments (
          id uuid default gen_random_uuid() primary key,
          user_id uuid references public.user_profiles(id) on delete cascade,
          post_content text not null,
          generated_comment text not null,
          persona_used text,
          feedback text check (feedback in ('pending', 'approved', 'rejected', 'posted')),
          ai_confidence_score decimal(3,2),
          user_rating integer check (user_rating >= 1 and user_rating <= 5),
          posted_at timestamp with time zone,
          created_at timestamp with time zone default now(),
          updated_at timestamp with time zone default now()
        );
      `
      await executeSQL(commentsSQL, 'comments', 'Comments Table')

      // Step 5: Create user_preferences table
      const userPreferencesSQL = `
        create table if not exists public.user_preferences (
          id uuid default gen_random_uuid() primary key,
          user_id uuid references public.user_profiles(id) on delete cascade,
          persona text,
          email text,
          sample_comment text,
          onboarding_completed boolean default false,
          onboarding_step integer default 1,
          approved_comments text[],
          rejected_comments text[],
          extension_installed boolean default false,
          created_at timestamp with time zone default now(),
          updated_at timestamp with time zone default now()
        );
      `
      await executeSQL(userPreferencesSQL, 'user_preferences', 'User Preferences Table')

      // Step 6: Setup RLS policies
      const rlsSQL = `
        alter table public.user_profiles enable row level security;
        alter table public.personas enable row level security;
        alter table public.comments enable row level security;
        alter table public.user_preferences enable row level security;

        create policy if not exists "Users can view own profile" on public.user_profiles
          for select using (auth.uid() = id);
        create policy if not exists "Users can update own profile" on public.user_profiles
          for update using (auth.uid() = id);
        create policy if not exists "Users can insert own profile" on public.user_profiles
          for insert with check (auth.uid() = id);

        create policy if not exists "Users can manage own personas" on public.personas
          for all using (auth.uid() = user_id);

        create policy if not exists "Users can manage own comments" on public.comments
          for all using (auth.uid() = user_id);

        create policy if not exists "Users can manage own preferences" on public.user_preferences
          for all using (auth.uid() = user_id);
      `
      await executeSQL(rlsSQL, 'policies', 'Security Policies')

      // Step 7: Create triggers
      const triggersSQL = `
        create or replace function public.handle_new_user()
        returns trigger as $$
        begin
          insert into public.user_profiles (id, full_name)
          values (new.id, new.raw_user_meta_data->>'full_name');

          insert into public.user_preferences (user_id, email)
          values (new.id, new.email);

          return new;
        end;
        $$ language plpgsql security definer;

        drop trigger if exists on_auth_user_created on auth.users;
        create trigger on_auth_user_created
          after insert on auth.users
          for each row execute function public.handle_new_user();
      `
      await executeSQL(triggersSQL, 'triggers', 'Triggers')

      toast({
        title: "Database setup complete! 🎉",
        description: "Your AutoComment.AI database is ready to use.",
      })

    } catch (error: any) {
      toast({
        title: "Setup encountered an error",
        description: "Some steps may have failed. Check the details below.",
        variant: "destructive",
      })
    } finally {
      setIsRunning(false)
    }
  }

  const completedSteps = setupSteps.filter(step => step.status === 'completed').length
  const progress = (completedSteps / setupSteps.length) * 100

  const getStepIcon = (status: SetupStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'running':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-muted" />
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            <CardTitle>Automatic Database Setup</CardTitle>
          </div>
          <Badge variant={completedSteps === setupSteps.length ? "default" : "secondary"}>
            {completedSteps}/{setupSteps.length} Complete
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertDescription>
            <strong>Automatic Setup:</strong> This will create all necessary database tables, security policies, and triggers for AutoComment.AI. 
            <br />
            <span className="text-sm text-muted-foreground">
              If automatic setup fails, you can still use the manual schema below.
            </span>
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        <Button 
          onClick={runAutomaticSetup} 
          disabled={isRunning || completedSteps === setupSteps.length}
          className="w-full"
          size="lg"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Setting up database...
            </>
          ) : completedSteps === setupSteps.length ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Setup Complete!
            </>
          ) : (
            <>
              <Database className="w-4 h-4 mr-2" />
              Start Automatic Setup
            </>
          )}
        </Button>

        <div className="space-y-3">
          <h4 className="font-medium">Setup Steps:</h4>
          {setupSteps.map((step) => (
            <div key={step.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
              {getStepIcon(step.status)}
              <div className="flex-1 min-w-0">
                <div className="font-medium">{step.title}</div>
                <div className="text-sm text-muted-foreground">{step.description}</div>
                {step.error && (
                  <div className="text-sm text-red-600 mt-1">{step.error}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {completedSteps === setupSteps.length && (
          <Alert>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <strong>Setup Complete!</strong> Your database is ready. You can now:
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>Sign up for a new account at <strong>/auth</strong></li>
                <li>Test the dashboard functionality</li>
                <li>Add and manage comments</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <Alert>
          <ExternalLink className="h-4 w-4" />
          <AlertDescription>
            <strong>Manual Setup Alternative:</strong> If automatic setup doesn't work, you can still manually run the SQL schema in your 
            <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
              Supabase dashboard → SQL Editor
            </a>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
