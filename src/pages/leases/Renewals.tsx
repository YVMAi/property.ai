import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Search, RefreshCw, Send, Check, X, Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { usePropertiesContext } from '@/contexts/PropertiesContext';
import { toast } from '@/hooks/use-toast';

type RenewalStatus = 'pending' | 'sent' | 'accepted' | 'rejected';

const STATUS_BADGE: Record<RenewalStatus, string> = {
  pending: 'bg-warning text-warning-foreground',
  sent: 'bg-primary text-primary-foreground',
  accepted: 'bg-secondary text-secondary-foreground',
  rejected: 'bg-destructive text-destructive-foreground',
};

interface RenewalRow {
  leaseId: string;
  tenantName: string;
  unitLabel: string;
  propertyName: string;
  expirationDate: string;
  currentRent: number;
  renewalStatus: RenewalStatus;
}

export default function Renewals() {
  const navigate = useNavigate();
  const { activeProperties } = usePropertiesContext();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showOffer, setShowOffer] = useState(false);
  const [selectedRenewal, setSelectedRenewal] = useState<RenewalRow | null>(null);
  const [newRent, setNewRent] = useState('');
  const [applyEscalation, setApplyEscalation] = useState(false);

  const renewalRows = useMemo<RenewalRow[]>(() => {
    const rows: RenewalRow[] = [];
    const now = new Date();
    const sixMonths = new Date(now);
    sixMonths.setMonth(sixMonths.getMonth() + 6);

    activeProperties.forEach((p) => {
      p.leases.filter((l) => l.status === 'active').forEach((l) => {
        const endDate = new Date(l.endDate);
        if (endDate <= sixMonths && endDate >= now) {
          const statuses: RenewalStatus[] = ['pending', 'sent', 'accepted', 'rejected'];
          rows.push({
            leaseId: l.id,
            tenantName: l.tenantName,
            unitLabel: l.unitId
              ? `Unit ${p.units.find((u) => u.id === l.unitId)?.unitNumber || '?'}`
              : 'Entire Property',
            propertyName: p.name,
            expirationDate: l.endDate,
            currentRent: l.rent,
            renewalStatus: statuses[Math.floor(Math.random() * 2)] as RenewalStatus, // mock
          });
        }
      });
    });
    return rows;
  }, [activeProperties]);

  const filtered = useMemo(() => {
    let list = renewalRows;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.tenantName.toLowerCase().includes(q) || r.propertyName.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') list = list.filter((r) => r.renewalStatus === statusFilter);
    return list;
  }, [renewalRows, search, statusFilter]);

  const openOffer = (row: RenewalRow) => {
    setSelectedRenewal(row);
    setNewRent(String(Math.round(row.currentRent * 1.03)));
    setShowOffer(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/leases')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-foreground">Renewals</h1>
          <div className="h-1 w-16 bg-secondary rounded-full mt-2" />
          <p className="text-sm text-muted-foreground mt-1">{renewalRows.length} lease{renewalRows.length !== 1 ? 's' : ''} expiring within 6 months</p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => {
          toast({ title: 'Bulk renewal offers sent', description: `${renewalRows.filter(r => r.renewalStatus === 'pending').length} offers queued` });
        }}>
          <Send className="h-4 w-4" /> Send All Offers
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {(['pending', 'sent', 'accepted', 'rejected'] as RenewalStatus[]).map((s) => (
          <Card key={s}>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{renewalRows.filter((r) => r.renewalStatus === s).length}</p>
              <Badge className={`text-xs mt-1 ${STATUS_BADGE[s]}`}>{s}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
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
                <TableHead>Expiration</TableHead>
                <TableHead className="text-right">Current Rent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No renewals pending</TableCell></TableRow>
              ) : filtered.map((r) => (
                <TableRow key={r.leaseId}>
                  <TableCell className="font-medium text-sm">{r.tenantName}</TableCell>
                  <TableCell>
                    <p className="text-sm">{r.unitLabel}</p>
                    <p className="text-xs text-muted-foreground">{r.propertyName}</p>
                  </TableCell>
                  <TableCell className="text-sm">{r.expirationDate}</TableCell>
                  <TableCell className="text-right text-sm">${r.currentRent.toLocaleString()}</TableCell>
                  <TableCell><Badge className={`text-xs ${STATUS_BADGE[r.renewalStatus]}`}>{r.renewalStatus}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => openOffer(r)}>
                        <Send className="h-3 w-3" /> Offer
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => toast({ title: 'Renewal accepted' })}>
                        <Check className="h-3.5 w-3.5 text-secondary-foreground" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => toast({ title: 'Renewal rejected' })}>
                        <X className="h-3.5 w-3.5 text-destructive-foreground" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Send Offer Dialog */}
      <Dialog open={showOffer} onOpenChange={setShowOffer}>
        <DialogContent>
          <DialogHeader><DialogTitle>Send Renewal Offer</DialogTitle></DialogHeader>
          {selectedRenewal && (
            <div className="space-y-3">
              <p className="text-sm">Renewing lease for <strong>{selectedRenewal.tenantName}</strong> at {selectedRenewal.unitLabel}</p>
              <div>
                <Label>New Rent ($/mo)</Label>
                <Input type="number" value={newRent} onChange={(e) => setNewRent(e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">Current: ${selectedRenewal.currentRent.toLocaleString()}/mo</p>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Apply Escalation from Settings</Label>
                <Switch checked={applyEscalation} onCheckedChange={setApplyEscalation} />
              </div>
              <p className="text-xs text-muted-foreground">Renewal document will be generated from template</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOffer(false)}>Cancel</Button>
            <Button onClick={() => {
              toast({ title: 'Renewal offer sent', description: `Offer sent to ${selectedRenewal?.tenantName}` });
              setShowOffer(false);
            }}>Send Offer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
