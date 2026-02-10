import React, { createContext, useContext, ReactNode } from 'react';
import { useVendors } from '@/hooks/useVendors';
import type { Vendor, VendorFormData, VendorStatus, VendorBGVReport } from '@/types/vendor';

interface VendorsContextType {
  vendors: Vendor[];
  activeVendors: Vendor[];
  archivedVendors: Vendor[];
  blacklistedVendors: Vendor[];
  getAllEmails: (excludeId?: string) => string[];
  addVendor: (data: VendorFormData) => Vendor;
  updateVendor: (id: string, data: Partial<VendorFormData>) => void;
  changeStatus: (id: string, status: VendorStatus) => void;
  softDeleteVendor: (id: string) => boolean;
  restoreVendor: (id: string) => void;
  getVendorById: (id: string) => Vendor | undefined;
  updateNotes: (id: string, notes: string) => void;
  runBGV: (id: string) => VendorBGVReport;
  resendInvite: (id: string) => void;
  assignWorkOrder: (vendorId: string, wo: { propertyName: string; description: string; dueDate: string }) => { id: string };
}

const VendorsContext = createContext<VendorsContextType | undefined>(undefined);

export function VendorsProvider({ children }: { children: ReactNode }) {
  const vendorsData = useVendors();
  return (
    <VendorsContext.Provider value={vendorsData}>
      {children}
    </VendorsContext.Provider>
  );
}

export function useVendorsContext() {
  const context = useContext(VendorsContext);
  if (!context) {
    throw new Error('useVendorsContext must be used within a VendorsProvider');
  }
  return context;
}
