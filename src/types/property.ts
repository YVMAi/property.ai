export type PropertyType =
  | 'single_family'
  | 'multi_family'
  | 'student_housing'
  | 'affordable_single'
  | 'affordable_multi'
  | 'commercial';

export type PropertyStatus = 'active' | 'vacant' | 'under_maintenance' | 'for_sale' | 'deleted';

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  single_family: 'Single Family',
  multi_family: 'Multi-Family Housing',
  student_housing: 'Student Housing',
  affordable_single: 'Affordable Housing - Single Family',
  affordable_multi: 'Affordable Housing - Multi-Family',
  commercial: 'Commercial',
};

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  active: 'Active',
  vacant: 'Vacant',
  under_maintenance: 'Under Maintenance',
  for_sale: 'For Sale',
  deleted: 'Deleted',
};

export const STATUS_COLORS: Record<PropertyStatus, string> = {
  active: 'bg-secondary text-secondary-foreground',
  vacant: 'bg-warning text-warning-foreground',
  under_maintenance: 'bg-[hsl(30,60%,75%)] text-[hsl(30,60%,25%)]',
  for_sale: 'bg-destructive text-destructive-foreground',
  deleted: 'bg-muted text-muted-foreground',
};

export interface PropertyAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export type UnitType = 'studio' | '1bhk' | '2bhk' | '3bhk' | '4bhk';

export const UNIT_TYPE_LABELS: Record<UnitType, string> = {
  studio: 'Studio',
  '1bhk': '1 BHK',
  '2bhk': '2 BHK',
  '3bhk': '3 BHK',
  '4bhk': '4 BHK',
};

export interface PropertyUnit {
  id: string;
  unitNumber: string;
  size: number;
  bedrooms: number;
  bathrooms: number;
  unitType?: UnitType; // for multi-family
  isShared?: boolean; // for student housing
  independentWashroom?: boolean; // for student housing
  unitAmenities?: string[]; // for student housing
}

export interface PropertyDocument {
  id: string;
  fileName: string;
  fileUrl: string;
  tags: string[];
  uploadedAt: string;
}

export interface PropertyLease {
  id: string;
  propertyId: string;
  unitId?: string;
  tenantName: string;
  tenantId?: string;
  rent: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'pending';
}

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  address: PropertyAddress;
  sqFt: number;
  yearBuilt: number;
  purchasePrice: number;
  purchaseDate: string;
  description: string;
  photos: string[];
  status: PropertyStatus;
  ownerId: string;
  mapCoords: { lat: number; lng: number };
  // Type-specific
  bedrooms?: number;
  bathrooms?: number;
  amenities: string[];
  hoaFees?: number;
  taxes?: number;
  insurance?: number;
  // Sub-units
  units: PropertyUnit[];
  // Leases
  leases: PropertyLease[];
  // Documents
  documents: PropertyDocument[];
  // Agreements (linked from owner)
  agreementIds: string[];
  // Market comparison
  marketRentAvg?: number;
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface PropertyFormData {
  name: string;
  type: PropertyType;
  address: PropertyAddress;
  sqFt: number | '';
  yearBuilt: number | '';
  purchasePrice: number | '';
  purchaseDate: string;
  description: string;
  photos: string[];
  ownerId: string;
  bedrooms?: number | '';
  bathrooms?: number | '';
  amenities: string[];
  hoaFees?: number | '';
  taxes?: number | '';
  insurance?: number | '';
  units: Omit<PropertyUnit, 'id'>[];
  agreementIds: string[];
  marketRentAvg?: number | '';
}

// Monthly mock data for charts
export interface MonthlyMetric {
  month: string;
  value: number;
}
