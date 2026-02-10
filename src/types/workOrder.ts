export type WOPriority = 'low' | 'medium' | 'high' | 'urgent' | 'emergency';
export type ServiceRequestStatus = 'pending' | 'approved' | 'rejected';
export type RFPStatus = 'open' | 'awarded' | 'closed';
export type WorkOrderStatus = 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export const WO_PRIORITY_LABELS: Record<WOPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
  emergency: 'Emergency',
};

export const WO_PRIORITY_COLORS: Record<WOPriority, string> = {
  low: 'bg-secondary text-secondary-foreground',
  medium: 'bg-primary text-primary-foreground',
  high: 'bg-warning text-warning-foreground',
  urgent: 'bg-destructive text-destructive-foreground',
  emergency: 'bg-destructive text-destructive-foreground',
};

export const SERVICE_REQUEST_STATUS_LABELS: Record<ServiceRequestStatus, string> = {
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const RFP_STATUS_LABELS: Record<RFPStatus, string> = {
  open: 'Open',
  awarded: 'Awarded',
  closed: 'Closed',
};

export const WO_STATUS_LABELS: Record<WorkOrderStatus, string> = {
  open: 'Open',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const WO_STATUS_COLORS: Record<WorkOrderStatus, string> = {
  open: 'bg-primary/20 text-primary-foreground',
  assigned: 'bg-warning/30 text-warning-foreground',
  in_progress: 'bg-primary text-primary-foreground',
  completed: 'bg-secondary text-secondary-foreground',
  cancelled: 'bg-muted text-muted-foreground',
};

export type RequestHistoryAction = 'submitted' | 'note_added' | 'status_changed' | 'communication_sent' | 'attachment_added';

export interface RequestHistoryEntry {
  id: string;
  requestId: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: 'pm' | 'tenant' | 'admin';
  action: RequestHistoryAction;
  details: string;
  reason?: string;
}

export const RESOLUTION_TARGET_HOURS: Record<WOPriority, number> = {
  emergency: 4,
  urgent: 24,
  high: 48,
  medium: 72,
  low: 168,
};

export const SR_CATEGORIES = [
  'Plumbing', 'Electrical', 'HVAC', 'Appliance', 'Structural',
  'Pest Control', 'Locks & Keys', 'Painting', 'Flooring', 'Other',
];

export interface ServiceRequest {
  id: string;
  propertyId: string;
  propertyName: string;
  unitId?: string;
  unitNumber?: string;
  tenantId: string;
  tenantName: string;
  tenantEmail?: string;
  tenantPhone?: string;
  description: string;
  category?: string;
  priority: WOPriority;
  status: ServiceRequestStatus;
  attachments: string[];
  rejectionReason?: string;
  rejectionNotes?: string;
  notes: string;
  history: RequestHistoryEntry[];
  linkedRFPId?: string;
  linkedWOId?: string;
  createdAt: string;
}

export interface RFPVendorQuote {
  vendorId: string;
  vendorName: string;
  status: 'pending' | 'accepted' | 'declined';
  estimatedCost?: number;
  estimatedDays?: number;
  submittedAt?: string;
}

export interface RFP {
  id: string;
  requestId: string;
  description: string;
  propertyId: string;
  propertyName: string;
  unitId?: string;
  unitNumber?: string;
  priority: WOPriority;
  status: RFPStatus;
  attachments: string[];
  vendorQuotes: RFPVendorQuote[];
  selectedVendorId?: string;
  createdAt: string;
}

export interface WOHistoryEntry {
  id: string;
  workOrderId: string;
  statusFrom?: string;
  statusTo: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: 'pm' | 'vendor' | 'tenant';
  notes?: string;
}

export interface WorkOrder {
  id: string;
  rfpId?: string;
  requestId?: string;
  propertyId: string;
  propertyName: string;
  unitId?: string;
  unitNumber?: string;
  description: string;
  priority: WOPriority;
  vendorId?: string;
  vendorName?: string;
  vendorAccepted?: boolean;
  status: WorkOrderStatus;
  estimatedCost: number;
  actualCost?: number;
  dueDate: string;
  completionPhotos: string[];
  tenantVerificationPhoto?: string;
  tenantVerified?: boolean;
  ownerApprovalNeeded: boolean;
  ownerApproved?: boolean;
  ownerId?: string;
  ownerName?: string;
  attachments: string[];
  notes: string;
  history: WOHistoryEntry[];
  invoiceUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrderFormData {
  propertyId: string;
  unitId?: string;
  description: string;
  priority: WOPriority;
  estimatedCost: number | '';
  dueDate: string;
  vendorId?: string;
  attachments: string[];
}
