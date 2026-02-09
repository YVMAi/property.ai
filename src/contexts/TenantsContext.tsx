import React, { createContext, useContext, ReactNode } from 'react';
import { useTenants } from '@/hooks/useTenants';
import type { Tenant, TenantFormData, BGVReport } from '@/types/tenant';

interface TenantsContextType {
  tenants: Tenant[];
  activeTenants: Tenant[];
  archivedTenants: Tenant[];
  deletedTenants: Tenant[];
  getAllEmails: (excludeId?: string) => string[];
  addTenant: (data: TenantFormData) => Tenant;
  updateTenant: (id: string, data: Partial<TenantFormData>) => void;
  toggleTenantStatus: (id: string) => void;
  softDeleteTenant: (id: string) => void;
  restoreTenant: (id: string) => void;
  getTenantById: (id: string) => Tenant | undefined;
  updateNotes: (id: string, notes: string) => void;
  runBGV: (id: string) => BGVReport;
  resendInvite: (id: string) => void;
}

const TenantsContext = createContext<TenantsContextType | undefined>(undefined);

export function TenantsProvider({ children }: { children: ReactNode }) {
  const tenantsData = useTenants();
  return (
    <TenantsContext.Provider value={tenantsData}>
      {children}
    </TenantsContext.Provider>
  );
}

export function useTenantsContext() {
  const context = useContext(TenantsContext);
  if (!context) {
    throw new Error('useTenantsContext must be used within a TenantsProvider');
  }
  return context;
}
