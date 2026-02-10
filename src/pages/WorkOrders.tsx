import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Download, Eye, Pencil, Filter } from 'lucide-react';
import { useWorkOrdersContext } from '@/contexts/WorkOrdersContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  WO_PRIORITY_LABELS, WO_PRIORITY_COLORS,
  WO_STATUS_LABELS, WO_STATUS_COLORS,
  RFP_STATUS_LABELS,
  type WOPriority, type WorkOrderFormData,
} from '@/types/workOrder';

export default function WorkOrdersDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    serviceRequests, pendingRequests, rejectedRequests,
    rfps,
    workOrders,
    approveRequest, rejectRequest,
    createWorkOrder,
  } = useWorkOrdersContext();

  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Reject dialog
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');

  // Create WO dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [woForm, setWoForm] = useState<WorkOrderFormData>({
    propertyId: '', description: '', priority: 'medium', estimatedCost: '', dueDate: '', attachments: [],
  });

  const filteredWOs = useMemo(() => {
    return workOrders.filter(wo => {
      if (search && !wo.description.toLowerCase().includes(search.toLowerCase()) && !wo.id.toLowerCase().includes(search.toLowerCase())) return false;
      if (priorityFilter !== 'all' && wo.priority !== priorityFilter) return false;
      if (statusFilter !== 'all' && wo.status !== statusFilter) return false;
      return true;
    });
  }, [workOrders, search, priorityFilter, statusFilter]);

  const handleReject = () => {
    if (!rejectReason) return;
    rejectRequest(rejectingId, rejectReason, rejectNotes);
    setRejectDialogOpen(false);
    setRejectReason('');
    setRejectNotes('');
    toast({ title: 'Request Rejected', description: 'The service request has been rejected.' });
  };

  const handleApprove = (id: string, direct: boolean) => {
    approveRequest(id, direct);
    toast({ title: direct ? 'Work Order Created' : 'RFP Created', description: direct ? 'A new work order has been created.' : 'An RFP has been created from this request.' });
  };

  const handleCreateWO = () => {
    if (!woForm.description || !woForm.priority) return;
    createWorkOrder(woForm, woForm.propertyId || 'General', undefined, undefined);
    setCreateOpen(false);
    setWoForm({ propertyId: '', description: '', priority: 'medium', estimatedCost: '', dueDate: '', attachments: [] });
    toast({ title: 'Work Order Created' });
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
    a.href = url;
    a.download = 'work_orders.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getPriorityBadge = (priority: WOPriority) => {
    const colors: Record<WOPriority, string> = {
      low: 'bg-secondary text-secondary-foreground border-0',
      medium: 'bg-primary/20 text-primary-foreground border-0',
      high: 'bg-warning text-warning-foreground border-0',
      urgent: 'bg-destructive text-destructive-foreground border-0',
      emergency: 'bg-destructive text-destructive-foreground border-0',
    };
    return <Badge className={colors[priority]}>{WO_PRIORITY_LABELS[priority]}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-primary/20 text-primary-foreground border-0',
      assigned: 'bg-warning text-warning-foreground border-0',
      in_progress: 'bg-secondary text-secondary-foreground border-0',
      completed: 'bg-muted text-muted-foreground border-0',
      cancelled: 'bg-destructive text-destructive-foreground border-0',
    };
    return <Badge className={colors[status] || 'border-0'}>{WO_STATUS_LABELS[status as keyof typeof WO_STATUS_LABELS] || status}</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header — matches Owners */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Work Orders</h1>
        <div className="h-1 w-16 bg-secondary rounded-full mt-2" />
      </div>

      {/* Tabs — matches Owners pattern */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All ({workOrders.length})</TabsTrigger>
          <TabsTrigger value="requests">Requests ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="rfps">RFPs ({rfps.length})</TabsTrigger>
          <TabsTrigger value="workorders">Work Orders ({workOrders.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedRequests.length})</TabsTrigger>
        </TabsList>

        {/* ── All / Work Orders Tab ── */}
        <TabsContent value="all">
          <WOTableSection
            workOrders={filteredWOs}
            search={search}
            onSearchChange={setSearch}
            priorityFilter={priorityFilter}
            onPriorityChange={setPriorityFilter}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            onCreateNew={() => setCreateOpen(true)}
            onExport={exportCsv}
            onView={id => navigate(`/work-orders/${id}`)}
            getPriorityBadge={getPriorityBadge}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        <TabsContent value="workorders">
          <WOTableSection
            workOrders={filteredWOs}
            search={search}
            onSearchChange={setSearch}
            priorityFilter={priorityFilter}
            onPriorityChange={setPriorityFilter}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            onCreateNew={() => setCreateOpen(true)}
            onExport={exportCsv}
            onView={id => navigate(`/work-orders/${id}`)}
            getPriorityBadge={getPriorityBadge}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        {/* ── Requests Tab ── */}
        <TabsContent value="requests">
          <div className="space-y-4">
            {pendingRequests.length === 0 ? (
              <EmptyState message="No pending service requests." />
            ) : (
              <div className="card-elevated overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-card hover:bg-card">
                      <TableHead>ID</TableHead>
                      <TableHead>Property / Unit</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRequests.map(req => (
                      <TableRow key={req.id} className="bg-card">
                        <TableCell className="font-medium">{req.id}</TableCell>
                        <TableCell>{req.propertyName}{req.unitNumber ? ` #${req.unitNumber}` : ''}</TableCell>
                        <TableCell className="text-muted-foreground">{req.tenantName}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground">{req.description}</TableCell>
                        <TableCell>{getPriorityBadge(req.priority)}</TableCell>
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

        {/* ── RFPs Tab ── */}
        <TabsContent value="rfps">
          <div className="space-y-4">
            {rfps.length === 0 ? (
              <EmptyState message="No RFPs created yet." />
            ) : (
              <div className="card-elevated overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-card hover:bg-card">
                      <TableHead>ID</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Vendors</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rfps.map(rfp => (
                      <TableRow key={rfp.id} className="bg-card">
                        <TableCell className="font-medium">{rfp.id}</TableCell>
                        <TableCell>{rfp.propertyName}{rfp.unitNumber ? ` #${rfp.unitNumber}` : ''}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground">{rfp.description}</TableCell>
                        <TableCell>{getPriorityBadge(rfp.priority)}</TableCell>
                        <TableCell><Badge className="bg-secondary text-secondary-foreground border-0">{RFP_STATUS_LABELS[rfp.status]}</Badge></TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="bg-background">{rfp.vendorQuotes.length}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{new Date(rfp.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="View" onClick={() => navigate(`/work-orders/rfp/${rfp.id}`)}>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Rejected Tab ── */}
        <TabsContent value="rejected">
          <div className="space-y-4">
            {rejectedRequests.length === 0 ? (
              <EmptyState message="No rejected requests." />
            ) : (
              <div className="card-elevated overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-card hover:bg-card">
                      <TableHead>ID</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rejectedRequests.map(req => (
                      <TableRow key={req.id} className="bg-card">
                        <TableCell className="font-medium">{req.id}</TableCell>
                        <TableCell>{req.propertyName}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground">{req.description}</TableCell>
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
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
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
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button className="btn-primary" onClick={handleCreateWO} disabled={!woForm.description}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ───── WO Table Section — mirrors OwnersTable layout ───── */

interface WOTableSectionProps {
  workOrders: any[];
  search: string;
  onSearchChange: (v: string) => void;
  priorityFilter: string;
  onPriorityChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
  onCreateNew: () => void;
  onExport: () => void;
  onView: (id: string) => void;
  getPriorityBadge: (p: WOPriority) => JSX.Element;
  getStatusBadge: (s: string) => JSX.Element;
}

function WOTableSection({
  workOrders, search, onSearchChange,
  priorityFilter, onPriorityChange, statusFilter, onStatusChange,
  onCreateNew, onExport, onView,
  getPriorityBadge, getStatusBadge,
}: WOTableSectionProps) {
  return (
    <div className="space-y-4">
      {/* Toolbar — matches Owners: search left, buttons right */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID or description..."
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={priorityFilter} onValueChange={onPriorityChange}>
            <SelectTrigger className="w-[130px] h-9"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              {Object.entries(WO_PRIORITY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[130px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(WO_STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button size="sm" className="btn-primary" onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Create New WO
          </Button>
        </div>
      </div>

      {/* Table — card-elevated wrapper, bg-card rows like Owners */}
      {workOrders.length === 0 ? (
        <EmptyState message="No active work orders. Tenant requests will appear here." />
      ) : (
        <div className="card-elevated overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-card hover:bg-card">
                <TableHead>ID</TableHead>
                <TableHead>Property / Unit</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Est. Cost</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workOrders.map(wo => (
                <TableRow key={wo.id} className="bg-card">
                  <TableCell className="font-medium">{wo.id}</TableCell>
                  <TableCell>{wo.propertyName}{wo.unitNumber ? ` #${wo.unitNumber}` : ''}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">{wo.description}</TableCell>
                  <TableCell>{getPriorityBadge(wo.priority)}</TableCell>
                  <TableCell>{getStatusBadge(wo.status)}</TableCell>
                  <TableCell className="text-muted-foreground">{wo.vendorName || '—'}</TableCell>
                  <TableCell className="text-right">${wo.estimatedCost.toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{wo.dueDate ? new Date(wo.dueDate).toLocaleDateString() : '—'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="View" onClick={() => onView(wo.id)}>
                        <Eye className="h-4 w-4 text-muted-foreground" />
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
