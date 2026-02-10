import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Download, Eye, FileText } from 'lucide-react';
import { useWorkOrdersContext } from '@/contexts/WorkOrdersContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  WO_PRIORITY_LABELS,
  WO_STATUS_LABELS,
  RFP_STATUS_LABELS,
  type WOPriority, type WorkOrderFormData,
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
    approveRequest, rejectRequest, createWorkOrder, createRequest,
  } = useWorkOrdersContext();

  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Reject dialog
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');

  // Create WO dialog
  const [createWOOpen, setCreateWOOpen] = useState(false);
  // Create RFP dialog
  const [createRFPOpen, setCreateRFPOpen] = useState(false);

  const [woForm, setWoForm] = useState<WorkOrderFormData>({
    propertyId: '', description: '', priority: 'medium', estimatedCost: '', dueDate: '', attachments: [],
  });
  const [rfpForm, setRfpForm] = useState({ propertyId: '', description: '', priority: 'medium' as WOPriority });

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

  /* ── Handlers ── */
  const handleReject = () => {
    if (!rejectReason) return;
    rejectRequest(rejectingId, rejectReason, rejectNotes);
    setRejectDialogOpen(false);
    setRejectReason('');
    setRejectNotes('');
    toast({ title: 'Request Rejected' });
  };

  const handleApprove = (id: string, direct: boolean) => {
    approveRequest(id, direct);
    toast({ title: direct ? 'Work Order Created' : 'RFP Created' });
  };

  const handleCreateWO = () => {
    if (!woForm.description) return;
    createWorkOrder(woForm, woForm.propertyId || 'General', undefined, undefined);
    setCreateWOOpen(false);
    setWoForm({ propertyId: '', description: '', priority: 'medium', estimatedCost: '', dueDate: '', attachments: [] });
    toast({ title: 'Work Order Created' });
  };

  const handleCreateRFP = () => {
    if (!rfpForm.description) return;
    const sr = createRequest({
      propertyId: rfpForm.propertyId || 'general',
      propertyName: rfpForm.propertyId || 'General',
      tenantId: 'admin',
      tenantName: 'Admin',
      description: rfpForm.description,
      priority: rfpForm.priority,
      attachments: [],
      notes: '',
    });
    approveRequest(sr.id, false);
    setCreateRFPOpen(false);
    setRfpForm({ propertyId: '', description: '', priority: 'medium' });
    toast({ title: 'RFP Created' });
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
      <Button size="sm" className="btn-primary" onClick={() => setCreateRFPOpen(true)}>
        <FileText className="h-4 w-4 mr-2" />
        Create RFP
      </Button>
      <Button size="sm" className="btn-primary" onClick={() => setCreateWOOpen(true)}>
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
                        <TableCell className="max-w-[200px] truncate text-muted-foreground">{wo.description}</TableCell>
                        <TableCell><PriorityBadge p={wo.priority} /></TableCell>
                        <TableCell><StatusBadge s={wo.status} /></TableCell>
                        <TableCell className="text-muted-foreground">{wo.vendorName || '—'}</TableCell>
                        <TableCell className="text-right">${wo.estimatedCost.toLocaleString()}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{wo.dueDate ? new Date(wo.dueDate).toLocaleDateString() : '—'}</TableCell>
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
                        <TableCell className="max-w-[200px] truncate text-muted-foreground">{wo.description}</TableCell>
                        <TableCell><PriorityBadge p={wo.priority} /></TableCell>
                        <TableCell><StatusBadge s={wo.status} /></TableCell>
                        <TableCell className="text-muted-foreground">{wo.vendorName || '—'}</TableCell>
                        <TableCell className="text-right">${wo.estimatedCost.toLocaleString()}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{wo.dueDate ? new Date(wo.dueDate).toLocaleDateString() : '—'}</TableCell>
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
                      <TableRow key={req.id} className="bg-card">
                        <TableCell className="font-medium">{req.id}</TableCell>
                        <TableCell>{req.propertyName}{req.unitNumber ? ` #${req.unitNumber}` : ''}</TableCell>
                        <TableCell className="text-muted-foreground">{req.tenantName}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground">{req.description}</TableCell>
                        <TableCell><PriorityBadge p={req.priority} /></TableCell>
                        <TableCell className="text-muted-foreground text-sm">{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => handleApprove(req.id, false)}>→ RFP</Button>
                            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => handleApprove(req.id, true)}>→ WO</Button>
                            <Button variant="ghost" size="sm" className="h-8 text-xs text-destructive-foreground" onClick={() => { setRejectingId(req.id); setRejectDialogOpen(true); }}>Reject</Button>
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
                      <TableRow key={rfp.id} className="bg-card">
                        <TableCell className="font-medium">{rfp.id}</TableCell>
                        <TableCell>{rfp.propertyName}{rfp.unitNumber ? ` #${rfp.unitNumber}` : ''}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground">{rfp.description}</TableCell>
                        <TableCell><PriorityBadge p={rfp.priority} /></TableCell>
                        <TableCell><Badge className="bg-secondary text-secondary-foreground border-0">{RFP_STATUS_LABELS[rfp.status]}</Badge></TableCell>
                        <TableCell className="text-center"><Badge variant="outline" className="bg-background">{rfp.vendorQuotes.length}</Badge></TableCell>
                        <TableCell className="text-muted-foreground text-sm">{new Date(rfp.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
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
                      <TableRow key={req.id} className="bg-card">
                        <TableCell className="font-medium">{req.id}</TableCell>
                        <TableCell>{req.propertyName}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground">{req.description}</TableCell>
                        <TableCell><PriorityBadge p={req.priority} /></TableCell>
                        <TableCell><Badge className="bg-destructive text-destructive-foreground border-0">{req.rejectionReason}</Badge></TableCell>
                        <TableCell className="text-muted-foreground text-sm">{req.rejectionNotes || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Service Request</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Reason</Label>
              <Select value={rejectReason} onValueChange={setRejectReason}>
                <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Duplicate">Duplicate</SelectItem>
                  <SelectItem value="Not covered">Not Covered Under Lease</SelectItem>
                  <SelectItem value="Insufficient info">Insufficient Information</SelectItem>
                  <SelectItem value="Tenant responsibility">Tenant Responsibility</SelectItem>
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

      {/* Create WO Dialog */}
      <Dialog open={createWOOpen} onOpenChange={setCreateWOOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create Work Order</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Property / Unit</Label>
              <Input value={woForm.propertyId} onChange={e => setWoForm({ ...woForm, propertyId: e.target.value })} placeholder="Property name or ID" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={woForm.description} onChange={e => setWoForm({ ...woForm, description: e.target.value })} placeholder="Describe the work…" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Priority</Label>
                <Select value={woForm.priority} onValueChange={v => setWoForm({ ...woForm, priority: v as WOPriority })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(WO_PRIORITY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Estimated Cost ($)</Label>
                <Input type="number" value={woForm.estimatedCost} onChange={e => setWoForm({ ...woForm, estimatedCost: e.target.value ? Number(e.target.value) : '' })} placeholder="0" />
              </div>
            </div>
            <div>
              <Label>Due Date</Label>
              <Input type="date" value={woForm.dueDate} onChange={e => setWoForm({ ...woForm, dueDate: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateWOOpen(false)}>Cancel</Button>
            <Button className="btn-primary" onClick={handleCreateWO} disabled={!woForm.description}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create RFP Dialog */}
      <Dialog open={createRFPOpen} onOpenChange={setCreateRFPOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Create RFP</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Property / Unit</Label>
              <Input value={rfpForm.propertyId} onChange={e => setRfpForm({ ...rfpForm, propertyId: e.target.value })} placeholder="Property name or ID" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={rfpForm.description} onChange={e => setRfpForm({ ...rfpForm, description: e.target.value })} placeholder="Describe the scope of work…" />
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={rfpForm.priority} onValueChange={v => setRfpForm({ ...rfpForm, priority: v as WOPriority })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(WO_PRIORITY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateRFPOpen(false)}>Cancel</Button>
            <Button className="btn-primary" onClick={handleCreateRFP} disabled={!rfpForm.description}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
