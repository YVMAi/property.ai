import { useState, useCallback, useMemo } from 'react';
import { getTenantCategory } from '@/types/tenant';
import type { Tenant, TenantFormData, TenantStatus, BGVReport, TenantPayment } from '@/types/tenant';

const generateId = () => Math.random().toString(36).substring(2, 11);

const MOCK_TENANTS: Tenant[] = [
  {
    id: 't1',
    entityType: 'individual',
    firstName: 'Alice',
    lastName: 'Martinez',
    companyName: '',
    contactPerson: '',
    dob: '1990-03-15',
    ssn: '***-**-4321',
    ein: '',
    phone: '(555) 111-2222',
    address: { street: '100 River Rd', city: 'Portland', state: 'OR', zip: '97201' },
    email: 'alice.martinez@email.com',
    status: 'active',
    inviteStatus: 'accepted',
    inviteSentAt: '2025-06-01T00:00:00Z',
    leases: [
      { id: 'l1', propertyName: 'Sunset Apartments', unit: 'Unit 4B', startDate: '2025-07-01', endDate: '2026-06-30', status: 'active', monthlyRent: 1200 },
      { id: 'l2', propertyName: 'Downtown Lofts', unit: 'Unit 2A', startDate: '2024-01-01', endDate: '2024-12-31', status: 'past', monthlyRent: 1500 },
    ],
    payments: [
      { id: 'tp1', tenantId: 't1', amount: 1200, date: '2026-02-01', status: 'paid' },
      { id: 'tp2', tenantId: 't1', amount: 1200, date: '2026-01-01', status: 'paid' },
      { id: 'tp3', tenantId: 't1', amount: 1200, date: '2025-12-01', status: 'paid' },
      { id: 'tp4', tenantId: 't1', amount: 1200, date: '2025-11-01', status: 'late' },
      { id: 'tp5', tenantId: 't1', amount: 1200, date: '2025-10-01', status: 'paid' },
      { id: 'tp6', tenantId: 't1', amount: 1200, date: '2025-09-01', status: 'paid' },
      { id: 'tp7', tenantId: 't1', amount: 1500, date: '2024-12-01', status: 'paid' },
      { id: 'tp8', tenantId: 't1', amount: 1500, date: '2024-11-01', status: 'paid' },
    ],
    bgvReports: [
      { id: 'bgv1', tenantId: 't1', runDate: '2025-06-15', schedule: 'one-time', reportUrl: '#', status: 'completed', sections: { credit: 'Good – 720', criminal: 'Clear', eviction: 'None' } },
    ],
    bgvEnabled: true,
    bgvSchedule: 'annually',
    notes: 'Reliable tenant, always communicates ahead of time.',
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 't2',
    entityType: 'company',
    firstName: '',
    lastName: '',
    companyName: 'Greenleaf Inc.',
    contactPerson: 'Brian Nguyen',
    dob: '',
    ssn: '',
    ein: '**-***7890',
    phone: '(555) 333-4444',
    address: { street: '500 Commerce Blvd', city: 'Seattle', state: 'WA', zip: '98101' },
    email: 'brian@greenleaf.com',
    status: 'active',
    inviteStatus: 'accepted',
    inviteSentAt: '2025-03-01T00:00:00Z',
    leases: [
      { id: 'l3', propertyName: 'Metro Tower', unit: 'Suite 300', startDate: '2025-04-01', endDate: '2027-03-31', status: 'active', monthlyRent: 4500 },
    ],
    payments: [
      { id: 'tp9', tenantId: 't2', amount: 4500, date: '2026-02-01', status: 'paid' },
      { id: 'tp10', tenantId: 't2', amount: 4500, date: '2026-01-01', status: 'paid' },
      { id: 'tp11', tenantId: 't2', amount: 4500, date: '2025-12-01', status: 'late' },
      { id: 'tp12', tenantId: 't2', amount: 4500, date: '2025-11-01', status: 'paid' },
    ],
    bgvReports: [],
    bgvEnabled: false,
    bgvSchedule: 'one-time',
    notes: '',
    createdAt: '2025-03-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 't3',
    entityType: 'individual',
    firstName: 'Carlos',
    lastName: 'Rivera',
    companyName: '',
    contactPerson: '',
    dob: '1985-11-22',
    ssn: '***-**-6789',
    ein: '',
    phone: '(555) 555-6666',
    address: { street: '88 Oak St', city: 'Austin', state: 'TX', zip: '73301' },
    email: 'carlos.r@email.com',
    status: 'active',
    inviteStatus: 'accepted',
    leases: [
      { id: 'l4', propertyName: 'Riverside Condos', unit: 'Unit 1C', startDate: '2024-06-01', endDate: '2025-05-31', status: 'past', monthlyRent: 2200 },
    ],
    payments: [
      { id: 'tp13', tenantId: 't3', amount: 2200, date: '2025-05-01', status: 'paid' },
      { id: 'tp14', tenantId: 't3', amount: 2200, date: '2025-04-01', status: 'paid' },
      { id: 'tp15', tenantId: 't3', amount: 2200, date: '2025-03-01', status: 'late' },
    ],
    bgvReports: [
      { id: 'bgv2', tenantId: 't3', runDate: '2024-05-20', schedule: 'one-time', reportUrl: '#', status: 'completed', sections: { credit: 'Fair – 650', criminal: 'Clear', eviction: 'None' } },
    ],
    bgvEnabled: false,
    bgvSchedule: 'one-time',
    notes: 'Moved out end of May 2025.',
    createdAt: '2024-05-15T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 't4',
    entityType: 'individual',
    firstName: 'Diana',
    lastName: 'Patel',
    companyName: '',
    contactPerson: '',
    dob: '1995-07-10',
    ssn: '***-**-1122',
    ein: '',
    phone: '(555) 777-8888',
    address: { street: '12 Elm Ave', city: 'San Francisco', state: 'CA', zip: '94102' },
    email: 'diana.patel@email.com',
    status: 'active',
    inviteStatus: 'pending',
    inviteSentAt: '2026-02-05T00:00:00Z',
    leases: [],
    payments: [],
    bgvReports: [],
    bgvEnabled: false,
    bgvSchedule: 'one-time',
    notes: '',
    createdAt: '2026-02-05T00:00:00Z',
    updatedAt: '2026-02-05T00:00:00Z',
  },
  {
    id: 't5',
    entityType: 'individual',
    firstName: 'Edward',
    lastName: 'Kim',
    companyName: '',
    contactPerson: '',
    dob: '1988-01-30',
    ssn: '***-**-3344',
    ein: '',
    phone: '(555) 999-0000',
    address: { street: '200 Pine St', city: 'Portland', state: 'OR', zip: '97201' },
    email: 'edward.kim@email.com',
    status: 'deactivated',
    inviteStatus: 'accepted',
    leases: [
      { id: 'l5', propertyName: 'Garden Estates', unit: 'Unit 7', startDate: '2023-01-01', endDate: '2023-12-31', status: 'past', monthlyRent: 1500 },
    ],
    payments: [
      { id: 'tp16', tenantId: 't5', amount: 1500, date: '2023-12-01', status: 'paid' },
      { id: 'tp17', tenantId: 't5', amount: 1500, date: '2023-11-01', status: 'late' },
    ],
    bgvReports: [],
    bgvEnabled: false,
    bgvSchedule: 'one-time',
    notes: 'Left due to relocation.',
    createdAt: '2022-12-15T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z',
  },
];

export function useTenants() {
  const [tenants, setTenants] = useState<Tenant[]>(MOCK_TENANTS);

  const nonDeleted = tenants.filter((t) => t.status !== 'deleted');
  const activeTenants = useMemo(() => nonDeleted.filter((t) => getTenantCategory(t) !== 'archived'), [nonDeleted]);
  const archivedTenants = useMemo(() => nonDeleted.filter((t) => getTenantCategory(t) === 'archived'), [nonDeleted]);
  const deletedTenants = tenants.filter((t) => t.status === 'deleted');

  const getAllEmails = useCallback(
    (excludeId?: string): string[] =>
      tenants
        .filter((t) => !excludeId || t.id !== excludeId)
        .map((t) => t.email.toLowerCase()),
    [tenants]
  );

  const addTenant = useCallback((data: TenantFormData) => {
    const now = new Date().toISOString();
    const newTenant: Tenant = {
      id: generateId(),
      ...data,
      status: 'active',
      inviteStatus: 'pending',
      inviteToken: generateId(),
      inviteSentAt: now,
      leases: [],
      payments: [],
      bgvReports: [],
      notes: '',
      createdAt: now,
      updatedAt: now,
    };
    setTenants((prev) => [...prev, newTenant]);
    return newTenant;
  }, []);

  const updateTenant = useCallback((id: string, data: Partial<TenantFormData>) => {
    setTenants((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
      )
    );
  }, []);

  const toggleTenantStatus = useCallback((id: string) => {
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        return {
          ...t,
          status: (t.status === 'active' ? 'deactivated' : 'active') as TenantStatus,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  const softDeleteTenant = useCallback((id: string) => {
    setTenants((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: 'deleted' as TenantStatus, updatedAt: new Date().toISOString() } : t
      )
    );
  }, []);

  const restoreTenant = useCallback((id: string) => {
    setTenants((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: 'active' as TenantStatus, updatedAt: new Date().toISOString() } : t
      )
    );
  }, []);

  const getTenantById = useCallback(
    (id: string) => tenants.find((t) => t.id === id),
    [tenants]
  );

  const updateNotes = useCallback((id: string, notes: string) => {
    setTenants((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, notes, updatedAt: new Date().toISOString() } : t
      )
    );
  }, []);

  const runBGV = useCallback((id: string) => {
    const report: BGVReport = {
      id: generateId(),
      tenantId: id,
      runDate: new Date().toISOString(),
      schedule: 'one-time',
      reportUrl: '#',
      status: 'pending',
      sections: undefined,
    };
    setTenants((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, bgvReports: [...t.bgvReports, report], updatedAt: new Date().toISOString() } : t
      )
    );
    // Simulate async completion
    setTimeout(() => {
      setTenants((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          return {
            ...t,
            bgvReports: t.bgvReports.map((r) =>
              r.id === report.id
                ? { ...r, status: 'completed' as const, sections: { credit: 'Good – 710', criminal: 'Clear', eviction: 'None' } }
                : r
            ),
          };
        })
      );
    }, 2000);
    return report;
  }, []);

  const resendInvite = useCallback((id: string) => {
    setTenants((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, inviteStatus: 'pending' as const, inviteToken: generateId(), inviteSentAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          : t
      )
    );
  }, []);

  return {
    tenants,
    activeTenants,
    archivedTenants,
    deletedTenants,
    getAllEmails,
    addTenant,
    updateTenant,
    toggleTenantStatus,
    softDeleteTenant,
    restoreTenant,
    getTenantById,
    updateNotes,
    runBGV,
    resendInvite,
  };
}
