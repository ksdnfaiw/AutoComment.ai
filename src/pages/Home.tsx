import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PersonaSelect } from '@/components/PersonaSelect';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Sparkles, Shield, Zap } from 'lucide-react';

export const Home = () => {
  const [formData, setFormData] = useState({
    email: '',
    persona: '',
    sampleComment: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.persona) {
      toast({
        title: "Missing fields",
        description: "Please fill in your email and select a persona.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Mock API call to n8n webhook
    setTimeout(() => {
      toast({
        title: "Welcome to AutoComment.AI!",
        description: "Your account has been created. Check your dashboard.",
      });
      setLoading(false);
      
      // In a real app, this would redirect to the dashboard
      console.log('Onboarding data:', formData);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/20">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <MessageSquare className="w-8 h-8 text-primary" />
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground">
                AutoComment<span className="text-primary">.AI</span>
              </h1>
            </div>
            
            <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Generate intelligent LinkedIn comments that sound authentically you. 
              Build meaningful connections with AI-powered networking.
            </p>

            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center gap-2 text-foreground">
                <Sparkles className="w-5 h-5 text-primary" />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Zap className="w-5 h-5 text-primary" />
                <span>Fast & Simple</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Shield className="w-5 h-5 text-primary" />
                <span>100% Safe</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                asChild
                className="bg-primary hover:bg-primary-hover text-primary-foreground font-medium"
              >
                <a href="/demo">Try Live Demo</a>
              </Button>
              <Button 
                asChild
                variant="outline"
              >
                <a href="/dashboard">View Dashboard</a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Onboarding Form */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Get Started in 30 Seconds</CardTitle>
              <CardDescription>
                Set up your AI comment assistant and start building better LinkedIn connections today.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="persona">Your Professional Persona</Label>
                  <PersonaSelect
                    value={formData.persona}
                    onValueChange={(value) => setFormData({ ...formData, persona: value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sample">Sample Comment (Optional)</Label>
                  <Textarea
                    id="sample"
                    value={formData.sampleComment}
                    onChange={(e) => setFormData({ ...formData, sampleComment: e.target.value })}
                    placeholder="Write a comment that represents your style..."
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground">
                    This helps our AI learn your unique commenting style.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-medium"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      Setting up your account...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Start Free Trial
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-accent rounded-lg">
                <p className="text-sm text-accent-foreground text-center">
                  🎉 <strong>Free:</strong> 50 comment suggestions per month • No credit card required
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features */}
      <div className="bg-accent/50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">
              How It Works
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary-foreground font-bold">1</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Browse LinkedIn</h3>
                <p className="text-muted-foreground text-sm">
                  Click the blue "Suggest Comments" button on any LinkedIn post
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary-foreground font-bold">2</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Review & Approve</h3>
                <p className="text-muted-foreground text-sm">
                  Get 2-3 AI-generated comments that match your professional style
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary-foreground font-bold">3</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Post & Connect</h3>
                <p className="text-muted-foreground text-sm">
                  Copy approved comments and paste them to build meaningful connections
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;