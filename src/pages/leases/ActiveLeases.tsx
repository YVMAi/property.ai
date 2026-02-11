import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, FileText, RefreshCw, LogOut, Send, Eye,
  AlertTriangle, DollarSign,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePropertiesContext } from '@/contexts/PropertiesContext';
import { toast } from '@/hooks/use-toast';

type LeaseStatusBadge = 'active' | 'expiring' | 'overdue';

interface LeaseRow {
  id: string;
  tenantName: string;
  tenantId?: string;
  unitLabel: string;
  propertyName: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  rent: number;
  statusBadge: LeaseStatusBadge;
  depositAmount: number;
}

const BADGE_STYLES: Record<LeaseStatusBadge, string> = {
  active: 'bg-secondary text-secondary-foreground',
  expiring: 'bg-warning text-warning-foreground',
  overdue: 'bg-destructive text-destructive-foreground',
};

export default function ActiveLeases() {
  const navigate = useNavigate();
  const { activeProperties } = usePropertiesContext();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLease, setSelectedLease] = useState<LeaseRow | null>(null);
  const [showVacate, setShowVacate] = useState(false);

  const leaseRows = useMemo<LeaseRow[]>(() => {
    const rows: LeaseRow[] = [];
    const now = new Date();
    const threeMonths = new Date(now);
    threeMonths.setMonth(threeMonths.getMonth() + 3);

    activeProperties.forEach((p) => {
      p.leases.filter((l) => l.status === 'active').forEach((l) => {
        const endDate = new Date(l.endDate);
        let statusBadge: LeaseStatusBadge = 'active';
        if (endDate <= threeMonths && endDate >= now) statusBadge = 'expiring';

        rows.push({
          id: l.id,
          tenantName: l.tenantName,
          tenantId: l.tenantId,
          unitLabel: l.unitId
            ? `Unit ${p.units.find((u) => u.id === l.unitId)?.unitNumber || '?'}`
            : 'Entire Property',
          propertyName: p.name,
          propertyId: p.id,
          startDate: l.startDate,
          endDate: l.endDate,
          rent: l.rent,
          statusBadge,
          depositAmount: l.rent * 2,
        });
      });
    });
    return rows;
  }, [activeProperties]);

  const filtered = useMemo(() => {
    let list = leaseRows;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((l) =>
        l.tenantName.toLowerCase().includes(q) ||
        l.propertyName.toLowerCase().includes(q) ||
        l.unitLabel.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') list = list.filter((l) => l.statusBadge === statusFilter);
    return list;
  }, [leaseRows, search, statusFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/leases')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Active Leases</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} active lease{filtered.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search leases..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expiring">Expiring</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant</TableHead>
                <TableHead>Unit / Property</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Rent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No active leases</TableCell></TableRow>
              ) : filtered.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium text-sm">{l.tenantName}</TableCell>
                  <TableCell>
                    <p className="text-sm">{l.unitLabel}</p>
                    <p className="text-xs text-muted-foreground">{l.propertyName}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs">{l.startDate}</p>
                    <p className="text-xs text-muted-foreground">to {l.endDate}</p>
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">${l.rent.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${BADGE_STYLES[l.statusBadge]}`}>{l.statusBadge}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setSelectedLease(l)} title="View">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => navigate('/leases/renewals')} title="Renew">
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setSelectedLease(l); setShowVacate(true); }} title="Vacate">
                        <LogOut className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Send Invoice"
                        onClick={() => toast({ title: 'Invoice sent', description: `Invoice sent to ${l.tenantName}` })}>
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Lease Detail Dialog */}
      <Dialog open={!!selectedLease && !showVacate} onOpenChange={() => setSelectedLease(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Lease Details</DialogTitle></DialogHeader>
          {selectedLease && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Tenant:</span> {selectedLease.tenantName}</div>
                <div><span className="text-muted-foreground">Unit:</span> {selectedLease.unitLabel}</div>
                <div><span className="text-muted-foreground">Property:</span> {selectedLease.propertyName}</div>
                <div><span className="text-muted-foreground">Rent:</span> ${selectedLease.rent.toLocaleString()}/mo</div>
                <div><span className="text-muted-foreground">Start:</span> {selectedLease.startDate}</div>
                <div><span className="text-muted-foreground">End:</span> {selectedLease.endDate}</div>
                <div><span className="text-muted-foreground">Deposit:</span> ${selectedLease.depositAmount.toLocaleString()}</div>
                <div><span className="text-muted-foreground">Status:</span> <Badge className={`text-xs ${BADGE_STYLES[selectedLease.statusBadge]}`}>{selectedLease.statusBadge}</Badge></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Vacate Dialog */}
      <Dialog open={showVacate} onOpenChange={(open) => { setShowVacate(open); if (!open) setSelectedLease(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Vacate Tenant</DialogTitle></DialogHeader>
          {selectedLease && (
            <div className="space-y-3">
              <p className="text-sm">Vacating <strong>{selectedLease.tenantName}</strong> from {selectedLease.unitLabel}</p>
              <div>
                <Label>Reason</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select reason..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="voluntary">Voluntary Move-Out</SelectItem>
                    <SelectItem value="eviction">Eviction</SelectItem>
                    <SelectItem value="non_renewal">Non-Renewal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Vacate Date</Label>
                <Input type="date" />
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Security Deposit</p>
                <p className="text-sm font-medium">${selectedLease.depositAmount.toLocaleString()} — Refund will be scheduled</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1" onClick={() => toast({ title: 'Eviction notice generated' })}>
                  <AlertTriangle className="h-3 w-3" /> Send Eviction Notice
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowVacate(false); setSelectedLease(null); }}>Cancel</Button>
            <Button variant="destructive" onClick={() => {
              toast({ title: 'Tenant vacated', description: 'Deposit refund scheduled' });
              setShowVacate(false);
              setSelectedLease(null);
            }}>Confirm Vacate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
