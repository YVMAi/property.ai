import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Download, MapPin, TrendingUp, Home, DollarSign, FileText, AlertTriangle, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Input } from '@/components/ui/input';
import { usePropertiesContext } from '@/contexts/PropertiesContext';
import { useOwnersContext } from '@/contexts/OwnersContext';
import type { PropertyType } from '@/types/property';

import multiFamilyImg from '@/assets/properties/multi-family.jpg';
import singleFamilyImg from '@/assets/properties/single-family.jpg';
import studentHousingImg from '@/assets/properties/student-housing.jpg';
import commercialImg from '@/assets/properties/commercial.jpg';
import affordableImg from '@/assets/properties/affordable.jpg';
import lakefrontImg from '@/assets/properties/lakefront.jpg';

const PROPERTY_TYPE_IMAGES: Record<PropertyType, string> = {
  single_family: singleFamilyImg,
  multi_family: multiFamilyImg,
  student_housing: studentHousingImg,
  affordable_single: affordableImg,
  affordable_multi: affordableImg,
  commercial: commercialImg,
};

// Special override for specific properties by ID
const PROPERTY_IMAGE_OVERRIDES: Record<string, string> = {
  p7: lakefrontImg,
};
import {
  PROPERTY_TYPE_LABELS,
  PROPERTY_STATUS_LABELS,
  STATUS_COLORS,
  type PropertyStatus,
} from '@/types/property';
import {
  RENT_COLLECTION_MONTHLY,
  FEE_COLLECTION_MONTHLY,
  EXPENSE_MONTHLY,
} from '@/data/propertiesMockData';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const PASTEL_CHART_COLORS = [
  'hsl(210,50%,78%)', 'hsl(120,30%,77%)', 'hsl(45,80%,75%)',
  'hsl(0,60%,87%)', 'hsl(280,40%,80%)', 'hsl(30,60%,75%)',
];

export default function Properties() {
  const navigate = useNavigate();
  const { activeProperties, archivedProperties } = usePropertiesContext();
  const { activeOwners } = useOwnersContext();

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ownerSearch, setOwnerSearch] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const displayProperties = showArchived ? archivedProperties : activeProperties;

  const filteredProperties = useMemo(() => {
    return displayProperties.filter((p) => {
      if (typeFilter !== 'all' && p.type !== typeFilter) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (ownerSearch.trim()) {
        const owner = activeOwners.find((o) => o.id === p.ownerId);
        const ownerName = owner
          ? owner.ownerType === 'company'
            ? owner.companyName
            : `${owner.firstName} ${owner.lastName}`
          : '';
        if (!ownerName.toLowerCase().includes(ownerSearch.toLowerCase())) return false;
      }
      return true;
    });
  }, [displayProperties, typeFilter, statusFilter, ownerSearch, activeOwners]);

  // Metrics
  const totalProperties = activeProperties.length;
  const typeBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    activeProperties.forEach((p) => {
      counts[p.type] = (counts[p.type] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({
      name: PROPERTY_TYPE_LABELS[type as PropertyType],
      value: count,
    }));
  }, [activeProperties]);

  const allLeases = activeProperties.flatMap((p) => p.leases);
  const activeLeases = allLeases.filter((l) => l.status === 'active');
  const totalUnits = activeProperties.reduce((s, p) => s + (p.units.length || 1), 0);
  const occupancyPct = totalUnits > 0 ? Math.round((activeLeases.length / totalUnits) * 100) : 0;

  const expiringLeases = activeLeases.filter((l) => {
    const end = new Date(l.endDate);
    const now = new Date();
    const days = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return days > 0 && days <= 90;
  });

  const rentYTD = RENT_COLLECTION_MONTHLY.slice(-2).reduce((s, m) => s + m.value, 0);
  const avgMonthlyRent = Math.round(RENT_COLLECTION_MONTHLY.reduce((s, m) => s + m.value, 0) / 12);
  const feeYTD = FEE_COLLECTION_MONTHLY.slice(-2).reduce((s, m) => s + m.value, 0);
  const expenseYTD = EXPENSE_MONTHLY.slice(-2).reduce((s, m) => s + m.value, 0);

  const vacantProps = activeProperties.filter((p) => p.status === 'vacant');

  const getOwnerName = (ownerId: string) => {
    const o = activeOwners.find((x) => x.id === ownerId);
    if (!o) return 'Unknown';
    return o.ownerType === 'company' ? o.companyName : `${o.firstName} ${o.lastName}`;
  };

  if (totalProperties === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
        <Building2 className="h-20 w-20 text-muted-foreground/40 mb-6" />
        <h2 className="text-2xl font-semibold text-foreground mb-2">No Properties Yet</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Add your first property to start tracking metrics, leases, and expenses.
        </p>
        <Button onClick={() => navigate('/properties/new')} className="gap-2">
          <Plus className="h-4 w-4" /> Add a Property
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Properties</h1>
          <p className="text-muted-foreground text-sm">
            {totalProperties} properties · {occupancyPct}% occupied
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowMap(!showMap)} className="gap-1.5">
            <MapPin className="h-4 w-4" /> {showMap ? 'Hide Map' : 'Map View'}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-4 w-4" /> Export PDF
          </Button>
          <Button size="sm" onClick={() => navigate('/properties/new')} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add Property
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="min-w-[160px]">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
              <SearchableSelect
                options={[{ value: 'all', label: 'All Types' }, ...Object.entries(PROPERTY_TYPE_LABELS).map(([k, v]) => ({ value: k, label: v }))]}
                value={typeFilter}
                onValueChange={setTypeFilter}
                placeholder="All Types"
                triggerClassName="h-9"
              />
            </div>
            <div className="min-w-[140px]">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
              <SearchableSelect
                options={[{ value: 'all', label: 'All Statuses' }, ...Object.entries(PROPERTY_STATUS_LABELS).filter(([k]) => k !== 'deleted').map(([k, v]) => ({ value: k, label: v }))]}
                value={statusFilter}
                onValueChange={setStatusFilter}
                placeholder="All Statuses"
                triggerClassName="h-9"
              />
            </div>
            <div className="min-w-[180px]">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Owner</label>
              <Input
                placeholder="Search owner..."
                className="h-9"
                value={ownerSearch}
                onChange={(e) => setOwnerSearch(e.target.value)}
              />
            </div>
            <Button
              variant={showArchived ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowArchived(!showArchived)}
            >
              {showArchived ? 'Show Active' : 'Show Archived'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Map View */}
      {showMap && (
        <Card>
          <CardContent className="p-0 overflow-hidden rounded-lg">
            <iframe
              title="Properties Map"
              width="100%"
              height="350"
              style={{ border: 0 }}
              loading="lazy"
              src={`https://www.google.com/maps/embed/v1/view?key=PLACEHOLDER&center=42,-98&zoom=4`}
            />
            <div className="p-4 bg-muted/30 text-sm text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Map requires a Google Maps API key. Showing placeholder.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total Properties */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {}}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-3xl font-bold text-foreground">{totalProperties}</span>
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Total Properties</p>
            <div className="flex flex-wrap gap-1">
              {typeBreakdown.map((t) => (
                <Badge key={t.name} variant="secondary" className="text-xs">
                  {t.value} {t.name.split(' ')[0]}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Leases */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-secondary/30 flex items-center justify-center">
                <FileText className="h-5 w-5 text-secondary-foreground" />
              </div>
              <span className="text-3xl font-bold text-foreground">{activeLeases.length}</span>
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Active Leases</p>
            <p className="text-xs text-muted-foreground">{occupancyPct}% occupancy · {expiringLeases.length} expiring &le;90d</p>
          </CardContent>
        </Card>

        {/* Rent YTD */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-3xl font-bold text-foreground">${(rentYTD / 1000).toFixed(0)}k</span>
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Rent Collected YTD</p>
            <p className="text-xs text-muted-foreground">Avg ${avgMonthlyRent.toLocaleString()}/mo</p>
          </CardContent>
        </Card>

        {/* Expenses YTD */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-destructive/30 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-destructive-foreground" />
              </div>
              <span className="text-3xl font-bold text-foreground">${(expenseYTD / 1000).toFixed(0)}k</span>
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Expenses YTD</p>
            <p className="text-xs text-muted-foreground">Fee collections: ${feeYTD.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Type Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Property Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={typeBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {typeBreakdown.map((_, i) => (
                    <Cell key={i} fill={PASTEL_CHART_COLORS[i % PASTEL_CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rent Collection Line */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Rent Collection (12 Mo)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={RENT_COLLECTION_MONTHLY}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Rent']} />
                <Line type="monotone" dataKey="value" stroke="hsl(210,50%,78%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expenses Line */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Expenses (12 Mo)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={EXPENSE_MONTHLY}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Expenses']} />
                <Line type="monotone" dataKey="value" stroke="hsl(0,60%,87%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Market Comparison + Insights + Leases Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Market Comparison */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Market Rent Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeProperties.filter((p) => p.marketRentAvg).slice(0, 5).map((p) => {
              const avgRent = p.leases.length > 0
                ? Math.round(p.leases.reduce((s, l) => s + l.rent, 0) / p.leases.length)
                : 0;
              const market = p.marketRentAvg || 0;
              const diff = avgRent > 0 ? Math.round(((avgRent - market) / market) * 100) : 0;
              return (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.address.street}</p>
                    <div className="flex gap-2 mt-1">
                      <div className="flex-1 h-2 rounded-full bg-primary/30">
                        <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(100, (avgRent / Math.max(avgRent, market)) * 100)}%` }} />
                      </div>
                      <div className="flex-1 h-2 rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-muted-foreground/40" style={{ width: `${Math.min(100, (market / Math.max(avgRent, market)) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs">Yours: ${avgRent.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Market: ${market.toLocaleString()}</p>
                    {diff !== 0 && (
                      <Badge variant={diff >= 0 ? 'secondary' : 'destructive'} className="text-xs mt-0.5">
                        {diff > 0 ? '+' : ''}{diff}%
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Insights */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Insights & Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-2">
              <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                <Home className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p>Occupancy: <strong>{occupancyPct}%</strong> across {totalUnits} units</p>
              </div>
              {vacantProps.length > 0 && (
                <div className="flex items-start gap-2 p-2 rounded-lg bg-warning/20">
                  <AlertTriangle className="h-4 w-4 text-warning-foreground mt-0.5 shrink-0" />
                  <p>{vacantProps.length} vacant {vacantProps.length === 1 ? 'property' : 'properties'} — <button className="underline text-primary-foreground" onClick={() => setStatusFilter('vacant')}>View</button></p>
                </div>
              )}
              {expiringLeases.length > 0 && (
                <div className="flex items-start gap-2 p-2 rounded-lg bg-destructive/10">
                  <FileText className="h-4 w-4 text-destructive-foreground mt-0.5 shrink-0" />
                  <p>{expiringLeases.length} {expiringLeases.length === 1 ? 'lease' : 'leases'} expiring within 90 days</p>
                </div>
              )}
              <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p>Expense-to-income ratio: <strong>{rentYTD > 0 ? Math.round((expenseYTD / rentYTD) * 100) : 0}%</strong></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Leases */}
      {expiringLeases.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Leases Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringLeases.map((l) => {
                const daysLeft = Math.ceil((new Date(l.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={l.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <div>
                      <p className="text-sm font-medium">{l.tenantName}</p>
                      <p className="text-xs text-muted-foreground">{l.unitId ? `Unit ${l.unitId}` : 'Property-level'} · ${l.rent}/mo</p>
                    </div>
                    <Badge variant={daysLeft <= 30 ? 'destructive' : 'secondary'} className="text-xs">
                      {daysLeft}d left
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Property Cards Grid */}
      <div>
        <h2 className="text-lg font-medium text-foreground mb-3">
          {showArchived ? 'Archived' : 'All'} Properties ({filteredProperties.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProperties.map((p) => {
            const photoSrc = PROPERTY_IMAGE_OVERRIDES[p.id] || PROPERTY_TYPE_IMAGES[p.type] || multiFamilyImg;
            return (
              <Card
                key={p.id}
                className="cursor-pointer hover:shadow-md transition-all hover:scale-[1.01] overflow-hidden"
                onClick={() => navigate(`/properties/${p.id}`)}
              >
                <div className="h-40 overflow-hidden">
                  <img
                    src={photoSrc}
                    alt={`${p.address.street} property`}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.address.street}, {p.address.city}, {p.address.state}</p>
                    </div>
                    <Badge className={`${STATUS_COLORS[p.status]} text-xs shrink-0 ml-2`}>
                      {PROPERTY_STATUS_LABELS[p.status]}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <Badge variant="outline" className="text-xs">{PROPERTY_TYPE_LABELS[p.type]}</Badge>
                    {p.units.length > 0 && <Badge variant="outline" className="text-xs">{p.units.length} units</Badge>}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Owner: {getOwnerName(p.ownerId)}</span>
                    <span>{p.leases.filter((l) => l.status === 'active').length} active leases</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
