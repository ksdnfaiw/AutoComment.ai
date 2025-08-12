import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PersonaSelect } from '@/components/PersonaSelect';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  User, 
  MessageSquare, 
  Target,
  Chrome,
  Download
} from 'lucide-react';

interface Comment {
  id: string;
  text: string;
  approved?: boolean;
  rejected?: boolean;
}

interface OnboardingData {
  email: string;
  persona: string;
  sampleComment: string;
  reviewedComments: Comment[];
}

export const OnboardingWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    email: '',
    persona: '',
    sampleComment: '',
    reviewedComments: []
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    preferences,
    loading: preferencesLoading,
    saving,
    savePreferences,
    updateOnboardingStep,
    completeOnboarding,
    addApprovedComment,
    addRejectedComment
  } = useUserPreferences();

  const mockComments: Comment[] = [
    { id: '1', text: 'Great insights! AI is definitely transforming how we approach SaaS development.' },
    { id: '2', text: 'Love this perspective! AI automation has been a game-changer for our team.' },
    { id: '3', text: 'Absolutely agree! The efficiency gains from AI tools are incredible.' }
  ];

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!user && !preferencesLoading) {
      navigate('/auth');
    }
  }, [user, preferencesLoading, navigate]);

  // Load existing preferences
  useEffect(() => {
    if (preferences && !preferencesLoading) {
      setData({
        email: preferences.email || user?.email || '',
        persona: preferences.persona || '',
        sampleComment: preferences.sample_comment || '',
        reviewedComments: mockComments.map(comment => ({
          ...comment,
          approved: preferences.approved_comments.includes(comment.text),
          rejected: preferences.rejected_comments.includes(comment.text)
        }))
      });
      setCurrentStep(preferences.onboarding_step || 1);
    }
  }, [preferences, preferencesLoading, user]);

  const handleStepSubmit = async () => {
    if (currentStep === 1) {
      if (!data.email || !data.persona) {
        toast({
          title: "Missing information",
          description: "Please fill in your email and select a persona.",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);

      // Save step 1 data to Supabase
      const result = await savePreferences({
        email: data.email,
        persona: data.persona,
        sample_comment: data.sampleComment,
        onboarding_step: 2
      });

      if (result?.success) {
        // Mock API call to generate personalized comments
        setTimeout(() => {
          setData(prev => ({ ...prev, reviewedComments: mockComments }));
          setCurrentStep(2);
          setLoading(false);
        }, 1500);
      } else {
        setLoading(false);
      }
    } else if (currentStep === 2) {
      const approvedCount = data.reviewedComments.filter(c => c.approved).length;
      if (approvedCount === 0) {
        toast({
          title: "Review required",
          description: "Please approve at least one comment to continue.",
          variant: "destructive",
        });
        return;
      }

      // Save approved/rejected comments
      const approvedComments = data.reviewedComments.filter(c => c.approved).map(c => c.text);
      const rejectedComments = data.reviewedComments.filter(c => c.rejected).map(c => c.text);

      await savePreferences({
        approved_comments: approvedComments,
        rejected_comments: rejectedComments,
        onboarding_step: 3
      });

      setCurrentStep(3);
    } else if (currentStep === 3) {
      await updateOnboardingStep(4);
      setCurrentStep(4);
    } else if (currentStep === 4) {
      await completeOnboarding();
      navigate('/dashboard');
    }
  };

  const handleCommentAction = async (commentId: string, action: 'approve' | 'reject') => {
    const comment = data.reviewedComments.find(c => c.id === commentId);
    if (!comment) return;

    setData(prev => ({
      ...prev,
      reviewedComments: prev.reviewedComments.map(c =>
        c.id === commentId
          ? { ...c, approved: action === 'approve', rejected: action === 'reject' }
          : c
      )
    }));

    // Save to preferences immediately
    if (action === 'approve') {
      await addApprovedComment(comment.text);
    } else {
      await addRejectedComment(comment.text);
    }
  };

  const completedSteps = currentStep - 1;
  const progress = (completedSteps / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/30 to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Step {currentStep} of 4
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <MessageSquare className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">
                AutoComment<span className="text-primary">.AI</span>
              </h1>
            </div>
            
            {currentStep === 1 && (
              <>
                <CardTitle className="text-xl">Welcome! Let's get you started</CardTitle>
                <CardDescription>
                  Set up your AI comment assistant in just a few steps
                </CardDescription>
              </>
            )}
            
            {currentStep === 2 && (
              <>
                <CardTitle className="text-xl">Review Your Sample Comments</CardTitle>
                <CardDescription>
                  We've generated some comments based on your persona. Approve the ones you like!
                </CardDescription>
              </>
            )}
            
            {currentStep === 3 && (
              <>
                <CardTitle className="text-xl">Install Chrome Extension</CardTitle>
                <CardDescription>
                  Add our extension to start generating comments on LinkedIn
                </CardDescription>
              </>
            )}
            
            {currentStep === 4 && (
              <>
                <CardTitle className="text-xl">🎉 You're all set!</CardTitle>
                <CardDescription>
                  Your AI comment assistant is ready to help you network better
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                    placeholder="your@email.com"
                    className="h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="persona" className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Your Professional Persona
                  </Label>
                  <PersonaSelect
                    value={data.persona}
                    onValueChange={(value) => setData({ ...data, persona: value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sample" className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Sample Comment (Optional)
                  </Label>
                  <Textarea
                    id="sample"
                    value={data.sampleComment}
                    onChange={(e) => setData({ ...data, sampleComment: e.target.value })}
                    placeholder="Write a comment that represents your style..."
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-sm text-muted-foreground">
                    This helps our AI learn your unique commenting style.
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Comment Review */}
            {currentStep === 2 && (
              <div className="space-y-4">
                {data.reviewedComments.map((comment) => (
                  <div key={comment.id} className="p-4 bg-muted rounded-lg border">
                    <p className="text-foreground mb-4 leading-relaxed">
                      "{comment.text}"
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleCommentAction(comment.id, 'approve')}
                        size="sm"
                        variant={comment.approved ? "default" : "outline"}
                        className="flex-1"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {comment.approved ? 'Approved' : 'Approve'}
                      </Button>
                      <Button
                        onClick={() => handleCommentAction(comment.id, 'reject')}
                        size="sm"
                        variant={comment.rejected ? "destructive" : "outline"}
                        className="flex-1"
                      >
                        {comment.rejected ? 'Rejected' : 'Reject'}
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="mt-6 p-4 bg-accent rounded-lg">
                  <p className="text-sm text-accent-foreground">
                    💡 <strong>Tip:</strong> Approved comments help train your AI to match your style better.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Extension Install */}
            {currentStep === 3 && (
              <div className="space-y-6 text-center">
                <div className="p-8 bg-gradient-to-br from-primary/10 to-accent/20 rounded-lg">
                  <Chrome className="w-16 h-16 mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">Chrome Extension</h3>
                  <p className="text-muted-foreground mb-4">
                    Install our extension to see "Suggest Comments" buttons on LinkedIn posts.
                  </p>
                  <Button className="mb-4" size="lg">
                    <Download className="w-4 h-4 mr-2" />
                    Add to Chrome
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Free • No permissions required • Works instantly
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Install extension</p>
                  </div>
                  <div className="p-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Visit LinkedIn</p>
                  </div>
                  <div className="p-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Click "Suggest Comments"</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Complete */}
            {currentStep === 4 && (
              <div className="space-y-6 text-center">
                <div className="p-8">
                  <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-success" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Welcome to AutoComment.AI!</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-accent rounded-lg">
                      <Badge variant="secondary" className="mb-2">Free Plan</Badge>
                      <p className="text-2xl font-bold text-foreground">50</p>
                      <p className="text-sm text-muted-foreground">Comments per month</p>
                    </div>
                    <div className="p-4 bg-accent rounded-lg">
                      <Badge variant="outline" className="mb-2">Persona</Badge>
                      <p className="text-lg font-semibold text-foreground">{data.persona}</p>
                      <p className="text-sm text-muted-foreground">Active profile</p>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <Button onClick={handleStepSubmit} disabled={saving}>
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                          Completing...
                        </>
                      ) : (
                        <>
                          Go to Dashboard
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                    <Button variant="outline" asChild>
                      <a href="/demo">Try Demo</a>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {currentStep < 4 && (
                <Button
                  onClick={handleStepSubmit}
                  disabled={loading || saving}
                  className="bg-primary hover:bg-primary-hover"
                >
                  {loading || saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      {saving ? 'Saving...' : 'Processing...'}
                    </>
                  ) : currentStep === 3 ? (
                    <>
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
