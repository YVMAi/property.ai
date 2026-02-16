export type SuperAdminRole = 'full_access' | 'editor' | 'viewer' | 'log_only';

export interface SuperAdmin {
  id: string;
  email: string;
  name: string;
  role: SuperAdminRole;
  createdAt: string;
  lastLogin?: string;
}

export type PMCStatus = 'active' | 'suspended' | 'trial';

export interface PMCFeatureToggles {
  aiChat: boolean;
  zillowIntegration: boolean;
  multiCurrency: boolean;
  customReports: boolean;
  advancedAnalytics: boolean;
  apiAccess: boolean;
}

export interface PMC {
  id: string;
  name: string;
  address: string;
  adminEmail: string;
  subscriptionPlan: SubscriptionPlanType;
  customDomain?: string;
  logoUrl?: string;
  timezone: string;
  locale: string;
  userLimit: number;
  usersUsed: number;
  storageQuotaGB: number;
  storageUsedGB: number;
  featureToggles: PMCFeatureToggles;
  complianceLevel: 'basic' | 'advanced';
  currency: string;
  status: PMCStatus;
  revenueYTD: number;
  lastActivity: string;
  createdAt: string;
}

export type SubscriptionPlanType = 'basic' | 'pro' | 'pro_max' | 'custom';

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: SubscriptionPlanType;
  priceMonthly: number;
  priceAnnual: number;
  userLimit: number;
  storageGB: number;
  features: string[];
}

export type LogSeverity = 'info' | 'warning' | 'error' | 'critical';
export type LogType = 'login' | 'data_edit' | 'error' | 'payment' | 'system' | 'subscription';

export interface SystemLog {
  id: string;
  date: string;
  pmcId: string;
  pmcName: string;
  userId?: string;
  userName?: string;
  type: LogType;
  severity: LogSeverity;
  details: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic', name: 'Basic', type: 'basic', priceMonthly: 49, priceAnnual: 470,
    userLimit: 5, storageGB: 10,
    features: ['Basic Dashboard', 'Up to 50 Units', 'Email Support', 'Standard Reports'],
  },
  {
    id: 'pro', name: 'Pro', type: 'pro', priceMonthly: 99, priceAnnual: 950,
    userLimit: 25, storageGB: 50,
    features: ['Advanced Dashboard', 'Unlimited Units', 'Priority Support', 'Custom Reports', 'AI Chat', 'Zillow Integration'],
  },
  {
    id: 'pro_max', name: 'Pro Max', type: 'pro_max', priceMonthly: 199, priceAnnual: 1900,
    userLimit: -1, storageGB: 200,
    features: ['Everything in Pro', 'Unlimited Users', 'Dedicated Support', 'Multi-Currency', 'Advanced Analytics', 'API Access', 'Custom Branding'],
  },
];

export const PLAN_BADGE_COLORS: Record<SubscriptionPlanType, string> = {
  basic: 'bg-secondary/30 text-secondary-foreground border-secondary/50',
  pro: 'bg-primary/30 text-primary-foreground border-primary/50',
  pro_max: 'bg-warning/30 text-warning-foreground border-warning/50',
  custom: 'bg-accent text-accent-foreground border-accent',
};

export const STATUS_BADGE_COLORS: Record<PMCStatus, string> = {
  active: 'bg-secondary/30 text-secondary-foreground',
  suspended: 'bg-destructive/30 text-destructive-foreground',
  trial: 'bg-primary/30 text-primary-foreground',
};
