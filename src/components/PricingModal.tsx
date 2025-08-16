import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Users, ArrowRight } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { SUBSCRIPTION_PLANS } from '@/types/subscription';

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PricingModal = ({ open, onOpenChange }: PricingModalProps) => {
  const { currentPlan, initiatePayment, isChangingPlan } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'pro':
        return <Zap className="w-6 h-6 text-blue-500" />;
      case 'enterprise':
        return <Users className="w-6 h-6 text-purple-500" />;
      default:
        return <Crown className="w-6 h-6 text-yellow-500" />;
    }
  };

  const handlePlanSelect = async (planId: string) => {
    if (planId === currentPlan?.id) return;
    
    setSelectedPlan(planId);
    try {
      await initiatePayment(planId);
      onOpenChange(false);
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setSelectedPlan(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Choose Your Plan</DialogTitle>
          <DialogDescription className="text-center">
            Upgrade your AutoComment.AI experience with more tokens and advanced features
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isCurrentPlan = currentPlan?.id === plan.id;
            const isSelected = selectedPlan === plan.id;
            const isLoading = isChangingPlan && isSelected;

            return (
              <Card 
                key={plan.id}
                className={`relative transition-all duration-200 ${
                  plan.isPopular ? 'ring-2 ring-primary scale-105' : ''
                } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-green-500 text-white px-3 py-1">
                      Current Plan
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    {getPlanIcon(plan.id)}
                  </div>
                  
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  
                  <div className="py-4">
                    <span className="text-4xl font-bold">
                      {plan.id === 'enterprise' ? 'Custom' : plan.price === 0 ? '$0' : `$${plan.price}`}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {plan.id === 'enterprise' ? '' : '/month'}
                    </span>
                  </div>
                  
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Token Information */}
                  <div className="mb-4 p-3 bg-accent rounded-lg">
                    <div className="text-sm font-medium text-center">
                      {plan.tokensPerMonth} tokens/month
                    </div>
                    <div className="text-xs text-muted-foreground text-center">
                      {plan.tokensPerHour} tokens/hour limit
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Action Button */}
                  <Button
                    className="w-full"
                    variant={plan.isPopular ? "default" : "outline"}
                    onClick={() => handlePlanSelect(plan.id)}
                    disabled={isCurrentPlan || isLoading}
                  >
                    {isLoading ? (
                      "Processing..."
                    ) : isCurrentPlan ? (
                      "Current Plan"
                    ) : plan.id === 'free' ? (
                      "Get Started Free"
                    ) : plan.id === 'enterprise' ? (
                      "Contact Sales"
                    ) : plan.isPopular ? (
                      "Start Pro Trial"
                    ) : (
                      <>
                        {currentPlan?.id === 'free' ? 'Upgrade' : 'Switch'} to {plan.name}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Billing Information */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="text-sm text-muted-foreground text-center space-y-1">
            <p>✨ All plans include core AI commenting features</p>
            <p>🔄 Cancel anytime - no hidden fees</p>
            <p>💳 Secure payment processing via Stripe</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
