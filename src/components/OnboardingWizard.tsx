import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, ArrowRight, ArrowLeft, MessageSquare } from 'lucide-react';
import { useOnboardingPreferences } from '@/hooks/useOnboardingPreferences';

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
  const { saveToneStyle, saveIndustryDomain, saveSampleFeedback, loadPreferences } = useOnboardingPreferences();

  const samples: Sample[] = [
    { id: '1', text: 'Appreciate this perspective—clear, actionable insights that drive results.' },
    { id: '2', text: 'Great breakdown! Curious how you\'d apply this in a lean team setting.' },
    { id: '3', text: 'Strong take. I\'d add that execution speed often beats perfect strategy.' }
  ];

  // Load existing preferences on mount
  useEffect(() => {
    const loadExistingPrefs = async () => {
      const existingPrefs = await loadPreferences();
      if (existingPrefs) {
        setPrefs({
          toneStyle: existingPrefs.tone_style || '',
          industryDomain: existingPrefs.industry_domain || '',
          sampleFeedback: existingPrefs.sample_feedback || []
        });
      }
    };
    loadExistingPrefs();
  }, [loadPreferences]);

  const handleStepSubmit = async () => {
    if (currentStep === 1) {
      if (!prefs.toneStyle) {
        toast({
          title: 'Pick a tone',
          description: 'Please select a tone to continue.',
          variant: 'destructive',
        });
        return;
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

  const handleSampleAction = (sampleId: string, liked: boolean) => {
    setPrefs(prev => {
      const existing = prev.sampleFeedback.find(s => s.id === sampleId);
      const updated = existing
        ? prev.sampleFeedback.map(s => (s.id === sampleId ? { ...s, liked } : s))
        : [...prev.sampleFeedback, { ...(samples.find(s => s.id === sampleId) as Sample), liked }];
      return { ...prev, sampleFeedback: updated };
    });
  };

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
                <CardTitle className="text-xl">Choose Your Industry</CardTitle>
                <CardDescription>
                  Help us tailor suggestions to your professional domain
                </CardDescription>
              </>
            )}
            
            {currentStep === 3 && (
              <>
                <CardTitle className="text-xl">Rate Sample Comments</CardTitle>
                <CardDescription>
                  Tell us which style resonates with you
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
            {/* Step 1: Tone Selection */}
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

            {/* Step 2: Industry Selection */}
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
                    💡 Tip: Selecting your domain boosts relevance of suggestions.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Sample Feedback */}
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
                  disabled={loading}
                  className="bg-primary hover:bg-primary-hover"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      Saving...
                    </>
                  ) : currentStep === 3 ? (
                    <>
                      Complete Setup
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
