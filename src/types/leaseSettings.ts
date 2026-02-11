export interface ReminderTiming {
  id: string;
  daysOffset: number; // negative = before due, 0 = on due, positive = after due
}

export interface LeaseSettings {
  // Invoice
  invoiceGenDaysBefore: number;

  // Reminders
  remindersEnabled: boolean;
  reminderChannels: ('email' | 'sms' | 'push')[];
  reminderTimings: ReminderTiming[];
  reminderEscalationEnabled: boolean;
  reminderEscalationDays: number;

  // Late Fees
  lateFeesDefaultEnabled: boolean;
  lateFeeType: 'percent' | 'flat';
  lateFeeValue: number | '';
  lateGraceDays: number | '';
  lateApplyAfterDays: number | '';
  lateMaxCap: number | '';

  // Renewal Fees
  renewalFeesDefaultEnabled: boolean;
  renewalFeeType: 'fixed' | 'percent';
  renewalFeeValue: number | '';
  renewalApplyOn: 'renewal_date' | 'anniversary';
  renewalWaiveConditions: string;

  // Templates
  standardLeaseTemplateURL: string;
  standardLeaseTemplateName: string;
  standardRenewalTemplateURL: string;
  standardRenewalTemplateName: string;

  // Auto-Renewal
  autoRenewDefault: boolean;
  autoRenewNoticeDays: number | '';

  // Escalation
  escalationDefaultEnabled: boolean;
  escalationType: 'percent' | 'fixed';
  escalationValue: number | '';
  escalationStartAfterMonths: number | '';

  // Pet Policy
  petsAllowedDefault: boolean;
  petFee: number | '';
  petFeeFrequency: 'one_time' | 'monthly';
  petRestrictions: string;

  // Parking/Utilities
  parkingSpots: number | '';
  parkingFee: number | '';
  utilitiesResponsibility: 'tenant' | 'owner' | 'included';

  // Inspection
  inspectionTemplateURL: string;
  inspectionTemplateName: string;
  inspectionRequired: boolean;

  // Custom Rules
  customRulesBoilerplate: string;

  // Approval
  requireOwnerApprovalNonStandard: boolean;

  // Reporting
  expirationNotifyMonthsBefore: number | '';

  // History
  settingsHistory: { date: string; user: string; changeSummary: string }[];
}

export const DEFAULT_LEASE_SETTINGS: LeaseSettings = {
  invoiceGenDaysBefore: 7,
  remindersEnabled: false,
  reminderChannels: [],
  reminderTimings: [],
  reminderEscalationEnabled: false,
  reminderEscalationDays: 5,
  lateFeesDefaultEnabled: false,
  lateFeeType: 'percent',
  lateFeeValue: '',
  lateGraceDays: '',
  lateApplyAfterDays: '',
  lateMaxCap: '',
  renewalFeesDefaultEnabled: false,
  renewalFeeType: 'fixed',
  renewalFeeValue: '',
  renewalApplyOn: 'renewal_date',
  renewalWaiveConditions: '',
  standardLeaseTemplateURL: '',
  standardLeaseTemplateName: '',
  standardRenewalTemplateURL: '',
  standardRenewalTemplateName: '',
  autoRenewDefault: false,
  autoRenewNoticeDays: '',
  escalationDefaultEnabled: false,
  escalationType: 'percent',
  escalationValue: '',
  escalationStartAfterMonths: '',
  petsAllowedDefault: false,
  petFee: '',
  petFeeFrequency: 'monthly',
  petRestrictions: '',
  parkingSpots: '',
  parkingFee: '',
  utilitiesResponsibility: 'tenant',
  inspectionTemplateURL: '',
  inspectionTemplateName: '',
  inspectionRequired: false,
  customRulesBoilerplate: '',
  requireOwnerApprovalNonStandard: false,
  expirationNotifyMonthsBefore: '',
  settingsHistory: [],
};
