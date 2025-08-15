import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Coins, TrendingUp, RefreshCw } from 'lucide-react';
import { useTokens } from '@/hooks/useTokens';

export const TokenDisplay = () => {
  const { tokenData, isLoading, refreshTokens, isRefreshing } = useTokens();
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-500" />
            Token Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-muted rounded"></div>
            <div className="h-2 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { current, total, plan } = tokenData;
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const isLow = percentage < 20;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-yellow-500" />
          Token Balance
        </CardTitle>
        <CardDescription>
          Your monthly comment generation credits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-foreground">
            {current}
          </span>
          <div className="flex items-center gap-2">
            <Badge variant={isLow ? "destructive" : "default"}>
              {current} / {total}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {plan}
            </Badge>
          </div>
        </div>
        
        <Progress 
          value={percentage} 
          className="w-full"
        />
        
        {isLow && (
          <div className="p-3 bg-destructive/10 rounded-lg">
            <div className="flex items-center gap-2 text-destructive">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">
                Running low on tokens
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Consider upgrading your plan for more monthly credits
            </p>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            💡 Tokens reset monthly. Each approved comment uses 1 token.
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshTokens}
            disabled={isRefreshing}
            className="text-xs"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
