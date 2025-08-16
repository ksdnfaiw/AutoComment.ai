import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy, ExternalLink, Settings, CheckCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function SupabaseConfig() {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const currentOrigin = window.location.origin
  const siteURL = currentOrigin
  const redirectURLs = [
    `${currentOrigin}/auth`,
    `${currentOrigin}/auth?confirmed=true`,
    `${currentOrigin}/reset-password`
  ]

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast({
        title: "Copied to clipboard",
        description: "Configuration value copied successfully.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please manually copy the text.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Supabase Authentication Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <ExternalLink className="h-4 w-4" />
          <AlertDescription>
            <strong>Fix Email Confirmation Issues:</strong> Configure these URLs in your Supabase dashboard 
            to fix localhost redirect problems.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Site URL</Label>
            <div className="flex gap-2 mt-1">
              <Input 
                value={siteURL} 
                readOnly 
                className="font-mono text-sm" 
              />
              <Button
                onClick={() => copyToClipboard(siteURL)}
                size="sm"
                variant="outline"
              >
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Set this as your Site URL in Authentication → Settings
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium">Redirect URLs</Label>
            <div className="space-y-2 mt-1">
              {redirectURLs.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <Input 
                    value={url} 
                    readOnly 
                    className="font-mono text-sm" 
                  />
                  <Button
                    onClick={() => copyToClipboard(url)}
                    size="sm"
                    variant="outline"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Add these to Redirect URLs in Authentication → Settings
            </p>
          </div>
        </div>

        <Alert>
          <AlertDescription>
            <strong>How to configure:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
              <li>Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Supabase Dashboard</a></li>
              <li>Select your project → Authentication → Settings</li>
              <li>Set the Site URL to: <code className="bg-muted px-1 rounded">{siteURL}</code></li>
              <li>Add all the redirect URLs above to the "Redirect URLs" section</li>
              <li>Click "Save" to apply changes</li>
            </ol>
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button asChild variant="outline" className="flex-1">
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
        </div>
      </CardContent>
    </Card>
  )
}
