import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Download, Eye, FileText } from 'lucide-react';
import { VendorSelector } from '@/components/workorders/VendorSelector';
import { useWorkOrdersContext } from '@/contexts/WorkOrdersContext';
import { useVendorsContext } from '@/contexts/VendorsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  WO_PRIORITY_LABELS,
  WO_STATUS_LABELS,
  RFP_STATUS_LABELS,
  type WOPriority,
} from '@/types/workOrder';

/* ───── helpers ───── */

const PRIORITY_BADGE: Record<WOPriority, string> = {
  low: 'bg-secondary text-secondary-foreground border-0',
  medium: 'bg-primary/20 text-primary-foreground border-0',
  high: 'bg-warning text-warning-foreground border-0',
  urgent: 'bg-destructive text-destructive-foreground border-0',
  emergency: 'bg-destructive text-destructive-foreground border-0',
};

const STATUS_BADGE: Record<string, string> = {
  open: 'bg-primary/20 text-primary-foreground border-0',
  assigned: 'bg-warning text-warning-foreground border-0',
  in_progress: 'bg-secondary text-secondary-foreground border-0',
  completed: 'bg-muted text-muted-foreground border-0',
  cancelled: 'bg-destructive text-destructive-foreground border-0',
};

function PriorityBadge({ p }: { p: WOPriority }) {
  return <Badge className={PRIORITY_BADGE[p]}>{WO_PRIORITY_LABELS[p]}</Badge>;
}
function StatusBadge({ s }: { s: string }) {
  return <Badge className={STATUS_BADGE[s] || 'border-0'}>{WO_STATUS_LABELS[s as keyof typeof WO_STATUS_LABELS] || s}</Badge>;
}

/* ───── Shared toolbar ───── */

function SearchFilterToolbar({
  search, onSearch, priorityFilter, onPriority, statusFilter, onStatus,
  onExport, extraButtons,
}: {
  search: string; onSearch: (v: string) => void;
  priorityFilter: string; onPriority: (v: string) => void;
  statusFilter?: string; onStatus?: (v: string) => void;
  onExport: () => void;
  extraButtons?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by ID or description..." value={search} onChange={e => onSearch(e.target.value)} className="pl-9 bg-background" />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={priorityFilter} onValueChange={onPriority}>
          <SelectTrigger className="w-[130px] h-9"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {Object.entries(WO_PRIORITY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        {statusFilter !== undefined && onStatus && (
          <Select value={statusFilter} onValueChange={onStatus}>
            <SelectTrigger className="w-[130px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(WO_STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
        {extraButtons}
      </div>
    </div>
  );
}

/* ───── Empty State ───── */

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="text-lg text-muted-foreground">{message}</p>
    </div>
  );
}

/* ───── Main Component ───── */

export default function WorkOrdersDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    serviceRequests, pendingRequests, rejectedRequests,
    rfps, workOrders,
    rejectRequest,
    approveRequestToRFP, approveRequestToWO,
  } = useWorkOrdersContext();
  const { activeVendors } = useVendorsContext();

  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Reject dialog
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');

  // SR → RFP modal
  const [srRfpOpen, setSrRfpOpen] = useState(false);
  const [srRfpId, setSrRfpId] = useState('');
  const [srRfpVendors, setSrRfpVendors] = useState<string[]>([]);
  const [srRfpDeadline, setSrRfpDeadline] = useState('');
  const [srRfpMessage, setSrRfpMessage] = useState('');

  // SR → Direct WO modal
  const [srWoOpen, setSrWoOpen] = useState(false);
  const [srWoId, setSrWoId] = useState('');
  const [srWoVendorSelection, setSrWoVendorSelection] = useState<string[]>([]);
  const [srWoCost, setSrWoCost] = useState('');
  const [srWoDueDate, setSrWoDueDate] = useState('');
  /* ── Filtered data ── */
  const filteredWOs = useMemo(() => workOrders.filter(wo => {
    if (search && !wo.description.toLowerCase().includes(search.toLowerCase()) && !wo.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (priorityFilter !== 'all' && wo.priority !== priorityFilter) return false;
    if (statusFilter !== 'all' && wo.status !== statusFilter) return false;
    return true;
  }), [workOrders, search, priorityFilter, statusFilter]);

  const filteredRequests = useMemo(() => pendingRequests.filter(r => {
    if (search && !r.description.toLowerCase().includes(search.toLowerCase()) && !r.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (priorityFilter !== 'all' && r.priority !== priorityFilter) return false;
    return true;
  }), [pendingRequests, search, priorityFilter]);

  const filteredRFPs = useMemo(() => rfps.filter(r => {
    if (search && !r.description.toLowerCase().includes(search.toLowerCase()) && !r.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (priorityFilter !== 'all' && r.priority !== priorityFilter) return false;
    return true;
  }), [rfps, search, priorityFilter]);

  const filteredRejected = useMemo(() => rejectedRequests.filter(r => {
    if (search && !r.description.toLowerCase().includes(search.toLowerCase()) && !r.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (priorityFilter !== 'all' && r.priority !== priorityFilter) return false;
    return true;
  }), [rejectedRequests, search, priorityFilter]);

  const srForRfp = serviceRequests.find(r => r.id === srRfpId);
  const srForWo = serviceRequests.find(r => r.id === srWoId);

  /* ── Handlers ── */
  const handleReject = () => {
    if (!rejectReason) return;
    rejectRequest(rejectingId, rejectReason, rejectNotes);
    setRejectDialogOpen(false);
    setRejectReason('');
    setRejectNotes('');
    toast({ title: 'Request Rejected' });
  };

  const handleOpenSrRfp = (id: string) => {
    setSrRfpId(id);
    setSrRfpVendors([]);
    setSrRfpDeadline('');
    setSrRfpMessage('');
    setSrRfpOpen(true);
  };

  const handleOpenSrWo = (id: string) => {
    setSrWoId(id);
    setSrWoVendorSelection([]);
    setSrWoCost('');
    setSrWoDueDate('');
    setSrWoOpen(true);
  };

  const handleSendRfp = () => {
    if (srRfpVendors.length === 0) {
      toast({ title: 'No vendors selected', description: 'Select at least one vendor to send the RFP.', variant: 'destructive' });
      return;
    }
    const vendors = srRfpVendors.map(vid => {
      const v = activeVendors.find(av => av.id === vid);
      return { vendorId: vid, vendorName: v ? (v.companyName || `${v.firstName} ${v.lastName}`) : vid };
    });
    approveRequestToRFP(srRfpId, vendors, srRfpDeadline, srRfpMessage);
    setSrRfpOpen(false);
    toast({ title: 'RFP Created & Sent', description: `RFP sent to ${vendors.length} vendor(s).` });
  };

  const handleCreateDirectWO = () => {
    const vendorId = srWoVendorSelection[0];
    const vendor = vendorId ? activeVendors.find(v => v.id === vendorId) : undefined;
    const vendorName = vendor ? (vendor.companyName || `${vendor.firstName} ${vendor.lastName}`) : undefined;
    approveRequestToWO(srWoId, vendorId || undefined, vendorName, srWoCost ? Number(srWoCost) : undefined, srWoDueDate || undefined);
    setSrWoOpen(false);
    toast({ title: 'Work Order Created', description: vendorId ? 'WO sent to vendor for acceptance.' : 'Work order created (unassigned).' });
  };


  const exportCsv = () => {
    const headers = ['ID', 'Property', 'Description', 'Priority', 'Status', 'Vendor', 'Est. Cost', 'Due Date'];
    const rows = filteredWOs.map(wo => [
      wo.id, wo.propertyName, wo.description, WO_PRIORITY_LABELS[wo.priority],
      WO_STATUS_LABELS[wo.status], wo.vendorName || '', wo.estimatedCost.toString(),
      wo.dueDate ? new Date(wo.dueDate).toLocaleDateString() : '',
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'work_orders.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const createButtons = (
    <>
      <Button size="sm" className="btn-primary" onClick={() => navigate('/work-orders/create-rfp')}>
        <FileText className="h-4 w-4 mr-2" />
        Create RFP
      </Button>
      <Button size="sm" className="btn-primary" onClick={() => navigate('/work-orders/create-wo')}>
        <Plus className="h-4 w-4 mr-2" />
        Create WO
      </Button>
    </>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Work Orders</h1>
        <div className="h-1 w-16 bg-secondary rounded-full mt-2" />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({workOrders.length})</TabsTrigger>
          <TabsTrigger value="requests">Requests ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="rfps">RFPs ({rfps.length})</TabsTrigger>
          <TabsTrigger value="workorders">Work Orders ({workOrders.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedRequests.length})</TabsTrigger>
        </TabsList>

        {/* ── All ── */}
        <TabsContent value="all">
          <div className="space-y-4">
            <SearchFilterToolbar search={search} onSearch={setSearch} priorityFilter={priorityFilter} onPriority={setPriorityFilter} statusFilter={statusFilter} onStatus={setStatusFilter} onExport={exportCsv} extraButtons={createButtons} />
            {filteredWOs.length === 0 ? <EmptyState message="No active work orders. Tenant requests will appear here." /> : (
              <div className="card-elevated overflow-hidden">
                <Table>
                  <TableHeader><TableRow className="bg-card hover:bg-card">
                    <TableHead>ID</TableHead><TableHead>Property / Unit</TableHead><TableHead>Description</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead>Vendor</TableHead><TableHead className="text-right">Est. Cost</TableHead><TableHead>Due Date</TableHead><TableHead className="text-right">Actions</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {filteredWOs.map(wo => (
                      <TableRow key={wo.id} className="bg-card">
                        <TableCell className="font-medium">{wo.id}</TableCell>
                        <TableCell>{wo.propertyName}{wo.unitNumber ? ` #${wo.unitNumber}` : ''}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{wo.description}</TableCell>
                        <TableCell><PriorityBadge p={wo.priority} /></TableCell>
                        <TableCell><StatusBadge s={wo.status} /></TableCell>
                        <TableCell>{wo.vendorName || '—'}</TableCell>
                        <TableCell className="text-right">${wo.estimatedCost.toLocaleString()}</TableCell>
                        <TableCell className="text-sm">{wo.dueDate ? new Date(wo.dueDate).toLocaleDateString() : '—'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="View" onClick={() => navigate(`/work-orders/${wo.id}`)}><Eye className="h-4 w-4 text-muted-foreground" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Work Orders ── */}
        <TabsContent value="workorders">
          <div className="space-y-4">
            <SearchFilterToolbar search={search} onSearch={setSearch} priorityFilter={priorityFilter} onPriority={setPriorityFilter} statusFilter={statusFilter} onStatus={setStatusFilter} onExport={exportCsv} extraButtons={createButtons} />
            {filteredWOs.length === 0 ? <EmptyState message="No work orders found." /> : (
              <div className="card-elevated overflow-hidden">
                <Table>
                  <TableHeader><TableRow className="bg-card hover:bg-card">
                    <TableHead>ID</TableHead><TableHead>Property / Unit</TableHead><TableHead>Description</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead>Vendor</TableHead><TableHead className="text-right">Est. Cost</TableHead><TableHead>Due Date</TableHead><TableHead className="text-right">Actions</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {filteredWOs.map(wo => (
                      <TableRow key={wo.id} className="bg-card">
                        <TableCell className="font-medium">{wo.id}</TableCell>
                        <TableCell>{wo.propertyName}{wo.unitNumber ? ` #${wo.unitNumber}` : ''}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{wo.description}</TableCell>
                        <TableCell><PriorityBadge p={wo.priority} /></TableCell>
                        <TableCell><StatusBadge s={wo.status} /></TableCell>
                        <TableCell>{wo.vendorName || '—'}</TableCell>
                        <TableCell className="text-right">${wo.estimatedCost.toLocaleString()}</TableCell>
                        <TableCell className="text-sm">{wo.dueDate ? new Date(wo.dueDate).toLocaleDateString() : '—'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="View" onClick={() => navigate(`/work-orders/${wo.id}`)}><Eye className="h-4 w-4 text-muted-foreground" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Requests ── */}
        <TabsContent value="requests">
          <div className="space-y-4">
            <SearchFilterToolbar search={search} onSearch={setSearch} priorityFilter={priorityFilter} onPriority={setPriorityFilter} onExport={exportCsv} extraButtons={createButtons} />
            {filteredRequests.length === 0 ? <EmptyState message="No pending service requests." /> : (
              <div className="card-elevated overflow-hidden">
                <Table>
                  <TableHeader><TableRow className="bg-card hover:bg-card">
                    <TableHead>ID</TableHead><TableHead>Property / Unit</TableHead><TableHead>Tenant</TableHead><TableHead>Description</TableHead><TableHead>Priority</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Actions</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {filteredRequests.map(req => (
                      <TableRow key={req.id} className="bg-card cursor-pointer" onClick={() => navigate(`/work-orders/requests/${req.id}`)}>
                        <TableCell className="font-medium">{req.id}</TableCell>
                        <TableCell>{req.propertyName}{req.unitNumber ? ` #${req.unitNumber}` : ''}</TableCell>
                        <TableCell>{req.tenantName}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{req.description}</TableCell>
                        <TableCell><PriorityBadge p={req.priority} /></TableCell>
                        <TableCell className="text-sm">{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              className="h-7 px-2.5 text-xs rounded-lg bg-secondary text-secondary-foreground hover:opacity-90 hover:scale-[1.05] transition-all"
                              onClick={() => handleOpenSrRfp(req.id)}
                            >
                              → RFP
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 px-2.5 text-xs rounded-lg bg-primary text-primary-foreground hover:opacity-90 hover:scale-[1.05] transition-all"
                              onClick={() => handleOpenSrWo(req.id)}
                            >
                              → WO
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 px-2.5 text-xs rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 hover:scale-[1.05] transition-all"
                              onClick={() => { setRejectingId(req.id); setRejectDialogOpen(true); }}
                            >
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── RFPs ── */}
        <TabsContent value="rfps">
          <div className="space-y-4">
            <SearchFilterToolbar search={search} onSearch={setSearch} priorityFilter={priorityFilter} onPriority={setPriorityFilter} onExport={exportCsv} extraButtons={createButtons} />
            {filteredRFPs.length === 0 ? <EmptyState message="No RFPs created yet." /> : (
              <div className="card-elevated overflow-hidden">
                <Table>
                  <TableHeader><TableRow className="bg-card hover:bg-card">
                    <TableHead>ID</TableHead><TableHead>Property</TableHead><TableHead>Description</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead className="text-center">Vendors</TableHead><TableHead>Created</TableHead><TableHead className="text-right">Actions</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {filteredRFPs.map(rfp => (
                      <TableRow key={rfp.id} className="bg-card cursor-pointer" onClick={() => navigate(`/work-orders/rfp/${rfp.id}`)}>
                        <TableCell className="font-medium">{rfp.id}</TableCell>
                        <TableCell>{rfp.propertyName}{rfp.unitNumber ? ` #${rfp.unitNumber}` : ''}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{rfp.description}</TableCell>
                        <TableCell><PriorityBadge p={rfp.priority} /></TableCell>
                        <TableCell><Badge className="bg-secondary text-secondary-foreground border-0">{RFP_STATUS_LABELS[rfp.status]}</Badge></TableCell>
                        <TableCell className="text-center"><Badge variant="outline" className="bg-background">{rfp.vendorQuotes.length}</Badge></TableCell>
                        <TableCell className="text-sm">{new Date(rfp.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="View" onClick={() => navigate(`/work-orders/rfp/${rfp.id}`)}><Eye className="h-4 w-4 text-muted-foreground" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Rejected ── */}
        <TabsContent value="rejected">
          <div className="space-y-4">
            <SearchFilterToolbar search={search} onSearch={setSearch} priorityFilter={priorityFilter} onPriority={setPriorityFilter} onExport={exportCsv} />
            {filteredRejected.length === 0 ? <EmptyState message="No rejected requests." /> : (
              <div className="card-elevated overflow-hidden">
                <Table>
                  <TableHeader><TableRow className="bg-card hover:bg-card">
                    <TableHead>ID</TableHead><TableHead>Property</TableHead><TableHead>Description</TableHead><TableHead>Priority</TableHead><TableHead>Reason</TableHead><TableHead>Notes</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {filteredRejected.map(req => (
                      <TableRow key={req.id} className="bg-card cursor-pointer" onClick={() => navigate(`/work-orders/requests/${req.id}`)}>
                        <TableCell className="font-medium">{req.id}</TableCell>
                        <TableCell>{req.propertyName}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{req.description}</TableCell>
                        <TableCell><PriorityBadge p={req.priority} /></TableCell>
                        <TableCell><Badge className="bg-destructive text-destructive-foreground border-0">{req.rejectionReason}</Badge></TableCell>
                        <TableCell className="text-sm">{req.rejectionNotes || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Reject Dialog ── */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Service Request</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Reason</Label>
              <Select value={rejectReason} onValueChange={setRejectReason}>
                <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not Maintenance Issue">Not Maintenance Issue</SelectItem>
                  <SelectItem value="Duplicate">Duplicate</SelectItem>
                  <SelectItem value="Tenant Responsibility">Tenant Responsibility</SelectItem>
                  <SelectItem value="Not covered">Not Covered Under Lease</SelectItem>
                  <SelectItem value="Insufficient info">Insufficient Information</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={rejectNotes} onChange={e => setRejectNotes(e.target.value)} placeholder="Additional details…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── SR → RFP Modal ── */}
      <Dialog open={srRfpOpen} onOpenChange={setSrRfpOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create RFP from {srRfpId}</DialogTitle>
          </DialogHeader>
          {srForRfp && (
            <div className="space-y-4">
              {/* Pre-filled info */}
              <div className="p-3 rounded-lg bg-muted/50 space-y-1 text-sm">
                <p><span className="text-muted-foreground">Property:</span> <span className="font-medium">{srForRfp.propertyName}{srForRfp.unitNumber ? ` #${srForRfp.unitNumber}` : ''}</span></p>
                <p><span className="text-muted-foreground">Priority:</span> <Badge className={PRIORITY_BADGE[srForRfp.priority] + ' ml-1'}>{WO_PRIORITY_LABELS[srForRfp.priority]}</Badge></p>
                <p><span className="text-muted-foreground">Description:</span> {srForRfp.description.slice(0, 120)}{srForRfp.description.length > 120 ? '…' : ''}</p>
                {srForRfp.attachments.length > 0 && (
                  <p><span className="text-muted-foreground">Attachments:</span> {srForRfp.attachments.length} file(s) will be linked</p>
                )}
              </div>

              <Separator />

              {/* Vendor Selection */}
              <div>
                <Label className="mb-2 block">Select Vendors</Label>
                <VendorSelector
                  vendors={activeVendors}
                  mode="multi"
                  selected={srRfpVendors}
                  onSelectionChange={setSrRfpVendors}
                  taskDescription={srForRfp.description}
                  taskCategory={srForRfp.category}
                  taskRegion=""
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Deadline</Label>
                  <Input type="date" value={srRfpDeadline} onChange={e => setSrRfpDeadline(e.target.value)} />
                </div>
              </div>

              <div>
                <Label>Message to Vendors (optional)</Label>
                <Textarea value={srRfpMessage} onChange={e => setSrRfpMessage(e.target.value)} placeholder="Add a custom note for vendors…" rows={2} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSrRfpOpen(false)}>Cancel</Button>
            <Button className="bg-secondary text-secondary-foreground hover:opacity-90" onClick={handleSendRfp} disabled={srRfpVendors.length === 0}>
              Send RFQ ({srRfpVendors.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── SR → Direct WO Modal ── */}
      <Dialog open={srWoOpen} onOpenChange={setSrWoOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Direct Work Order from {srWoId}</DialogTitle>
          </DialogHeader>
          {srForWo && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50 space-y-1 text-sm">
                <p><span className="text-muted-foreground">Property:</span> <span className="font-medium">{srForWo.propertyName}{srForWo.unitNumber ? ` #${srForWo.unitNumber}` : ''}</span></p>
                <p><span className="text-muted-foreground">Priority:</span> <Badge className={PRIORITY_BADGE[srForWo.priority] + ' ml-1'}>{WO_PRIORITY_LABELS[srForWo.priority]}</Badge></p>
                <p><span className="text-muted-foreground">Description:</span> {srForWo.description.slice(0, 120)}{srForWo.description.length > 120 ? '…' : ''}</p>
                {srForWo.attachments.length > 0 && (
                  <p><span className="text-muted-foreground">Attachments:</span> {srForWo.attachments.length} file(s) will be linked</p>
                )}
              </div>

              <Separator />

              <div>
                <Label className="mb-2 block">Assign Vendor</Label>
                <VendorSelector
                  vendors={activeVendors}
                  mode="single"
                  selected={srWoVendorSelection}
                  onSelectionChange={setSrWoVendorSelection}
                  taskDescription={srForWo.description}
                  taskCategory={srForWo.category}
                  taskRegion=""
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Estimated Cost ($)</Label>
                  <Input type="number" value={srWoCost} onChange={e => setSrWoCost(e.target.value)} placeholder="0" />
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input type="date" value={srWoDueDate} onChange={e => setSrWoDueDate(e.target.value)} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSrWoOpen(false)}>Cancel</Button>
            <Button className="bg-primary text-primary-foreground hover:opacity-90" onClick={handleCreateDirectWO}>
              Create & Send WO
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
