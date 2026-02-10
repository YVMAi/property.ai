import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  ArrowLeft, Pencil, Wrench, FileText, DollarSign, ShieldCheck, StickyNote, Download,
  MessageSquare, MapPin, Clock, AlertTriangle, Plus, ChevronsUpDown,
} from 'lucide-react';
import { getVendorDisplayName } from '@/types/vendor';
import type { VendorStatus, WOStatus, ComplaintStatus } from '@/types/vendor';
import { useVendorsContext } from '@/contexts/VendorsContext';
import { useToast } from '@/hooks/use-toast';

export default function VendorViewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getVendorById, vendors, changeStatus, runBGV, updateNotes, assignWorkOrder } = useVendorsContext();
  const { toast } = useToast();
  const allVendors = vendors.filter((v) => v.status !== 'deleted');

  const vendor = id ? getVendorById(id) : undefined;

  if (!vendor) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg text-muted-foreground mb-4">Vendor not found.</p>
        <Button variant="outline" onClick={() => navigate('/users/vendors')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Vendors
        </Button>
      </div>
    );
  }

  return <VendorDashboard vendor={vendor} allVendors={allVendors} />;
}

function VendorDashboard({ vendor, allVendors }: { vendor: NonNullable<ReturnType<ReturnType<typeof useVendorsContext>['getVendorById']>>; allVendors: typeof vendor[] }) {
  const navigate = useNavigate();
  const { changeStatus, runBGV, updateNotes, assignWorkOrder } = useVendorsContext();
  const { toast } = useToast();
  const [notes, setNotes] = useState(vendor.notes);
  const [woDialogOpen, setWoDialogOpen] = useState(false);
  const [woForm, setWoForm] = useState({ propertyName: '', description: '', dueDate: '' });

  const displayName = getVendorDisplayName(vendor);

  const statusBadge = (() => {
    switch (vendor.status) {
      case 'active': return <Badge className="bg-secondary text-secondary-foreground border-0">Active</Badge>;
      case 'archived': return <Badge className="bg-muted text-muted-foreground border-0">Archived</Badge>;
      case 'blacklisted': return <Badge className="bg-destructive text-destructive-foreground border-0">Blacklisted</Badge>;
      default: return null;
    }
  })();

  const activeWOs = vendor.workOrders.filter((wo) => wo.status === 'open' || wo.status === 'in_progress').length;
  const completedWOs = vendor.workOrders.filter((wo) => wo.status === 'completed').length;
  const totalPaid = vendor.payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);

  const handleRunBGV = () => {
    runBGV(vendor.id);
    toast({ title: 'BGV initiated', description: 'Background verification is running.' });
  };

  const handleSaveNotes = () => {
    updateNotes(vendor.id, notes);
    toast({ title: 'Notes saved', description: 'Vendor notes updated.' });
  };

  const handleAssignWO = () => {
    if (!woForm.propertyName.trim() || !woForm.description.trim()) {
      toast({ title: 'Missing fields', description: 'Please fill in property and description.', variant: 'destructive' });
      return;
    }
    if (vendor.status === 'blacklisted') {
      toast({ title: 'Cannot assign', description: 'This vendor is blacklisted.', variant: 'destructive' });
      return;
    }
    assignWorkOrder(vendor.id, woForm);
    toast({ title: 'Work order assigned', description: 'New work order has been created.' });
    setWoDialogOpen(false);
    setWoForm({ propertyName: '', description: '', dueDate: '' });
  };

  const getWOStatusBadge = (status: WOStatus) => {
    switch (status) {
      case 'open': return <Badge variant="outline" className="border-primary text-primary-foreground text-xs">Open</Badge>;
      case 'in_progress': return <Badge variant="outline" className="border-warning text-warning-foreground text-xs">In Progress</Badge>;
      case 'completed': return <Badge variant="outline" className="border-secondary text-secondary-foreground text-xs">Completed</Badge>;
      case 'cancelled': return <Badge variant="outline" className="border-muted text-muted-foreground text-xs">Cancelled</Badge>;
    }
  };

  const getComplaintStatusBadge = (status: ComplaintStatus) => {
    return status === 'resolved'
      ? <Badge variant="outline" className="border-secondary text-secondary-foreground text-xs">Resolved</Badge>
      : <Badge variant="outline" className="border-destructive text-destructive-foreground text-xs">Open</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/users/vendors')} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-semibold text-foreground">{displayName}</h1>
              {statusBadge}
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
              <span>{vendor.email}</span>
              <span>·</span>
              <span>{vendor.vendorType === 'company' ? 'Company' : 'Individual'}</span>
              <span>·</span>
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{vendor.regions.join(', ') || 'No regions'}</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {vendor.categories.map((c) => (
                <Badge key={c} variant="outline" className="text-xs bg-primary/10 text-primary-foreground border-primary/20">{c}</Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={vendor.id} onValueChange={(val) => navigate(`/users/vendors/${val}`)}>
            <SelectTrigger className="w-[200px]">
              <ChevronsUpDown className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Switch Vendor" />
            </SelectTrigger>
            <SelectContent>
              {allVendors.map((v) => (
                <SelectItem key={v.id} value={v.id}>{getVendorDisplayName(v)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => navigate(`/users/vendors/${vendor.id}/edit`)} className="btn-primary">
            <Pencil className="h-4 w-4 mr-2" /> Edit Vendor
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Wrench className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active WOs</p>
                <p className="text-2xl font-semibold">{activeWOs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed WOs</p>
                <p className="text-2xl font-semibold">{completedWOs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-semibold">${totalPaid.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Documents</p>
                <p className="text-2xl font-semibold">{vendor.documents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="workorders" className="w-full">
        <TabsList className="w-full justify-start flex-wrap">
          <TabsTrigger value="workorders">Work Orders</TabsTrigger>
          <TabsTrigger value="complaints">
            Complaints
            {vendor.complaints.filter((c) => c.status === 'open').length > 0 && (
              <Badge className="ml-2 bg-destructive text-destructive-foreground border-0 text-xs px-1.5 py-0">
                {vendor.complaints.filter((c) => c.status === 'open').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="bgv">BGV Reports</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Work Orders Tab */}
        <TabsContent value="workorders">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><Wrench className="h-4 w-4" /> Work Orders</CardTitle>
                <Button size="sm" className="btn-primary" onClick={() => setWoDialogOpen(true)}
                  disabled={vendor.status === 'blacklisted'}>
                  <Plus className="h-4 w-4 mr-1" /> Assign New WO
                </Button>
              </div>
              {vendor.status === 'blacklisted' && (
                <p className="text-xs text-destructive-foreground flex items-center gap-1 mt-1"><AlertTriangle className="h-3 w-3" /> Blacklisted vendors cannot receive new assignments.</p>
              )}
            </CardHeader>
            <CardContent>
              {vendor.workOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No work orders assigned.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>WO ID</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Assigned</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendor.workOrders.map((wo) => (
                      <TableRow key={wo.id}>
                        <TableCell className="font-mono text-xs">{wo.id.slice(0, 8).toUpperCase()}</TableCell>
                        <TableCell className="font-medium">{wo.propertyName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{wo.description}</TableCell>
                        <TableCell className="text-sm">{format(new Date(wo.assignedDate), 'MMM d, yyyy')}</TableCell>
                        <TableCell>{getWOStatusBadge(wo.status)}</TableCell>
                        <TableCell className="text-right">${wo.cost.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Complaints Tab */}
        <TabsContent value="complaints">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Complaints</CardTitle>
            </CardHeader>
            <CardContent>
              {vendor.complaints.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No complaints recorded.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Date</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Resolution</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendor.complaints.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="text-sm">{format(new Date(c.date), 'MMM d, yyyy')}</TableCell>
                        <TableCell className="text-sm">{c.from}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{c.description}</TableCell>
                        <TableCell>{getComplaintStatusBadge(c.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{c.resolutionNotes || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><DollarSign className="h-4 w-4" /> Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {vendor.payments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No payment history.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Invoice</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendor.payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="text-sm">{format(new Date(p.date), 'MMM d, yyyy')}</TableCell>
                        <TableCell>${p.amount.toLocaleString()}</TableCell>
                        <TableCell>{p.method}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={p.status === 'paid' ? 'border-secondary text-secondary-foreground' : 'border-warning text-warning-foreground'}>
                            {p.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {p.invoiceUrl && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" title="Download">
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {vendor.documents.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No documents uploaded.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>File Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendor.documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />{doc.fileName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs capitalize">{doc.type}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{format(new Date(doc.uploadedAt), 'MMM d, yyyy')}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Download">
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* BGV Tab */}
        <TabsContent value="bgv">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Background Verification</CardTitle>
                <Button size="sm" variant="outline" onClick={handleRunBGV}>Run BGV</Button>
              </div>
            </CardHeader>
            <CardContent>
              {vendor.bgvReports.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No BGV reports yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Credit</TableHead>
                      <TableHead>Criminal</TableHead>
                      <TableHead>License</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendor.bgvReports.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-sm">{format(new Date(r.runDate), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            r.status === 'completed' ? 'border-secondary text-secondary-foreground'
                              : r.status === 'pending' ? 'border-warning text-warning-foreground'
                              : 'border-destructive text-destructive-foreground'
                          }>
                            {r.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{r.sections?.credit || '—'}</TableCell>
                        <TableCell className="text-sm">{r.sections?.criminal || '—'}</TableCell>
                        <TableCell className="text-sm">{r.sections?.license || '—'}</TableCell>
                        <TableCell className="text-right">
                          {r.status === 'completed' && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" title="Download">
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><StickyNote className="h-4 w-4" /> Admin Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this vendor..."
                rows={5}
              />
              <Button size="sm" className="mt-3 btn-primary" onClick={handleSaveNotes}>Save Notes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assign WO Dialog */}
      <Dialog open={woDialogOpen} onOpenChange={setWoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign New Work Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Property</Label>
              <Input value={woForm.propertyName} onChange={(e) => setWoForm((p) => ({ ...p, propertyName: e.target.value }))} placeholder="e.g., Sunset Apartments" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={woForm.description} onChange={(e) => setWoForm((p) => ({ ...p, description: e.target.value }))} placeholder="Work order description..." rows={3} />
            </div>
            <div>
              <Label>Due Date</Label>
              <Input type="date" value={woForm.dueDate} onChange={(e) => setWoForm((p) => ({ ...p, dueDate: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWoDialogOpen(false)}>Cancel</Button>
            <Button className="btn-primary" onClick={handleAssignWO}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
