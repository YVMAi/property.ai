import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useWorkOrdersContext } from '@/contexts/WorkOrdersContext';
import { useToast } from '@/hooks/use-toast';
import { WO_PRIORITY_LABELS, type WOPriority } from '@/types/workOrder';

export default function CreateRFPPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createRequest, approveRequest } = useWorkOrdersContext();

  const [form, setForm] = useState({
    propertyId: '',
    description: '',
    priority: 'medium' as WOPriority,
  });

  const handleSubmit = () => {
    if (!form.description) return;
    const sr = createRequest({
      propertyId: form.propertyId || 'general',
      propertyName: form.propertyId || 'General',
      tenantId: 'admin',
      tenantName: 'Admin',
      description: form.description,
      priority: form.priority,
      attachments: [],
      notes: '',
      history: [],
    });
    approveRequest(sr.id, false);
    toast({ title: 'RFP Created' });
    navigate('/work-orders');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/work-orders')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Create RFP</h1>
          <div className="h-1 w-16 bg-secondary rounded-full mt-2" />
        </div>
      </div>

      <Card className="card-elevated">
        <CardContent className="pt-6 space-y-5">
          <div>
            <Label>Property / Unit</Label>
            <Input
              value={form.propertyId}
              onChange={(e) => setForm({ ...form, propertyId: e.target.value })}
              placeholder="Property name or ID"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the scope of work…"
              rows={4}
              className="mt-1.5"
            />
          </div>

          <div className="max-w-xs">
            <Label>Priority</Label>
            <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as WOPriority })}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(WO_PRIORITY_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button variant="outline" onClick={() => navigate('/work-orders')}>Cancel</Button>
            <Button className="btn-primary" onClick={handleSubmit} disabled={!form.description}>
              Create RFP
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
