import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
<<<<<<< HEAD
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
=======
import { CheckCircle, ArrowRight, ArrowLeft, MessageSquare } from 'lucide-react';
import { useOnboardingPreferences } from '@/hooks/useOnboardingPreferences';
>>>>>>> origin/main

interface Sample {
  id: string;
  text: string;
  liked?: boolean;
}

interface OnboardingPrefs {
  toneStyle: string;
  industryDomain: string;
  sampleFeedback: Sample[];
}

export const OnboardingWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [prefs, setPrefs] = useState<OnboardingPrefs>({
    toneStyle: '',
    industryDomain: '',
    sampleFeedback: []
  });
  const { toast } = useToast();
<<<<<<< HEAD
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
=======
  const { saveToneStyle, saveIndustryDomain, saveSampleFeedback } = useOnboardingPreferences();
>>>>>>> origin/main

const samples: Sample[] = [
  { id: '1', text: 'Appreciate this perspective—clear, actionable insights that drive results.' },
  { id: '2', text: 'Great breakdown! Curious how you’d apply this in a lean team setting.' },
  { id: '3', text: 'Strong take. I’d add that execution speed often beats perfect strategy.' }
];

<<<<<<< HEAD
  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!user && !preferencesLoading) {
      navigate('/auth');
    }
  }, [user, preferencesLoading, navigate]);

  // Show loading state
  if (preferencesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/30 to-primary/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your preferences...</p>
        </div>
      </div>
    );
  }

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
        toast({
          title: "Preferences saved!",
          description: "Generating personalized comments for you...",
        });

        // Mock API call to generate personalized comments
        setTimeout(() => {
          setData(prev => ({ ...prev, reviewedComments: mockComments }));
          setCurrentStep(2);
          setLoading(false);
        }, 1500);
      } else {
        toast({
          title: "Save failed",
          description: "There was an issue saving your preferences. Please try again.",
          variant: "destructive",
        });
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

      setLoading(true);
      const result = await savePreferences({
        approved_comments: approvedComments,
        rejected_comments: rejectedComments,
        onboarding_step: 3
      });

      if (result?.success) {
        toast({
          title: "Feedback saved!",
          description: "Your comment preferences have been recorded.",
        });
        setCurrentStep(3);
      } else {
        toast({
          title: "Save failed",
          description: "There was an issue saving your feedback. Please try again.",
          variant: "destructive",
        });
      }
      setLoading(false);
    } else if (currentStep === 3) {
      setLoading(true);
      const result = await updateOnboardingStep(4);
      if (result?.success) {
        setCurrentStep(4);
      } else {
        toast({
          title: "Error",
          description: "Failed to update progress. Please try again.",
          variant: "destructive",
        });
      }
      setLoading(false);
    } else if (currentStep === 4) {
      setLoading(true);
      const result = await completeOnboarding();
      if (result?.success) {
        toast({
          title: "Setup complete! 🎉",
          description: "Welcome to AutoComment.AI! Redirecting to your dashboard...",
        });
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        toast({
          title: "Completion failed",
          description: "There was an issue completing setup. You can still access the dashboard.",
          variant: "destructive",
        });
        navigate('/dashboard');
      }
      setLoading(false);
=======
const handleStepSubmit = async () => {
  if (currentStep === 1) {
    if (!prefs.toneStyle) {
      toast({
        title: 'Pick a tone',
        description: 'Please select a tone to continue.',
        variant: 'destructive',
      });
      return;
>>>>>>> origin/main
    }
    setCurrentStep(2);
  } else if (currentStep === 2) {
    if (!prefs.industryDomain) {
      toast({
        title: 'Select an industry',
        description: 'Please choose your industry/domain.',
        variant: 'destructive',
      });
      return;
    }
    setCurrentStep(3);
  } else if (currentStep === 3) {
    setLoading(true);
    await saveSampleFeedback(prefs.sampleFeedback.length ? prefs.sampleFeedback : samples.map(s => ({ ...s, liked: s.liked ?? false })));
    setLoading(false);
    setCurrentStep(4);
  }
};

<<<<<<< HEAD
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
=======
const handleSampleAction = (sampleId: string, liked: boolean) => {
  setPrefs(prev => {
    const existing = prev.sampleFeedback.find(s => s.id === sampleId);
    const updated = existing
      ? prev.sampleFeedback.map(s => (s.id === sampleId ? { ...s, liked } : s))
      : [...prev.sampleFeedback, { ...(samples.find(s => s.id === sampleId) as Sample), liked }];
    return { ...prev, sampleFeedback: updated };
  });
};
>>>>>>> origin/main

const totalSteps = 4;
const progress = (currentStep / totalSteps) * 100;

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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {['Friendly', 'Professional', 'Thought Leader', 'Casual', 'Humorous'].map((tone) => {
          const selected = prefs.toneStyle === tone;
          return (
            <Button
              key={tone}
              type="button"
              variant={selected ? 'default' : 'outline'}
              className="justify-start h-12"
              onClick={async () => {
                setPrefs((p) => ({ ...p, toneStyle: tone }));
                await saveToneStyle(tone);
              }}
            >
              {tone}
            </Button>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground">You can change this later in settings.</p>
    </div>
  </div>
)}

            {/* Step 2: Comment Review */}
{currentStep === 2 && (
  <div className="space-y-4">
    <div>
      <Select
        value={prefs.industryDomain}
        onValueChange={async (val) => {
          setPrefs((p) => ({ ...p, industryDomain: val }));
          await saveIndustryDomain(val);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choose an industry" />
        </SelectTrigger>
        <SelectContent className="z-50">
          {['Tech', 'Marketing', 'Finance', 'HR', 'E-commerce', 'Healthcare', 'Education', 'Consulting'].map((ind) => (
            <SelectItem key={ind} value={ind}>{ind}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div className="p-4 bg-accent rounded-lg">
      <p className="text-sm text-accent-foreground">
        Tip: Selecting your domain boosts relevance of suggestions.
      </p>
    </div>
  </div>
)}

            {/* Step 3: Extension Install */}
{currentStep === 3 && (
  <div className="space-y-4">
    {samples.map((sample) => {
      const state = prefs.sampleFeedback.find((s) => s.id === sample.id)?.liked;
      return (
        <div key={sample.id} className="p-4 bg-muted rounded-lg border">
          <p className="text-foreground mb-4 leading-relaxed">"{sample.text}"</p>
          <div className="flex gap-2">
            <Button
              onClick={() => handleSampleAction(sample.id, true)}
              size="sm"
              variant={state === true ? 'default' : 'outline'}
              className="flex-1"
            >
              👍 Like
            </Button>
            <Button
              onClick={() => handleSampleAction(sample.id, false)}
              size="sm"
              variant={state === false ? 'destructive' : 'outline'}
              className="flex-1"
            >
              👎 Dislike
            </Button>
          </div>
        </div>
      );
    })}
  </div>
)}

            {/* Step 4: Complete */}
{currentStep === 4 && (
  <div className="space-y-6 text-center">
    <div className="p-8">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 bg-primary/10">
        <CheckCircle className="w-10 h-10 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-4">Welcome to AutoComment.AI!</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-accent rounded-lg">
          <Badge variant="outline" className="mb-2">Tone</Badge>
          <p className="text-lg font-semibold text-foreground">{prefs.toneStyle || '—'}</p>
        </div>
        <div className="p-4 bg-accent rounded-lg">
          <Badge variant="outline" className="mb-2">Industry</Badge>
          <p className="text-lg font-semibold text-foreground">{prefs.industryDomain || '—'}</p>
        </div>
        <div className="p-4 bg-accent rounded-lg">
          <Badge variant="secondary" className="mb-2">Feedback</Badge>
          <p className="text-lg font-semibold text-foreground">
            {prefs.sampleFeedback.filter(s => s.liked === true).length} likes • {prefs.sampleFeedback.filter(s => s.liked === false).length} dislikes
          </p>
        </div>
      </div>

<<<<<<< HEAD
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
=======
      <div className="flex gap-4 justify-center">
        <Button asChild>
          <a href="/dashboard">
            Go to Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </a>
        </Button>
      </div>
    </div>
  </div>
)}
>>>>>>> origin/main

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
