import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Database, Plus, AlertCircle, CheckCircle } from 'lucide-react'

export function DataTest() {
  const [testData, setTestData] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const testInsert = async () => {
    setLoading(true)
    setResult(null)

    try {
      // Try to insert into a test table or common table names
      const testTables = ['users', 'comments', 'posts', 'test_table']
      
      for (const tableName of testTables) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .insert([{ 
              test_field: testData || 'Test data from app',
              created_at: new Date().toISOString()
            }])
            .select()

          if (!error) {
            setResult({
              success: true,
              message: `✅ Successfully inserted data into '${tableName}' table!`
            })
            return
          } else {
            console.log(`Failed to insert into ${tableName}:`, error)
          }
        } catch (e) {
          console.log(`Table ${tableName} might not exist`)
        }
      }

      // If we get here, none of the tables worked
      setResult({
        success: false,
        message: '❌ Could not insert data. Check RLS policies or table structure.'
      })

    } catch (error: any) {
      setResult({
        success: false,
        message: `❌ Error: ${error.message}`
      })
    } finally {
      setLoading(false)
    }
  }

  const testSelect = async () => {
    setLoading(true)
    setResult(null)

    try {
      const testTables = ['users', 'comments', 'posts', 'personas']
      
      for (const tableName of testTables) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(5)

          if (!error && data) {
            setResult({
              success: true,
              message: `✅ Found ${data.length} records in '${tableName}' table`
            })
            return
          }
        } catch (e) {
          console.log(`Table ${tableName} might not exist`)
        }
      }

      setResult({
        success: false,
        message: '❌ Could not read from any tables. Check table names and RLS policies.'
      })

    } catch (error: any) {
      setResult({
        success: false,
        message: `❌ Error: ${error.message}`
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Database Operations Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Test Data:</label>
          <Input
            value={testData}
            onChange={(e) => setTestData(e.target.value)}
            placeholder="Enter test data to insert"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={testSelect} disabled={loading}>
            Test Read Data
          </Button>
          <Button onClick={testInsert} disabled={loading}>
            <Plus className="w-4 h-4 mr-1" />
            Test Insert Data
          </Button>
        </div>

        {loading && (
          <div className="text-muted-foreground">Testing database operations...</div>
        )}

        {result && (
          <Alert className={result.success ? "border-green-500" : "border-red-500"}>
            {result.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded">
          <strong>Common Issues:</strong>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>RLS (Row Level Security) policies preventing inserts</li>
            <li>Table names don't match your actual tables</li>
            <li>Authentication required for data operations</li>
            <li>Incorrect column names or data types</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
