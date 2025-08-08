import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export interface CommentHistory {
  id: string
  post_content: string
  generated_comment: string
  feedback: 'approved' | 'rejected' | 'pending' | 'posted'
  created_at: string
  user_id: string
  persona_used?: string
  ai_confidence_score?: number
  user_rating?: number
}

export function useCommentHistory() {
  const [commentHistory, setCommentHistory] = useState<CommentHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchCommentHistory = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!user) {
        setCommentHistory([])
        setError('Please sign in to view your comment history')
        setLoading(false)
        return
      }

      // Fetch user's comments with the new schema
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          post_content,
          generated_comment,
          feedback,
          created_at,
          user_id,
          persona_used,
          ai_confidence_score,
          user_rating
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Error fetching comments:', error)
        setError(`Failed to load comments: ${error.message}`)
        setCommentHistory([])
      } else {
        setCommentHistory(data || [])
        console.log(`✅ Loaded ${data?.length || 0} comments for user`)
      }

    } catch (err: any) {
      setError(`Database error: ${err.message}`)
      console.error('Error fetching comment history:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCommentHistory()
  }, [])

  const addComment = async (postContent: string, generatedComment: string, persona?: string) => {
    try {
      if (!user) {
        return { success: false, error: 'Please sign in to add comments' }
      }

      console.log('Adding comment for user:', user.id)

      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            user_id: user.id,
            post_content: postContent,
            generated_comment: generatedComment,
            feedback: 'pending',
            persona_used: persona || 'professional',
            ai_confidence_score: 0.85,
            created_at: new Date().toISOString()
          }
        ])
        .select()

      if (error) {
        console.error('Error inserting comment:', error)
        const errorMessage = error.message || error.details || JSON.stringify(error, null, 2)
        return { success: false, error: errorMessage }
      }

      console.log('✅ Successfully added comment')
      // Refresh the data
      await fetchCommentHistory()
      return { success: true, data }

    } catch (err: any) {
      console.error('Error adding comment:', err)
      const errorMessage = err?.message || err?.error_description || err?.details || JSON.stringify(err, null, 2)
      return { success: false, error: errorMessage }
    }
  }

  return {
    commentHistory,
    loading,
    error,
    refetch: fetchCommentHistory,
    addComment
  }
}

export function useUserStats() {
  const [stats, setStats] = useState({
    totalComments: 0,
    approvalRate: 0,
    daysActive: 0
  })
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!user) {
          setStats({ totalComments: 0, approvalRate: 0, daysActive: 0 })
          setLoading(false)
          return
        }

        // Get user's comment stats
        const { data: comments } = await supabase
          .from('comments')
          .select('feedback, created_at')
          .eq('user_id', user.id)

        if (comments && comments.length > 0) {
          const totalComments = comments.length
          const approvedComments = comments.filter(c => c.feedback === 'approved' || c.feedback === 'posted').length
          const approvalRate = totalComments > 0 ? Math.round((approvedComments / totalComments) * 100) : 0

          // Calculate days active
          const firstComment = comments.sort((a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )[0]

          const daysActive = firstComment
            ? Math.ceil((Date.now() - new Date(firstComment.created_at).getTime()) / (1000 * 60 * 60 * 24)) || 1
            : 0

          setStats({ totalComments, approvalRate, daysActive })
        } else {
          // New user with no comments yet
          setStats({ totalComments: 0, approvalRate: 0, daysActive: 0 })
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
        setStats({ totalComments: 0, approvalRate: 0, daysActive: 0 })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user])

  return { stats, loading }
}
