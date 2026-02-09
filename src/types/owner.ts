export type OwnerStatus = 'active' | 'deactivated' | 'deleted';
export type EmailStatus = 'active' | 'deactivated';
export type TaxClassification = 'individual' | 'llc' | 'corporation' | 'partnership' | 'trust' | 'other';
export type OwnerType = 'individual' | 'company';

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
}
