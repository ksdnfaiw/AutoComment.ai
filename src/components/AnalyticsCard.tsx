import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Users, Eye, Lock, Crown } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface AnalyticsCardProps {
  onUpgrade: () => void;
}

export const AnalyticsCard = ({ onUpgrade }: AnalyticsCardProps) => {
  const { currentPlan, hasFeatureAccess } = useSubscription();

  const basicMetrics = [
    { label: 'Comments This Month', value: '23', icon: BarChart3 },
    { label: 'Approval Rate', value: '87%', icon: TrendingUp },
    { label: 'Days Active', value: '12', icon: Users }
  ];

  const advancedMetrics = [
    { label: 'Engagement Rate', value: '4.2%', icon: Eye },
    { label: 'Best Performing Time', value: '2:00 PM', icon: TrendingUp },
    { label: 'Top Performing Post Type', value: 'Industry News', icon: BarChart3 },
    { label: 'Average Response Time', value: '1.2 hrs', icon: Users },
    { label: 'Weekly Growth', value: '+12%', icon: TrendingUp },
    { label: 'Conversion Rate', value: '2.8%', icon: Eye }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Analytics Dashboard
          {!hasFeatureAccess('advanced_analytics') && (
            <Badge variant="outline" className="text-xs">
              <Lock className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Track your LinkedIn engagement performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Basic Metrics - Available to all users */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {basicMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="p-3 bg-accent rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{metric.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{metric.value}</p>
              </div>
            );
          })}
        </div>

        {/* Advanced Analytics - Premium Feature */}
        {hasFeatureAccess('advanced_analytics') ? (
          <div className="space-y-4">
            <div className="border-t border-border pt-4">
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Advanced Insights
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {advancedMetrics.map((metric, index) => {
                  const Icon = metric.icon;
                  return (
                    <div key={index} className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">{metric.label}</span>
                      </div>
                      <p className="text-lg font-bold text-blue-900">{metric.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="border-t border-border pt-4">
            <div className="text-center p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Crown className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Unlock Advanced Analytics</h4>
              <p className="text-sm text-gray-600 mb-4">
                Get detailed insights into your LinkedIn engagement with advanced metrics, 
                performance trends, and optimization recommendations.
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  Engagement tracking
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Performance trends
                </div>
                <div className="flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" />
                  Content insights
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Audience analytics
                </div>
              </div>
              <Button 
                onClick={onUpgrade}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="sm"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
