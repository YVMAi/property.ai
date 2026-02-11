import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Search, Home, BedDouble, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import LeaseCreationModal from '@/components/properties/LeaseCreationModal';
import type { PropertyType, PropertyUnit, PropertyLease } from '@/types/property';
import type { LeaseFormData, ExtendedLease } from '@/types/lease';
import { LEASE_STATUS_LABELS, LEASE_STATUS_COLORS } from '@/types/lease';

interface LeasableItemsListProps {
  propertyType: PropertyType;
  units: PropertyUnit[];
  leases: PropertyLease[];
  extendedLeases: ExtendedLease[];
  onCreateLease: (data: LeaseFormData, leasableLabel: string, unitId?: string) => void;
  showExistingLeases?: boolean;
}

const needsUnits = (t: PropertyType) => ['multi_family', 'affordable_multi', 'student_housing'].includes(t);
const isStudentType = (t: PropertyType) => t === 'student_housing';
const isSingleType = (t: PropertyType) => ['single_family', 'affordable_single', 'commercial'].includes(t);

function getUnitLeaseStatus(unitId: string, leases: PropertyLease[]): 'vacant' | 'leased' | 'expired' {
  const unitLeases = leases.filter((l) => l.unitId === unitId);
  if (unitLeases.some((l) => l.status === 'active')) return 'leased';
  if (unitLeases.some((l) => l.status === 'expired')) return 'expired';
  return 'vacant';
}

const STATUS_BADGE: Record<string, string> = {
  vacant: 'bg-secondary text-secondary-foreground',
  leased: 'bg-primary/20 text-primary',
  expired: 'bg-muted text-muted-foreground',
};

export default function LeasableItemsList({
  propertyType,
  units,
  leases,
  extendedLeases,
  onCreateLease,
  showExistingLeases = false,
}: LeasableItemsListProps) {
  const [leaseModalOpen, setLeaseModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<{ label: string; unitId?: string } | null>(null);
  const [unitSearch, setUnitSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const isStudent = isStudentType(propertyType);

  const filteredUnits = useMemo(() => {
    return units.filter((u) => {
      if (unitSearch && !u.unitNumber.toLowerCase().includes(unitSearch.toLowerCase())) return false;
      if (statusFilter !== 'all') {
        const status = getUnitLeaseStatus(u.id || '', leases);
        if (status !== statusFilter) return false;
      }
      return true;
    });
  }, [units, unitSearch, statusFilter, leases]);

  const openLeaseModal = (label: string, unitId?: string, propertyId?: string) => {
    setSelectedUnit({ label, unitId });
    setLeaseModalOpen(true);
  };

  const handleSaveLease = (data: LeaseFormData) => {
    if (selectedUnit) {
      onCreateLease(data, selectedUnit.label, selectedUnit.unitId);
    }
  };

  // Single property type - show single card
  if (isSingleType(propertyType)) {
    const hasActiveLease = leases.some((l) => l.status === 'active');
    return (
      <div className="space-y-3">
        <Card className="border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Home className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Entire Property</p>
                <p className="text-xs text-muted-foreground">
                  {hasActiveLease ? 'Currently leased' : 'Available for lease'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={hasActiveLease ? STATUS_BADGE.leased : STATUS_BADGE.vacant}>
                {hasActiveLease ? 'Leased' : 'Vacant'}
              </Badge>
              <Button
                size="sm"
                className="gap-1"
                onClick={() => openLeaseModal('Entire Property')}
              >
                <Plus className="h-3.5 w-3.5" /> Create Lease
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Existing leases */}
        {showExistingLeases && leases.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Existing Leases</p>
            {leases.map((l) => (
              <div key={l.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="text-sm font-medium">{l.tenantName}</p>
                  <p className="text-xs text-muted-foreground">
                    ${l.rent}/mo · {l.startDate} → {l.endDate}
                  </p>
                </div>
                <Badge variant={l.status === 'active' ? 'secondary' : 'outline'} className="text-xs">
                  {l.status}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* Extended leases */}
        {extendedLeases.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">New Leases (Draft)</p>
            {extendedLeases.map((l) => (
              <div key={l.id} className="flex items-center justify-between p-3 rounded-lg border border-primary/20 bg-primary/5">
                <div>
                  <p className="text-sm font-medium">{l.tenantName}</p>
                  <p className="text-xs text-muted-foreground">
                    ${l.rent}/mo · {l.startDate} → {l.endDate}
                  </p>
                </div>
                <Badge className={LEASE_STATUS_COLORS[l.status]} >{LEASE_STATUS_LABELS[l.status]}</Badge>
              </div>
            ))}
          </div>
        )}

        {selectedUnit && (
          <LeaseCreationModal
            open={leaseModalOpen}
            onOpenChange={setLeaseModalOpen}
            leasableLabel={selectedUnit.label}
            unitId={selectedUnit.unitId}
            onSave={handleSaveLease}
          />
        )}
      </div>
    );
  }

  // Multi-unit / Student housing - table of units or beds

  return (
    <div className="space-y-3">
      {/* Search and filter bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 h-9"
            placeholder={`Search ${isStudent ? 'beds' : 'units'}...`}
            value={unitSearch}
            onChange={(e) => setUnitSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="vacant">Vacant</SelectItem>
            <SelectItem value="leased">Leased</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {units.length === 0 ? (
        <div className="p-6 text-center text-sm text-muted-foreground border-2 border-dashed rounded-lg">
          <Building2 className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
          No {isStudent ? 'beds' : 'units'} added yet. Add them in Step 1 to create leases.
        </div>
      ) : filteredUnits.length === 0 ? (
        <div className="p-4 text-center text-sm text-muted-foreground">
          No {isStudent ? 'beds' : 'units'} match your search/filter.
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isStudent ? 'Bed #' : 'Unit #'}</TableHead>
                {isStudent ? (
                  <>
                    <TableHead>Shared</TableHead>
                    <TableHead className="hidden sm:table-cell">Washroom</TableHead>
                  </>
                ) : (
                  <>
                    <TableHead>Size</TableHead>
                    <TableHead className="hidden sm:table-cell">Type</TableHead>
                  </>
                )}
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUnits.slice(0, 50).map((u) => {
                const status = getUnitLeaseStatus(u.id || '', leases);
                return (
                  <TableRow key={u.id || u.unitNumber}>
                    <TableCell className="font-medium">{u.unitNumber}</TableCell>
                    {isStudent ? (
                      <>
                        <TableCell>{u.isShared ? 'Shared' : 'Private'}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {u.independentWashroom ? 'Yes' : 'No'}
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{u.size} sqft</TableCell>
                        <TableCell className="hidden sm:table-cell">{u.bedrooms}bd/{u.bathrooms}ba</TableCell>
                      </>
                    )}
                    <TableCell>
                      <Badge className={`text-xs ${STATUS_BADGE[status]}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 h-7 text-xs"
                        onClick={() => openLeaseModal(
                          isStudent ? `Bed ${u.unitNumber}` : `Unit ${u.unitNumber}`,
                          u.id
                        )}
                      >
                        <Plus className="h-3 w-3" /> Lease
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filteredUnits.length > 50 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              Showing 50 of {filteredUnits.length}. Use search to filter.
            </p>
          )}
        </div>
      )}

      {/* Extended leases created in this session */}
      {extendedLeases.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">New Leases (Draft)</p>
          {extendedLeases.map((l) => (
            <div key={l.id} className="flex items-center justify-between p-3 rounded-lg border border-primary/20 bg-primary/5">
              <div>
                <p className="text-sm font-medium">{l.tenantName} — {l.leasableLabel}</p>
                <p className="text-xs text-muted-foreground">
                  ${l.rent}/mo · {l.startDate} → {l.endDate}
                </p>
              </div>
              <Badge className={LEASE_STATUS_COLORS[l.status]}>{LEASE_STATUS_LABELS[l.status]}</Badge>
            </div>
          ))}
        </div>
      )}

      {selectedUnit && (
        <LeaseCreationModal
          open={leaseModalOpen}
          onOpenChange={setLeaseModalOpen}
          leasableLabel={selectedUnit.label}
          unitId={selectedUnit.unitId}
          onSave={handleSaveLease}
        />
      )}
    </div>
  );
}
