import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, LayoutGrid, List, ChevronDown } from 'lucide-react';
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
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import {
  WO_PRIORITY_LABELS, WO_PRIORITY_COLORS,
  WO_STATUS_LABELS, WO_STATUS_COLORS,
  SERVICE_REQUEST_STATUS_LABELS,
  RFP_STATUS_LABELS,
  type WOPriority, type WorkOrderFormData,
} from '@/types/workOrder';

export default function WorkOrdersDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    serviceRequests, pendingRequests, rejectedRequests,
    rfps, openRFPs,
    workOrders,
    approveRequest, rejectRequest,
    createWorkOrder,
  } = useWorkOrdersContext();

  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Work Orders</h1>
        <div className="h-1 w-16 rounded-full bg-secondary mt-2" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search work orders…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Button variant="outline" size="icon" className="shrink-0 sm:hidden" onClick={() => setFiltersOpen(!filtersOpen)}>
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2">
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[130px] h-9"><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {Object.entries(WO_PRIORITY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(WO_STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center border rounded-lg overflow-hidden">
            <Button variant={viewMode === 'table' ? 'default' : 'ghost'} size="icon" className="h-9 w-9 rounded-none" onClick={() => setViewMode('table')}><List className="h-4 w-4" /></Button>
            <Button variant={viewMode === 'card' ? 'default' : 'ghost'} size="icon" className="h-9 w-9 rounded-none" onClick={() => setViewMode('card')}><LayoutGrid className="h-4 w-4" /></Button>
          </div>
          <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-1" /> Create New WO</Button>
        </div>
      </div>

      {/* Mobile filters */}
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <CollapsibleContent className="sm:hidden space-y-2">
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              {Object.entries(WO_PRIORITY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(WO_STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </CollapsibleContent>
      </Collapsible>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="requests">
            Requests
            {pendingRequests.length > 0 && <Badge variant="secondary" className="ml-1.5 text-xs px-1.5">{pendingRequests.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="rfps">RFPs</TabsTrigger>
          <TabsTrigger value="workorders">Work Orders</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        {/* Tenant Requests Tab */}
        <TabsContent value="requests">
          {pendingRequests.length === 0 ? (
            <EmptyState message="No pending service requests." />
          ) : (
            <div className="space-y-3">
              {pendingRequests.map(req => (
                <Card key={req.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{req.id}</span>
                        <Badge className={WO_PRIORITY_COLORS[req.priority]}>{WO_PRIORITY_LABELS[req.priority]}</Badge>
                        <Badge variant="outline">{req.propertyName}{req.unitNumber ? ` #${req.unitNumber}` : ''}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{req.description}</p>
                      <p className="text-xs text-muted-foreground">By {req.tenantName} · {new Date(req.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => handleApprove(req.id, false)}>→ RFP</Button>
                      <Button size="sm" variant="default" onClick={() => handleApprove(req.id, true)}>→ Direct WO</Button>
                      <Button size="sm" variant="destructive" onClick={() => { setRejectingId(req.id); setRejectDialogOpen(true); }}>Reject</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* RFPs Tab */}
        <TabsContent value="rfps">
          {rfps.length === 0 ? (
            <EmptyState message="No RFPs created yet." />
          ) : (
            <div className="space-y-3">
              {rfps.map(rfp => (
                <Card key={rfp.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/work-orders/rfp/${rfp.id}`)}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-sm">{rfp.id}</span>
                      <Badge className={WO_PRIORITY_COLORS[rfp.priority]}>{WO_PRIORITY_LABELS[rfp.priority]}</Badge>
                      <Badge variant="outline">{RFP_STATUS_LABELS[rfp.status]}</Badge>
                      <Badge variant="outline">{rfp.propertyName}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{rfp.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{rfp.vendorQuotes.length} vendor(s) contacted · {new Date(rfp.createdAt).toLocaleDateString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Work Orders Tab */}
        <TabsContent value="workorders">
          <WOListView workOrders={filteredWOs} viewMode={viewMode} onView={id => navigate(`/work-orders/${id}`)} />
        </TabsContent>

        {/* Rejected Tab */}
        <TabsContent value="rejected">
          {rejectedRequests.length === 0 ? (
            <EmptyState message="No rejected requests." />
          ) : (
            <div className="space-y-3">
              {rejectedRequests.map(req => (
                <Card key={req.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-sm">{req.id}</span>
                      <Badge variant="destructive">Rejected</Badge>
                      <Badge variant="outline">{req.propertyName}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{req.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">Reason: {req.rejectionReason} {req.rejectionNotes ? `— ${req.rejectionNotes}` : ''}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* All Tab */}
        <TabsContent value="all">
          <WOListView workOrders={filteredWOs} viewMode={viewMode} onView={id => navigate(`/work-orders/${id}`)} />
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
            <Button onClick={handleCreateWO} disabled={!woForm.description}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ───── Sub-components ───── */

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <p>{message}</p>
      <p className="text-sm mt-1">Tenant requests will appear here.</p>
    </div>
  );
}

function WOListView({ workOrders, viewMode, onView }: { workOrders: any[]; viewMode: 'card' | 'table'; onView: (id: string) => void }) {
  if (workOrders.length === 0) return <EmptyState message="No active work orders." />;

  if (viewMode === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {workOrders.map(wo => (
          <Card key={wo.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onView(wo.id)}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{wo.id}</span>
                <Badge className={WO_PRIORITY_COLORS[wo.priority]}>{WO_PRIORITY_LABELS[wo.priority]}</Badge>
              </div>
              <p className="text-sm line-clamp-2">{wo.description}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={WO_STATUS_COLORS[wo.status]}>{WO_STATUS_LABELS[wo.status]}</Badge>
                <span className="text-xs text-muted-foreground">{wo.propertyName}</span>
              </div>
              {wo.vendorName && <p className="text-xs text-muted-foreground">Vendor: {wo.vendorName}</p>}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Est: ${wo.estimatedCost.toLocaleString()}</span>
                {wo.actualCost != null && <span>Act: ${wo.actualCost.toLocaleString()}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Property / Unit</TableHead>
          <TableHead className="hidden md:table-cell">Description</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="hidden lg:table-cell">Vendor</TableHead>
          <TableHead className="hidden lg:table-cell text-right">Est. Cost</TableHead>
          <TableHead className="hidden xl:table-cell">Due Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {workOrders.map(wo => (
          <TableRow key={wo.id} className="cursor-pointer" onClick={() => onView(wo.id)}>
            <TableCell className="font-medium">{wo.id}</TableCell>
            <TableCell>{wo.propertyName}{wo.unitNumber ? ` #${wo.unitNumber}` : ''}</TableCell>
            <TableCell className="hidden md:table-cell max-w-[200px] truncate">{wo.description}</TableCell>
            <TableCell><Badge className={WO_PRIORITY_COLORS[wo.priority]}>{WO_PRIORITY_LABELS[wo.priority]}</Badge></TableCell>
            <TableCell><Badge className={WO_STATUS_COLORS[wo.status]}>{WO_STATUS_LABELS[wo.status]}</Badge></TableCell>
            <TableCell className="hidden lg:table-cell">{wo.vendorName || '—'}</TableCell>
            <TableCell className="hidden lg:table-cell text-right">${wo.estimatedCost.toLocaleString()}</TableCell>
            <TableCell className="hidden xl:table-cell">{wo.dueDate ? new Date(wo.dueDate).toLocaleDateString() : '—'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
