import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

export interface UserPreferences {
  id?: string
  user_id: string
  persona: string
  email: string
  sample_comment: string
  onboarding_completed: boolean
  onboarding_step: number
  approved_comments: string[]
  rejected_comments: string[]
  extension_installed: boolean
  created_at?: string
  updated_at?: string
}

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  // Fetch user preferences
  useEffect(() => {
    if (!user) {
      setPreferences(null)
      setLoading(false)
      return
    }

    const fetchPreferences = async () => {
      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          throw error
        }

        if (data) {
          setPreferences(data)
        } else {
          // Create default preferences if none exist
          const defaultPrefs: Partial<UserPreferences> = {
            user_id: user.id,
            persona: '',
            email: user.email || '',
            sample_comment: '',
            onboarding_completed: false,
            onboarding_step: 1,
            approved_comments: [],
            rejected_comments: [],
            extension_installed: false
          }
          
          const { data: newPrefs, error: createError } = await supabase
            .from('user_preferences')
            .insert([defaultPrefs])
            .select()
            .single()

          if (createError) {
            console.error('Error creating preferences:', createError)
          } else {
            setPreferences(newPrefs)
          }
        }
      } catch (error: any) {
        console.error('Error fetching preferences:', error)
        toast({
          title: "Error loading preferences",
          description: error.message,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPreferences()
  }, [user, toast])

  // Save preferences
  const savePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user || !preferences) return

    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      setPreferences(data)
      return { success: true, data }
    } catch (error: any) {
      console.error('Error saving preferences:', error)
      toast({
        title: "Error saving preferences",
        description: error.message,
        variant: "destructive",
      })
      return { success: false, error }
    } finally {
      setSaving(false)
    }
  }

  // Update onboarding step
  const updateOnboardingStep = async (step: number) => {
    return savePreferences({ onboarding_step: step })
  }

  // Complete onboarding
  const completeOnboarding = async () => {
    return savePreferences({ 
      onboarding_completed: true, 
      onboarding_step: 4 
    })
  }

  // Add approved comment
  const addApprovedComment = async (comment: string) => {
    if (!preferences) return
    
    const updatedComments = [...preferences.approved_comments, comment]
    return savePreferences({ approved_comments: updatedComments })
  }

  // Add rejected comment
  const addRejectedComment = async (comment: string) => {
    if (!preferences) return
    
    const updatedComments = [...preferences.rejected_comments, comment]
    return savePreferences({ rejected_comments: updatedComments })
  }

  return {
    preferences,
    loading,
    saving,
    savePreferences,
    updateOnboardingStep,
    completeOnboarding,
    addApprovedComment,
    addRejectedComment
  }
}
