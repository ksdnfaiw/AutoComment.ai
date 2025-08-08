import { useState } from 'react'
import { Login } from '@/components/auth/Login'
import { Signup } from '@/components/auth/Signup'
import { MessageSquare } from 'lucide-react'

export function Auth() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
  }

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

        {/* Auth Form */}
        {mode === 'login' ? (
          <Login onToggleMode={toggleMode} />
        ) : (
          <Signup onToggleMode={toggleMode} />
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
