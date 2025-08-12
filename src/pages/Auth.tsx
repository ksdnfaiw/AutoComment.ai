import { useState, useEffect } from 'react'
import { Login } from '@/components/auth/Login'
import { Signup } from '@/components/auth/Signup'
import { EmailVerificationHelper } from '@/components/auth/EmailVerificationHelper'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MessageSquare, CheckCircle } from 'lucide-react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function Auth() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [searchParams] = useSearchParams()
  const [showConfirmed, setShowConfirmed] = useState(false)
  const [showEmailHelper, setShowEmailHelper] = useState(false)
  const [lastSignupEmail, setLastSignupEmail] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
    setShowEmailHelper(false)
  }

  const handleSignupSuccess = (email: string) => {
    setLastSignupEmail(email)
    setShowEmailHelper(true)
  }

  // Handle email confirmation
  useEffect(() => {
    const confirmed = searchParams.get('confirmed')
    if (confirmed === 'true') {
      setShowConfirmed(true)
      setMode('login')
      // Remove the parameter from URL
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('confirmed')
      window.history.replaceState({}, '', newUrl.toString())
    }
  }, [searchParams])

  // Redirect authenticated users
  useEffect(() => {
    if (user) {
      navigate('/onboarding')
    }
  }, [user, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <MessageSquare className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              AutoComment<span className="text-primary">.AI</span>
            </h1>
          </div>
          <p className="text-muted-foreground">
            AI-powered LinkedIn comment generation
          </p>
        </div>

        {/* Email Confirmation Success */}
        {showConfirmed && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Email confirmed!</strong> Your account is now active. Please sign in to continue.
            </AlertDescription>
          </Alert>
        )}

        {/* Auth Form */}
        {mode === 'login' ? (
          <Login onToggleMode={toggleMode} />
        ) : (
          <Signup onToggleMode={toggleMode} onSignupSuccess={handleSignupSuccess} />
        )}

        {/* Email Verification Helper */}
        {showEmailHelper && (
          <EmailVerificationHelper
            email={lastSignupEmail}
            onVerificationSuccess={() => {
              setShowEmailHelper(false)
              navigate('/onboarding')
            }}
          />
        )}

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>
            By continuing, you agree to our{' '}
            <a href="/terms" className="hover:text-primary">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="hover:text-primary">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Auth
