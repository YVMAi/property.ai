export interface ListingAmenity {
  name: string;
  included: boolean; // true = included, false = paid extra
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
  incomeRatio: number; // e.g. 3 = 3x rent
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

export interface ListingFormData {
  // Step 1
  propertyId: string;
  unitId: string;
  bulkUnitIds: string[];

  // Step 2 - Property details (overrides for listing)
  propertyAmenities: ListingAmenity[];
  locationDescription: string;
  propertyPhotos: string[];

  // Step 3 - Unit details
  unitAmenities: ListingAmenity[];
  unitLocationNotes: string;
  unitPhotos: string[];

  // Step 4 - Tenant criteria
  tenantCriteria: TenantCriteria;
  houseRules: string;

  // Step 5 - Rental & Fees
  rentalAmount: number | '';
  aiSuggestedRent: number | null;
  securityDeposit: number | '';
  depositDueOn: 'move_in' | 'application';
  fees: ListingFee[];

  // Step 6 - Lease type & availability
  leaseType: LeaseType;
  availableFrom: string;
  minTermMonths: number;
  maxTermMonths: number;
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
};
