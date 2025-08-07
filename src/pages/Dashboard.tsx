import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TokenDisplay } from '@/components/TokenDisplay';
import { PersonaSelect } from '@/components/PersonaSelect';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Settings, TrendingUp, MessageSquare, Calendar } from 'lucide-react';

interface CommentHistory {
  id: string;
  post: string;
  comment: string;
  feedback: 'approved' | 'rejected';
  date: string;
}

export const Dashboard = () => {
  const [tokens, setTokens] = useState({ current: 47, total: 50 });
  const [persona, setPersona] = useState('saas-founder');
  const [commentHistory, setCommentHistory] = useState<CommentHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Mock comment history data
    setCommentHistory([
      {
        id: '1',
        post: 'AI is transforming how we build SaaS products...',
        comment: 'Absolutely! AI automation saves us hours daily in our development process.',
        feedback: 'approved',
        date: '2024-01-07'
      },
      {
        id: '2',
        post: 'The future of marketing is data-driven...',
        comment: 'Great insights! We\'ve seen similar results with our AI-driven campaigns.',
        feedback: 'approved',
        date: '2024-01-06'
      },
      {
        id: '3',
        post: 'Startup funding in 2024...',
        comment: 'This perspective aligns with what we\'re seeing in the SaaS space.',
        feedback: 'rejected',
        date: '2024-01-05'
      }
    ]);
  }, []);

  const refreshTokens = async () => {
    setLoading(true);
    
    // Mock API call to n8n webhook
    setTimeout(() => {
      setTokens({ current: 50, total: 50 });
      toast({
        title: "Tokens refreshed!",
        description: "Your monthly token balance has been reset.",
      });
      setLoading(false);
    }, 1500);
  };

  const updatePersona = async () => {
    toast({
      title: "Persona updated!",
      description: "Your comment style will be adjusted to match your new persona.",
    });
    
    // Mock API call to n8n webhook
    console.log('Updated persona:', persona);
  };

  const getFeedbackBadge = (feedback: string) => {
    return feedback === 'approved' 
      ? <Badge className="bg-success text-success-foreground">Approved</Badge>
      : <Badge variant="secondary">Rejected</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-card-foreground">
                  AutoComment<span className="text-primary">.AI</span>
                </h1>
                <p className="text-muted-foreground">Dashboard</p>
              </div>
            </div>
            
            <Button
              onClick={refreshTokens}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Tokens
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-card-foreground">127</p>
                      <p className="text-sm text-muted-foreground">Comments Generated</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-success/10 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-card-foreground">89%</p>
                      <p className="text-sm text-muted-foreground">Approval Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-warning/10 rounded-lg">
                      <Calendar className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-card-foreground">23</p>
                      <p className="text-sm text-muted-foreground">Days Active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Comment History */}
            <Card>
              <CardHeader>
                <CardTitle>Comment History</CardTitle>
                <CardDescription>
                  Your recent AI-generated comments and their feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Post</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead>Feedback</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commentHistory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="max-w-xs">
                          <p className="truncate text-sm">{item.post}</p>
                        </TableCell>
                        <TableCell className="max-w-sm">
                          <p className="truncate text-sm">{item.comment}</p>
                        </TableCell>
                        <TableCell>{getFeedbackBadge(item.feedback)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(item.date).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Token Display */}
            <TokenDisplay current={tokens.current} total={tokens.total} />

            {/* Persona Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Persona Settings
                </CardTitle>
                <CardDescription>
                  Customize your comment style and tone
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-card-foreground">
                    Current Persona
                  </label>
                  <PersonaSelect value={persona} onValueChange={setPersona} />
                </div>
                
                <Button
                  onClick={updatePersona}
                  className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
                >
                  Update Persona
                </Button>
              </CardContent>
            </Card>

            {/* Usage Tips */}
            <Card>
              <CardHeader>
                <CardTitle>💡 Pro Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="p-3 bg-accent rounded-lg">
                  <p className="font-medium text-accent-foreground mb-1">Be Authentic</p>
                  <p className="text-muted-foreground">
                    Review and edit suggestions to match your personal voice
                  </p>
                </div>
                
                <div className="p-3 bg-accent rounded-lg">
                  <p className="font-medium text-accent-foreground mb-1">Engage Meaningfully</p>
                  <p className="text-muted-foreground">
                    Focus on posts where you can add genuine value
                  </p>
                </div>
                
                <div className="p-3 bg-accent rounded-lg">
                  <p className="font-medium text-accent-foreground mb-1">Track Performance</p>
                  <p className="text-muted-foreground">
                    Use rejection feedback to improve future suggestions
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;