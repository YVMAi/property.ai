import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  SuperAdmin, SuperAdminRole, PMC, PMCStatus, SystemLog, LogType, LogSeverity,
  SubscriptionPlanType, PMCFeatureToggles, SUBSCRIPTION_PLANS
} from '@/types/superAdmin';

interface SuperAdminContextType {
  superAdmin: SuperAdmin | null;
  superAdmins: SuperAdmin[];
  pmcs: PMC[];
  logs: SystemLog[];
  addPMC: (pmc: Omit<PMC, 'id' | 'createdAt' | 'usersUsed' | 'storageUsedGB' | 'revenueYTD' | 'lastActivity'>) => void;
  updatePMC: (id: string, updates: Partial<PMC>) => void;
  deletePMC: (id: string) => void;
  updatePMCStatus: (id: string, status: PMCStatus) => void;
  addSuperAdmin: (admin: Omit<SuperAdmin, 'id' | 'createdAt'>) => void;
  removeSuperAdmin: (id: string) => void;
  getLogsByPMC: (pmcId: string) => SystemLog[];
  getFilteredLogs: (filters: { pmcId?: string; type?: LogType; severity?: LogSeverity; search?: string }) => SystemLog[];
  totalRevenue: number;
  totalUsers: number;
}

const SuperAdminContext = createContext<SuperAdminContextType | undefined>(undefined);

const DEMO_SUPER_ADMINS: SuperAdmin[] = [
  { id: 'sa-1', email: 'super@pmshq.com', name: 'System Administrator', role: 'full_access', createdAt: '2024-01-01', lastLogin: '2026-02-16' },
  { id: 'sa-2', email: 'viewer@pmshq.com', name: 'Log Viewer', role: 'viewer', createdAt: '2025-06-01' },
];

const DEMO_PMCS: PMC[] = [
  {
    id: 'pmc-1', name: 'Skyline Property Group', address: '123 Main St, New York, NY 10001',
    adminEmail: 'admin@skylinepg.com', subscriptionPlan: 'pro_max', customDomain: 'skyline.mypms.com',
    timezone: 'America/New_York', locale: 'en-US', userLimit: -1, usersUsed: 42, storageQuotaGB: 200,
    storageUsedGB: 87, featureToggles: { aiChat: true, zillowIntegration: true, multiCurrency: true, customReports: true, advancedAnalytics: true, apiAccess: true },
    complianceLevel: 'advanced', currency: 'USD', status: 'active', revenueYTD: 28500, lastActivity: '2026-02-16', createdAt: '2024-03-15',
  },
  {
    id: 'pmc-2', name: 'Greenfield Realty', address: '456 Oak Ave, Chicago, IL 60601',
    adminEmail: 'admin@greenfield.com', subscriptionPlan: 'pro',
    timezone: 'America/Chicago', locale: 'en-US', userLimit: 25, usersUsed: 18, storageQuotaGB: 50,
    storageUsedGB: 22, featureToggles: { aiChat: true, zillowIntegration: true, multiCurrency: false, customReports: true, advancedAnalytics: false, apiAccess: false },
    complianceLevel: 'basic', currency: 'USD', status: 'active', revenueYTD: 11880, lastActivity: '2026-02-15', createdAt: '2024-08-01',
  },
  {
    id: 'pmc-3', name: 'Harbor View Mgmt', address: '789 Beach Rd, Miami, FL 33101',
    adminEmail: 'admin@harborview.com', subscriptionPlan: 'basic',
    timezone: 'America/New_York', locale: 'en-US', userLimit: 5, usersUsed: 4, storageQuotaGB: 10,
    storageUsedGB: 3, featureToggles: { aiChat: false, zillowIntegration: false, multiCurrency: false, customReports: false, advancedAnalytics: false, apiAccess: false },
    complianceLevel: 'basic', currency: 'USD', status: 'trial', revenueYTD: 0, lastActivity: '2026-02-14', createdAt: '2026-01-10',
  },
  {
    id: 'pmc-4', name: 'Summit Estates LLC', address: '321 Peak Dr, Denver, CO 80202',
    adminEmail: 'admin@summit.com', subscriptionPlan: 'pro',
    timezone: 'America/Denver', locale: 'en-US', userLimit: 25, usersUsed: 12, storageQuotaGB: 50,
    storageUsedGB: 15, featureToggles: { aiChat: true, zillowIntegration: false, multiCurrency: false, customReports: true, advancedAnalytics: false, apiAccess: false },
    complianceLevel: 'basic', currency: 'USD', status: 'suspended', revenueYTD: 5940, lastActivity: '2026-01-28', createdAt: '2025-02-20',
  },
];

const DEMO_LOGS: SystemLog[] = [
  { id: 'log-1', date: '2026-02-16T09:30:00', pmcId: 'pmc-1', pmcName: 'Skyline Property Group', userId: 'u-1', userName: 'Admin User', type: 'login', severity: 'info', details: 'Successful login from 192.168.1.1' },
  { id: 'log-2', date: '2026-02-16T08:15:00', pmcId: 'pmc-2', pmcName: 'Greenfield Realty', type: 'payment', severity: 'info', details: 'Monthly subscription payment of $99 processed' },
  { id: 'log-3', date: '2026-02-15T22:00:00', pmcId: 'pmc-4', pmcName: 'Summit Estates LLC', type: 'payment', severity: 'error', details: 'Payment failed – card declined. Account suspended.' },
  { id: 'log-4', date: '2026-02-15T14:30:00', pmcId: 'pmc-1', pmcName: 'Skyline Property Group', userId: 'u-3', userName: 'Jane Doe', type: 'data_edit', severity: 'info', details: 'Updated property "Downtown Lofts" address field' },
  { id: 'log-5', date: '2026-02-15T11:00:00', pmcId: 'pmc-3', pmcName: 'Harbor View Mgmt', type: 'subscription', severity: 'warning', details: 'Trial expires in 5 days – no payment method on file' },
  { id: 'log-6', date: '2026-02-14T16:45:00', pmcId: 'pmc-2', pmcName: 'Greenfield Realty', type: 'error', severity: 'error', details: 'Zillow API sync failed – timeout after 30s' },
  { id: 'log-7', date: '2026-02-14T10:00:00', pmcId: 'pmc-1', pmcName: 'Skyline Property Group', type: 'system', severity: 'info', details: 'Automated backup completed successfully' },
  { id: 'log-8', date: '2026-02-13T09:00:00', pmcId: 'pmc-4', pmcName: 'Summit Estates LLC', type: 'subscription', severity: 'critical', details: 'Account suspended due to non-payment – 3rd reminder sent' },
];

export function SuperAdminProvider({ children }: { children: ReactNode }) {
  const [superAdmin] = useState<SuperAdmin>(DEMO_SUPER_ADMINS[0]);
  const [superAdmins, setSuperAdmins] = useState<SuperAdmin[]>(DEMO_SUPER_ADMINS);
  const [pmcs, setPmcs] = useState<PMC[]>(DEMO_PMCS);
  const [logs, setLogs] = useState<SystemLog[]>(DEMO_LOGS);

  const addPMC = (data: Omit<PMC, 'id' | 'createdAt' | 'usersUsed' | 'storageUsedGB' | 'revenueYTD' | 'lastActivity'>) => {
    const newPMC: PMC = {
      ...data,
      id: `pmc-${Date.now()}`,
      usersUsed: 0,
      storageUsedGB: 0,
      revenueYTD: 0,
      lastActivity: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    setPmcs(prev => [newPMC, ...prev]);
    setLogs(prev => [{ id: `log-${Date.now()}`, date: new Date().toISOString(), pmcId: newPMC.id, pmcName: newPMC.name, type: 'system', severity: 'info', details: `New PMC "${newPMC.name}" created with ${data.subscriptionPlan} plan` }, ...prev]);
  };

  const updatePMC = (id: string, updates: Partial<PMC>) => {
    setPmcs(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deletePMC = (id: string) => {
    setPmcs(prev => prev.filter(p => p.id !== id));
  };

  const updatePMCStatus = (id: string, status: PMCStatus) => {
    setPmcs(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    const pmc = pmcs.find(p => p.id === id);
    if (pmc) {
      setLogs(prev => [{ id: `log-${Date.now()}`, date: new Date().toISOString(), pmcId: id, pmcName: pmc.name, type: 'system', severity: 'warning', details: `PMC status changed to ${status}` }, ...prev]);
    }
  };

  const addSuperAdmin = (admin: Omit<SuperAdmin, 'id' | 'createdAt'>) => {
    setSuperAdmins(prev => [...prev, { ...admin, id: `sa-${Date.now()}`, createdAt: new Date().toISOString() }]);
  };

  const removeSuperAdmin = (id: string) => {
    setSuperAdmins(prev => prev.filter(a => a.id !== id));
  };

  const getLogsByPMC = (pmcId: string) => logs.filter(l => l.pmcId === pmcId);

  const getFilteredLogs = (filters: { pmcId?: string; type?: LogType; severity?: LogSeverity; search?: string }) => {
    return logs.filter(l => {
      if (filters.pmcId && l.pmcId !== filters.pmcId) return false;
      if (filters.type && l.type !== filters.type) return false;
      if (filters.severity && l.severity !== filters.severity) return false;
      if (filters.search && !l.details.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  };

  const totalRevenue = pmcs.reduce((sum, p) => sum + p.revenueYTD, 0);
  const totalUsers = pmcs.reduce((sum, p) => sum + p.usersUsed, 0);

  return (
    <SuperAdminContext.Provider value={{
      superAdmin, superAdmins, pmcs, logs, addPMC, updatePMC, deletePMC, updatePMCStatus,
      addSuperAdmin, removeSuperAdmin, getLogsByPMC, getFilteredLogs, totalRevenue, totalUsers,
    }}>
      {children}
    </SuperAdminContext.Provider>
  );
}

export function useSuperAdmin() {
  const context = useContext(SuperAdminContext);
  if (!context) throw new Error('useSuperAdmin must be used within SuperAdminProvider');
  return context;
}
