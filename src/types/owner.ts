export type OwnerStatus = 'active' | 'deactivated' | 'deleted';
export type EmailStatus = 'active' | 'deactivated';
export type InviteStatus = 'pending' | 'shared' | 'accepted' | 'rejected' | 'withdrawn';
export type TaxClassification = 'individual' | 'llc' | 'corporation' | 'partnership' | 'trust' | 'other';
export type OwnerType = 'individual' | 'company';
export type PayoutMethod = 'ach' | 'check' | 'wire' | 'other';
export type PayoutFrequency = 'monthly' | 'bi-weekly' | 'quarterly' | 'on-demand';
export type PayoutAccountType = 'checking' | 'savings';
export type ManagementFeeType = 'percentage' | 'flat_monthly' | 'flat_per_property';
export type ManagementFeeApplyTo = 'all' | 'specific';
export type AgreementMode = 'single' | 'per_property';
export type AgreementManagementFeeType = 'fixed_per_unit' | 'percent_rent' | 'percent_total_income' | 'combination';
export type AgreementFeeType = 'fixed' | 'variable';
export type PaymentHistoryStatus = 'paid' | 'pending';

export interface OwnerEmail {
  id: string;
  email: string;
  isPrimary: boolean;
  status: EmailStatus;
  inviteStatus: InviteStatus;
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

export interface OwnerAgreement {
  id: string;
  propertyId?: string;
  name: string;
  fileName: string;
  fileUrl: string;
  startDate: string;
  endDate: string;
  managementFeeType: AgreementManagementFeeType;
  managementFeeFixed: number | '';
  managementFeePercent: number | '';
  managementFeePercentTotal: number | '';
  leaseFeeType: AgreementFeeType;
  leaseFeeValue: number | '';
  renewalFeeType: AgreementFeeType;
  renewalFeeValue: number | '';
  feePerUnit: number | '';
  feePercentRent: number | '';
  managementFeeLowerCap: number | '';
  managementFeeUpperCap: number | '';
  chargeIfVacant: boolean;
  createdAt: string;
}

export interface OwnerPayment {
  id: string;
  amount: number;
  date: string;
  method: string;
  status: PaymentHistoryStatus;
  invoiceUrl?: string;
  receiptUrl?: string;
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
  autoPayEnabled: boolean;
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
  autoPayEnabled: true,
  managementFeeEnabled: false,
  managementFeeType: 'percentage',
  managementFeeValue: '',
  managementFeeMinimum: '',
  managementFeeApplyTo: 'all',
  managementFeePropertyIds: [],
  managementFeeNotes: '',
};

export const emptyAgreement: Omit<OwnerAgreement, 'id'> = {
  name: '',
  fileName: '',
  fileUrl: '#',
  startDate: '',
  endDate: '',
  managementFeeType: 'fixed_per_unit',
  managementFeeFixed: '',
  managementFeePercent: '',
  managementFeePercentTotal: '',
  leaseFeeType: 'fixed',
  leaseFeeValue: '',
  renewalFeeType: 'fixed',
  renewalFeeValue: '',
  feePerUnit: '',
  feePercentRent: '',
  managementFeeLowerCap: '',
  managementFeeUpperCap: '',
  chargeIfVacant: false,
  createdAt: new Date().toISOString(),
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
  agreements: OwnerAgreement[];
  agreementMode: AgreementMode;
  documents: OwnerDocument[];
  payments: OwnerPayment[];
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
  emails: Omit<OwnerEmail, 'loginCount' | 'lastLogin'>[];
  linkedPropertyIds: string[];
  agreements: Omit<OwnerAgreement, 'id'>[];
  agreementMode: AgreementMode;
  documents: Omit<OwnerDocument, 'id'>[];
  paymentSetup: PaymentSetup;
}
