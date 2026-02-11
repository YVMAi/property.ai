import { useState, useCallback, useMemo } from 'react';
import type {
  ServiceRequest, RFP, WorkOrder, WOHistoryEntry,
  ServiceRequestStatus, RFPStatus, WorkOrderStatus,
  WOPriority, WorkOrderFormData, RFPVendorQuote,
} from '@/types/workOrder';

const now = new Date().toISOString();
const d = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();

const initialRequests: ServiceRequest[] = [
  { id: 'SR-001', propertyId: 'p1', propertyName: 'Sunrise Apartments', unitId: 'u1', unitNumber: '101', tenantId: 't1', tenantName: 'John Smith', tenantEmail: 'john.smith@email.com', tenantPhone: '(555) 123-4567', description: 'Leaking faucet in kitchen sink. Water drips constantly even when handle is fully turned off. Started about 3 days ago and is getting worse. The cabinet below is starting to get damp.', category: 'Plumbing', priority: 'medium', status: 'pending', attachments: ['kitchen_leak_1.jpg', 'kitchen_leak_2.jpg'], notes: '', history: [
    { id: 'rh1', requestId: 'SR-001', timestamp: d(2), userId: 't1', userName: 'John Smith', userRole: 'tenant', action: 'submitted', details: 'Service request submitted via tenant portal' },
  ], createdAt: d(2) },
  { id: 'SR-002', propertyId: 'p2', propertyName: 'Oak View Homes', tenantId: 't2', tenantName: 'Sarah Johnson', tenantEmail: 'sarah.j@email.com', tenantPhone: '(555) 987-6543', description: 'Broken window latch on bedroom window – urgent security concern. The latch snapped off and the window can be pushed open from outside. Ground floor unit.', category: 'Locks & Keys', priority: 'urgent', status: 'pending', attachments: ['window_latch.jpg'], notes: '', history: [
    { id: 'rh2', requestId: 'SR-002', timestamp: d(1), userId: 't2', userName: 'Sarah Johnson', userRole: 'tenant', action: 'submitted', details: 'Service request submitted via tenant portal' },
    { id: 'rh3', requestId: 'SR-002', timestamp: d(0.5), userId: 'admin', userName: 'Admin', userRole: 'pm', action: 'note_added', details: 'Tenant confirmed window is currently secured with tape as temporary fix' },
  ], createdAt: d(1) },
  { id: 'SR-003', propertyId: 'p1', propertyName: 'Sunrise Apartments', unitId: 'u3', unitNumber: '205', tenantId: 't3', tenantName: 'Mike Davis', tenantEmail: 'mike.d@email.com', tenantPhone: '(555) 456-7890', description: 'AC not cooling properly. Temperature stays at 78°F even when set to 68°F. Filter was replaced last month.', category: 'HVAC', priority: 'high', status: 'rejected', rejectionReason: 'Duplicate', rejectionNotes: 'Already submitted as SR-001', attachments: [], notes: '', history: [
    { id: 'rh4', requestId: 'SR-003', timestamp: d(5), userId: 't3', userName: 'Mike Davis', userRole: 'tenant', action: 'submitted', details: 'Service request submitted via tenant portal' },
    { id: 'rh5', requestId: 'SR-003', timestamp: d(4), userId: 'admin', userName: 'Admin', userRole: 'pm', action: 'status_changed', details: 'Status changed to Rejected', reason: 'Duplicate' },
  ], createdAt: d(5) },
];

const initialRFPs: RFP[] = [
  { id: 'RFP-001', requestId: 'SR-004', description: 'Replace water heater unit 302', propertyId: 'p1', propertyName: 'Sunrise Apartments', unitId: 'u4', unitNumber: '302', priority: 'high', status: 'open', attachments: [], vendorQuotes: [
    { vendorId: 'v1', vendorName: 'Fix-It Plumbing', status: 'accepted', estimatedCost: 1200, estimatedDays: 3, submittedAt: d(1) },
    { vendorId: 'v2', vendorName: 'Quick Repairs LLC', status: 'pending' },
  ], createdAt: d(3) },
];

const initialWorkOrders: WorkOrder[] = [
  { id: 'WO-001', propertyId: 'p1', propertyName: 'Sunrise Apartments', unitId: 'u2', unitNumber: '104', description: 'Paint hallway walls', priority: 'low', vendorId: 'v3', vendorName: 'Pro Painters Inc', vendorAccepted: true, status: 'in_progress', estimatedCost: 800, dueDate: d(-5), completionPhotos: [], ownerApprovalNeeded: false, attachments: [], notes: '', history: [
    { id: 'h1', workOrderId: 'WO-001', statusTo: 'open', timestamp: d(10), userId: 'admin', userName: 'Admin', userRole: 'pm' },
    { id: 'h2', workOrderId: 'WO-001', statusFrom: 'open', statusTo: 'assigned', timestamp: d(8), userId: 'admin', userName: 'Admin', userRole: 'pm' },
    { id: 'h3', workOrderId: 'WO-001', statusFrom: 'assigned', statusTo: 'in_progress', timestamp: d(6), userId: 'v3', userName: 'Pro Painters Inc', userRole: 'vendor' },
  ], createdAt: d(10), updatedAt: d(6) },
  { id: 'WO-002', rfpId: 'RFP-002', propertyId: 'p2', propertyName: 'Oak View Homes', description: 'Fix roof leak in master bedroom', priority: 'urgent', vendorId: 'v1', vendorName: 'Fix-It Plumbing', vendorAccepted: true, status: 'completed', estimatedCost: 2500, actualCost: 2800, dueDate: d(2), completionPhotos: ['completion1.jpg'], tenantVerified: true, ownerApprovalNeeded: true, ownerApproved: true, ownerId: 'o1', ownerName: 'Robert Chen', attachments: [], notes: 'Owner approved budget overrun', history: [], invoiceUrl: 'invoice_wo002.pdf', createdAt: d(15), updatedAt: d(1) },
];

let reqCounter = 4;
let rfpCounter = 2;
let woCounter = 3;

export function useWorkOrders() {
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(initialRequests);
  const [rfps, setRFPs] = useState<RFP[]>(initialRFPs);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(initialWorkOrders);

  // -- Service Requests --
  const pendingRequests = useMemo(() => serviceRequests.filter(r => r.status === 'pending'), [serviceRequests]);
  const rejectedRequests = useMemo(() => serviceRequests.filter(r => r.status === 'rejected'), [serviceRequests]);

  const createRequest = useCallback((data: Omit<ServiceRequest, 'id' | 'status' | 'createdAt'>) => {
    const sr: ServiceRequest = { ...data, id: `SR-${String(++reqCounter).padStart(3, '0')}`, status: 'pending', createdAt: now };
    setServiceRequests(prev => [sr, ...prev]);
    return sr;
  }, []);

  const approveRequest = useCallback((id: string, asDirect: boolean = false) => {
    setServiceRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' as ServiceRequestStatus } : r));
    const req = serviceRequests.find(r => r.id === id);
    if (!req) return;
    if (asDirect) {
      // create WO directly
      const wo: WorkOrder = {
        id: `WO-${String(++woCounter).padStart(3, '0')}`, requestId: req.id,
        propertyId: req.propertyId, propertyName: req.propertyName, unitId: req.unitId, unitNumber: req.unitNumber,
        description: req.description, priority: req.priority, status: 'open', estimatedCost: 0, dueDate: '',
        completionPhotos: [], ownerApprovalNeeded: false, attachments: req.attachments, notes: '', history: [
          { id: crypto.randomUUID(), workOrderId: '', statusTo: 'open', timestamp: now, userId: 'admin', userName: 'Admin', userRole: 'pm' },
        ], createdAt: now, updatedAt: now,
      };
      wo.history[0].workOrderId = wo.id;
      setWorkOrders(prev => [wo, ...prev]);
    } else {
      // create RFP
      const rfp: RFP = {
        id: `RFP-${String(++rfpCounter).padStart(3, '0')}`, requestId: req.id,
        description: req.description, propertyId: req.propertyId, propertyName: req.propertyName,
        unitId: req.unitId, unitNumber: req.unitNumber, priority: req.priority, status: 'open',
        attachments: req.attachments, vendorQuotes: [], createdAt: now,
      };
      setRFPs(prev => [rfp, ...prev]);
    }
  }, [serviceRequests]);

  const rejectRequest = useCallback((id: string, reason: string, notes: string) => {
    setServiceRequests(prev => prev.map(r => {
      if (r.id !== id) return r;
      const entry: import('@/types/workOrder').RequestHistoryEntry = { id: crypto.randomUUID(), requestId: id, timestamp: new Date().toISOString(), userId: 'admin', userName: 'Admin', userRole: 'pm', action: 'status_changed', details: `Status changed to Rejected`, reason };
      return { ...r, status: 'rejected' as ServiceRequestStatus, rejectionReason: reason, rejectionNotes: notes, history: [...r.history, entry] };
    }));
  }, []);

  const addRequestNote = useCallback((id: string, note: string) => {
    setServiceRequests(prev => prev.map(r => {
      if (r.id !== id) return r;
      const entry: import('@/types/workOrder').RequestHistoryEntry = { id: crypto.randomUUID(), requestId: id, timestamp: new Date().toISOString(), userId: 'admin', userName: 'Admin', userRole: 'pm', action: 'note_added', details: note };
      return { ...r, notes: r.notes ? `${r.notes}\n${note}` : note, history: [...r.history, entry] };
    }));
  }, []);

  // -- RFPs --
  const openRFPs = useMemo(() => rfps.filter(r => r.status === 'open'), [rfps]);

  const sendRFPToVendors = useCallback((rfpId: string, vendors: { vendorId: string; vendorName: string }[]) => {
    setRFPs(prev => prev.map(r => r.id === rfpId ? { ...r, vendorQuotes: [...r.vendorQuotes, ...vendors.map(v => ({ vendorId: v.vendorId, vendorName: v.vendorName, status: 'pending' as const }))] } : r));
  }, []);

  const selectRFPVendor = useCallback((rfpId: string, vendorId: string) => {
    setRFPs(prev => prev.map(r => {
      if (r.id !== rfpId) return r;
      const quote = r.vendorQuotes.find(q => q.vendorId === vendorId);
      const wo: WorkOrder = {
        id: `WO-${String(++woCounter).padStart(3, '0')}`, rfpId: r.id, requestId: r.requestId,
        propertyId: r.propertyId, propertyName: r.propertyName, unitId: r.unitId, unitNumber: r.unitNumber,
        description: r.description, priority: r.priority, vendorId, vendorName: quote?.vendorName || '', vendorAccepted: false,
        status: 'open', estimatedCost: quote?.estimatedCost || 0, dueDate: '', completionPhotos: [],
        ownerApprovalNeeded: false, attachments: r.attachments, notes: '', history: [
          { id: crypto.randomUUID(), workOrderId: '', statusTo: 'open', timestamp: now, userId: 'admin', userName: 'Admin', userRole: 'pm' },
        ], createdAt: now, updatedAt: now,
      };
      wo.history[0].workOrderId = wo.id;
      setWorkOrders(prev => [wo, ...prev]);
      return { ...r, status: 'awarded' as RFPStatus, selectedVendorId: vendorId };
    }));
  }, []);

  // -- Work Orders --
  const createWorkOrder = useCallback((data: WorkOrderFormData, propertyName: string, unitNumber?: string, vendorName?: string) => {
    const wo: WorkOrder = {
      id: `WO-${String(++woCounter).padStart(3, '0')}`,
      propertyId: data.propertyId, propertyName, unitId: data.unitId, unitNumber,
      description: data.description, priority: data.priority,
      vendorId: data.vendorId, vendorName, vendorAccepted: false,
      status: data.vendorId ? 'assigned' : 'open',
      estimatedCost: Number(data.estimatedCost) || 0, dueDate: data.dueDate,
      completionPhotos: [], ownerApprovalNeeded: false,
      attachments: data.attachments, notes: '', history: [
        { id: crypto.randomUUID(), workOrderId: '', statusTo: data.vendorId ? 'assigned' : 'open', timestamp: now, userId: 'admin', userName: 'Admin', userRole: 'pm' },
      ], createdAt: now, updatedAt: now,
    };
    wo.history[0].workOrderId = wo.id;
    setWorkOrders(prev => [wo, ...prev]);
    return wo;
  }, []);

  const updateWOStatus = useCallback((id: string, status: WorkOrderStatus, notes?: string) => {
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id !== id) return wo;
      const entry: WOHistoryEntry = { id: crypto.randomUUID(), workOrderId: id, statusFrom: wo.status, statusTo: status, timestamp: now, userId: 'admin', userName: 'Admin', userRole: 'pm', notes };
      return { ...wo, status, updatedAt: now, history: [...wo.history, entry] };
    }));
  }, []);

  const acceptVendorWO = useCallback((id: string) => {
    setWorkOrders(prev => prev.map(wo => wo.id === id ? { ...wo, vendorAccepted: true, status: 'assigned', updatedAt: now } : wo));
  }, []);

  const completeWO = useCallback((id: string, photos: string[], actualCost?: number) => {
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id !== id) return wo;
      return { ...wo, status: 'completed' as WorkOrderStatus, completionPhotos: photos, actualCost: actualCost ?? wo.actualCost, updatedAt: now };
    }));
  }, []);

  const approveOwnerWO = useCallback((id: string) => {
    setWorkOrders(prev => prev.map(wo => wo.id === id ? { ...wo, ownerApproved: true, updatedAt: now } : wo));
  }, []);

  const submitVendorQuote = useCallback((rfpId: string, vendorId: string, quote: { estimatedCost: number; estimatedDays: number; notes?: string }) => {
    setRFPs(prev => prev.map(r => {
      if (r.id !== rfpId) return r;
      return {
        ...r,
        vendorQuotes: r.vendorQuotes.map(q =>
          q.vendorId === vendorId
            ? { ...q, status: 'accepted' as const, estimatedCost: quote.estimatedCost, estimatedDays: quote.estimatedDays, submittedAt: new Date().toISOString() }
            : q
        ),
      };
    }));
  }, []);

  const declineRFPQuote = useCallback((rfpId: string, vendorId: string) => {
    setRFPs(prev => prev.map(r => {
      if (r.id !== rfpId) return r;
      return {
        ...r,
        vendorQuotes: r.vendorQuotes.map(q =>
          q.vendorId === vendorId ? { ...q, status: 'declined' as const } : q
        ),
      };
    }));
  }, []);

  const declineVendorWO = useCallback((id: string) => {
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id !== id) return wo;
      return { ...wo, vendorId: undefined, vendorName: undefined, vendorAccepted: false, status: 'open', updatedAt: now };
    }));
  }, []);

  const approveRequestToRFP = useCallback((id: string, vendors: { vendorId: string; vendorName: string }[], deadline?: string, message?: string) => {
    setServiceRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' as ServiceRequestStatus } : r));
    const req = serviceRequests.find(r => r.id === id);
    if (!req) return;
    const rfp: RFP = {
      id: `RFP-${String(++rfpCounter).padStart(3, '0')}`, requestId: req.id,
      description: req.description, propertyId: req.propertyId, propertyName: req.propertyName,
      unitId: req.unitId, unitNumber: req.unitNumber, priority: req.priority, status: 'open',
      attachments: [...req.attachments], vendorQuotes: vendors.map(v => ({ vendorId: v.vendorId, vendorName: v.vendorName, status: 'pending' as const })),
      createdAt: new Date().toISOString(),
    };
    setRFPs(prev => [rfp, ...prev]);
    return rfp;
  }, [serviceRequests]);

  const approveRequestToWO = useCallback((id: string, vendorId?: string, vendorName?: string, estimatedCost?: number, dueDate?: string) => {
    setServiceRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' as ServiceRequestStatus } : r));
    const req = serviceRequests.find(r => r.id === id);
    if (!req) return;
    const wo: WorkOrder = {
      id: `WO-${String(++woCounter).padStart(3, '0')}`, requestId: req.id,
      propertyId: req.propertyId, propertyName: req.propertyName, unitId: req.unitId, unitNumber: req.unitNumber,
      description: req.description, priority: req.priority,
      vendorId, vendorName, vendorAccepted: false,
      status: vendorId ? 'assigned' : 'open',
      estimatedCost: estimatedCost || 0, dueDate: dueDate || '',
      completionPhotos: [], ownerApprovalNeeded: false,
      attachments: [...req.attachments], notes: '', history: [
        { id: crypto.randomUUID(), workOrderId: '', statusTo: vendorId ? 'assigned' : 'open', timestamp: new Date().toISOString(), userId: 'admin', userName: 'Admin', userRole: 'pm' },
      ], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    wo.history[0].workOrderId = wo.id;
    setWorkOrders(prev => [wo, ...prev]);
    return wo;
  }, [serviceRequests]);

  const getWorkOrderById = useCallback((id: string) => workOrders.find(wo => wo.id === id), [workOrders]);
  const getServiceRequestById = useCallback((id: string) => serviceRequests.find(r => r.id === id), [serviceRequests]);
  const getRFPById = useCallback((id: string) => rfps.find(r => r.id === id), [rfps]);

  return {
    serviceRequests, pendingRequests, rejectedRequests, createRequest, approveRequest, rejectRequest, addRequestNote, getServiceRequestById,
    rfps, openRFPs, sendRFPToVendors, selectRFPVendor, getRFPById, submitVendorQuote, declineRFPQuote,
    workOrders, createWorkOrder, updateWOStatus, acceptVendorWO, declineVendorWO, completeWO, approveOwnerWO, getWorkOrderById,
    approveRequestToRFP, approveRequestToWO,
  };
}
