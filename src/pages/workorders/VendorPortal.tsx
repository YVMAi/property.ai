import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useWorkOrdersContext } from '@/contexts/WorkOrdersContext';
import { useToast } from '@/hooks/use-toast';
import {
  WO_PRIORITY_LABELS, WO_PRIORITY_COLORS,
  WO_STATUS_LABELS, WO_STATUS_COLORS,
  RFP_STATUS_LABELS,
} from '@/types/workOrder';
import { FileText, Wrench, CheckCircle, XCircle, Send, DollarSign, Clock } from 'lucide-react';

export default function VendorPortal() {
  const { toast } = useToast();
  const {
    workOrders, rfps,
    acceptVendorWO, declineVendorWO, updateWOStatus,
    submitVendorQuote, declineRFPQuote,
  } = useWorkOrdersContext();

  // Simulate: vendor sees all WOs assigned to them & all RFPs with pending quotes
  const vendorWOs = workOrders.filter(wo => wo.vendorId);
  const vendorRFPs = rfps.filter(r => r.status === 'open' && r.vendorQuotes.some(q => q.status === 'pending'));

  // Quote submission
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteRfpId, setQuoteRfpId] = useState('');
  const [quoteVendorId, setQuoteVendorId] = useState('');
  const [quoteCost, setQuoteCost] = useState('');
  const [quoteDays, setQuoteDays] = useState('');
  const [quoteNotes, setQuoteNotes] = useState('');

  const openQuoteDialog = (rfpId: string, vendorId: string) => {
    setQuoteRfpId(rfpId);
    setQuoteVendorId(vendorId);
    setQuoteCost('');
    setQuoteDays('');
    setQuoteNotes('');
    setQuoteOpen(true);
  };

  const handleSubmitQuote = () => {
    if (!quoteCost || !quoteDays) {
      toast({ title: 'Missing fields', description: 'Cost and timeline are required.', variant: 'destructive' });
      return;
    }
    submitVendorQuote(quoteRfpId, quoteVendorId, {
      estimatedCost: Number(quoteCost),
      estimatedDays: Number(quoteDays),
      notes: quoteNotes,
    });
    setQuoteOpen(false);
    toast({ title: 'Quote Submitted', description: 'Your quote has been sent to the property manager.' });
  };

  const handleDeclineRFP = (rfpId: string, vendorId: string) => {
    declineRFPQuote(rfpId, vendorId);
    toast({ title: 'RFP Declined' });
  };

  return (
    <div className="space-y-6 animate-fade-in p-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Vendor Portal</h1>
        <div className="h-1 w-16 rounded-full bg-secondary mt-2" />
        <p className="text-sm text-muted-foreground mt-2">View and manage your assigned work orders and RFP requests.</p>
      </div>

      <Tabs defaultValue="work-orders" className="w-full">
        <TabsList>
          <TabsTrigger value="work-orders" className="gap-1.5"><Wrench className="h-3.5 w-3.5" /> Work Orders ({vendorWOs.length})</TabsTrigger>
          <TabsTrigger value="rfps" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> RFP Requests ({vendorRFPs.length})</TabsTrigger>
        </TabsList>

        {/* Work Orders Tab */}
        <TabsContent value="work-orders">
          {vendorWOs.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Wrench className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>No assigned work orders.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {vendorWOs.map(wo => (
                <Card key={wo.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{wo.id}</span>
                        <Badge className={WO_PRIORITY_COLORS[wo.priority]}>{WO_PRIORITY_LABELS[wo.priority]}</Badge>
                        <Badge className={WO_STATUS_COLORS[wo.status]}>{WO_STATUS_LABELS[wo.status]}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{wo.propertyName}{wo.unitNumber ? ` #${wo.unitNumber}` : ''}</span>
                    </div>
                    <p className="text-sm">{wo.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {wo.estimatedCost > 0 && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />${wo.estimatedCost.toLocaleString()}</span>}
                      {wo.dueDate && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Due: {new Date(wo.dueDate).toLocaleDateString()}</span>}
                    </div>
                    <Separator />
                    <div className="flex gap-2 flex-wrap">
                      {!wo.vendorAccepted && (wo.status === 'open' || wo.status === 'assigned') && (
                        <>
                          <Button size="sm" className="bg-secondary text-secondary-foreground hover:opacity-90" onClick={() => { acceptVendorWO(wo.id); toast({ title: 'Work order accepted' }); }}>
                            <CheckCircle className="h-3.5 w-3.5 mr-1" /> Accept
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive-foreground" onClick={() => { declineVendorWO(wo.id); toast({ title: 'Work order declined', description: 'PM has been notified.' }); }}>
                            <XCircle className="h-3.5 w-3.5 mr-1" /> Decline
                          </Button>
                        </>
                      )}
                      {wo.vendorAccepted && wo.status === 'assigned' && (
                        <Button size="sm" className="bg-primary text-primary-foreground hover:opacity-90" onClick={() => { updateWOStatus(wo.id, 'in_progress'); toast({ title: 'Marked In Progress' }); }}>
                          Start Work
                        </Button>
                      )}
                      {wo.status === 'in_progress' && (
                        <Button size="sm" className="bg-secondary text-secondary-foreground hover:opacity-90" onClick={() => { updateWOStatus(wo.id, 'completed'); toast({ title: 'Marked Completed' }); }}>
                          <CheckCircle className="h-3.5 w-3.5 mr-1" /> Mark Complete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* RFPs Tab */}
        <TabsContent value="rfps">
          {vendorRFPs.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>No pending RFP requests.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {vendorRFPs.map(rfp => {
                const pendingQuotes = rfp.vendorQuotes.filter(q => q.status === 'pending');
                return (
                  <Card key={rfp.id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{rfp.id}</span>
                          <Badge className={WO_PRIORITY_COLORS[rfp.priority]}>{WO_PRIORITY_LABELS[rfp.priority]}</Badge>
                          <Badge variant="outline">{RFP_STATUS_LABELS[rfp.status]}</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">{rfp.propertyName}{rfp.unitNumber ? ` #${rfp.unitNumber}` : ''}</span>
                      </div>
                      <p className="text-sm">{rfp.description}</p>
                      {rfp.attachments.length > 0 && (
                        <p className="text-xs text-muted-foreground">{rfp.attachments.length} attachment(s)</p>
                      )}
                      <Separator />
                      {pendingQuotes.map(q => (
                        <div key={q.vendorId} className="flex gap-2 flex-wrap">
                          <Button size="sm" className="bg-secondary text-secondary-foreground hover:opacity-90" onClick={() => openQuoteDialog(rfp.id, q.vendorId)}>
                            <Send className="h-3.5 w-3.5 mr-1" /> Submit Quote
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive-foreground" onClick={() => handleDeclineRFP(rfp.id, q.vendorId)}>
                            <XCircle className="h-3.5 w-3.5 mr-1" /> Decline
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quote Submission Dialog */}
      <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Submit Quote for {quoteRfpId}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Estimated Cost ($)</Label>
              <Input type="number" value={quoteCost} onChange={e => setQuoteCost(e.target.value)} placeholder="Enter cost" />
            </div>
            <div>
              <Label>Timeline (days)</Label>
              <Input type="number" value={quoteDays} onChange={e => setQuoteDays(e.target.value)} placeholder="Estimated days" />
            </div>
            <div>
              <Label>Notes (optional)</Label>
              <Textarea value={quoteNotes} onChange={e => setQuoteNotes(e.target.value)} placeholder="Additional details…" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuoteOpen(false)}>Cancel</Button>
            <Button className="bg-secondary text-secondary-foreground hover:opacity-90" onClick={handleSubmitQuote} disabled={!quoteCost || !quoteDays}>
              Submit Quote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
