import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle, User, Database, Settings } from 'lucide-react'

export function SetupVerification() {
  const { user } = useAuth()
  const { preferences, loading } = useUserPreferences()
  const [checks, setChecks] = useState({
    auth: false,
    database: false,
    preferences: false
  })

  useEffect(() => {
    setChecks({
      auth: !!user,
      database: !loading,
      preferences: !!preferences
    })
  }, [user, loading, preferences])

  const allChecksPass = Object.values(checks).every(Boolean)

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Setup Verification
          </CardTitle>
          <Badge variant={allChecksPass ? "default" : "destructive"}>
            {allChecksPass ? "Ready" : "Incomplete"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
            {checks.auth ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <div className="flex-1">
              <div className="font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                Authentication
              </div>
              <div className="text-sm text-muted-foreground">
                {checks.auth ? `Signed in as ${user?.email}` : 'Not authenticated'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
            {checks.database ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <div className="flex-1">
              <div className="font-medium flex items-center gap-2">
                <Database className="w-4 h-4" />
                Database Connection
              </div>
              <div className="text-sm text-muted-foreground">
                {checks.database ? 'Connected to Supabase' : 'Connection issues'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/20">
            {checks.preferences ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <div className="flex-1">
              <div className="font-medium flex items-center gap-2">
                <Settings className="w-4 h-4" />
                User Preferences
              </div>
              <div className="text-sm text-muted-foreground">
                {checks.preferences 
                  ? `Onboarding step: ${preferences?.onboarding_step || 1}/4${preferences?.onboarding_completed ? ' (Complete)' : ''}`
                  : 'Preferences not loaded'
                }
              </div>
            </div>
          </div>
        </div>

        {preferences && (
          <div className="pt-4 border-t space-y-2">
            <h4 className="font-medium text-sm">Current Settings:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Persona:</span>
                <span className="ml-1">{preferences.persona || 'Not set'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Step:</span>
                <span className="ml-1">{preferences.onboarding_step}/4</span>
              </div>
              <div>
                <span className="text-muted-foreground">Approved:</span>
                <span className="ml-1">{preferences.approved_comments?.length || 0}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Completed:</span>
                <span className="ml-1">{preferences.onboarding_completed ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
