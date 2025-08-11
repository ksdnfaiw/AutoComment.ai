import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { PremiumFeatures } from '@/components/PremiumFeatures';
import { DatabaseExplorer } from '@/components/DatabaseExplorer';
import { DataTest } from '@/components/DataTest';
import { DatabaseDebug } from '@/components/DatabaseDebug';
import { DatabaseSetup } from '@/components/DatabaseSetup';
import { UserMenu } from '@/components/UserMenu';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare, Sparkles, Shield, Zap, Play, Star, Users, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Home = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { user } = useAuth();

  if (showOnboarding) {
    return <OnboardingWizard />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold">
                AutoComment<span className="text-primary">.AI</span>
              </span>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>
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

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Button 
                onClick={() => setShowOnboarding(true)}
                size="lg"
                className="bg-primary hover:bg-primary-hover text-primary-foreground font-medium text-lg px-8 py-3"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Free Now
              </Button>
              <Button 
                asChild
                variant="outline"
                size="lg"
                className="text-lg px-8 py-3"
              >
                <a href="/demo">Watch Demo</a>
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm">4.9/5 from users</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="text-sm">500+ professionals</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="text-sm">Enterprise secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Value Proposition */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              Powered by Advanced AI
            </Badge>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Stop Struggling with LinkedIn Comments
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI generates authentic, professional comments that match your voice and help you build meaningful connections - without the stress of finding the right words.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-success mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Sounds Like You</h3>
                  <p className="text-muted-foreground">AI learns your writing style and professional tone</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-success mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Context Aware</h3>
                  <p className="text-muted-foreground">Comments match the post content and industry</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-success mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Always Safe</h3>
                  <p className="text-muted-foreground">You review every comment before posting</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-primary/10 to-accent/20 p-8 rounded-lg">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Ready to try it?</h3>
                <p className="text-muted-foreground mb-4">
                  Join hundreds of professionals already using AutoComment.AI
                </p>
                <Button 
                  onClick={() => setShowOnboarding(true)}
                  className="w-full"
                  size="lg"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-accent/30 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">
              How It Works
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <span className="text-primary font-bold text-xl">1</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-lg">Install & Browse</h3>
                <p className="text-muted-foreground">
                  Add our Chrome extension and browse LinkedIn normally. Click "Suggest Comments" on any post.
                </p>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <span className="text-primary font-bold text-xl">2</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-lg">AI Generates</h3>
                <p className="text-muted-foreground">
                  Our AI analyzes the post and creates 2-3 authentic comments that match your professional persona.
                </p>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <span className="text-primary font-bold text-xl">3</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-lg">Auto-Fill & Post</h3>
                <p className="text-muted-foreground">
                  Approve a comment and it auto-fills LinkedIn's comment box. Review and post when ready!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Features */}
      <div className="container mx-auto px-4 py-16">
        <PremiumFeatures />
      </div>

      {/* Database Setup & Testing */}
      <div className="container mx-auto px-4 py-8 space-y-6">
        <DatabaseSetup />
        <DatabaseExplorer />
        <DataTest />
        <DatabaseDebug />
      </div>
    </div>
  );
};

export default Home;
