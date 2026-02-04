import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, FileText, ClipboardList, TrendingUp, DollarSign, Home, Calendar } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  const stats = [
    { title: 'Total Properties', value: '24', icon: Building2, change: '+2 this month' },
    { title: 'Active Tenants', value: '156', icon: Users, change: '+12 this month' },
    { title: 'Active Leases', value: '142', icon: FileText, change: '98% occupancy' },
    { title: 'Pending Tasks', value: '8', icon: ClipboardList, change: '3 high priority' },
  ];

  const quickActions = [
    { title: 'Add Property', icon: Home, description: 'Register a new property' },
    { title: 'New Lease', icon: FileText, description: 'Create a lease agreement' },
    { title: 'Add Tenant', icon: Users, description: 'Register a new tenant' },
    { title: 'Schedule Task', icon: Calendar, description: 'Create a maintenance task' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Welcome back, {user?.name?.split(' ')[0] || 'User'}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your property portfolio
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-l-4 border-l-primary border-border/50 shadow-soft hover:shadow-elevated transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-success" />
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.title}
                className="border-border/50 shadow-soft hover:shadow-elevated hover:border-primary/30 transition-all cursor-pointer group"
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/50 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Monthly Revenue</span>
                <span className="text-xl font-semibold text-foreground">$48,250</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Outstanding</span>
                <span className="text-xl font-semibold text-destructive-foreground">$3,200</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Collection Rate</span>
                <span className="text-xl font-semibold text-success-foreground">93.4%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { text: 'Lease renewed for Unit 204', time: '2 hours ago' },
                { text: 'Maintenance completed at 123 Oak St', time: '5 hours ago' },
                { text: 'New tenant application received', time: '1 day ago' },
              ].map((activity, i) => (
                <div key={i} className="flex justify-between items-start pb-3 border-b border-border/50 last:border-0 last:pb-0">
                  <span className="text-sm text-foreground">{activity.text}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
