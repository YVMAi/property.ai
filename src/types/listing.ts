export type ListingStatus = 'draft' | 'active' | 'inactive' | 'expired';

export const LISTING_STATUS_CONFIG: Record<ListingStatus, { label: string; badgeClass: string; color: string }> = {
  draft: { label: 'Draft', badgeClass: 'bg-muted text-muted-foreground', color: 'text-muted-foreground' },
  active: { label: 'Active', badgeClass: 'bg-secondary text-secondary-foreground', color: 'text-secondary' },
  inactive: { label: 'Inactive', badgeClass: 'bg-warning/20 text-warning-foreground', color: 'text-warning' },
  expired: { label: 'Expired', badgeClass: 'bg-destructive/15 text-destructive', color: 'text-destructive' },
};

export interface ListingAmenity {
  name: string;
  included: boolean;
}

export interface ListingFee {
  id: string;
  type: 'application' | 'pet' | 'parking' | 'cleaning' | 'late' | 'admin' | 'other';
  label: string;
  amount: number;
  frequency: 'one_time' | 'monthly';
  required: boolean;
}

export interface TenantCriteria {
  minCreditScore: number;
  incomeRatio: number;
  noEvictions: boolean;
  backgroundCheck: boolean;
  petPolicy: 'allowed' | 'not_allowed' | 'case_by_case';
  smokingAllowed: boolean;
  maxOccupants: number;
}

export type LeaseType = 'month_to_month' | 'fixed_6' | 'fixed_12' | 'fixed_24';

export const LEASE_TYPE_LABELS: Record<LeaseType, string> = {
  month_to_month: 'Month-to-Month',
  fixed_6: 'Fixed Term — 6 Months',
  fixed_12: 'Fixed Term — 12 Months',
  fixed_24: 'Fixed Term — 24 Months',
};

export const LEASE_TYPE_DESCRIPTIONS: Record<LeaseType, string> = {
  month_to_month: 'Flexible but higher turnover. Tenant can leave with 30 days notice.',
  fixed_6: 'Short commitment. Good for seasonal or transitional tenants.',
  fixed_12: 'Standard annual lease. Most common for residential properties.',
  fixed_24: 'Long-term stability. Lower turnover risk with guaranteed occupancy.',
};

export const FEE_TYPE_LABELS: Record<ListingFee['type'], string> = {
  application: 'Application Fee',
  pet: 'Pet Fee',
  parking: 'Parking Fee',
  cleaning: 'Cleaning Fee',
  late: 'Late Payment Fee',
  admin: 'Admin Fee',
  other: 'Other',
};

export const PROPERTY_AMENITIES_OPTIONS = [
  'Pool', 'Gym', 'Parking', 'Laundry', 'Elevator', 'Balcony',
  'Rooftop', 'Doorman', 'Storage', 'Bike Room', 'Garden', 'BBQ Area',
  'Package Locker', 'EV Charging', 'Playground',
];

export const UNIT_AMENITIES_OPTIONS = [
  'Kitchen Appliances', 'Air Conditioning', 'Furnished', 'View',
  'In-Unit Washer/Dryer', 'Dishwasher', 'Hardwood Floors', 'Walk-In Closet',
  'Fireplace', 'Private Entrance', 'Patio/Deck', 'Ceiling Fan',
];

export type InquiryType = 'question' | 'tour' | 'application';
export type InquiryStatus = 'pending' | 'responded' | 'converted' | 'rejected';

export interface ListingInquiry {
  id: string;
  listingId: string;
  date: string;
  leadName: string;
  leadEmail: string;
  leadPhone?: string;
  message: string;
  type: InquiryType;
  status: InquiryStatus;
  scheduledDate?: string; // for tour requests
  linkedTaskId?: string;
  linkedLeaseId?: string;
}

export interface StatusHistoryEntry {
  date: string;
  from: ListingStatus;
  to: ListingStatus;
  note?: string;
}

export interface ListingRecord {
  id: string;
  propertyId: string;
  propertyName: string;
  unitId: string;
  unitLabel: string;
  platform: string;
  status: ListingStatus;
  postedDate: string;
  expiryDate: string | null;
  views: number;
  rent: number;
  securityDeposit: number;
  inquiries: ListingInquiry[];
  statusHistory: StatusHistoryEntry[];
  lastStatusChange: string;
}

export interface ListingFormData {
  // Step 1
  propertyId: string;
  unitId: string;
  bulkUnitIds: string[];

  // Step 2
  propertyAmenities: ListingAmenity[];
  locationDescription: string;
  propertyPhotos: string[];

  // Step 3
  unitAmenities: ListingAmenity[];
  unitLocationNotes: string;
  unitPhotos: string[];

  // Step 4
  tenantCriteria: TenantCriteria;
  houseRules: string;

  // Step 5
  rentalAmount: number | '';
  aiSuggestedRent: number | null;
  securityDeposit: number | '';
  depositDueOn: 'move_in' | 'application';
  fees: ListingFee[];

  // Step 6
  leaseType: LeaseType;
  availableFrom: string;
  minTermMonths: number;
  maxTermMonths: number;

  // Step 7 - Status
  listingStatus: ListingStatus;
  expiryDate: string;
}

export const DEFAULT_TENANT_CRITERIA: TenantCriteria = {
  minCreditScore: 650,
  incomeRatio: 3,
  noEvictions: true,
  backgroundCheck: true,
  petPolicy: 'case_by_case',
  smokingAllowed: false,
  maxOccupants: 4,
};

export const EMPTY_LISTING_FORM: ListingFormData = {
  propertyId: '',
  unitId: '',
  bulkUnitIds: [],
  propertyAmenities: [],
  locationDescription: '',
  propertyPhotos: [],
  unitAmenities: [],
  unitLocationNotes: '',
  unitPhotos: [],
  tenantCriteria: { ...DEFAULT_TENANT_CRITERIA },
  houseRules: '',
  rentalAmount: '',
  aiSuggestedRent: null,
  securityDeposit: '',
  depositDueOn: 'move_in',
  fees: [],
  leaseType: 'fixed_12',
  availableFrom: '',
  minTermMonths: 12,
  maxTermMonths: 12,
  listingStatus: 'draft',
  expiryDate: '',
};

// --- Mock Data ---
export const MOCK_LISTINGS: ListingRecord[] = [
  {
    id: 'lst-1', propertyId: 'p1', propertyName: 'Oakwood Apartments', unitId: 'u101', unitLabel: 'Unit 101',
    platform: 'Zillow', status: 'active', postedDate: '2026-01-15', expiryDate: '2026-03-15',
    views: 234, rent: 1800, securityDeposit: 1800, lastStatusChange: '2026-01-15',
    inquiries: [
      { id: 'inq-1', listingId: 'lst-1', date: '2026-02-01', leadName: 'Sarah Chen', leadEmail: 'sarah@email.com', message: 'Interested in viewing this unit. Is Saturday available?', type: 'tour', status: 'pending' },
      { id: 'inq-2', listingId: 'lst-1', date: '2026-02-05', leadName: 'Mike Johnson', leadEmail: 'mike@email.com', message: 'Available for move-in March 1st?', type: 'question', status: 'responded' },
      { id: 'inq-3', listingId: 'lst-1', date: '2026-02-08', leadName: 'Emily Davis', leadEmail: 'emily@email.com', message: 'I would like to submit an application for this unit.', type: 'application', status: 'pending' },
    ],
    statusHistory: [
      { date: '2026-01-10', from: 'draft', to: 'active', note: 'Published to Zillow' },
    ],
  },
  {
    id: 'lst-2', propertyId: 'p2', propertyName: 'Maple Heights', unitId: 'u205', unitLabel: 'Unit 205',
    platform: 'Zillow', status: 'draft', postedDate: '', expiryDate: null,
    views: 0, rent: 2200, securityDeposit: 2200, lastStatusChange: '2026-02-01',
    inquiries: [],
    statusHistory: [],
  },
  {
    id: 'lst-3', propertyId: 'p3', propertyName: 'Downtown Commercial', unitId: 'sa', unitLabel: 'Suite A',
    platform: 'Zillow', status: 'active', postedDate: '2026-01-20', expiryDate: '2026-04-20',
    views: 89, rent: 3500, securityDeposit: 3500, lastStatusChange: '2026-01-20',
    inquiries: [
      { id: 'inq-4', listingId: 'lst-3', date: '2026-02-08', leadName: 'Lisa Park', leadEmail: 'lisa@corp.com', leadPhone: '555-0199', message: 'Need office space ASAP. Can we schedule a tour this week?', type: 'tour', status: 'pending' },
    ],
    statusHistory: [
      { date: '2026-01-18', from: 'draft', to: 'active', note: 'Published to Zillow' },
    ],
  },
  {
    id: 'lst-4', propertyId: 'p1', propertyName: 'Oakwood Apartments', unitId: 'u102', unitLabel: 'Unit 102',
    platform: 'Zillow', status: 'inactive', postedDate: '2025-12-01', expiryDate: null,
    views: 156, rent: 1650, securityDeposit: 1650, lastStatusChange: '2026-01-25',
    inquiries: [
      { id: 'inq-5', listingId: 'lst-4', date: '2025-12-15', leadName: 'Tom Wilson', leadEmail: 'tom@email.com', message: 'Is this pet friendly?', type: 'question', status: 'responded' },
    ],
    statusHistory: [
      { date: '2025-12-01', from: 'draft', to: 'active', note: 'Published' },
      { date: '2026-01-25', from: 'active', to: 'inactive', note: 'Paused by manager' },
    ],
  },
  {
    id: 'lst-5', propertyId: 'p2', propertyName: 'Maple Heights', unitId: 'u301', unitLabel: 'Unit 301',
    platform: 'Zillow', status: 'expired', postedDate: '2025-10-15', expiryDate: '2026-01-15',
    views: 312, rent: 1950, securityDeposit: 1950, lastStatusChange: '2026-01-15',
    inquiries: [
      { id: 'inq-6', listingId: 'lst-5', date: '2025-11-01', leadName: 'Jane Smith', leadEmail: 'jane@email.com', message: 'I would like to apply.', type: 'application', status: 'converted' },
    ],
    statusHistory: [
      { date: '2025-10-15', from: 'draft', to: 'active', note: 'Published' },
      { date: '2026-01-15', from: 'active', to: 'expired', note: 'Auto-expired' },
    ],
  },
];
