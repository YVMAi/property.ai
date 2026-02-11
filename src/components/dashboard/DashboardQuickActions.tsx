import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Home, FileText, Users, Calendar, Wrench, RefreshCw } from 'lucide-react';

const actions = [
  { title: 'Add Property', icon: Home, description: 'Register a new property', path: '/properties/new', color: 'bg-primary/15 text-primary-foreground' },
  { title: 'New Lease', icon: FileText, description: 'Create a lease agreement', path: '/leases/create', color: 'bg-secondary/20 text-secondary-foreground' },
  { title: 'Add Tenant', icon: Users, description: 'Register a new tenant', path: '/users/tenants/new', color: 'bg-warning/20 text-warning-foreground' },
  { title: 'Schedule Task', icon: Calendar, description: 'Create a maintenance task', path: '#task', color: 'bg-destructive/15 text-destructive-foreground' },
  { title: 'Create Work Order', icon: Wrench, description: 'Open a new work order', path: '/work-orders', color: 'bg-primary/10 text-primary-foreground' },
  { title: 'Send Renewal', icon: RefreshCw, description: 'Offer lease renewal', path: '/leases/renewals', color: 'bg-secondary/15 text-secondary-foreground' },
];

interface Props {
  onCreateTask: () => void;
}

export default function DashboardQuickActions({ onCreateTask }: Props) {
  const navigate = useNavigate();

  return (
    <div>
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</h2>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.title}
              className="border-border/40 shadow-soft hover:shadow-elevated hover:border-primary/30 transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => action.path === '#task' ? onCreateTask() : navigate(action.path)}
            >
              <CardContent className="p-4 text-center">
                <div className={`mx-auto h-10 w-10 rounded-xl ${action.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-medium text-foreground">{action.title}</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 hidden sm:block">{action.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
