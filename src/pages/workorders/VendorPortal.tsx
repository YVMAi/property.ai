import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWorkOrdersContext } from '@/contexts/WorkOrdersContext';
import { useToast } from '@/hooks/use-toast';
import { WO_PRIORITY_LABELS, WO_PRIORITY_COLORS, WO_STATUS_LABELS, WO_STATUS_COLORS } from '@/types/workOrder';

export default function VendorPortal() {
  const { toast } = useToast();
  const { workOrders, acceptVendorWO, updateWOStatus } = useWorkOrdersContext();

  // Simulate: show all WOs assigned to any vendor
  const vendorWOs = workOrders.filter(wo => wo.vendorId);

  return (
    <div className="space-y-6 animate-fade-in p-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Vendor Portal</h1>
        <div className="h-1 w-16 rounded-full bg-secondary mt-2" />
        <p className="text-sm text-muted-foreground mt-2">View and manage your assigned work orders.</p>
      </div>

      {vendorWOs.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
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
                  <span className="text-xs text-muted-foreground">{wo.propertyName}</span>
                </div>
                <p className="text-sm">{wo.description}</p>
                <div className="flex gap-2 flex-wrap">
                  {!wo.vendorAccepted && wo.status === 'open' && (
                    <Button size="sm" onClick={() => { acceptVendorWO(wo.id); toast({ title: 'Work order accepted' }); }}>Accept</Button>
                  )}
                  {wo.vendorAccepted && wo.status === 'assigned' && (
                    <Button size="sm" onClick={() => { updateWOStatus(wo.id, 'in_progress'); toast({ title: 'Marked In Progress' }); }}>Start Work</Button>
                  )}
                  {wo.status === 'in_progress' && (
                    <Button size="sm" variant="success" onClick={() => { updateWOStatus(wo.id, 'completed'); toast({ title: 'Marked Completed' }); }}>Mark Complete</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
