import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Ensure user profile exists with proper token allocation for free plan
  const ensureUserProfile = async (user: User) => {
    try {
      // Check if profile already exists
      const { data: existingProfile, error: selectError } = await supabase
        .from('user_profiles')
        .select('id, tokens_limit, tokens_used, subscription_tier')
        .eq('id', user.id)
        .single()

      if (selectError && selectError.code !== 'PGRST116') {
        // Error other than "not found"
        console.error('Error checking user profile:', selectError)
        return
      }

      if (!existingProfile) {
        // Create new profile with free plan token allocation
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            full_name: user.user_metadata?.full_name || '',
            subscription_tier: 'free',
            tokens_limit: 50,
            tokens_used: 0
          })

        if (insertError) {
          console.error('Error creating user profile:', insertError)
        }
      } else if (!existingProfile.tokens_limit && !existingProfile.subscription_tier) {
        // Update existing profile with missing token fields
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            subscription_tier: 'free',
            tokens_limit: 50,
            tokens_used: 0
          })
          .eq('id', user.id)

        if (updateError) {
          console.error('Error updating user profile:', updateError)
        }
      }
    } catch (error) {
      console.error('Error ensuring user profile:', error)
    }
  }

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
      } else {
        setSession(session)
        setUser(session?.user ?? null)
      }
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        if (event === 'SIGNED_IN' && session?.user) {
          // Check if user profile exists, if not create one with proper token allocation
          await ensureUserProfile(session.user)

          toast({
            title: "Welcome back!",
            description: `Signed in as ${session?.user?.email}`,
          })

          // Redirect to dashboard after successful sign in
          if (window.location.pathname === '/auth') {
            window.location.href = '/dashboard'
          }
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "Signed out",
            description: "You have been signed out successfully.",
          })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [toast])

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true)

      // For demo purposes, we'll try to create the account without email verification
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?confirmed=true`,
          data: {
            full_name: fullName,
          }
        }
      })

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        })
        return { error }
      }

      if (data.user && !data.session) {
        // Email verification required but user created
        toast({
          title: "Account created! ✅",
          description: "For instant access, use the 'Quick Demo Access' button below with password 'demo123456'",
        })
      } else if (data.session) {
        // User was automatically signed in (email confirmation disabled)
        toast({
          title: "Welcome! 🎉",
          description: "Account created successfully! Redirecting to your dashboard...",
        })

        // Auto redirect after successful signup
        setTimeout(() => {
          window.location.href = '/onboarding'
        }, 1500)
      }

      return { error: null }
    } catch (error: any) {
      console.error('Sign up error:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        })
        return { error }
      }

      return { error: null }
    } catch (error: any) {
      console.error('Sign in error:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()

      if (error) {
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive",
        })
        return { error }
      }

      return { error: null }
    } catch (error: any) {
      console.error('Sign out error:', error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        toast({
          title: "Password reset failed",
          description: error.message,
          variant: "destructive",
        })
        return { error }
      }

      toast({
        title: "Password reset sent",
        description: "Check your email for a password reset link.",
      })

      return { error: null }
    } catch (error: any) {
      console.error('Password reset error:', error)
      return { error }
    }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
