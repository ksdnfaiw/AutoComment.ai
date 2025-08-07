import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Target, 
  BarChart3, 
  Shield, 
  Clock, 
  Users, 
  Sparkles,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

export const PremiumFeatures = () => {
  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Generate comments in under 2 seconds with our optimized AI engine",
      color: "text-yellow-500"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Persona-Matched",
      description: "Comments that perfectly match your professional voice and industry",
      color: "text-blue-500"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analytics Dashboard",
      description: "Track engagement and optimize your networking strategy",
      color: "text-green-500"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "100% Safe",
      description: "Never auto-posts. You always review and approve before commenting",
      color: "text-purple-500"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Save Hours",
      description: "Reduce networking time by 80% while maintaining authenticity",
      color: "text-orange-500"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Ready",
      description: "Manage multiple personas and team members from one dashboard",
      color: "text-pink-500"
    }
  ];

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      description: "Perfect for getting started",
      features: [
        "50 comments per month",
        "3 professional personas",
        "Basic analytics",
        "Chrome extension",
        "Email support"
      ],
      cta: "Get Started Free",
      popular: false
    },
    {
      name: "Pro",
      price: "$19",
      period: "/month",
      description: "For active networkers",
      features: [
        "500 comments per month",
        "Unlimited personas",
        "Advanced analytics",
        "Priority support",
        "Custom training",
        "Team collaboration"
      ],
      cta: "Start Pro Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For teams and agencies",
      features: [
        "Unlimited comments",
        "White-label solution",
        "API access",
        "Dedicated support",
        "Custom integrations",
        "Advanced reporting"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="space-y-16">
      {/* Features Grid */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Why Choose AutoComment.AI?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The most advanced AI commenting tool designed specifically for LinkedIn networking
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`${feature.color} mb-2`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Card>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div>
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            Special Launch Pricing
          </Badge>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free, upgrade anytime. All plans include our core AI commenting features.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${plan.popular ? 'ring-2 ring-primary shadow-xl scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <CardDescription className="mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            🎉 <strong>Limited Time:</strong> First 1000 users get Pro features free for 3 months
          </p>
        </div>
      </div>
    </div>
  );
};