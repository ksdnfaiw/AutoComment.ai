import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Database, Table, Users, MessageSquare, Settings } from 'lucide-react'

interface TableInfo {
  table_name: string
  table_schema: string
}

export function DatabaseExplorer() {
  const [tables, setTables] = useState<TableInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTables = async () => {
      try {
        // Query the information_schema to get table information
        const { data, error } = await supabase
          .rpc('get_table_info')
          .select('*')

        if (error) {
          // Fallback: try to get basic table info
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('information_schema.tables')
            .select('table_name, table_schema')
            .eq('table_schema', 'public')

          if (fallbackError) {
            // Another fallback: try to query specific known tables
            const knownTables = ['users', 'comments', 'posts', 'personas', 'settings']
            const tableResults = []
            
            for (const tableName of knownTables) {
              try {
                const { data, error } = await supabase
                  .from(tableName)
                  .select('*')
                  .limit(1)
                
                if (!error) {
                  tableResults.push({ table_name: tableName, table_schema: 'public' })
                }
              } catch (e) {
                // Table doesn't exist, skip
              }
            }
            
            setTables(tableResults)
          } else {
            setTables(fallbackData || [])
          }
        } else {
          setTables(data || [])
        }
      } catch (err) {
        setError('Failed to fetch database schema')
        console.error('Database query error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTables()
  }, [])

  const getTableIcon = (tableName: string) => {
    if (tableName.includes('user')) return <Users className="w-4 h-4" />
    if (tableName.includes('comment')) return <MessageSquare className="w-4 h-4" />
    if (tableName.includes('setting')) return <Settings className="w-4 h-4" />
    return <Table className="w-4 h-4" />
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database Explorer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Loading database schema...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          AutoComment.ai Database
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-red-600">
            {error}
            <div className="text-sm text-muted-foreground mt-2">
              Connect to Supabase MCP for advanced database management
            </div>
          </div>
        ) : tables.length > 0 ? (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Found {tables.length} table(s) in your database:
            </div>
            <div className="grid gap-2">
              {tables.map((table) => (
                <div key={table.table_name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {getTableIcon(table.table_name)}
                    <span className="font-medium">{table.table_name}</span>
                  </div>
                  <Badge variant="outline">{table.table_schema}</Badge>
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground pt-2 border-t">
              💡 Use Supabase MCP integration for advanced database operations
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground">
            No tables found. Connect to Supabase MCP to explore your database.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
