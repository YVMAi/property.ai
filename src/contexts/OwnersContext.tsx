import React, { createContext, useContext, ReactNode } from 'react';
import { useOwners } from '@/hooks/useOwners';
import type { Owner, OwnerFormData } from '@/types/owner';

interface OwnersContextType {
  owners: Owner[];
  activeOwners: Owner[];
  archivedOwners: Owner[];
  addOwner: (data: OwnerFormData) => Owner;
  updateOwner: (id: string, data: Partial<OwnerFormData>) => void;
  toggleOwnerStatus: (id: string) => void;
  softDeleteOwner: (id: string) => void;
  restoreOwner: (id: string) => void;
  getOwnerById: (id: string) => Owner | undefined;
}

const OwnersContext = createContext<OwnersContextType | undefined>(undefined);

export function OwnersProvider({ children }: { children: ReactNode }) {
  const ownersData = useOwners();

  return (
    <OwnersContext.Provider value={ownersData}>
      {children}
    </OwnersContext.Provider>
  );
}

export function useOwnersContext() {
  const context = useContext(OwnersContext);
  if (!context) {
    throw new Error('useOwnersContext must be used within an OwnersProvider');
  }
  return context;
}
