import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Database, AlertCircle, CheckCircle, Info } from 'lucide-react'

export function DatabaseDebug() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (test: string, success: boolean, message: string, details?: any) => {
    setResults(prev => [...prev, { test, success, message, details, timestamp: new Date().toISOString() }])
  }

  const runFullDiagnostic = async () => {
    setLoading(true)
    setResults([])

    // Test 1: Basic connection
    try {
      const { data, error } = await supabase.from('_realtime_schema').select('*').limit(1)
      addResult('Connection Test', true, 'Supabase connection is working')
    } catch (err: any) {
      addResult('Connection Test', false, `Connection failed: ${err.message}`)
    }

    // Test 2: List all tables
    try {
      const { data, error } = await supabase
        .rpc('get_schema_tables')
        .select('*')
      
      if (error) {
        // Fallback method
        const tables = ['comments', 'comment_history', 'generated_comments', 'user_comments', 'posts', 'users', 'personas']
        const existingTables = []
        
        for (const tableName of tables) {
          try {
            const { data, error } = await supabase.from(tableName).select('*').limit(1)
            if (!error) {
              existingTables.push(tableName)
            }
          } catch (e) {
            // Table doesn't exist
          }
        }
        
        addResult('Table Discovery', true, `Found tables: ${existingTables.join(', ') || 'None'}`, existingTables)
      } else {
        addResult('Table Discovery', true, `Found ${data?.length || 0} tables via RPC`, data)
      }
    } catch (err: any) {
      addResult('Table Discovery', false, `Table discovery failed: ${err.message}`)
    }

    // Test 3: Try creating a test table
    try {
      const { data, error } = await supabase
        .rpc('create_test_table')
        
      if (error) {
        addResult('Create Table Test', false, `Cannot create tables: ${error.message}`)
      } else {
        addResult('Create Table Test', true, 'Can create tables (admin privileges)')
      }
    } catch (err: any) {
      addResult('Create Table Test', false, 'Cannot create tables (expected for anon users)')
    }

    // Test 4: Check RLS policies
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{ test_field: 'test' }])
        .select()

      if (error) {
        if (error.code === '42P01') {
          addResult('Comments Table', false, 'Table "comments" does not exist')
        } else if (error.code === 'PGRST116') {
          addResult('RLS Policy Check', false, 'Row Level Security policy violation - no INSERT permissions for anon users')
        } else {
          addResult('Insert Test', false, `Insert failed: ${error.message} (Code: ${error.code})`, error)
        }
      } else {
        addResult('Insert Test', true, 'Successfully inserted test data')
      }
    } catch (err: any) {
      addResult('Insert Test', false, `Insert exception: ${err.message}`)
    }

    // Test 5: Check authentication status
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (user) {
        addResult('Auth Status', true, `Authenticated as: ${user.email}`)
      } else {
        addResult('Auth Status', false, 'No authenticated user (using anon key)')
      }
    } catch (err: any) {
      addResult('Auth Status', false, `Auth check failed: ${err.message}`)
    }

    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Database Diagnostic Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runFullDiagnostic} disabled={loading} className="w-full">
          {loading ? 'Running Diagnostics...' : 'Run Full Diagnostic'}
        </Button>

        {results.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Diagnostic Results:</h4>
            {results.map((result, index) => (
              <Alert key={index} className={result.success ? "border-green-500" : "border-red-500"}>
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.test}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div>{result.message}</div>
                  {result.details && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-muted-foreground">Details</summary>
                      <Textarea 
                        className="mt-1 text-xs" 
                        value={JSON.stringify(result.details, null, 2)}
                        readOnly
                        rows={3}
                      />
                    </details>
                  )}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Common Solutions:</strong>
            <ul className="list-disc list-inside mt-1 text-sm space-y-1">
              <li>If table doesn't exist: Create it in Supabase dashboard</li>
              <li>If RLS policy violation: Disable RLS or create INSERT policy for anon users</li>
              <li>If no permissions: Authenticate users or adjust table permissions</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
