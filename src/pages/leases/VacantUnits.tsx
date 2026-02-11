import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Plus, ExternalLink, Search, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePropertiesContext } from '@/contexts/PropertiesContext';
import { PROPERTY_TYPE_LABELS } from '@/types/property';

interface VacantUnit {
  propertyId: string;
  propertyName: string;
  propertyType: string;
  unitId: string;
  unitLabel: string;
  daysVacant: number;
  projectedRent: number;
}

export default function VacantUnits() {
  const navigate = useNavigate();
  const { activeProperties } = usePropertiesContext();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [daysFilter, setDaysFilter] = useState('all');

  const vacantUnits = useMemo<VacantUnit[]>(() => {
    const units: VacantUnit[] = [];
    activeProperties.forEach((p) => {
      const activeLeaseUnitIds = new Set(
        p.leases.filter((l) => l.status === 'active').map((l) => l.unitId || l.propertyId)
      );
      if (p.units.length === 0) {
        if (!activeLeaseUnitIds.has(p.id)) {
          units.push({
            propertyId: p.id,
            propertyName: p.name,
            propertyType: PROPERTY_TYPE_LABELS[p.type],
            unitId: p.id,
            unitLabel: 'Entire Property',
            daysVacant: Math.floor(Math.random() * 90) + 1,
            projectedRent: p.marketRentAvg || 1500,
          });
        }
      } else {
        p.units.forEach((u) => {
          if (!activeLeaseUnitIds.has(u.id)) {
            units.push({
              propertyId: p.id,
              propertyName: p.name,
              propertyType: PROPERTY_TYPE_LABELS[p.type],
              unitId: u.id,
              unitLabel: `Unit ${u.unitNumber}`,
              daysVacant: Math.floor(Math.random() * 90) + 1,
              projectedRent: p.marketRentAvg || 1200,
            });
          }
        });
      }
    });
    return units;
  }, [activeProperties]);

  const filtered = useMemo(() => {
    let list = vacantUnits;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((u) =>
        u.propertyName.toLowerCase().includes(q) || u.unitLabel.toLowerCase().includes(q)
      );
    }
    if (typeFilter !== 'all') {
      list = list.filter((u) => u.propertyType === typeFilter);
    }
    if (daysFilter !== 'all') {
      const d = Number(daysFilter);
      list = list.filter((u) => u.daysVacant >= d);
    }
    return list;
  }, [vacantUnits, search, typeFilter, daysFilter]);

  const types = [...new Set(vacantUnits.map((u) => u.propertyType))];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/leases')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Vacant Units</h1>
          <div className="h-1 w-16 bg-secondary rounded-full mt-2" />
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} vacant unit{filtered.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search units..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Property Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={daysFilter} onValueChange={setDaysFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Days Vacant" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Duration</SelectItem>
            <SelectItem value="30">30+ days</SelectItem>
            <SelectItem value="60">60+ days</SelectItem>
            <SelectItem value="90">90+ days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit / Property</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Days Vacant</TableHead>
                <TableHead className="text-right">Projected Rent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No vacant units found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((u) => (
                  <TableRow key={`${u.propertyId}-${u.unitId}`}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{u.unitLabel}</p>
                        <p className="text-xs text-muted-foreground">{u.propertyName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{u.propertyType}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={u.daysVacant > 60 ? 'destructive' : 'outline'} className="text-xs">
                        {u.daysVacant}d
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm">${u.projectedRent.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => navigate(`/leases/create?propertyId=${u.propertyId}&unitId=${u.unitId}`)}>
                          <Plus className="h-3 w-3" /> Lease
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => navigate('/leases/listings')}>
                          <ExternalLink className="h-3 w-3" /> List
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
