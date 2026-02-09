export type FileType = 'pdf' | 'image' | 'document' | 'spreadsheet' | 'other';
export type AssociatedEntityType = 'property' | 'owner' | 'tenant' | 'vendor';

export interface DMSTag {
  id: string;
  name: string;
  color: string; // tailwind class or hex
}

export interface DMSFolder {
  id: string;
  name: string;
  parentId: string | null;
  path: string; // breadcrumb path e.g. "Properties/123 Main St/Leases"
  createdAt: string;
  associatedEntityType?: AssociatedEntityType;
  associatedEntityId?: string;
  isTrash?: boolean;
}

export interface DMSFile {
  id: string;
  folderId: string;
  name: string;
  size: number; // bytes
  mimeType: string;
  fileType: FileType;
  uploadDate: string;
  lastModified: string;
  tags: string[]; // tag ids
  associatedEntityType?: AssociatedEntityType;
  associatedEntityId?: string;
  version: number;
  isDeleted?: boolean;
  url?: string; // placeholder
}
