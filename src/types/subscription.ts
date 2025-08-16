export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  period: string;
  tokensPerMonth: number;
  tokensPerHour: number;
  features: string[];
  isPopular?: boolean;
  stripePriceId?: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'expired' | 'past_due';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
}

export interface UsageStats {
  totalComments: number;
  approvalRate: number;
  daysActive: number;
  tokensUsedThisMonth: number;
  tokensRemainingThisMonth: number;
  dailyUsage: Array<{
    date: string;
    comments: number;
    tokensUsed: number;
  }>;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    price: 0,
    period: '/month',
    tokensPerMonth: 50,
    tokensPerHour: 10,
    features: [
      '50 AI comments per month',
      '10 comments per hour',
      'Basic personas',
      'Comment history',
      'Email support'
    ]
  },
  {
    id: 'pro',
    name: 'Professional',
    description: 'For active LinkedIn users',
    price: 19,
    period: '/month',
    tokensPerMonth: 500,
    tokensPerHour: 50,
    isPopular: true,
    features: [
      '500 AI comments per month',
      '50 comments per hour',
      'Advanced personas',
      'Priority AI generation',
      'Advanced analytics',
      'Custom templates',
      'Priority support'
    ],
    stripePriceId: 'price_pro_monthly'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For teams and power users',
    price: 49,
    period: '/month',
    tokensPerMonth: 2000,
    tokensPerHour: 200,
    features: [
      '2000 AI comments per month',
      '200 comments per hour',
      'Custom personas',
      'White-label options',
      'Team management',
      'API access',
      'Advanced analytics',
      'Dedicated support'
    ],
    stripePriceId: 'price_enterprise_monthly'
  }
];
