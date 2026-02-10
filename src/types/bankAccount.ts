export type AccountType = 'checking' | 'savings' | 'escrow';

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  checking: 'Checking',
  savings: 'Savings',
  escrow: 'Escrow',
};

export type BankPurpose =
  | 'rent_collection'
  | 'expenses'
  | 'security_deposits'
  | 'reserves_escrow'
  | 'owner_distributions'
  | 'other';

export const BANK_PURPOSE_LABELS: Record<BankPurpose, string> = {
  rent_collection: 'Rent Collection',
  expenses: 'Expenses / Payments',
  security_deposits: 'Security Deposits',
  reserves_escrow: 'Reserves / Escrow',
  owner_distributions: 'Owner Distributions',
  other: 'Other',
};

export const PURPOSE_COLORS: Record<BankPurpose, string> = {
  rent_collection: 'hsl(120,30%,82%)',
  expenses: 'hsl(210,50%,82%)',
  security_deposits: 'hsl(0,50%,87%)',
  reserves_escrow: 'hsl(45,60%,82%)',
  owner_distributions: 'hsl(270,40%,85%)',
  other: 'hsl(0,0%,85%)',
};

export interface BankAccount {
  id: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string; // stored full, displayed masked
  routingNumber: string; // stored full, displayed masked
  accountType: AccountType;
  country: string;
  currency: string;
  nickname?: string;
  createdAt: string;
  createdBy: string;
}

export interface PropertyBankLink {
  id: string;
  propertyId: string;
  bankAccountId: string;
  purpose: BankPurpose;
  customPurpose?: string;
  primaryForPurpose: boolean;
  linkedAt: string;
}

/** Mask account/routing to ****XXXX (last 4) */
export function maskNumber(value: string): string {
  if (!value || value.length <= 4) return value;
  return '••••' + value.slice(-4);
}
