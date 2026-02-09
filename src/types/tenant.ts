export type TenantEntityType = 'individual' | 'company';
export type TenantCategory = 'active' | 'archived' | 'new';
export type TenantStatus = 'active' | 'deactivated' | 'deleted';
export type InviteStatus = 'pending' | 'accepted' | 'expired';
export type BGVSchedule = 'one-time' | 'monthly' | 'quarterly' | 'annually';
export type BGVReportStatus = 'completed' | 'failed' | 'pending';
export type PaymentStatus = 'paid' | 'late' | 'pending';
export type LeaseStatus = 'active' | 'past' | 'upcoming';

export interface TenantAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface TenantLease {
  id: string;
  propertyName: string;
  unit?: string;
  startDate: string;
  endDate: string;
  status: LeaseStatus;
  monthlyRent: number;
}

export interface BGVReport {
  id: string;
  tenantId: string;
  runDate: string;
  schedule: BGVSchedule;
  reportUrl: string;
  status: BGVReportStatus;
  sections?: { credit: string; criminal: string; eviction: string };
}

export interface TenantPayment {
  id: string;
  tenantId: string;
  amount: number;
  date: string;
  status: PaymentStatus;
  leaseId?: string;
}

export interface Tenant {
  id: string;
  entityType: TenantEntityType;
  firstName: string;
  lastName: string;
  companyName: string;
  contactPerson: string;
  dob: string;
  ssn: string;
  ein: string;
  phone: string;
  address: TenantAddress;
  email: string;
  status: TenantStatus;
  inviteStatus: InviteStatus;
  inviteToken?: string;
  inviteSentAt?: string;
  leases: TenantLease[];
  payments: TenantPayment[];
  bgvReports: BGVReport[];
  bgvEnabled: boolean;
  bgvSchedule: BGVSchedule;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export function getTenantCategory(tenant: Tenant): TenantCategory {
  const hasActiveLease = tenant.leases.some((l) => l.status === 'active');
  if (hasActiveLease) return 'active';
  const hasPastLease = tenant.leases.some((l) => l.status === 'past');
  if (hasPastLease) return 'archived';
  return 'new';
}

export function getTenantDisplayName(tenant: Tenant): string {
  return tenant.entityType === 'company'
    ? tenant.companyName
    : `${tenant.firstName} ${tenant.lastName}`;
}

export interface TenantFormData {
  entityType: TenantEntityType;
  firstName: string;
  lastName: string;
  companyName: string;
  contactPerson: string;
  dob: string;
  ssn: string;
  ein: string;
  phone: string;
  address: TenantAddress;
  email: string;
  bgvEnabled: boolean;
  bgvSchedule: BGVSchedule;
}

export const emptyTenantForm: TenantFormData = {
  entityType: 'individual',
  firstName: '',
  lastName: '',
  companyName: '',
  contactPerson: '',
  dob: '',
  ssn: '',
  ein: '',
  phone: '',
  address: { street: '', city: '', state: '', zip: '' },
  email: '',
  bgvEnabled: false,
  bgvSchedule: 'one-time',
};
