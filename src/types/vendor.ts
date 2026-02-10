export type VendorType = 'individual' | 'company';
export type VendorStatus = 'active' | 'archived' | 'blacklisted' | 'deleted';
export type InviteStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';
export type BGVSchedule = 'one-time' | 'monthly' | 'quarterly' | 'annually';
export type BGVReportStatus = 'completed' | 'failed' | 'pending';
export type PaymentTerms = 'net_30' | 'immediate' | 'weekly' | 'bi_weekly' | 'net_15' | 'net_60';
export type PaymentMethod = 'ach' | 'check' | 'wire';
export type WOStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';
export type ComplaintStatus = 'open' | 'resolved';
export type VendorPaymentStatus = 'paid' | 'pending';

export interface VendorAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface VendorDocument {
  id: string;
  fileName: string;
  fileUrl: string;
  type: 'master_agreement' | 'w9' | 'insurance' | 'license' | 'other';
  uploadedAt: string;
}

export interface VendorBGVReport {
  id: string;
  vendorId: string;
  runDate: string;
  schedule: BGVSchedule;
  reportUrl: string;
  status: BGVReportStatus;
  sections?: { credit: string; criminal: string; license: string };
}

export interface VendorWorkOrder {
  id: string;
  vendorId: string;
  propertyName: string;
  description: string;
  assignedDate: string;
  status: WOStatus;
  cost: number;
}

export interface VendorComplaint {
  id: string;
  vendorId: string;
  date: string;
  from: string;
  description: string;
  status: ComplaintStatus;
  resolutionNotes: string;
}

export interface VendorPayment {
  id: string;
  vendorId: string;
  amount: number;
  date: string;
  method: string;
  status: VendorPaymentStatus;
  invoiceUrl?: string;
}

export interface Vendor {
  id: string;
  vendorType: VendorType;
  firstName: string;
  lastName: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  address: VendorAddress;
  ssn: string;
  ein: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  availability247: boolean;
  categories: string[];
  customCategories: string[];
  regions: string[];
  defaultHourlyRate: number | '';
  paymentTerms: PaymentTerms;
  defaultPaymentMethod: PaymentMethod;
  tags: string[];
  email: string;
  status: VendorStatus;
  inviteStatus: InviteStatus;
  inviteToken?: string;
  inviteSentAt?: string;
  bgvEnabled: boolean;
  bgvSchedule: BGVSchedule;
  documents: VendorDocument[];
  bgvReports: VendorBGVReport[];
  workOrders: VendorWorkOrder[];
  complaints: VendorComplaint[];
  payments: VendorPayment[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorFormDocument {
  id: string;
  fileName: string;
  type: 'master_agreement' | 'w9' | 'insurance' | 'license' | 'other';
  fileSize: number;
  addedAt: string;
}

export interface VendorFormData {
  vendorType: VendorType;
  firstName: string;
  lastName: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  address: VendorAddress;
  ssn: string;
  ein: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  availability247: boolean;
  categories: string[];
  customCategories: string[];
  regions: string[];
  defaultHourlyRate: number | '';
  paymentTerms: PaymentTerms;
  defaultPaymentMethod: PaymentMethod;
  tags: string[];
  email: string;
  bgvEnabled: boolean;
  bgvSchedule: BGVSchedule;
  formDocuments: VendorFormDocument[];
}

export const PREDEFINED_CATEGORIES = [
  'Maintenance/Repair', 'Plumbing', 'Electrical', 'HVAC', 'Cleaning',
  'Landscaping', 'Painting', 'Pest Control', 'Roofing', 'Legal',
  'Insurance', 'Supplies',
];

export const PREDEFINED_REGIONS = [
  'Downtown', 'Midtown', 'Uptown', 'East Side', 'West Side',
  'North District', 'South District', 'Suburban Area', 'Industrial Zone',
];

export const VENDOR_TAGS = ['Preferred', 'Emergency', 'Licensed', 'Insured', 'New'];

export const emptyVendorForm: VendorFormData = {
  vendorType: 'individual',
  firstName: '',
  lastName: '',
  companyName: '',
  contactPerson: '',
  phone: '',
  address: { street: '', city: '', state: '', zip: '' },
  ssn: '',
  ein: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  availability247: false,
  categories: [],
  customCategories: [],
  regions: [],
  defaultHourlyRate: '',
  paymentTerms: 'net_30',
  defaultPaymentMethod: 'ach',
  tags: [],
  email: '',
  bgvEnabled: true,
  bgvSchedule: 'one-time',
  formDocuments: [],
};

export function getVendorDisplayName(vendor: Vendor): string {
  return vendor.vendorType === 'company'
    ? vendor.companyName
    : `${vendor.firstName} ${vendor.lastName}`;
}
