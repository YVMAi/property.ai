import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Edit, Building2, DollarSign, FileText, Users, ChevronDown, Wand2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { usePropertiesContext } from '@/contexts/PropertiesContext';
import { useOwnersContext } from '@/contexts/OwnersContext';
import {
  PROPERTY_TYPE_LABELS,
  PROPERTY_STATUS_LABELS,
  STATUS_COLORS,
  type PropertyStatus,
} from '@/types/property';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis,
} from 'recharts';
import BulkUnitSetupDialog, { type BulkUnit } from '@/components/properties/BulkUnitSetupDialog';

const needsUnits = (t: string) => ['multi_family', 'affordable_multi', 'student_housing'].includes(t);
const isStudentType = (t: string) => t === 'student_housing';
const PASTEL = ['hsl(210,50%,78%)', 'hsl(120,30%,77%)', 'hsl(45,80%,75%)', 'hsl(0,60%,87%)'];

export default function PropertyViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPropertyById, changeStatus, updateProperty } = usePropertiesContext();
  const { activeOwners } = useOwnersContext();
  const [bulkOpen, setBulkOpen] = useState(false);
  const [unitSearch, setUnitSearch] = useState('');

  const property = id ? getPropertyById(id) : undefined;

  const handleBulkConfirm = (bulkUnits: BulkUnit[]) => {
    if (!id || !property) return;
    const mapped = bulkUnits.map(u => ({
      unitNumber: u.unitNumber,
      size: u.size,
      bedrooms: u.bedrooms,
      bathrooms: u.bathrooms,
      unitType: u.unitType as any,
      isShared: u.isShared,
      independentWashroom: u.independentWashroom,
      unitAmenities: u.unitAmenities,
    }));
    updateProperty(id, { units: [...property.units, ...mapped] });
  };

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <Building2 className="h-16 w-16 text-muted-foreground/40 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Property Not Found</h2>
        <Button onClick={() => navigate('/properties')}>Back to Properties</Button>
      </div>
    );
  }

  const owner = activeOwners.find((o) => o.id === property.ownerId);
  const ownerName = owner
    ? owner.ownerType === 'company' ? owner.companyName : `${owner.firstName} ${owner.lastName}`
    : 'Unknown';

  const activeLeases = property.leases.filter((l) => l.status === 'active');
  const totalRentYTD = activeLeases.reduce((s, l) => s + l.rent * 2, 0); // 2 months placeholder
  const avgRent = activeLeases.length > 0 ? Math.round(activeLeases.reduce((s, l) => s + l.rent, 0) / activeLeases.length) : 0;

  const expenseBreakdown = [
    { name: 'Maintenance', value: 3200 },
    { name: 'Utilities', value: 1800 },
    { name: 'Taxes', value: property.taxes || 2400 },
    { name: 'Insurance', value: property.insurance || 800 },
  ];

  const marketComparison = [
    { name: 'Your Avg', value: avgRent },
    { name: 'Market', value: property.marketRentAvg || 0 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/properties')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{property.name}</h1>
            <p className="text-sm text-muted-foreground">
              {property.address.city}, {property.address.state} {property.address.zip}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={`${STATUS_COLORS[property.status]} text-sm`}>
            {PROPERTY_STATUS_LABELS[property.status]}
          </Badge>
          <Badge variant="outline">{PROPERTY_TYPE_LABELS[property.type]}</Badge>
          <SearchableSelect
            options={Object.entries(PROPERTY_STATUS_LABELS).filter(([k]) => k !== 'deleted').map(([k, v]) => ({ value: k, label: v }))}
            value={property.status}
            onValueChange={(v) => id && changeStatus(id, v as PropertyStatus)}
            placeholder="Change Status"
            triggerClassName="w-[160px] h-9"
          />
          <Button size="sm" variant="outline" onClick={() => navigate(`/properties/${id}/edit`)} className="gap-1.5">
            <Edit className="h-4 w-4" /> Edit
          </Button>
        </div>
      </div>

      {/* Owner link */}
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Owner: <strong>{ownerName}</strong></span>
          </div>
          {owner && (
            <Button variant="link" size="sm" onClick={() => navigate(`/users/owners/${owner.id}`)}>
              View Owner
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-primary-foreground" />
              <p className="text-sm font-medium text-muted-foreground">YTD Rent Collected</p>
            </div>
            <p className="text-2xl font-bold">${totalRentYTD.toLocaleString()}</p>
          </CardContent>
        </Card>

        {/* Expense Pie */}
        <Card>
          <CardHeader className="pb-1 pt-4 px-5">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={expenseBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55} label={false}>
                  {expenseBreakdown.map((_, i) => (
                    <Cell key={i} fill={PASTEL[i % PASTEL.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Market Comparison Bar */}
        <Card>
          <CardHeader className="pb-1 pt-4 px-5">
            <CardTitle className="text-sm font-medium">Rent vs Market</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={marketComparison} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={60} />
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {marketComparison.map((_, i) => (
                    <Cell key={i} fill={PASTEL[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Map placeholder */}
      <Card>
        <CardContent className="p-4 flex items-center gap-2 text-muted-foreground text-sm">
          <MapPin className="h-4 w-4" />
          Map embed for {property.address.street} ({property.mapCoords.lat}, {property.mapCoords.lng}) — requires Google Maps API key.
        </CardContent>
      </Card>

      {/* Current Leases */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Current Leases ({activeLeases.length})</CardTitle>
            <Button size="sm" variant="outline" className="gap-1.5">
              <FileText className="h-4 w-4" /> Add Lease
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeLeases.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No active leases</p>
          ) : (
            <div className="space-y-2">
              {property.leases.map((l) => (
                <div key={l.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="text-sm font-medium">{l.tenantName}</p>
                    <p className="text-xs text-muted-foreground">
                      {l.unitId ? `Unit ${l.unitId}` : 'Property-level'} · ${l.rent}/mo · {l.startDate} → {l.endDate}
                    </p>
                  </div>
                  <Badge variant={l.status === 'active' ? 'secondary' : 'outline'} className="text-xs">{l.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sub-Units (multi/student) */}
      {needsUnits(property.type) && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">
                {isStudentType(property.type) ? 'Beds' : 'Units'} ({property.units.length})
              </CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setBulkOpen(true)} className="gap-1.5 border-primary/30 text-primary hover:bg-primary/5">
                  <Wand2 className="h-4 w-4" /> Bulk Add
                </Button>
              </div>
            </div>
            {property.units.length > 10 && (
              <Input
                placeholder={`Search ${isStudentType(property.type) ? 'beds' : 'units'}...`}
                value={unitSearch}
                onChange={(e) => setUnitSearch(e.target.value)}
                className="mt-2 h-9"
              />
            )}
          </CardHeader>
          <CardContent>
            {property.units.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No {isStudentType(property.type) ? 'beds' : 'units'} added yet</p>
            ) : (
              <Accordion type="multiple">
                {property.units
                  .filter(u => !unitSearch || u.unitNumber.toLowerCase().includes(unitSearch.toLowerCase()))
                  .slice(0, 50)
                  .map((u) => {
                    const unitLeases = property.leases.filter((l) => l.unitId === u.id);
                    return (
                      <AccordionItem key={u.id} value={u.id}>
                        <AccordionTrigger className="text-sm py-2">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{u.unitNumber}</span>
                            <span className="text-xs text-muted-foreground">{u.size} sqft · {u.bedrooms}bd/{u.bathrooms}ba</span>
                            {u.isShared && <Badge variant="outline" className="text-xs">Shared</Badge>}
                            <Badge variant={unitLeases.some((l) => l.status === 'active') ? 'secondary' : 'outline'} className="text-xs">
                              {unitLeases.some((l) => l.status === 'active') ? 'Occupied' : 'Vacant'}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          {unitLeases.length > 0 ? (
                            unitLeases.map((l) => (
                              <div key={l.id} className="pl-4 py-1 text-sm">
                                {l.tenantName} · ${l.rent}/mo · {l.startDate} → {l.endDate}
                              </div>
                            ))
                          ) : (
                            <p className="pl-4 text-sm text-muted-foreground">No leases</p>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                {property.units.filter(u => !unitSearch || u.unitNumber.toLowerCase().includes(unitSearch.toLowerCase())).length > 50 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    Showing 50 of {property.units.filter(u => !unitSearch || u.unitNumber.toLowerCase().includes(unitSearch.toLowerCase())).length}. Use search to filter.
                  </p>
                )}
              </Accordion>
            )}
          </CardContent>
        </Card>
      )}

      {/* Documents */}
      {property.documents.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {property.documents.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <span className="text-sm">{d.fileName}</span>
                  <div className="flex gap-1">
                    {d.tags.map((t) => (
                      <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Details */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Property Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div><p className="text-muted-foreground">Sq Ft</p><p className="font-medium">{property.sqFt.toLocaleString()}</p></div>
            <div><p className="text-muted-foreground">Year Built</p><p className="font-medium">{property.yearBuilt}</p></div>
            <div><p className="text-muted-foreground">Purchase Price</p><p className="font-medium">${property.purchasePrice.toLocaleString()}</p></div>
            {property.bedrooms && <div><p className="text-muted-foreground">Bedrooms</p><p className="font-medium">{property.bedrooms}</p></div>}
            {property.bathrooms && <div><p className="text-muted-foreground">Bathrooms</p><p className="font-medium">{property.bathrooms}</p></div>}
            {property.hoaFees && <div><p className="text-muted-foreground">HOA</p><p className="font-medium">${property.hoaFees}/mo</p></div>}
          </div>
          {property.amenities.length > 0 && (
            <div className="mt-4">
              <p className="text-muted-foreground text-sm mb-2">Amenities</p>
              <div className="flex flex-wrap gap-1">
                {property.amenities.map((a) => (
                  <Badge key={a} variant="outline" className="text-xs">{a}</Badge>
                ))}
              </div>
            </div>
          )}
          {property.description && (
            <div className="mt-4">
              <p className="text-muted-foreground text-sm mb-1">Description</p>
              <p className="text-sm">{property.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Unit Setup Dialog */}
      {needsUnits(property.type) && (
        <BulkUnitSetupDialog
          open={bulkOpen}
          onOpenChange={setBulkOpen}
          isStudent={isStudentType(property.type)}
          existingUnitNumbers={property.units.map(u => u.unitNumber)}
          onConfirm={handleBulkConfirm}
        />
      )}
    </div>
  );
}
