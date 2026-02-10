import React, { createContext, useContext, ReactNode } from 'react';
import { useProperties } from '@/hooks/useProperties';
import type { Property, PropertyFormData, PropertyStatus } from '@/types/property';

interface PropertiesContextType {
  properties: Property[];
  activeProperties: Property[];
  archivedProperties: Property[];
  addProperty: (data: PropertyFormData) => Property;
  updateProperty: (id: string, data: Partial<PropertyFormData>) => void;
  changeStatus: (id: string, status: PropertyStatus) => void;
  softDeleteProperty: (id: string) => void;
  restoreProperty: (id: string) => void;
  getPropertyById: (id: string) => Property | undefined;
  getPropertiesByOwner: (ownerId: string) => Property[];
}

const PropertiesContext = createContext<PropertiesContextType | undefined>(undefined);

export function PropertiesProvider({ children }: { children: ReactNode }) {
  const data = useProperties();
  return <PropertiesContext.Provider value={data}>{children}</PropertiesContext.Provider>;
}

export function usePropertiesContext() {
  const ctx = useContext(PropertiesContext);
  if (!ctx) throw new Error('usePropertiesContext must be used within PropertiesProvider');
  return ctx;
}
