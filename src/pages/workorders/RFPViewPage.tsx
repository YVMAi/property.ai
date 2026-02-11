import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ArrowUpDown, Check, DollarSign, Clock, Users } from 'lucide-react';
import { useWorkOrdersContext } from '@/contexts/WorkOrdersContext';
import { useVendorsContext } from '@/contexts/VendorsContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  WO_PRIORITY_LABELS, WO_PRIORITY_COLORS,
  RFP_STATUS_LABELS,
  type WOPriority,
} from '@/types/workOrder';

const PRIORITY_BADGE: Record<WOPriority, string> = {
  low: 'bg-muted text-muted-foreground border-0',
  medium: 'bg-primary/20 text-primary-foreground border-0',
  high: 'bg-warning text-warning-foreground border-0',
  urgent: 'bg-destructive text-destructive-foreground border-0',
  emergency: 'bg-destructive text-destructive-foreground border-0',
};

const RFP_STATUS_BADGE: Record<string, string> = {
  open: 'bg-primary/20 text-primary-foreground border-0',
  awarded: 'bg-secondary text-secondary-foreground border-0',
  closed: 'bg-muted text-muted-foreground border-0',
};

type SortField = 'cost' | 'days' | 'date';

export default function RFPViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getRFPById, selectRFPVendor, sendRFPToVendors, workOrders } = useWorkOrdersContext();
  const { activeVendors } = useVendorsContext();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [sortField, setSortField] = useState<SortField>('cost');
  const [sortAsc, setSortAsc] = useState(true);

  const rfp = getRFPById(id || '');
  if (!rfp) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">RFP not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/work-orders')}>Back</Button>
      </div>
    );
  }

  const linkedWO = workOrders.find(wo => wo.rfpId === rfp.id);
  const submittedQuotes = rfp.vendorQuotes.filter(q => q.status === 'accepted' && q.estimatedCost != null);
  const lowestCost = submittedQuotes.length > 0 ? Math.min(...submittedQuotes.map(q => q.estimatedCost!)) : null;
  const fastestDays = submittedQuotes.length > 0 ? Math.min(...submittedQuotes.filter(q => q.estimatedDays).map(q => q.estimatedDays!)) : null;

  const sortedQuotes = [...rfp.vendorQuotes].sort((a, b) => {
    if (sortField === 'cost') {
      const av = a.estimatedCost ?? Infinity;
      const bv = b.estimatedCost ?? Infinity;
      return sortAsc ? av - bv : bv - av;
    }
    if (sortField === 'days') {
      const av = a.estimatedDays ?? Infinity;
      const bv = b.estimatedDays ?? Infinity;
      return sortAsc ? av - bv : bv - av;
    }
    const av = a.submittedAt || '';
    const bv = b.submittedAt || '';
    return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleSelectVendor = () => {
    selectRFPVendor(rfp.id, selectedVendorId);
    setConfirmOpen(false);
    toast({ title: 'Vendor Selected', description: 'Work order created from RFP.' });
    navigate('/work-orders');
  };

  const openConfirm = (vendorId: string) => {
    setSelectedVendorId(vendorId);
    setConfirmOpen(true);
  };

  const selectedQuote = rfp.vendorQuotes.find(q => q.vendorId === selectedVendorId);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/work-orders" className="hover:text-foreground transition-colors">Work Orders</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="hover:text-foreground cursor-pointer" onClick={() => navigate('/work-orders')}>RFPs</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">{rfp.id}</span>
      </div>

      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" className="mt-0.5 shrink-0" onClick={() => navigate('/work-orders')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-semibold text-foreground">{rfp.id}</h1>
            <Badge className={RFP_STATUS_BADGE[rfp.status]}>{RFP_STATUS_LABELS[rfp.status]}</Badge>
            <Badge className={PRIORITY_BADGE[rfp.priority]}>{WO_PRIORITY_LABELS[rfp.priority]}</Badge>
          </div>
          <div className="h-1 w-16 bg-secondary rounded-full mt-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-lg">RFP Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div><span className="text-muted-foreground">Property</span><p className="font-medium mt-0.5">{rfp.propertyName}{rfp.unitNumber ? ` #${rfp.unitNumber}` : ''}</p></div>
                <div><span className="text-muted-foreground">Created</span><p className="font-medium mt-0.5">{new Date(rfp.createdAt).toLocaleDateString()}</p></div>
                <div><span className="text-muted-foreground">Request ID</span><p className="font-medium mt-0.5">{rfp.requestId || '—'}</p></div>
              </div>
              <Separator />
              <p className="text-sm whitespace-pre-wrap">{rfp.description}</p>
              {rfp.attachments.length > 0 && (
                <p className="text-xs text-muted-foreground">{rfp.attachments.length} attachment(s) from service request</p>
              )}
            </CardContent>
          </Card>

          {/* Vendor Quotes */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" /> Vendor Quotes
                </CardTitle>
                <span className="text-xs text-muted-foreground">
                  {submittedQuotes.length} of {rfp.vendorQuotes.length} submitted
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {rfp.vendorQuotes.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No vendors contacted yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-card hover:bg-card">
                        <TableHead>Vendor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('cost')}>
                          <div className="flex items-center gap-1">Est. Cost <ArrowUpDown className="h-3 w-3" /></div>
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('days')}>
                          <div className="flex items-center gap-1">Timeline <ArrowUpDown className="h-3 w-3" /></div>
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>
                          <div className="flex items-center gap-1">Quote Date <ArrowUpDown className="h-3 w-3" /></div>
                        </TableHead>
                        {rfp.status === 'open' && <TableHead className="text-right">Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedQuotes.map(q => {
                        const isLowest = q.estimatedCost != null && q.estimatedCost === lowestCost;
                        const isFastest = q.estimatedDays != null && q.estimatedDays === fastestDays;
                        const isAwarded = rfp.selectedVendorId === q.vendorId;
                        return (
                          <TableRow key={q.vendorId} className={`bg-card ${isAwarded ? 'ring-2 ring-secondary' : ''}`}>
                            <TableCell>
                              <p className="font-medium text-sm">{q.vendorName}</p>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={q.status === 'accepted' ? 'default' : q.status === 'declined' ? 'destructive' : 'outline'}
                                className="border-0"
                              >
                                {q.status === 'accepted' ? 'Quote Submitted' : q.status === 'declined' ? 'Declined' : 'Pending'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {q.estimatedCost != null ? (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">${q.estimatedCost.toLocaleString()}</span>
                                  {isLowest && <Badge className="bg-secondary text-secondary-foreground border-0 text-[10px] px-1.5 py-0">Lowest</Badge>}
                                </div>
                              ) : '—'}
                            </TableCell>
                            <TableCell>
                              {q.estimatedDays != null ? (
                                <div className="flex items-center gap-1">
                                  <span>{q.estimatedDays} days</span>
                                  {isFastest && <Badge className="bg-primary/20 text-primary-foreground border-0 text-[10px] px-1.5 py-0">Fastest</Badge>}
                                </div>
                              ) : '—'}
                            </TableCell>
                            <TableCell className="text-sm">
                              {q.submittedAt ? new Date(q.submittedAt).toLocaleDateString() : '—'}
                            </TableCell>
                            {rfp.status === 'open' && (
                              <TableCell className="text-right">
                                {q.status === 'accepted' && (
                                  <Button size="sm" className="h-7 text-xs bg-secondary text-secondary-foreground hover:opacity-90" onClick={() => openConfirm(q.vendorId)}>
                                    <Check className="h-3 w-3 mr-1" /> Select
                                  </Button>
                                )}
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-lg">Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Vendors Contacted</span><span className="font-medium">{rfp.vendorQuotes.length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Quotes Received</span><span className="font-medium">{submittedQuotes.length}</span></div>
              {lowestCost != null && (
                <div className="flex justify-between"><span className="text-muted-foreground">Lowest Quote</span><span className="font-medium text-secondary-foreground">${lowestCost.toLocaleString()}</span></div>
              )}
              {fastestDays != null && (
                <div className="flex justify-between"><span className="text-muted-foreground">Fastest Timeline</span><span className="font-medium">{fastestDays} days</span></div>
              )}
            </CardContent>
          </Card>

          {/* Linked WO */}
          {linkedWO && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-lg">Related Work Order</CardTitle></CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate(`/work-orders/${linkedWO.id}`)}>
                  {linkedWO.id} — {linkedWO.status}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {rfp.status === 'open' && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-lg">Actions</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full" onClick={() => navigate(`/work-orders/requests/${rfp.requestId}`)}>
                  View Service Request
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Confirm Selection Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirm Vendor Selection</DialogTitle></DialogHeader>
          {selectedQuote && (
            <div className="space-y-3">
              <p className="text-sm">
                You are about to award this RFP to <span className="font-semibold">{selectedQuote.vendorName}</span>.
                A work order will be created and sent to the vendor for acceptance.
              </p>
              <div className="p-3 rounded-lg bg-muted/50 text-sm space-y-1">
                <p><span className="text-muted-foreground">Estimated Cost:</span> <span className="font-medium">${selectedQuote.estimatedCost?.toLocaleString()}</span></p>
                <p><span className="text-muted-foreground">Timeline:</span> <span className="font-medium">{selectedQuote.estimatedDays} days</span></p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button className="bg-secondary text-secondary-foreground hover:opacity-90" onClick={handleSelectVendor}>
              Confirm & Create WO
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
