import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Wrench, FileText, DollarSign, Bell, Users, Home, Shield, ClipboardList, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import type { Task } from '@/hooks/useTasks';
import { cn } from '@/lib/utils';

interface FeedEvent {
  id: string;
  type: 'wo' | 'renewal' | 'payment' | 'lease' | 'lead' | 'vendor' | 'task' | 'tenant' | 'maintenance';
  title: string;
  description: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  link?: string;
}

const mockEvents: FeedEvent[] = [
  { id: 'e1', type: 'wo', title: 'Work Order Completed', description: 'WO-002 Roof leak repair completed by Fix-It Plumbing', timestamp: '2h ago', priority: 'medium', link: '/work-orders/WO-002' },
  { id: 'e2', type: 'payment', title: 'Late Fee Applied', description: 'Unit 205 — $50 late fee applied (15 days overdue)', timestamp: '3h ago', priority: 'high' },
  { id: 'e3', type: 'renewal', title: 'Renewal Request', description: 'Tenant in Unit 302 requested lease renewal', timestamp: '5h ago', priority: 'medium', link: '/leases/renewals' },
  { id: 'e4', type: 'lead', title: 'New Listing Inquiry', description: 'Zillow lead for 2BR at Oak View Homes', timestamp: '6h ago', priority: 'low', link: '/leases/listings' },
  { id: 'e5', type: 'vendor', title: 'Vendor Quote Submitted', description: 'Quick Repairs LLC submitted quote for RFP-001 — $1,200', timestamp: '8h ago', priority: 'medium', link: '/work-orders/rfp/RFP-001' },
  { id: 'e6', type: 'tenant', title: 'Complaint Received', description: 'Noise complaint from Unit 104 tenant', timestamp: '10h ago', priority: 'low' },
  { id: 'e7', type: 'lease', title: 'Lease Expiring Soon', description: 'Unit 104 lease expires in 58 days', timestamp: '1d ago', priority: 'medium', link: '/leases/active' },
  { id: 'e8', type: 'maintenance', title: 'Maintenance Approved', description: 'Pest control for Oak View Homes approved', timestamp: '1d ago', priority: 'low' },
  { id: 'e9', type: 'payment', title: 'Security Deposit Refund Due', description: 'Unit 201 — $1,500 refund due in 5 days', timestamp: '1d ago', priority: 'high' },
  { id: 'e10', type: 'wo', title: 'WO Accepted by Vendor', description: 'Pro Painters Inc accepted WO-001', timestamp: '2d ago', priority: 'low', link: '/work-orders/WO-001' },
];

const typeConfig: Record<string, { icon: typeof Wrench; color: string }> = {
  wo: { icon: Wrench, color: 'bg-secondary/20 text-secondary-foreground' },
  renewal: { icon: FileText, color: 'bg-warning/20 text-warning-foreground' },
  payment: { icon: DollarSign, color: 'bg-destructive/15 text-destructive-foreground' },
  lease: { icon: FileText, color: 'bg-primary/15 text-primary-foreground' },
  lead: { icon: Users, color: 'bg-primary/10 text-primary-foreground' },
  vendor: { icon: Home, color: 'bg-secondary/15 text-secondary-foreground' },
  task: { icon: ClipboardList, color: 'bg-warning/15 text-warning-foreground' },
  tenant: { icon: Users, color: 'bg-muted text-muted-foreground' },
  maintenance: { icon: Shield, color: 'bg-secondary/10 text-secondary-foreground' },
};

const priorityColors: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-primary/15 text-primary-foreground',
  high: 'bg-warning/20 text-warning-foreground',
  urgent: 'bg-destructive/20 text-destructive-foreground',
};

interface Props {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onCreateTask: () => void;
}

export default function DashboardFeed({ tasks, onToggleTask, onCreateTask }: Props) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const activeTasks = useMemo(() => tasks.filter(t => t.status !== 'done'), [tasks]);

  const taskEvents: FeedEvent[] = useMemo(() => activeTasks.map(t => ({
    id: t.id,
    type: 'task' as const,
    title: t.status === 'in_progress' ? 'Task In Progress' : new Date(t.dueDate) < new Date() ? 'Task Overdue' : 'Task Pending',
    description: t.title + (t.propertyName ? ` — ${t.propertyName}` : ''),
    timestamp: new Date(t.dueDate) < new Date() ? 'Overdue' : `Due ${t.dueDate}`,
    priority: t.priority,
  })), [activeTasks]);

  const allEvents = useMemo(() => {
    let events = [...taskEvents, ...mockEvents];
    if (filter === 'tasks') events = events.filter(e => e.type === 'task');
    else if (filter === 'updates') events = events.filter(e => e.type !== 'task');
    else if (filter === 'high') events = events.filter(e => e.priority === 'high' || e.priority === 'urgent');
    if (search.trim()) {
      const q = search.toLowerCase();
      events = events.filter(e => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
    }
    return events;
  }, [taskEvents, mockEvents, filter, search]);

  return (
    <Card className="border-border/50 shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Tasks & Updates
          </CardTitle>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={onCreateTask}>
            <Plus className="h-3 w-3" /> Create Task
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
          <Tabs value={filter} onValueChange={setFilter} className="w-full sm:w-auto">
            <TabsList className="h-8 p-0.5">
              <TabsTrigger value="all" className="text-xs h-7 px-2.5">All</TabsTrigger>
              <TabsTrigger value="tasks" className="text-xs h-7 px-2.5">Tasks</TabsTrigger>
              <TabsTrigger value="updates" className="text-xs h-7 px-2.5">Updates</TabsTrigger>
              <TabsTrigger value="high" className="text-xs h-7 px-2.5">High Priority</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search feed…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 pl-8 text-xs" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
          {allEvents.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No items match your filters.</p>
          )}
          {allEvents.map((event) => {
            const cfg = typeConfig[event.type] || typeConfig.task;
            const Icon = cfg.icon;
            const isTask = event.type === 'task';
            const taskObj = isTask ? activeTasks.find(t => t.id === event.id) : null;
            const isOverdue = event.timestamp === 'Overdue';

            return (
              <div
                key={event.id}
                className={cn(
                  'flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-accent/50 transition-colors group',
                  isOverdue && 'bg-destructive/5'
                )}
              >
                {isTask && taskObj ? (
                  <Checkbox
                    checked={false}
                    onCheckedChange={() => onToggleTask(event.id)}
                    className="mt-0.5 shrink-0"
                  />
                ) : (
                  <div className={cn('h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5', cfg.color)}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-sm font-medium text-foreground', isOverdue && 'text-destructive-foreground')}>
                      {event.title}
                    </span>
                    <Badge variant="secondary" className={cn('text-[10px] px-1.5 py-0', priorityColors[event.priority])}>
                      {event.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{event.description}</p>
                </div>
                <span className={cn('text-[10px] text-muted-foreground whitespace-nowrap mt-1', isOverdue && 'text-destructive-foreground font-medium')}>
                  {isOverdue && <AlertTriangle className="h-3 w-3 inline mr-0.5" />}
                  {event.timestamp}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
