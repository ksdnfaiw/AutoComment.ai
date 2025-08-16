import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { SubscriptionCard } from '@/components/SubscriptionCard';
import { PricingModal } from '@/components/PricingModal';
import { AnalyticsCard } from '@/components/AnalyticsCard';
import { PersonaSelect } from '@/components/PersonaSelect';
import { useToast } from '@/hooks/use-toast';
import { useCommentHistory, useUserStats } from '@/hooks/useSupabaseData';
import { useSubscription } from '@/hooks/useSubscription';
import { RefreshCw, Settings, TrendingUp, MessageSquare, Calendar, Plus, Database, Crown, Lock, Zap } from 'lucide-react';

export const Dashboard = () => {
  const [persona, setPersona] = useState('saas-founder');
  const [loading, setLoading] = useState(false);
  const [testPost, setTestPost] = useState('AI is transforming how we build SaaS products...');
  const [testComment, setTestComment] = useState('Absolutely! AI automation saves us hours daily in our development process.');
  const [pricingModalOpen, setPricingModalOpen] = useState(false);

  const { toast } = useToast();
  const { commentHistory, loading: commentsLoading, error: commentsError, refetch, addComment } = useCommentHistory();
  const { stats, loading: statsLoading } = useUserStats();
  const {
    currentPlan,
    hasFeatureAccess,
    hasRemainingTokens,
    getRemainingTokens,
    getUsagePercentage,
    subscriptionLoading
  } = useSubscription();

  const refreshTokens = async () => {
    if (!hasFeatureAccess('manual_refresh')) {
      toast({
        title: "Feature not available",
        description: "Manual token refresh is only available in Pro and Enterprise plans.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Mock API call to n8n webhook
    setTimeout(() => {
      toast({
        title: "Tokens refreshed!",
        description: "Your monthly token balance has been reset.",
      });
      setLoading(false);
    }, 1500);
  };

  const updatePersona = async () => {
    if (!hasFeatureAccess('advanced_personas') && persona !== 'professional') {
      toast({
        title: "Premium feature",
        description: "Advanced personas are only available in Pro and Enterprise plans.",
        variant: "destructive",
      });
      setPricingModalOpen(true);
      return;
    }

    toast({
      title: "Persona updated!",
      description: "Your comment style will be adjusted to match your new persona.",
    });

    // Mock API call to n8n webhook
    console.log('Updated persona:', persona);
  };

  const addTestComment = async () => {
    if (!hasRemainingTokens()) {
      toast({
        title: "No tokens remaining",
        description: "You've used all your tokens for this month. Upgrade your plan for more tokens.",
        variant: "destructive",
      });
      setPricingModalOpen(true);
      return;
    }

    setLoading(true);
    const result = await addComment(testPost, testComment);

    if (result.success) {
      toast({
        title: "Comment added!",
        description: "Test comment has been added to your database.",
      });
    } else {
      toast({
        title: "Error adding comment",
        description: result.error || "Failed to add comment to database.",
        variant: "destructive",
      });
    }
    setLoading(false);
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
            
            <div className="flex items-center gap-2">
              <Button
                onClick={refreshTokens}
                disabled={loading || !hasFeatureAccess('manual_refresh')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh Tokens
                {!hasFeatureAccess('manual_refresh') && (
                  <Lock className="w-3 h-3 ml-1 text-muted-foreground" />
                )}
              </Button>

              {currentPlan?.id === 'free' && (
                <Button
                  onClick={() => setPricingModalOpen(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Crown className="w-4 h-4" />
                  Upgrade
                </Button>
              )}
            </div>
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
                      <p className="text-2xl font-bold text-card-foreground">
                        {statsLoading ? '...' : stats.totalComments}
                      </p>
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
                      <p className="text-2xl font-bold text-card-foreground">
                        {statsLoading ? '...' : `${stats.approvalRate}%`}
                      </p>
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
                      <p className="text-2xl font-bold text-card-foreground">
                        {statsLoading ? '...' : stats.daysActive}
                      </p>
                      <p className="text-sm text-muted-foreground">Days Active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Comment History */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      Comment History
                      {commentsLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                    </CardTitle>
                    <CardDescription>
                      Your recent AI-generated comments from Supabase database
                    </CardDescription>
                  </div>
                  <Button
                    onClick={refetch}
                    variant="outline"
                    size="sm"
                    disabled={commentsLoading}
                  >
                    <RefreshCw className={`w-4 h-4 ${commentsLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {commentsError ? (
                  <div className="text-center py-8">
                    <div className="text-red-600 mb-2">❌ {commentsError}</div>
                    <Button onClick={addTestComment} disabled={loading} className="mr-2">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Test Comment
                    </Button>
                    <Button onClick={refetch} variant="outline">
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Retry
                    </Button>
                  </div>
                ) : (
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
                      {commentHistory.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <div className="text-muted-foreground">
                              No comments found in database.
                              <div className="mt-2">
                                <Button onClick={addTestComment} disabled={loading}>
                                  <Plus className="w-4 h-4 mr-1" />
                                  Add Test Comment
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        commentHistory.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="max-w-xs">
                              <p className="truncate text-sm">{item.post_content}</p>
                            </TableCell>
                            <TableCell className="max-w-sm">
                              <p className="truncate text-sm">{item.generated_comment}</p>
                            </TableCell>
                            <TableCell>{getFeedbackBadge(item.feedback)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(item.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription Card */}
            <SubscriptionCard />

            {/* Persona Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Persona Settings
                  {!hasFeatureAccess('advanced_personas') && (
                    <Badge variant="outline" className="text-xs">
                      <Lock className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
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
                  <PersonaSelect
                    value={persona}
                    onValueChange={setPersona}
                    disabled={!hasFeatureAccess('advanced_personas')}
                  />
                  {!hasFeatureAccess('advanced_personas') && (
                    <p className="text-xs text-muted-foreground">
                      Advanced personas available in Pro plans
                    </p>
                  )}
                </div>

                <Button
                  onClick={updatePersona}
                  className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
                  disabled={!hasFeatureAccess('advanced_personas') && persona !== 'professional'}
                >
                  Update Persona
                  {!hasFeatureAccess('advanced_personas') && (
                    <Lock className="w-3 h-3 ml-2" />
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Plan Features & Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {currentPlan?.id === 'free' ? (
                    <>
                      <Zap className="w-5 h-5 text-yellow-500" />
                      Upgrade Benefits
                    </>
                  ) : (
                    <>
                      💡 Pro Tips
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {currentPlan?.id === 'free' ? (
                  <>
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                      <p className="font-medium text-blue-900 mb-1 flex items-center gap-2">
                        <Crown className="w-4 h-4" />
                        10x More Tokens
                      </p>
                      <p className="text-blue-700 text-xs">
                        Get 500 comments per month instead of 50
                      </p>
                    </div>

                    <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                      <p className="font-medium text-green-900 mb-1 flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        Advanced Personas
                      </p>
                      <p className="text-green-700 text-xs">
                        Access to professional, creative, and custom personas
                      </p>
                    </div>

                    <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                      <p className="font-medium text-purple-900 mb-1 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Priority Support
                      </p>
                      <p className="text-purple-700 text-xs">
                        Get faster responses and dedicated support
                      </p>
                    </div>

                    <Button
                      onClick={() => setPricingModalOpen(true)}
                      className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade Now - Starting $19/mo
                    </Button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Pricing Modal */}
      <PricingModal
        open={pricingModalOpen}
        onOpenChange={setPricingModalOpen}
      />
    </div>
  );
};

export default Dashboard;
