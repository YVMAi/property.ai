import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useWorkOrdersContext } from '@/contexts/WorkOrdersContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  WO_PRIORITY_LABELS, WO_PRIORITY_COLORS,
  RFP_STATUS_LABELS,
} from '@/types/workOrder';

export default function RFPViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getRFPById, selectRFPVendor, sendRFPToVendors } = useWorkOrdersContext();

  const rfp = getRFPById(id || '');
  if (!rfp) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">RFP not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/work-orders')}>Back</Button>
      </div>
    );
  }

  const handleSelectVendor = (vendorId: string) => {
    selectRFPVendor(rfp.id, vendorId);
    toast({ title: 'Vendor Selected', description: 'Work order created from RFP.' });
    navigate('/work-orders');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/work-orders')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{rfp.id}</h1>
          <div className="h-1 w-16 rounded-full bg-secondary mt-1" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            RFP Details
            <Badge className={WO_PRIORITY_COLORS[rfp.priority]}>{WO_PRIORITY_LABELS[rfp.priority]}</Badge>
            <Badge variant="outline">{RFP_STATUS_LABELS[rfp.status]}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Property</span><p className="font-medium">{rfp.propertyName}{rfp.unitNumber ? ` #${rfp.unitNumber}` : ''}</p></div>
            <div><span className="text-muted-foreground">Created</span><p className="font-medium">{new Date(rfp.createdAt).toLocaleDateString()}</p></div>
          </div>
          <p className="text-sm">{rfp.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Vendor Quotes</CardTitle></CardHeader>
        <CardContent>
          {rfp.vendorQuotes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No vendors contacted yet.</p>
          ) : (
            <div className="space-y-3">
              {rfp.vendorQuotes.map(q => (
                <div key={q.vendorId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{q.vendorName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={q.status === 'accepted' ? 'default' : q.status === 'declined' ? 'destructive' : 'outline'}>
                        {q.status === 'accepted' ? 'Quote Submitted' : q.status === 'declined' ? 'Declined' : 'Pending'}
                      </Badge>
                      {q.estimatedCost != null && <span className="text-xs text-muted-foreground">${q.estimatedCost.toLocaleString()} · {q.estimatedDays} days</span>}
                    </div>
                  </div>
                  {rfp.status === 'open' && q.status === 'accepted' && (
                    <Button size="sm" onClick={() => handleSelectVendor(q.vendorId)}>Select & Create WO</Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
