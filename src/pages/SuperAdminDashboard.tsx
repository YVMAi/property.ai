import { useState } from 'react';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, DollarSign, Users, AlertTriangle, Plus, CreditCard, FileText, BarChart3, Settings } from 'lucide-react';
import SuperAdminLayout from '@/components/superadmin/SuperAdminLayout';
import SuperAdminPMCList from '@/components/superadmin/SuperAdminPMCList';
import SuperAdminLogs from '@/components/superadmin/SuperAdminLogs';
import SuperAdminSubscriptions from '@/components/superadmin/SuperAdminSubscriptions';
import SuperAdminTeam from '@/components/superadmin/SuperAdminTeam';
import AddPMCDialog from '@/components/superadmin/AddPMCDialog';

export default function SuperAdminDashboard() {
  const { pmcs, totalRevenue, totalUsers, logs } = useSuperAdmin();
  const [showAddPMC, setShowAddPMC] = useState(false);

  const activePMCs = pmcs.filter(p => p.status === 'active').length;
  const criticalLogs = logs.filter(l => l.severity === 'critical' || l.severity === 'error').length;

  const kpis = [
    { label: 'Total PMCs', value: pmcs.length, sub: `${activePMCs} active`, icon: Building2, color: 'bg-primary/15 text-primary-foreground' },
    { label: 'Revenue YTD', value: `$${totalRevenue.toLocaleString()}`, sub: 'All subscriptions', icon: DollarSign, color: 'bg-secondary/15 text-secondary-foreground' },
    { label: 'Global Users', value: totalUsers, sub: 'Across all PMCs', icon: Users, color: 'bg-warning/15 text-warning-foreground' },
    { label: 'Critical Alerts', value: criticalLogs, sub: 'Errors & critical', icon: AlertTriangle, color: 'bg-destructive/15 text-destructive-foreground' },
  ];

  return (
    <SuperAdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map(k => (
            <Card key={k.label} className="border-border/50">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{k.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{k.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{k.sub}</p>
                  </div>
                  <div className={`h-10 w-10 rounded-xl ${k.color} flex items-center justify-center`}>
                    <k.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setShowAddPMC(true)} className="gap-2 btn-primary">
            <Plus className="h-4 w-4" /> Add New PMC
          </Button>
          <Button variant="outline" className="gap-2">
            <CreditCard className="h-4 w-4" /> Manage Subscriptions
          </Button>
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" /> View Logs
          </Button>
          <Button variant="outline" className="gap-2">
            <BarChart3 className="h-4 w-4" /> Global Reports
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pmcs">
          <TabsList className="bg-muted/60 p-1">
            <TabsTrigger value="pmcs" className="gap-1.5"><Building2 className="h-3.5 w-3.5" /> PMCs</TabsTrigger>
            <TabsTrigger value="subscriptions" className="gap-1.5"><CreditCard className="h-3.5 w-3.5" /> Subscriptions</TabsTrigger>
            <TabsTrigger value="logs" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> Logs</TabsTrigger>
            <TabsTrigger value="team" className="gap-1.5"><Settings className="h-3.5 w-3.5" /> Team</TabsTrigger>
          </TabsList>

          <TabsContent value="pmcs"><SuperAdminPMCList onAddNew={() => setShowAddPMC(true)} /></TabsContent>
          <TabsContent value="subscriptions"><SuperAdminSubscriptions /></TabsContent>
          <TabsContent value="logs"><SuperAdminLogs /></TabsContent>
          <TabsContent value="team"><SuperAdminTeam /></TabsContent>
        </Tabs>
      </div>

      <AddPMCDialog open={showAddPMC} onOpenChange={setShowAddPMC} />
    </SuperAdminLayout>
  );
}
