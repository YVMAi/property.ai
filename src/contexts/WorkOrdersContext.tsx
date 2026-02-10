import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useWorkOrders } from '@/hooks/useWorkOrders';

type WorkOrdersContextType = ReturnType<typeof useWorkOrders>;

const WorkOrdersContext = createContext<WorkOrdersContextType | undefined>(undefined);

export function WorkOrdersProvider({ children }: { children: ReactNode }) {
  const data = useWorkOrders();
  return <WorkOrdersContext.Provider value={data}>{children}</WorkOrdersContext.Provider>;
}

export function useWorkOrdersContext() {
  const ctx = useContext(WorkOrdersContext);
  if (!ctx) throw new Error('useWorkOrdersContext must be used within a WorkOrdersProvider');
  return ctx;
}
