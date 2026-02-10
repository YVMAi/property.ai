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
      { id: 'e1', email: 'john.anderson@email.com', isPrimary: true, status: 'active', inviteStatus: 'accepted', loginCount: 12, lastLogin: '2026-02-08T14:30:00Z' },
      { id: 'e2', email: 'john.a@work.com', isPrimary: false, status: 'active', inviteStatus: 'shared', loginCount: 3, lastLogin: '2026-01-20T09:15:00Z' },
    ],
    linkedPropertyIds: ['p1', 'p2', 'p3'],
    agreements: [
      { id: 'ag1', name: 'Global Management Agreement 2026', fileName: 'Global_Agreement_2026.pdf', fileUrl: '#', startDate: '2026-01-01', endDate: '2026-12-31', managementFeeType: 'combination' as const, managementFeeFixed: 50, managementFeePercent: 8, managementFeePercentTotal: 5, leaseFeeType: 'fixed' as const, leaseFeeValue: 500, renewalFeeType: 'variable' as const, renewalFeeValue: 3, feePerUnit: 50, feePercentRent: 8, createdAt: '2026-01-01T00:00:00Z' },
    ],
    agreementMode: 'single',
    documents: [
      { id: 'd1', fileName: 'Management_Agreement_2026.pdf', fileUrl: '#', tags: ['Agreement2026', 'PropertyX'], uploadedAt: '2026-01-15T10:00:00Z' },
    ],
    payments: [
      { id: 'pay1', amount: 1840, date: '2026-02-01', method: 'ACH', status: 'paid', invoiceUrl: '#', receiptUrl: '#' },
      { id: 'pay2', amount: 1840, date: '2026-01-01', method: 'ACH', status: 'paid', invoiceUrl: '#', receiptUrl: '#' },
      { id: 'pay3', amount: 1900, date: '2025-12-01', method: 'ACH', status: 'paid', invoiceUrl: '#', receiptUrl: '#' },
    ],
    paymentSetup: {
      ...emptyPaymentSetup,
      payoutMethod: 'ach',
      bankName: 'Chase',
      accountNumber: '****1234',
      routingNumber: '****5678',
      autoPayEnabled: true,
      managementFeeEnabled: true,
      managementFeeType: 'percentage',
      managementFeeValue: 8,
      managementFeeMinimum: 50,
      managementFeeApplyTo: 'all',
      managementFeePropertyIds: [],
    },
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
      { id: 'e3', email: 'sarah.mitchell@email.com', isPrimary: true, status: 'active', inviteStatus: 'accepted', loginCount: 28, lastLogin: '2026-02-09T08:45:00Z' },
    ],
    linkedPropertyIds: ['p4', 'p5'],
    agreements: [
      { id: 'ag2', propertyId: 'p4', name: 'Hilltop Management Agreement', fileName: 'Hilltop_Agreement.pdf', fileUrl: '#', startDate: '2025-06-01', endDate: '2026-05-31', managementFeeType: 'fixed_per_unit' as const, managementFeeFixed: 75, managementFeePercent: '', managementFeePercentTotal: '', leaseFeeType: 'fixed' as const, leaseFeeValue: 400, renewalFeeType: 'fixed' as const, renewalFeeValue: 200, feePerUnit: 75, feePercentRent: 6, createdAt: '2025-06-01T00:00:00Z' },
      { id: 'ag3', propertyId: 'p5', name: 'Garden Estates Agreement', fileName: 'Garden_Agreement.pdf', fileUrl: '#', startDate: '2025-06-01', endDate: '2026-05-31', managementFeeType: 'percent_rent' as const, managementFeeFixed: '', managementFeePercent: 7, managementFeePercentTotal: '', leaseFeeType: 'variable' as const, leaseFeeValue: 5, renewalFeeType: 'variable' as const, renewalFeeValue: 3, feePerUnit: 60, feePercentRent: 7, createdAt: '2025-06-01T00:00:00Z' },
    ],
    agreementMode: 'per_property',
    documents: [],
    payments: [
      { id: 'pay4', amount: 2200, date: '2026-02-01', method: 'Check', status: 'paid', invoiceUrl: '#', receiptUrl: '#' },
      { id: 'pay5', amount: 2200, date: '2026-01-01', method: 'Check', status: 'pending' },
    ],
    paymentSetup: { ...emptyPaymentSetup, payoutMethod: 'check', payoutFrequency: 'monthly', payoutDay: '15th', autoPayEnabled: false },
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
      { id: 'e4', email: 'mchen@company.com', isPrimary: true, status: 'active', inviteStatus: 'pending', loginCount: 5, lastLogin: '2026-01-30T16:20:00Z' },
    ],
    linkedPropertyIds: ['p6'],
    agreements: [],
    agreementMode: 'single',
    documents: [
      { id: 'd2', fileName: 'W9_Form.pdf', fileUrl: '#', tags: ['W9', 'Tax'], uploadedAt: '2025-12-01T00:00:00Z' },
    ],
    payments: [],
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
      { id: 'e5', email: 'emily.r@trust.com', isPrimary: true, status: 'deactivated', inviteStatus: 'rejected', loginCount: 0 },
    ],
    linkedPropertyIds: [],
    agreements: [],
    agreementMode: 'single',
    documents: [],
    payments: [],
    paymentSetup: { ...emptyPaymentSetup },
    status: 'deleted',
    createdAt: '2024-11-20T00:00:00Z',
    updatedAt: '2025-08-15T00:00:00Z',
  },
];

export const MOCK_PROPERTIES = [
  { id: 'p1', name: 'Sunset Apartments', units: 12, rent: 1200 },
  { id: 'p2', name: 'Downtown Lofts', units: 8, rent: 1800 },
  { id: 'p3', name: 'Riverside Condos', units: 6, rent: 2200 },
  { id: 'p4', name: 'Hilltop Villas', units: 4, rent: 3000 },
  { id: 'p5', name: 'Garden Estates', units: 10, rent: 1500 },
  { id: 'p6', name: 'Metro Tower', units: 20, rent: 2500 },
  { id: 'p7', name: 'Lakeside Manor', units: 3, rent: 4000 },
  { id: 'p8', name: 'Pine Ridge', units: 5, rent: 1600 },
];

export function useOwners() {
  const [owners, setOwners] = useState<Owner[]>(MOCK_OWNERS);

  const activeOwners = owners.filter((o) => o.status !== 'deleted');
  const archivedOwners = owners.filter((o) => o.status === 'deleted');

  const getAllEmails = useCallback(
    (excludeOwnerId?: string): string[] => {
      return owners
        .filter((o) => !excludeOwnerId || o.id !== excludeOwnerId)
        .flatMap((o) => o.emails.map((e) => e.email.toLowerCase()));
    },
    [owners]
  );

  const addOwner = useCallback((data: OwnerFormData) => {
    const now = new Date().toISOString();
    const newOwner: Owner = {
      id: generateId(),
      ...data,
      emails: data.emails.map((e) => ({
        ...e,
        id: (e as any).id || generateId(),
        loginCount: 0,
      })),
      agreements: data.agreements.map((a) => ({
        ...a,
        id: generateId(),
      })),
      documents: data.documents.map((d) => ({
        ...d,
        id: generateId(),
      })),
      payments: [],
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
          agreements: data.agreements
            ? data.agreements.map((a) => ({
                ...a,
                id: (a as any).id || generateId(),
              }))
            : o.agreements,
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

  const addPayment = useCallback((ownerId: string, payment: Omit<Owner['payments'][0], 'id'>) => {
    setOwners((prev) =>
      prev.map((o) => {
        if (o.id !== ownerId) return o;
        return {
          ...o,
          payments: [...o.payments, { ...payment, id: generateId() }],
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
    getAllEmails,
    addOwner,
    updateOwner,
    addPayment,
    toggleOwnerStatus,
    softDeleteOwner,
    restoreOwner,
    getOwnerById,
  };
}
