import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Crown, Zap, Users, AlertTriangle, Calendar } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

export const SubscriptionCard = () => {
  const { 
    subscription, 
    currentPlan, 
    getRemainingTokens, 
    getUsagePercentage,
    hasRemainingTokens,
    subscriptionLoading 
  } = useSubscription();

  if (subscriptionLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-2 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const remainingTokens = getRemainingTokens();
  const usagePercentage = getUsagePercentage();
  const isLowOnTokens = usagePercentage > 80;
  const isOutOfTokens = !hasRemainingTokens();

  const getPlanIcon = () => {
    switch (currentPlan?.id) {
      case 'pro':
        return <Zap className="w-5 h-5 text-blue-500" />;
      case 'enterprise':
        return <Users className="w-5 h-5 text-purple-500" />;
      default:
        return <Crown className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getPlanColor = () => {
    switch (currentPlan?.id) {
      case 'pro':
        return 'bg-blue-500';
      case 'enterprise':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className={currentPlan?.isPopular ? 'ring-2 ring-primary' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getPlanIcon()}
          Current Plan
        </CardTitle>
        <CardDescription>
          Your subscription and usage details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Plan Name and Price */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{currentPlan?.name}</h3>
            <p className="text-sm text-muted-foreground">
              {currentPlan?.price === 0 ? 'Free' : `$${currentPlan?.price}/month`}
            </p>
          </div>
          <Badge 
            className={`${getPlanColor()} text-white`}
            variant="secondary"
          >
            {currentPlan?.id.toUpperCase()}
          </Badge>
        </div>

        {/* Token Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Monthly Tokens</span>
            <span className={isOutOfTokens ? 'text-destructive font-medium' : ''}>
              {remainingTokens} / {currentPlan?.tokensPerMonth} remaining
            </span>
          </div>
          
          <Progress 
            value={usagePercentage} 
            className="w-full h-2"
          />
          
          {isLowOnTokens && (
            <div className={`p-2 rounded-lg flex items-center gap-2 text-sm ${
              isOutOfTokens ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'
            }`}>
              <AlertTriangle className="w-4 h-4" />
              <span>
                {isOutOfTokens 
                  ? 'Out of tokens! Upgrade or wait for reset.' 
                  : 'Running low on tokens. Consider upgrading.'
                }
              </span>
            </div>
          )}
        </div>

        {/* Next Billing */}
        {subscription && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              {currentPlan?.id === 'free' 
                ? 'Tokens reset in 30 days'
                : `Next billing: ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
              }
            </span>
          </div>
        )}

        {/* Rate Limits */}
        <div className="pt-2 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Rate limit: {currentPlan?.tokensPerHour} comments/hour</div>
            <div>Monthly limit: {currentPlan?.tokensPerMonth} comments</div>
          </div>
        </div>

        {/* Upgrade Button */}
        {currentPlan?.id === 'free' && (
          <Button 
            className="w-full mt-4" 
            onClick={() => {
              // This would open a pricing modal or redirect to pricing page
              window.location.href = '#pricing';
            }}
          >
            <Zap className="w-4 h-4 mr-2" />
            Upgrade Plan
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
