import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Copy, ExternalLink, Settings, AlertTriangle, CheckCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function EmailVerificationFix() {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Configuration copied to clipboard.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy manually.",
        variant: "destructive",
      })
    }
  }

  const sqlCommand = `-- Run this in Supabase SQL Editor to disable email verification
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;

-- Or disable email confirmation completely in dashboard:
-- Authentication > Settings > Email Confirmation > Disable`

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Fix Email Verification Issues
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Quick Fix:</strong> Disable email verification for instant access during development/demo.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Option 1: Dashboard Configuration</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Supabase Dashboard</a></li>
              <li>Select your project → Authentication → Settings</li>
              <li>Scroll to "Email Confirmation"</li>
              <li>Toggle <Badge variant="outline">Enable email confirmations</Badge> to OFF</li>
              <li>Click "Save" - users can now sign up instantly!</li>
            </ol>
          </div>

          <div>
            <h3 className="font-medium mb-2">Option 2: SQL Fix (Instant)</h3>
            <div className="relative">
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                {sqlCommand}
              </pre>
              <Button
                onClick={() => copyToClipboard(sqlCommand)}
                size="sm"
                variant="outline"
                className="absolute top-2 right-2"
              >
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Option 3: Demo Access (Right Now!)</h3>
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Immediate Access:</strong> Use the "Quick Demo Access" button on the auth page with any email and password <Badge variant="outline">demo123456</Badge>
              </AlertDescription>
            </Alert>
          </div>
        </div>

        <div className="flex gap-2">
          <Button asChild className="flex-1">
            <a 
              href="https://supabase.com/dashboard" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open Supabase Dashboard
            </a>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="flex-1"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Done? Refresh Page
          </Button>
        </div>

        <Alert>
          <AlertDescription>
            <strong>Why this happens:</strong> Supabase enables email verification by default. For demos and development, 
            it's common to disable this feature for a smoother user experience.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
