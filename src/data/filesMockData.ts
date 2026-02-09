import type { DMSFolder, DMSFile, DMSTag } from '@/types/files';

export const MOCK_TAGS: DMSTag[] = [
  { id: 'tag-lease', name: 'Lease', color: 'bg-primary/20 text-primary-foreground' },
  { id: 'tag-w9', name: 'W-9', color: 'bg-secondary/20 text-secondary-foreground' },
  { id: 'tag-inspection', name: 'Inspection', color: 'bg-warning/20 text-warning-foreground' },
  { id: 'tag-invoice', name: 'Invoice', color: 'bg-destructive/20 text-destructive-foreground' },
  { id: 'tag-agreement', name: 'Agreement', color: 'bg-primary/20 text-primary-foreground' },
  { id: 'tag-urgent', name: 'Urgent', color: 'bg-destructive/30 text-destructive-foreground' },
  { id: 'tag-insurance', name: 'Insurance', color: 'bg-secondary/20 text-secondary-foreground' },
  { id: 'tag-photo', name: 'Photo', color: 'bg-accent text-accent-foreground' },
];

export const MOCK_FOLDERS: DMSFolder[] = [
  // Root
  { id: 'f-properties', name: 'Properties', parentId: null, path: 'Properties', createdAt: '2025-06-01' },
  { id: 'f-people', name: 'People', parentId: null, path: 'People', createdAt: '2025-06-01' },
  { id: 'f-global', name: 'Global / Shared', parentId: null, path: 'Global / Shared', createdAt: '2025-06-01' },
  { id: 'f-trash', name: 'Trash', parentId: null, path: 'Trash', createdAt: '2025-06-01', isTrash: true },

  // Properties sub
  { id: 'f-prop-123', name: '123 Main St', parentId: 'f-properties', path: 'Properties/123 Main St', createdAt: '2025-07-10', associatedEntityType: 'property', associatedEntityId: 'prop-1' },
  { id: 'f-prop-123-leases', name: 'Leases', parentId: 'f-prop-123', path: 'Properties/123 Main St/Leases', createdAt: '2025-07-10' },
  { id: 'f-prop-123-photos', name: 'Photos', parentId: 'f-prop-123', path: 'Properties/123 Main St/Photos', createdAt: '2025-07-10' },
  { id: 'f-prop-123-maint', name: 'Maintenance', parentId: 'f-prop-123', path: 'Properties/123 Main St/Maintenance', createdAt: '2025-07-12' },
  { id: 'f-prop-456', name: '456 Oak Ave', parentId: 'f-properties', path: 'Properties/456 Oak Ave', createdAt: '2025-08-01', associatedEntityType: 'property', associatedEntityId: 'prop-2' },
  { id: 'f-prop-456-leases', name: 'Leases', parentId: 'f-prop-456', path: 'Properties/456 Oak Ave/Leases', createdAt: '2025-08-01' },

  // People sub
  { id: 'f-owners', name: 'Owners', parentId: 'f-people', path: 'People/Owners', createdAt: '2025-06-01' },
  { id: 'f-tenants', name: 'Tenants', parentId: 'f-people', path: 'People/Tenants', createdAt: '2025-06-01' },
  { id: 'f-vendors', name: 'Vendors', parentId: 'f-people', path: 'People/Vendors', createdAt: '2025-06-01' },
  { id: 'f-owner-john', name: 'John Smith', parentId: 'f-owners', path: 'People/Owners/John Smith', createdAt: '2025-06-15', associatedEntityType: 'owner', associatedEntityId: 'owner-1' },
  { id: 'f-tenant-jane', name: 'Jane Doe', parentId: 'f-tenants', path: 'People/Tenants/Jane Doe', createdAt: '2025-07-01', associatedEntityType: 'tenant', associatedEntityId: 'tenant-1' },
  { id: 'f-vendor-abc', name: 'ABC Plumbing', parentId: 'f-vendors', path: 'People/Vendors/ABC Plumbing', createdAt: '2025-07-20', associatedEntityType: 'vendor', associatedEntityId: 'vendor-1' },

  // Global sub
  { id: 'f-templates', name: 'Templates', parentId: 'f-global', path: 'Global / Shared/Templates', createdAt: '2025-06-01' },
  { id: 'f-policies', name: 'Company Policies', parentId: 'f-global', path: 'Global / Shared/Company Policies', createdAt: '2025-06-01' },
  { id: 'f-insurance', name: 'Insurance Docs', parentId: 'f-global', path: 'Global / Shared/Insurance Docs', createdAt: '2025-06-01' },
];

export const MOCK_FILES: DMSFile[] = [
  // 123 Main St / Leases
  { id: 'file-1', folderId: 'f-prop-123-leases', name: 'Lease_Agreement_2025.pdf', size: 2450000, mimeType: 'application/pdf', fileType: 'pdf', uploadDate: '2025-07-15', lastModified: '2025-07-15', tags: ['tag-lease', 'tag-agreement'], version: 1 },
  { id: 'file-2', folderId: 'f-prop-123-leases', name: 'Lease_Addendum_Pets.pdf', size: 580000, mimeType: 'application/pdf', fileType: 'pdf', uploadDate: '2025-08-02', lastModified: '2025-08-02', tags: ['tag-lease'], version: 1 },

  // 123 Main St / Photos
  { id: 'file-3', folderId: 'f-prop-123-photos', name: 'Front_Exterior.jpg', size: 3200000, mimeType: 'image/jpeg', fileType: 'image', uploadDate: '2025-07-11', lastModified: '2025-07-11', tags: ['tag-photo'], version: 1 },
  { id: 'file-4', folderId: 'f-prop-123-photos', name: 'Kitchen_Renovation.png', size: 4100000, mimeType: 'image/png', fileType: 'image', uploadDate: '2025-09-20', lastModified: '2025-09-20', tags: ['tag-photo', 'tag-inspection'], version: 2 },

  // 123 Main St / Maintenance
  { id: 'file-5', folderId: 'f-prop-123-maint', name: 'HVAC_Inspection_Report.pdf', size: 1200000, mimeType: 'application/pdf', fileType: 'pdf', uploadDate: '2025-10-05', lastModified: '2025-10-05', tags: ['tag-inspection'], version: 1 },

  // 456 Oak Ave / Leases
  { id: 'file-6', folderId: 'f-prop-456-leases', name: 'Lease_2025_Unit_A.pdf', size: 1800000, mimeType: 'application/pdf', fileType: 'pdf', uploadDate: '2025-08-10', lastModified: '2025-08-10', tags: ['tag-lease'], version: 1 },

  // Owner John Smith
  { id: 'file-7', folderId: 'f-owner-john', name: 'W9_JohnSmith.pdf', size: 340000, mimeType: 'application/pdf', fileType: 'pdf', uploadDate: '2025-06-20', lastModified: '2025-06-20', tags: ['tag-w9'], version: 1 },
  { id: 'file-8', folderId: 'f-owner-john', name: 'Management_Agreement.pdf', size: 1500000, mimeType: 'application/pdf', fileType: 'pdf', uploadDate: '2025-06-22', lastModified: '2025-06-22', tags: ['tag-agreement'], version: 1 },

  // Tenant Jane Doe
  { id: 'file-9', folderId: 'f-tenant-jane', name: 'ID_Verification.jpg', size: 920000, mimeType: 'image/jpeg', fileType: 'image', uploadDate: '2025-07-03', lastModified: '2025-07-03', tags: [], version: 1 },
  { id: 'file-10', folderId: 'f-tenant-jane', name: 'Rental_Application.pdf', size: 680000, mimeType: 'application/pdf', fileType: 'pdf', uploadDate: '2025-07-02', lastModified: '2025-07-02', tags: ['tag-agreement'], version: 1 },

  // Vendor ABC Plumbing
  { id: 'file-11', folderId: 'f-vendor-abc', name: 'Insurance_Certificate.pdf', size: 750000, mimeType: 'application/pdf', fileType: 'pdf', uploadDate: '2025-07-25', lastModified: '2025-07-25', tags: ['tag-insurance'], version: 1 },
  { id: 'file-12', folderId: 'f-vendor-abc', name: 'Invoice_Oct2025.pdf', size: 280000, mimeType: 'application/pdf', fileType: 'pdf', uploadDate: '2025-10-30', lastModified: '2025-10-30', tags: ['tag-invoice'], version: 1 },

  // Global templates
  { id: 'file-13', folderId: 'f-templates', name: 'Lease_Template_v3.docx', size: 450000, mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', fileType: 'document', uploadDate: '2025-06-05', lastModified: '2025-11-01', tags: ['tag-lease'], version: 3 },
  { id: 'file-14', folderId: 'f-templates', name: 'Inspection_Checklist.xlsx', size: 120000, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', fileType: 'spreadsheet', uploadDate: '2025-06-10', lastModified: '2025-06-10', tags: ['tag-inspection'], version: 1 },

  // Policies
  { id: 'file-15', folderId: 'f-policies', name: 'Pet_Policy.pdf', size: 310000, mimeType: 'application/pdf', fileType: 'pdf', uploadDate: '2025-06-02', lastModified: '2025-06-02', tags: [], version: 1 },

  // Insurance
  { id: 'file-16', folderId: 'f-insurance', name: 'Liability_Insurance_2025.pdf', size: 2100000, mimeType: 'application/pdf', fileType: 'pdf', uploadDate: '2025-01-15', lastModified: '2025-01-15', tags: ['tag-insurance'], version: 1 },

  // Trash
  { id: 'file-17', folderId: 'f-trash', name: 'Old_Lease_Draft.pdf', size: 900000, mimeType: 'application/pdf', fileType: 'pdf', uploadDate: '2025-05-01', lastModified: '2025-12-01', tags: ['tag-lease'], version: 1, isDeleted: true },
];
