export type OwnerStatus = 'active' | 'deactivated' | 'deleted';
export type EmailStatus = 'active' | 'deactivated';
export type TaxClassification = 'individual' | 'llc' | 'corporation' | 'partnership' | 'trust' | 'other';
export type OwnerType = 'individual' | 'company';
export type PayoutMethod = 'ach' | 'check' | 'wire' | 'other';
export type PayoutFrequency = 'monthly' | 'bi-weekly' | 'quarterly' | 'on-demand';
export type PayoutAccountType = 'checking' | 'savings';
export type ManagementFeeType = 'percentage' | 'flat_monthly' | 'flat_per_property';
export type ManagementFeeApplyTo = 'all' | 'specific';

export interface OwnerEmail {
  id: string;
  email: string;
  isPrimary: boolean;
  status: EmailStatus;
  inviteToken?: string;
  inviteSentAt?: string;
  loginCount: number;
  lastLogin?: string;
}

export interface OwnerDocument {
  id: string;
  fileName: string;
  fileUrl: string;
  tags: string[];
  uploadedAt: string;
}

export interface OwnerAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface PaymentSetup {
  payoutMethod: PayoutMethod;
  payoutMethodOther: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  accountType: PayoutAccountType;
  payoutFrequency: PayoutFrequency;
  payoutDay: string;
  managementFeeEnabled: boolean;
  managementFeeType: ManagementFeeType;
  managementFeeValue: number | '';
  managementFeeMinimum: number | '';
  managementFeeApplyTo: ManagementFeeApplyTo;
  managementFeePropertyIds: string[];
  managementFeeNotes: string;
}

export const emptyPaymentSetup: PaymentSetup = {
  payoutMethod: 'ach',
  payoutMethodOther: '',
  bankName: '',
  accountNumber: '',
  routingNumber: '',
  accountType: 'checking',
  payoutFrequency: 'monthly',
  payoutDay: '',
  managementFeeEnabled: false,
  managementFeeType: 'percentage',
  managementFeeValue: '',
  managementFeeMinimum: '',
  managementFeeApplyTo: 'all',
  managementFeePropertyIds: [],
  managementFeeNotes: '',
};

export interface Owner {
  id: string;
  ownerType: OwnerType;
  firstName: string;
  lastName: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  address: OwnerAddress;
  ssn: string;
  ein: string;
  taxId: string;
  taxClassification: TaxClassification;
  w9FileUrl?: string;
  emails: OwnerEmail[];
  linkedPropertyIds: string[];
  documents: OwnerDocument[];
  paymentSetup: PaymentSetup;
  status: OwnerStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OwnerFormData {
  ownerType: OwnerType;
  firstName: string;
  lastName: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  address: OwnerAddress;
  ssn: string;
  ein: string;
  taxId: string;
  taxClassification: TaxClassification;
  emails: Omit<OwnerEmail, 'id' | 'loginCount' | 'lastLogin'>[];
  linkedPropertyIds: string[];
  documents: Omit<OwnerDocument, 'id'>[];
  paymentSetup: PaymentSetup;
}
