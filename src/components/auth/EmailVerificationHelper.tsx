import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Copy, Mail, AlertTriangle, CheckCircle, RefreshCw, Settings } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

interface EmailVerificationHelperProps {
  email?: string
  onVerificationSuccess?: () => void
}

export function EmailVerificationHelper({ email, onVerificationSuccess }: EmailVerificationHelperProps) {
  const [resendLoading, setResendLoading] = useState(false)
  const [testEmail, setTestEmail] = useState(email || '')
  const { toast } = useToast()

  const resendVerification = async () => {
    if (!testEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      })
      return
    }

    setResendLoading(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: testEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?confirmed=true`
        }
      })

      if (error) {
        toast({
          title: "Resend failed",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Email sent! ✅",
          description: "Check your inbox and spam folder for the verification link.",
        })
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to resend verification email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setResendLoading(false)
    }
  }

  const skipVerification = async () => {
    // For development/demo purposes - sign in directly
    if (!testEmail) {
      toast({
        title: "Email required", 
        description: "Please enter your email address.",
        variant: "destructive",
      })
      return
    }

    // Try to sign in with a common test password
    const testPassword = "demo123456"
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      })

      if (error) {
        toast({
          title: "Demo Access",
          description: "For demo purposes, try signing up with any email and password 'demo123456'",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Demo access granted! 🎉",
          description: "You're now signed in for demonstration purposes.",
        })
        onVerificationSuccess?.()
      }
    } catch (err) {
      toast({
        title: "Demo signup needed",
        description: "Please sign up first with password 'demo123456' for instant access.",
      })
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mail className="w-5 h-5" />
          Email Verification Helper
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Not receiving emails?</strong> This is a common issue. Here are quick solutions:
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div>
            <Label htmlFor="test-email">Your Email</Label>
            <Input
              id="test-email"
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Enter your email address"
              className="mt-1"
            />
          </div>

          <div className="grid gap-2">
            <Button
              onClick={resendVerification}
              disabled={resendLoading || !testEmail}
              variant="outline"
              className="w-full"
            >
              {resendLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Resending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Resend Verification Email
                </>
              )}
            </Button>

            <Button
              onClick={skipVerification}
              disabled={!testEmail}
              className="w-full"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Quick Demo Access
            </Button>
          </div>
        </div>

        <Alert>
          <Settings className="h-4 w-4" />
          <AlertDescription>
            <strong>For instant access:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
              <li>Use any email address</li>
              <li>Set password as: <Badge variant="outline" className="mx-1">demo123456</Badge></li>
              <li>Click "Quick Demo Access" above</li>
            </ol>
          </AlertDescription>
        </Alert>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Common email issues:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Check spam/junk folder</li>
            <li>Add noreply@supabase.io to contacts</li>
            <li>Corporate emails may block external senders</li>
            <li>Try a personal Gmail/Yahoo account</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
