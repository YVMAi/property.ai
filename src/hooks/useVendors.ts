import { useState, useCallback, useMemo } from 'react';
import type { Vendor, VendorFormData, VendorStatus, VendorBGVReport } from '@/types/vendor';

const generateId = () => Math.random().toString(36).substring(2, 11);

const MOCK_VENDORS: Vendor[] = [
  {
    id: 'v1',
    vendorType: 'company',
    firstName: '',
    lastName: '',
    companyName: 'CoolAir Services',
    contactPerson: 'Mike Johnson',
    phone: '(555) 100-2000',
    address: { street: '45 Industrial Pkwy', city: 'Portland', state: 'OR', zip: '97201' },
    ssn: '',
    ein: '**-***4567',
    emergencyContactName: 'Sarah Johnson',
    emergencyContactPhone: '(555) 100-2001',
    availability247: true,
    categories: ['HVAC', 'Maintenance/Repair'],
    customCategories: [],
    regions: ['Downtown', 'East Side'],
    defaultHourlyRate: 85,
    paymentTerms: 'net_30',
    defaultPaymentMethod: 'ach',
    tags: ['Preferred', 'Licensed'],
    email: 'mike@coolair.com',
    status: 'active',
    inviteStatus: 'accepted',
    inviteSentAt: '2025-03-01T00:00:00Z',
    bgvEnabled: true,
    bgvSchedule: 'annually',
    documents: [
      { id: 'd1', fileName: 'W9_CoolAir.pdf', fileUrl: '#', type: 'w9', uploadedAt: '2025-03-01T00:00:00Z' },
      { id: 'd2', fileName: 'Insurance_CoolAir.pdf', fileUrl: '#', type: 'insurance', uploadedAt: '2025-03-01T00:00:00Z' },
    ],
    bgvReports: [
      { id: 'bv1', vendorId: 'v1', runDate: '2025-03-15', schedule: 'one-time', reportUrl: '#', status: 'completed', sections: { credit: 'Good', criminal: 'Clear', license: 'Valid' } },
    ],
    workOrders: [
      { id: 'wo1', vendorId: 'v1', propertyName: 'Sunset Apartments', description: 'HVAC system repair unit 4B', assignedDate: '2026-01-15', status: 'completed', cost: 1200 },
      { id: 'wo2', vendorId: 'v1', propertyName: 'Downtown Lofts', description: 'AC maintenance check', assignedDate: '2026-02-01', status: 'in_progress', cost: 450 },
      { id: 'wo3', vendorId: 'v1', propertyName: 'Riverside Condos', description: 'Heating system installation', assignedDate: '2026-02-05', status: 'open', cost: 3200 },
    ],
    complaints: [
      { id: 'c1', vendorId: 'v1', date: '2026-01-20', from: 'Tenant - Alice Martinez', description: 'Late arrival for scheduled maintenance', status: 'resolved', resolutionNotes: 'Vendor apologized and offered discount on next service.' },
    ],
    payments: [
      { id: 'vp1', vendorId: 'v1', amount: 1200, date: '2026-01-25', method: 'ACH', status: 'paid', invoiceUrl: '#' },
      { id: 'vp2', vendorId: 'v1', amount: 450, date: '2026-02-05', method: 'ACH', status: 'pending' },
    ],
    notes: 'Reliable HVAC vendor. Responds quickly to emergency calls.',
    createdAt: '2025-03-01T00:00:00Z',
    updatedAt: '2026-02-05T00:00:00Z',
  },
  {
    id: 'v2',
    vendorType: 'individual',
    firstName: 'Carlos',
    lastName: 'Mendez',
    companyName: '',
    contactPerson: '',
    phone: '(555) 200-3000',
    address: { street: '88 Main St', city: 'Austin', state: 'TX', zip: '73301' },
    ssn: '***-**-7890',
    ein: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    availability247: false,
    categories: ['Plumbing'],
    customCategories: [],
    regions: ['Suburban Area', 'South District'],
    defaultHourlyRate: 65,
    paymentTerms: 'immediate',
    defaultPaymentMethod: 'check',
    tags: ['Insured'],
    email: 'carlos.mendez@email.com',
    status: 'active',
    inviteStatus: 'accepted',
    inviteSentAt: '2025-06-01T00:00:00Z',
    bgvEnabled: true,
    bgvSchedule: 'one-time',
    documents: [
      { id: 'd3', fileName: 'W9_Mendez.pdf', fileUrl: '#', type: 'w9', uploadedAt: '2025-06-01T00:00:00Z' },
    ],
    bgvReports: [
      { id: 'bv2', vendorId: 'v2', runDate: '2025-06-10', schedule: 'one-time', reportUrl: '#', status: 'completed', sections: { credit: 'Fair', criminal: 'Clear', license: 'Valid' } },
    ],
    workOrders: [
      { id: 'wo4', vendorId: 'v2', propertyName: 'Garden Estates', description: 'Kitchen sink leak repair', assignedDate: '2026-01-28', status: 'completed', cost: 320 },
    ],
    complaints: [],
    payments: [
      { id: 'vp3', vendorId: 'v2', amount: 320, date: '2026-01-30', method: 'Check', status: 'paid', invoiceUrl: '#' },
    ],
    notes: '',
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2026-01-30T00:00:00Z',
  },
  {
    id: 'v3',
    vendorType: 'company',
    firstName: '',
    lastName: '',
    companyName: 'GreenScape Landscaping',
    contactPerson: 'Linda Park',
    phone: '(555) 300-4000',
    address: { street: '200 Garden Blvd', city: 'Seattle', state: 'WA', zip: '98101' },
    ssn: '',
    ein: '**-***1234',
    emergencyContactName: 'Tom Park',
    emergencyContactPhone: '(555) 300-4001',
    availability247: false,
    categories: ['Landscaping', 'Cleaning'],
    customCategories: [],
    regions: ['North District', 'West Side'],
    defaultHourlyRate: 55,
    paymentTerms: 'net_30',
    defaultPaymentMethod: 'ach',
    tags: ['Preferred'],
    email: 'linda@greenscape.com',
    status: 'active',
    inviteStatus: 'accepted',
    inviteSentAt: '2025-01-15T00:00:00Z',
    bgvEnabled: false,
    bgvSchedule: 'one-time',
    documents: [],
    bgvReports: [],
    workOrders: [
      { id: 'wo5', vendorId: 'v3', propertyName: 'Hilltop Villas', description: 'Monthly lawn maintenance', assignedDate: '2026-02-01', status: 'in_progress', cost: 800 },
    ],
    complaints: [],
    payments: [
      { id: 'vp4', vendorId: 'v3', amount: 800, date: '2026-01-05', method: 'ACH', status: 'paid', invoiceUrl: '#' },
    ],
    notes: 'Great landscaping service. Seasonal contracts available.',
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'v4',
    vendorType: 'individual',
    firstName: 'James',
    lastName: 'Wright',
    companyName: '',
    contactPerson: '',
    phone: '(555) 400-5000',
    address: { street: '55 Oak Lane', city: 'San Francisco', state: 'CA', zip: '94102' },
    ssn: '***-**-3456',
    ein: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    availability247: false,
    categories: ['Electrical', 'Maintenance/Repair'],
    customCategories: [],
    regions: ['Downtown'],
    defaultHourlyRate: 75,
    paymentTerms: 'net_15',
    defaultPaymentMethod: 'wire',
    tags: ['Licensed'],
    email: 'james.wright@email.com',
    status: 'blacklisted',
    inviteStatus: 'accepted',
    inviteSentAt: '2024-08-01T00:00:00Z',
    bgvEnabled: true,
    bgvSchedule: 'one-time',
    documents: [],
    bgvReports: [
      { id: 'bv3', vendorId: 'v4', runDate: '2024-08-10', schedule: 'one-time', reportUrl: '#', status: 'completed', sections: { credit: 'Poor', criminal: 'Flag', license: 'Expired' } },
    ],
    workOrders: [
      { id: 'wo6', vendorId: 'v4', propertyName: 'Metro Tower', description: 'Electrical wiring fix', assignedDate: '2025-09-10', status: 'cancelled', cost: 600 },
    ],
    complaints: [
      { id: 'c2', vendorId: 'v4', date: '2025-10-05', from: 'Admin', description: 'Poor quality work and missed deadlines', status: 'open', resolutionNotes: '' },
    ],
    payments: [
      { id: 'vp5', vendorId: 'v4', amount: 600, date: '2025-09-15', method: 'Wire', status: 'paid' },
    ],
    notes: 'Blacklisted due to multiple complaints and expired license.',
    createdAt: '2024-08-01T00:00:00Z',
    updatedAt: '2025-10-05T00:00:00Z',
  },
  {
    id: 'v5',
    vendorType: 'company',
    firstName: '',
    lastName: '',
    companyName: 'PestFree Solutions',
    contactPerson: 'Diana Chen',
    phone: '(555) 500-6000',
    address: { street: '120 Commerce Dr', city: 'Portland', state: 'OR', zip: '97201' },
    ssn: '',
    ein: '**-***5678',
    emergencyContactName: '',
    emergencyContactPhone: '',
    availability247: false,
    categories: ['Pest Control'],
    customCategories: [],
    regions: ['East Side', 'Suburban Area'],
    defaultHourlyRate: 60,
    paymentTerms: 'net_30',
    defaultPaymentMethod: 'ach',
    tags: [],
    email: 'diana@pestfree.com',
    status: 'archived',
    inviteStatus: 'accepted',
    inviteSentAt: '2024-05-01T00:00:00Z',
    bgvEnabled: false,
    bgvSchedule: 'one-time',
    documents: [],
    bgvReports: [],
    workOrders: [],
    complaints: [],
    payments: [],
    notes: 'Archived - no activity in over 6 months.',
    createdAt: '2024-05-01T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
  },
];

export function useVendors() {
  const [vendors, setVendors] = useState<Vendor[]>(MOCK_VENDORS);

  const nonDeleted = vendors.filter((v) => v.status !== 'deleted');
  const activeVendors = useMemo(() => nonDeleted.filter((v) => v.status === 'active'), [nonDeleted]);
  const archivedVendors = useMemo(() => nonDeleted.filter((v) => v.status === 'archived'), [nonDeleted]);
  const blacklistedVendors = useMemo(() => nonDeleted.filter((v) => v.status === 'blacklisted'), [nonDeleted]);

  const getAllEmails = useCallback(
    (excludeId?: string): string[] =>
      vendors.filter((v) => !excludeId || v.id !== excludeId).map((v) => v.email.toLowerCase()),
    [vendors]
  );

  const addVendor = useCallback((data: VendorFormData) => {
    const now = new Date().toISOString();
    const { formDocuments, ...rest } = data;
    const documents = formDocuments.map((d) => ({
      id: d.id,
      fileName: d.fileName,
      fileUrl: '#',
      type: d.type,
      uploadedAt: d.addedAt,
    }));
    const newVendor: Vendor = {
      id: generateId(),
      ...rest,
      status: 'active',
      inviteStatus: 'pending',
      inviteToken: generateId(),
      inviteSentAt: now,
      documents,
      bgvReports: [],
      workOrders: [],
      complaints: [],
      payments: [],
      notes: '',
      createdAt: now,
      updatedAt: now,
    };
    setVendors((prev) => [...prev, newVendor]);
    return newVendor;
  }, []);

  const updateVendor = useCallback((id: string, data: Partial<VendorFormData>) => {
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v;
        const { formDocuments, ...rest } = data as any;
        const updatedDocs = formDocuments
          ? (formDocuments as any[]).map((d: any) => ({
              id: d.id,
              fileName: d.fileName,
              fileUrl: '#',
              type: d.type,
              uploadedAt: d.addedAt,
            }))
          : v.documents;
        return { ...v, ...rest, documents: updatedDocs, updatedAt: new Date().toISOString() };
      })
    );
  }, []);

  const changeStatus = useCallback((id: string, status: VendorStatus) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status, updatedAt: new Date().toISOString() } : v))
    );
  }, []);

  const softDeleteVendor = useCallback((id: string) => {
    const vendor = vendors.find((v) => v.id === id);
    const hasActiveWOs = vendor?.workOrders.some((wo) => wo.status === 'open' || wo.status === 'in_progress');
    if (hasActiveWOs) return false;
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: 'deleted' as VendorStatus, updatedAt: new Date().toISOString() } : v))
    );
    return true;
  }, [vendors]);

  const restoreVendor = useCallback((id: string) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: 'active' as VendorStatus, updatedAt: new Date().toISOString() } : v))
    );
  }, []);

  const getVendorById = useCallback((id: string) => vendors.find((v) => v.id === id), [vendors]);

  const updateNotes = useCallback((id: string, notes: string) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, notes, updatedAt: new Date().toISOString() } : v))
    );
  }, []);

  const runBGV = useCallback((id: string) => {
    const report: VendorBGVReport = {
      id: generateId(),
      vendorId: id,
      runDate: new Date().toISOString(),
      schedule: 'one-time',
      reportUrl: '#',
      status: 'pending',
    };
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, bgvReports: [...v.bgvReports, report], updatedAt: new Date().toISOString() } : v))
    );
    setTimeout(() => {
      setVendors((prev) =>
        prev.map((v) => {
          if (v.id !== id) return v;
          return {
            ...v,
            bgvReports: v.bgvReports.map((r) =>
              r.id === report.id
                ? { ...r, status: 'completed' as const, sections: { credit: 'Good', criminal: 'Clear', license: 'Valid' } }
                : r
            ),
          };
        })
      );
    }, 2000);
    return report;
  }, []);

  const resendInvite = useCallback((id: string) => {
    setVendors((prev) =>
      prev.map((v) =>
        v.id === id
          ? { ...v, inviteStatus: 'pending' as const, inviteToken: generateId(), inviteSentAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          : v
      )
    );
  }, []);

  const assignWorkOrder = useCallback((vendorId: string, wo: { propertyName: string; description: string; dueDate: string }) => {
    const newWO = {
      id: generateId(),
      vendorId,
      propertyName: wo.propertyName,
      description: wo.description,
      assignedDate: new Date().toISOString(),
      status: 'open' as const,
      cost: 0,
    };
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, workOrders: [...v.workOrders, newWO], updatedAt: new Date().toISOString() } : v))
    );
    return newWO;
  }, []);

  return {
    vendors: nonDeleted,
    activeVendors,
    archivedVendors,
    blacklistedVendors,
    getAllEmails,
    addVendor,
    updateVendor,
    changeStatus,
    softDeleteVendor,
    restoreVendor,
    getVendorById,
    updateNotes,
    runBGV,
    resendInvite,
    assignWorkOrder,
  };
}
