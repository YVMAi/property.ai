export type LeaseType = 'month_to_month' | 'fixed_term';
export type LeaseStatus = 'draft' | 'active' | 'expired' | 'terminated';
export type EscalationType = 'percent' | 'fixed';
export type EscalationSchedule = 'yearly_anniversary' | 'specific_date';
export type LateFeeType = 'percent' | 'flat';
export type AdditionalFeeFrequency = 'one_time' | 'monthly' | 'quarterly';

export const LEASE_TYPE_LABELS: Record<LeaseType, string> = {
  month_to_month: 'Month-to-Month',
  fixed_term: 'Fixed Term',
};

export const LEASE_STATUS_LABELS: Record<LeaseStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  expired: 'Expired',
  terminated: 'Terminated',
};

export const LEASE_STATUS_COLORS: Record<LeaseStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  active: 'bg-secondary text-secondary-foreground',
  expired: 'bg-warning text-warning-foreground',
  terminated: 'bg-destructive text-destructive-foreground',
};

export const ADDITIONAL_FEE_TYPES = [
  'Utilities', 'Parking', 'Pet', 'Storage', 'Other',
] as const;

export interface AdditionalFee {
  id: string;
  type: string;
  amount: number;
  frequency: AdditionalFeeFrequency;
}

export interface LeaseHistoryEntry {
  date: string;
  action: string;
  user: string;
}

export interface ExtendedLease {
  id: string;
  propertyId: string;
  unitId?: string;
  leasableLabel: string; // "Entire Property", "Unit 101", "Bed A-1"

  // Tenant
  tenantId: string;
  tenantName: string;

  // Core terms
  leaseType: LeaseType;
  startDate: string;
  endDate: string;
  rent: number;
  paymentDueDay: number; // 1-28

  // Escalation
  escalationEnabled: boolean;
  escalationType?: EscalationType;
  escalationValue?: number;
  escalationSchedule?: EscalationSchedule;

  // Additional fees
  additionalFees: AdditionalFee[];

  // Late fees
  lateFeeEnabled: boolean;
  lateFeeType?: LateFeeType;
  lateFeeValue?: number;
  lateGraceDays?: number;

  // Security deposit
  securityDepositAmount?: number;
  securityDueDate?: string;
  securityRefundTerms?: string;

  // Eviction
  evictionNoticeDays?: number;
  evictionGrounds?: string[];

  // Auto-renewal
  autoRenew: boolean;
  autoRenewNoticeDays?: number;

  // Subletting
  sublettingAllowed: boolean;
  sublettingConditions?: string;

  // Insurance
  insuranceRequired: boolean;
  insuranceAmount?: number;

  // Custom clauses
  customClauses?: string;

  // Documents
  documentIds: string[];

  // Status & history
  status: LeaseStatus;
  history: LeaseHistoryEntry[];

  createdAt: string;
  updatedAt: string;
}

export interface LeaseFormData {
  tenantId: string;
  leaseType: LeaseType;
  startDate: string;
  endDate: string;
  rent: number | '';
  paymentDueDay: number;

  escalationEnabled: boolean;
  escalationType: EscalationType;
  escalationValue: number | '';
  escalationSchedule: EscalationSchedule;

  additionalFees: Omit<AdditionalFee, 'id'>[];

  lateFeeEnabled: boolean;
  lateFeeType: LateFeeType;
  lateFeeValue: number | '';
  lateGraceDays: number | '';

  securityDepositAmount: number | '';
  securityDueDate: string;
  securityRefundTerms: string;

  evictionNoticeDays: number | '';
  evictionGrounds: string[];

  autoRenew: boolean;
  autoRenewNoticeDays: number | '';

  sublettingAllowed: boolean;
  sublettingConditions: string;

  insuranceRequired: boolean;
  insuranceAmount: number | '';

  customClauses: string;
}

export const emptyLeaseForm: LeaseFormData = {
  tenantId: '',
  leaseType: 'fixed_term',
  startDate: '',
  endDate: '',
  rent: '',
  paymentDueDay: 1,

  escalationEnabled: false,
  escalationType: 'percent',
  escalationValue: '',
  escalationSchedule: 'yearly_anniversary',

  additionalFees: [],

  lateFeeEnabled: false,
  lateFeeType: 'percent',
  lateFeeValue: '',
  lateGraceDays: '',

  securityDepositAmount: '',
  securityDueDate: '',
  securityRefundTerms: '',

  evictionNoticeDays: '',
  evictionGrounds: [],

  autoRenew: false,
  autoRenewNoticeDays: '',

  sublettingAllowed: false,
  sublettingConditions: '',

  insuranceRequired: false,
  insuranceAmount: '',

  customClauses: '',
};
