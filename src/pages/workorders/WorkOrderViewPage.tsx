import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Clock, FileText, Upload } from 'lucide-react';
import { useWorkOrdersContext } from '@/contexts/WorkOrdersContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  WO_PRIORITY_LABELS, WO_PRIORITY_COLORS,
  WO_STATUS_LABELS, WO_STATUS_COLORS,
} from '@/types/workOrder';

export default function WorkOrderViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getWorkOrderById, updateWOStatus, approveOwnerWO, completeWO } = useWorkOrdersContext();

  const wo = getWorkOrderById(id || '');
  if (!wo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Work Order not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/work-orders')}>Back</Button>
      </div>
    );
  }

  const handleStatusChange = (status: 'in_progress' | 'completed' | 'cancelled') => {
    if (status === 'completed') {
      completeWO(wo.id, wo.completionPhotos);
    } else {
      updateWOStatus(wo.id, status);
    }
    toast({ title: `Status updated to ${WO_STATUS_LABELS[status]}` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/work-orders')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{wo.id}</h1>
          <div className="h-1 w-16 rounded-full bg-secondary mt-1" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className={WO_PRIORITY_COLORS[wo.priority]}>{WO_PRIORITY_LABELS[wo.priority]}</Badge>
                <Badge className={WO_STATUS_COLORS[wo.status]}>{WO_STATUS_LABELS[wo.status]}</Badge>
                {wo.ownerApprovalNeeded && !wo.ownerApproved && <Badge variant="destructive">Awaiting Owner Approval</Badge>}
                {wo.ownerApproved && <Badge className="bg-secondary text-secondary-foreground">Owner Approved</Badge>}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Property</span><p className="font-medium">{wo.propertyName}{wo.unitNumber ? ` #${wo.unitNumber}` : ''}</p></div>
                <div><span className="text-muted-foreground">Vendor</span><p className="font-medium">{wo.vendorName || 'Unassigned'}</p></div>
                <div><span className="text-muted-foreground">Due Date</span><p className="font-medium">{wo.dueDate ? new Date(wo.dueDate).toLocaleDateString() : '—'}</p></div>
                <div><span className="text-muted-foreground">Vendor Accepted</span><p className="font-medium">{wo.vendorAccepted ? 'Yes' : 'Pending'}</p></div>
              </div>
              <Separator />
              <div>
                <span className="text-sm text-muted-foreground">Description</span>
                <p className="text-sm mt-1">{wo.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-lg">Timeline</CardTitle></CardHeader>
            <CardContent>
              {wo.history.length === 0 ? (
                <p className="text-sm text-muted-foreground">No history recorded.</p>
              ) : (
                <div className="space-y-3">
                  {wo.history.map(h => (
                    <div key={h.id} className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                      <div>
                        <p className="text-sm"><span className="font-medium">{h.userName}</span> changed status to <Badge variant="outline" className="ml-1">{h.statusTo}</Badge></p>
                        <p className="text-xs text-muted-foreground">{new Date(h.timestamp).toLocaleString()}</p>
                        {h.notes && <p className="text-xs mt-0.5">{h.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Costs */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-lg">Costs</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Estimated</span><span className="font-medium">${wo.estimatedCost.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Actual</span><span className="font-medium">{wo.actualCost != null ? `$${wo.actualCost.toLocaleString()}` : '—'}</span></div>
              {wo.actualCost != null && wo.actualCost > wo.estimatedCost && (
                <Badge variant="destructive" className="mt-1">Budget Overrun: +${(wo.actualCost - wo.estimatedCost).toLocaleString()}</Badge>
              )}
              {wo.invoiceUrl && (
                <Button variant="outline" size="sm" className="w-full mt-2">
                  <FileText className="h-4 w-4 mr-1" /> View Invoice
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-lg">Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {wo.status === 'assigned' && (
                <Button className="w-full" onClick={() => handleStatusChange('in_progress')}>
                  <Clock className="h-4 w-4 mr-1" /> Mark In Progress
                </Button>
              )}
              {(wo.status === 'in_progress' || wo.status === 'assigned') && (
                <Button className="w-full" variant="success" onClick={() => handleStatusChange('completed')}>
                  <CheckCircle className="h-4 w-4 mr-1" /> Mark Completed
                </Button>
              )}
              {wo.status !== 'completed' && wo.status !== 'cancelled' && (
                <Button className="w-full" variant="destructive" onClick={() => handleStatusChange('cancelled')}>
                  <XCircle className="h-4 w-4 mr-1" /> Cancel
                </Button>
              )}
              {wo.ownerApprovalNeeded && !wo.ownerApproved && (
                <Button className="w-full" variant="outline" onClick={() => { approveOwnerWO(wo.id); toast({ title: 'Owner approval granted' }); }}>
                  Approve (Owner)
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Verification */}
          {wo.status === 'completed' && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-lg">Verification</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tenant Verified</span>
                  <span>{wo.tenantVerified ? '✓ Yes' : 'Pending'}</span>
                </div>
                {wo.completionPhotos.length > 0 && <p className="text-xs text-muted-foreground">{wo.completionPhotos.length} completion photo(s)</p>}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
