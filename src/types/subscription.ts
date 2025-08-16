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
    tokensPerHour: 3,
    features: [
      '50 comments per month',
      '3 professional personas',
      'Basic analytics',
      'Chrome extension',
      'Email support'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For active networkers',
    price: 10,
    period: '/month',
    tokensPerMonth: 500,
    tokensPerHour: 50,
    isPopular: true,
    features: [
      '500 comments per month',
      'Unlimited personas',
      'Advanced analytics',
      'Priority support',
      'Custom training',
      'Team collaboration'
    ],
    stripePriceId: 'price_pro_monthly'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For teams and agencies',
    price: 0,
    period: ' - Custom',
    tokensPerMonth: 999999,
    tokensPerHour: 9999,
    features: [
      'Unlimited comments',
      'White-label solution',
      'API access',
      'Dedicated support',
      'Custom integrations',
      'Advanced reporting'
    ],
    stripePriceId: 'price_enterprise_monthly'
  }
];
