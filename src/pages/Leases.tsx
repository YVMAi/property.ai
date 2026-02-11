import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, FileText, Users, TrendingUp, DollarSign,
  Home, ListFilter, Plus, ExternalLink, RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { usePropertiesContext } from '@/contexts/PropertiesContext';
import { useTenantsContext } from '@/contexts/TenantsContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const PASTEL_COLORS = [
  'hsl(210, 50%, 78%)',
  'hsl(120, 30%, 77%)',
  'hsl(45, 80%, 75%)',
  'hsl(0, 60%, 87%)',
  'hsl(270, 30%, 80%)',
];

export default function LeasesDashboard() {
  const navigate = useNavigate();
  const { activeProperties } = usePropertiesContext();
  const { activeTenants } = useTenantsContext();

  const metrics = useMemo(() => {
    const allUnits = activeProperties.flatMap((p) =>
      p.units.length > 0 ? p.units : [{ id: p.id, unitNumber: 'Entire' }]
    );
    const allLeases = activeProperties.flatMap((p) => p.leases);
    const activeLeases = allLeases.filter((l) => l.status === 'active');
    const totalRent = activeLeases.reduce((s, l) => s + l.rent, 0);
    const leasedUnitIds = new Set(activeLeases.map((l) => l.unitId || l.propertyId));
    const vacantCount = allUnits.filter((u) => !leasedUnitIds.has(u.id)).length;
    const occupancyRate = allUnits.length > 0
      ? Math.round(((allUnits.length - vacantCount) / allUnits.length) * 100)
      : 0;

    const now = new Date();
    const threeMonths = new Date(now);
    threeMonths.setMonth(threeMonths.getMonth() + 3);
    const expiringSoon = activeLeases.filter((l) => {
      const end = new Date(l.endDate);
      return end <= threeMonths && end >= now;
    });

    return {
      totalUnits: allUnits.length,
      vacantCount,
      occupancyRate,
      activeLeaseCount: activeLeases.length,
      expiringSoonCount: expiringSoon.length,
      totalRent,
      expiringSoon,
    };
  }, [activeProperties]);

  const vacancyByType = useMemo(() => {
    const byType: Record<string, { total: number; vacant: number }> = {};
    activeProperties.forEach((p) => {
      const units = p.units.length > 0 ? p.units : [{ id: p.id }];
      const activeLeaseUnitIds = new Set(
        p.leases.filter((l) => l.status === 'active').map((l) => l.unitId || l.propertyId)
      );
      const label = p.type.replace(/_/g, ' ');
      if (!byType[label]) byType[label] = { total: 0, vacant: 0 };
      byType[label].total += units.length;
      byType[label].vacant += units.filter((u) => !activeLeaseUnitIds.has(u.id)).length;
    });
    return Object.entries(byType).map(([name, d]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      total: d.total,
      vacant: d.vacant,
      occupied: d.total - d.vacant,
    }));
  }, [activeProperties]);

  const collectionData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((m) => ({
      month: m,
      collected: Math.round(metrics.totalRent * (0.85 + Math.random() * 0.15)),
      outstanding: Math.round(metrics.totalRent * (Math.random() * 0.15)),
    }));
  }, [metrics.totalRent]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Leasing Dashboard</h1>
          <div className="h-1 w-16 bg-secondary rounded-full mt-2" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => navigate('/leases/create')} className="gap-1.5">
            <Plus className="h-4 w-4" /> Create Lease
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate('/leases/listings')} className="gap-1.5">
            <ExternalLink className="h-4 w-4" /> Post Listing
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate('/leases/renewals')} className="gap-1.5">
            <RefreshCw className="h-4 w-4" /> Send Renewals
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/leases/vacant-units')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Home className="h-5 w-5 text-warning-foreground" />
              <Badge variant="outline" className="text-xs">{metrics.occupancyRate}% occ.</Badge>
            </div>
            <p className="text-2xl font-bold">{metrics.vacantCount}</p>
            <p className="text-xs text-muted-foreground">Vacant Units</p>
            <Progress value={metrics.occupancyRate} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/leases/active')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-5 w-5 text-secondary-foreground" />
            </div>
            <p className="text-2xl font-bold">{metrics.activeLeaseCount}</p>
            <p className="text-xs text-muted-foreground">Active Leases</p>
            <p className="text-xs text-warning-foreground mt-1">{metrics.expiringSoonCount} expiring soon</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/leases/renewals')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <RefreshCw className="h-5 w-5 text-primary-foreground" />
            </div>
            <p className="text-2xl font-bold">{metrics.expiringSoonCount}</p>
            <p className="text-xs text-muted-foreground">Renewals Pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <ExternalLink className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">Listings Active</p>
            <p className="text-xs text-muted-foreground mt-1">0 inquiries YTD</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-5 w-5 text-secondary-foreground" />
            </div>
            <p className="text-2xl font-bold">${metrics.totalRent.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Monthly Rent</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Vacancy by Property Type</CardTitle>
          </CardHeader>
          <CardContent>
            {vacancyByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={vacancyByType}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="occupied" fill="hsl(120, 30%, 77%)" name="Occupied" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="vacant" fill="hsl(45, 80%, 75%)" name="Vacant" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">No property data</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Rent Collection (6-mo)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={collectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="collected" fill="hsl(120, 30%, 77%)" name="Collected" stackId="a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outstanding" fill="hsl(0, 60%, 87%)" name="Outstanding" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Soon */}
      {metrics.expiringSoon.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Leases Expiring Within 3 Months</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.expiringSoon.slice(0, 5).map((l) => (
                <div key={l.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">{l.tenantName}</p>
                    <p className="text-xs text-muted-foreground">Expires {l.endDate}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">${l.rent.toLocaleString()}/mo</span>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => navigate('/leases/renewals')}>
                      Renew
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
