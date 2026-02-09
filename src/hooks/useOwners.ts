import { useState, useCallback } from 'react';
import type { Owner, OwnerFormData, OwnerStatus } from '@/types/owner';
import { emptyPaymentSetup } from '@/types/owner';

const generateId = () => Math.random().toString(36).substring(2, 11);

const MOCK_OWNERS: Owner[] = [
  {
    id: '1',
    ownerType: 'individual',
    firstName: 'John',
    lastName: 'Anderson',
    companyName: '',
    contactPerson: '',
    phone: '(555) 123-4567',
    address: { street: '123 Oak Lane', city: 'Portland', state: 'OR', zip: '97201' },
    ssn: '***-**-1234',
    ein: '',
    taxId: '',
    taxClassification: 'individual',
    emails: [
      { id: 'e1', email: 'john.anderson@email.com', isPrimary: true, status: 'active', loginCount: 12, lastLogin: '2026-02-08T14:30:00Z' },
      { id: 'e2', email: 'john.a@work.com', isPrimary: false, status: 'active', loginCount: 3, lastLogin: '2026-01-20T09:15:00Z' },
    ],
    linkedPropertyIds: ['p1', 'p2', 'p3'],
    documents: [
      { id: 'd1', fileName: 'Management_Agreement_2026.pdf', fileUrl: '#', tags: ['Agreement2026', 'PropertyX'], uploadedAt: '2026-01-15T10:00:00Z' },
    ],
    paymentSetup: { ...emptyPaymentSetup, payoutMethod: 'ach', bankName: 'Chase', accountNumber: '****1234', routingNumber: '****5678', managementFeeEnabled: true, managementFeeType: 'percentage', managementFeeValue: 8, managementFeeMinimum: 50, managementFeeApplyTo: 'all', managementFeePropertyIds: [] },
    status: 'active',
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2026-02-08T14:30:00Z',
  },
  {
    id: '2',
    ownerType: 'company',
    firstName: '',
    lastName: '',
    companyName: 'Mitchell Properties LLC',
    contactPerson: 'Sarah Mitchell',
    phone: '(555) 987-6543',
    address: { street: '456 Elm Street', city: 'Seattle', state: 'WA', zip: '98101' },
    ssn: '',
    ein: '**-***5678',
    taxId: '',
    taxClassification: 'llc',
    emails: [
      { id: 'e3', email: 'sarah.mitchell@email.com', isPrimary: true, status: 'active', loginCount: 28, lastLogin: '2026-02-09T08:45:00Z' },
    ],
    linkedPropertyIds: ['p4', 'p5'],
    documents: [],
    paymentSetup: { ...emptyPaymentSetup, payoutMethod: 'check', payoutFrequency: 'monthly', payoutDay: '15th' },
    status: 'active',
    createdAt: '2025-03-15T00:00:00Z',
    updatedAt: '2026-02-09T08:45:00Z',
  },
  {
    id: '3',
    ownerType: 'company',
    firstName: '',
    lastName: '',
    companyName: 'Chen Holdings Corp',
    contactPerson: 'Michael Chen',
    phone: '(555) 456-7890',
    address: { street: '789 Pine Ave', city: 'San Francisco', state: 'CA', zip: '94102' },
    ssn: '',
    ein: '**-***9012',
    taxId: '',
    taxClassification: 'corporation',
    emails: [
      { id: 'e4', email: 'mchen@company.com', isPrimary: true, status: 'active', loginCount: 5, lastLogin: '2026-01-30T16:20:00Z' },
    ],
    linkedPropertyIds: ['p6'],
    documents: [
      { id: 'd2', fileName: 'W9_Form.pdf', fileUrl: '#', tags: ['W9', 'Tax'], uploadedAt: '2025-12-01T00:00:00Z' },
    ],
    paymentSetup: { ...emptyPaymentSetup },
    status: 'deactivated',
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2026-01-30T16:20:00Z',
  },
  {
    id: '4',
    ownerType: 'individual',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    companyName: '',
    contactPerson: '',
    phone: '(555) 321-0987',
    address: { street: '321 Maple Dr', city: 'Austin', state: 'TX', zip: '73301' },
    ssn: '***-**-3456',
    ein: '',
    taxId: '',
    taxClassification: 'trust',
    emails: [
      { id: 'e5', email: 'emily.r@trust.com', isPrimary: true, status: 'deactivated', loginCount: 0 },
    ],
    linkedPropertyIds: [],
    documents: [],
    paymentSetup: { ...emptyPaymentSetup },
    status: 'deleted',
    createdAt: '2024-11-20T00:00:00Z',
    updatedAt: '2025-08-15T00:00:00Z',
  },
];

export const MOCK_PROPERTIES = [
  { id: 'p1', name: 'Sunset Apartments' },
  { id: 'p2', name: 'Downtown Lofts' },
  { id: 'p3', name: 'Riverside Condos' },
  { id: 'p4', name: 'Hilltop Villas' },
  { id: 'p5', name: 'Garden Estates' },
  { id: 'p6', name: 'Metro Tower' },
  { id: 'p7', name: 'Lakeside Manor' },
  { id: 'p8', name: 'Pine Ridge' },
];

export function useOwners() {
  const [owners, setOwners] = useState<Owner[]>(MOCK_OWNERS);

  const activeOwners = owners.filter((o) => o.status !== 'deleted');
  const archivedOwners = owners.filter((o) => o.status === 'deleted');

  const addOwner = useCallback((data: OwnerFormData) => {
    const now = new Date().toISOString();
    const newOwner: Owner = {
      id: generateId(),
      ...data,
      emails: data.emails.map((e) => ({
        ...e,
        id: generateId(),
        loginCount: 0,
      })),
      documents: data.documents.map((d) => ({
        ...d,
        id: generateId(),
      })),
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
    setOwners((prev) => [...prev, newOwner]);
    return newOwner;
  }, []);

  const updateOwner = useCallback((id: string, data: Partial<OwnerFormData>) => {
    setOwners((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        return {
          ...o,
          ...data,
          emails: data.emails
            ? data.emails.map((e) => ({
                ...e,
                id: (e as any).id || generateId(),
                loginCount: (e as any).loginCount || 0,
                lastLogin: (e as any).lastLogin,
              }))
            : o.emails,
          documents: data.documents
            ? data.documents.map((d) => ({
                ...d,
                id: (d as any).id || generateId(),
              }))
            : o.documents,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  const toggleOwnerStatus = useCallback((id: string) => {
    setOwners((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        return {
          ...o,
          status: (o.status === 'active' ? 'deactivated' : 'active') as OwnerStatus,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  const softDeleteOwner = useCallback((id: string) => {
    setOwners((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        return { ...o, status: 'deleted' as OwnerStatus, updatedAt: new Date().toISOString() };
      })
    );
  }, []);

  const restoreOwner = useCallback((id: string) => {
    setOwners((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        return { ...o, status: 'active' as OwnerStatus, updatedAt: new Date().toISOString() };
      })
    );
  }, []);

  const getOwnerById = useCallback(
    (id: string) => owners.find((o) => o.id === id),
    [owners]
  );

  return {
    owners,
    activeOwners,
    archivedOwners,
    addOwner,
    updateOwner,
    toggleOwnerStatus,
    softDeleteOwner,
    restoreOwner,
    getOwnerById,
  };
}
