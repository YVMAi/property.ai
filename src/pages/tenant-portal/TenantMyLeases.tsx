import { useState, useMemo } from 'react';
import {
  FileText, Download, Shield, Mail, Eye, ChevronUp, ChevronDown,
  ChevronsUpDown, Search, Filter, ArrowUpDown, CheckCircle2,
  Building2, Calendar, DollarSign, AlertCircle, Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_PMCS = [
  { id: 'all', name: 'All PMCs' },
  { id: 'pmc1', name: 'Greenfield Realty' },
  { id: 'pmc2', name: 'BlueSky Properties' },
  { id: 'pmc3', name: 'Metro Housing Group' },
];

interface Lease {
  id: string;
  pmcId: string;
  pmcName: string;
  property: string;
  unit: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  status: 'active' | 'expired' | 'terminated';
  depositAmount: number;
  depositStatus: 'Held' | 'Refund Pending' | 'Released';
  depositRefund?: number;
}

const MOCK_LEASES: Lease[] = [
  {
    id: 'LSE-2024-001',
    pmcId: 'pmc1',
    pmcName: 'Greenfield Realty',
    property: 'Sunset Apartments',
    unit: 'Unit 4B',
    startDate: '2024-06-01',
    endDate: '2025-06-30',
    monthlyRent: 1850,
    status: 'active',
    depositAmount: 2500,
    depositStatus: 'Held',
  },
  {
    id: 'LSE-2024-002',
    pmcId: 'pmc2',
    pmcName: 'BlueSky Properties',
    property: 'Lakeside Condos',
    unit: 'Unit 12A',
    startDate: '2024-01-01',
    endDate: '2025-01-31',
    monthlyRent: 2100,
    status: 'active',
    depositAmount: 3000,
    depositStatus: 'Held',
  },
  {
    id: 'LSE-2022-005',
    pmcId: 'pmc1',
    pmcName: 'Greenfield Realty',
    property: 'Oak Street Lofts',
    unit: 'Unit 2C',
    startDate: '2022-03-01',
    endDate: '2023-03-31',
    monthlyRent: 1500,
    status: 'expired',
    depositAmount: 1800,
    depositStatus: 'Released',
    depositRefund: 1800,
  },
  {
    id: 'LSE-2021-003',
    pmcId: 'pmc3',
    pmcName: 'Metro Housing Group',
    property: 'Riverside Heights',
    unit: 'Unit 7F',
    startDate: '2021-07-01',
    endDate: '2022-06-30',
    monthlyRent: 1350,
    status: 'terminated',
    depositAmount: 1600,
    depositStatus: 'Refund Pending',
    depositRefund: 1200,
  },
  {
    id: 'LSE-2023-008',
    pmcId: 'pmc2',
    pmcName: 'BlueSky Properties',
    property: 'Harbor View Flats',
    unit: 'Studio 3',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    monthlyRent: 980,
    status: 'expired',
    depositAmount: 1000,
    depositStatus: 'Released',
    depositRefund: 1000,
  },
];

const MOCK_INVOICES = [
  { id: 'INV-001', date: '2024-12-01', amount: 1500, status: 'paid' },
  { id: 'INV-002', date: '2023-03-01', amount: 1500, status: 'paid' },
  { id: 'INV-003', date: '2023-02-01', amount: 1500, status: 'paid' },
  { id: 'INV-004', date: '2023-01-01', amount: 1500, status: 'paid' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
type SortDir = 'asc' | 'desc' | null;
type SortKey = keyof Lease | null;

function SortIcon({ dir }: { dir: SortDir }) {
  if (!dir) return <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />;
  return dir === 'asc'
    ? <ChevronUp className="h-3.5 w-3.5 text-primary" />
    : <ChevronDown className="h-3.5 w-3.5 text-primary" />;
}

function StatusBadge({ status }: { status: Lease['status'] }) {
  if (status === 'active')
    return <Badge className="bg-success/15 text-success border-0 font-medium">Active</Badge>;
  if (status === 'expired')
    return <Badge className="bg-muted text-muted-foreground border-0 font-medium">Expired</Badge>;
  return <Badge className="bg-destructive/15 text-destructive border-0 font-medium">Terminated</Badge>;
}

function DepositBadge({ status }: { status: Lease['depositStatus'] }) {
  if (status === 'Held')
    return <Badge className="bg-secondary/20 text-secondary-foreground border-0">Held</Badge>;
  if (status === 'Released')
    return <Badge className="bg-success/15 text-success border-0">Released</Badge>;
  return <Badge className="bg-warning/15 text-warning border-0">Refund Pending</Badge>;
}

// ─── Historic Invoice Dialog ──────────────────────────────────────────────────
function InvoicesDialog({ lease, open, onClose }: { lease: Lease | null; open: boolean; onClose: () => void }) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  if (!lease) return null;
  const filtered = MOCK_INVOICES.filter((inv) => {
    if (dateFrom && inv.date < dateFrom) return false;
    if (dateTo && inv.date > dateTo) return false;
    return true;
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Historic Invoices — {lease.property} {lease.unit}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[140px] space-y-1">
              <Label className="text-xs text-muted-foreground">From</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9 rounded-xl" />
            </div>
            <div className="flex-1 min-w-[140px] space-y-1">
              <Label className="text-xs text-muted-foreground">To</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9 rounded-xl" />
            </div>
          </div>
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-semibold">Invoice</TableHead>
                  <TableHead className="text-xs font-semibold">Date</TableHead>
                  <TableHead className="text-xs font-semibold">Amount</TableHead>
                  <TableHead className="text-xs font-semibold">Status</TableHead>
                  <TableHead className="text-xs font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground text-sm py-6">No invoices found for selected range</TableCell>
                  </TableRow>
                ) : filtered.map((inv) => (
                  <TableRow key={inv.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs text-muted-foreground">{inv.id}</TableCell>
                    <TableCell className="text-sm">{format(new Date(inv.date), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-sm font-semibold">${inv.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className="bg-success/15 text-success border-0 text-xs">Paid</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 rounded-lg">
                        <Download className="h-3 w-3" /> PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-between items-center pt-1">
            <p className="text-xs text-muted-foreground">{filtered.length} invoice(s)</p>
            <Button size="sm" className="rounded-xl gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs">
              <Download className="h-3.5 w-3.5" /> Download All
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Security Deposit Dialog ──────────────────────────────────────────────────
function DepositDialog({ lease, open, onClose }: { lease: Lease | null; open: boolean; onClose: () => void }) {
  if (!lease) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security Deposit — {lease.property} {lease.unit}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Amount Held</p>
              <p className="text-2xl font-bold text-foreground">${lease.depositAmount.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Status</p>
              <div className="pt-1"><DepositBadge status={lease.depositStatus} /></div>
            </div>
          </div>

          {lease.depositRefund !== undefined && (
            <div className={`p-4 rounded-xl border space-y-3 ${
              lease.depositStatus === 'Released'
                ? 'bg-success/5 border-success/20'
                : 'bg-warning/5 border-warning/20'
            }`}>
              <p className="text-sm font-semibold text-foreground">Refund Details</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Original Deposit</span>
                  <span className="font-medium">${lease.depositAmount.toLocaleString()}</span>
                </div>
                {lease.depositAmount !== lease.depositRefund && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deductions</span>
                    <span className="font-medium text-destructive">-${(lease.depositAmount - lease.depositRefund).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="font-semibold text-foreground">Refund Amount</span>
                  <span className="font-bold text-lg text-foreground">${lease.depositRefund.toLocaleString()}</span>
                </div>
              </div>
              {lease.depositStatus === 'Released' && (
                <div className="flex items-center gap-2 text-xs text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Deposit has been released to your account
                </div>
              )}
              {lease.depositStatus === 'Refund Pending' && (
                <div className="flex items-center gap-2 text-xs text-warning">
                  <Clock className="h-3.5 w-3.5" />
                  Refund is being processed — allow 5–10 business days
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Refund History</p>
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="text-xs">Event</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-sm">Deposit Collected</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{format(new Date(lease.startDate), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-sm font-medium">${lease.depositAmount.toLocaleString()}</TableCell>
                  </TableRow>
                  {lease.depositRefund !== undefined && (
                    <TableRow>
                      <TableCell className="text-sm">
                        {lease.depositStatus === 'Released' ? 'Refund Issued' : 'Refund Initiated'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(lease.endDate), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-success">${lease.depositRefund.toLocaleString()}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Final Statement Dialog ───────────────────────────────────────────────────
function FinalStatementDialog({ lease, open, onClose }: { lease: Lease | null; open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    toast({ title: 'Request Sent', description: 'Your final statement request has been sent to the property manager.' });
  };

  if (!lease) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => { onClose(); if (!o) { setSubmitted(false); setNotes(''); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Request Final Statement
          </DialogTitle>
        </DialogHeader>
        {submitted ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg font-semibold text-foreground">Request Sent!</p>
            <p className="text-sm text-muted-foreground text-center">
              Your final statement request for <strong>{lease.property} {lease.unit}</strong> has been sent to {lease.pmcName}. You will be notified once it is ready.
            </p>
            <Button onClick={onClose} className="rounded-xl bg-primary text-primary-foreground">Close</Button>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="p-3 rounded-xl bg-muted/40 border border-border text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lease</span>
                <span className="font-medium font-mono text-xs">{lease.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Property</span>
                <span className="font-medium">{lease.property} — {lease.unit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">PMC</span>
                <span className="font-medium">{lease.pmcName}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Reason / Notes <span className="text-muted-foreground/60 normal-case">(optional)</span>
              </Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Needed for tax filing, mortgage application..."
                className="rounded-xl resize-none"
                rows={3}
              />
            </div>
            <Button
              onClick={handleSubmit}
              className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2"
            >
              <Mail className="h-4 w-4" /> Send Request to PMC
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Lease View Dialog (reused across tabs) ───────────────────────────────────
function LeaseDocDialog({ lease, open, onClose }: { lease: Lease | null; open: boolean; onClose: () => void }) {
  if (!lease) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Lease Document — {lease.property} {lease.unit}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="w-full h-[380px] rounded-xl bg-muted/50 border border-border flex items-center justify-center">
            <div className="text-center space-y-2">
              <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto" />
              <p className="text-sm text-muted-foreground">Lease PDF Preview</p>
              <p className="text-xs text-muted-foreground">{lease.id} · {lease.property} {lease.unit}</p>
            </div>
          </div>
          <Button className="rounded-xl gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TenantMyLeases() {
  const [selectedPMC, setSelectedPMC] = useState('all');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  // Dialog state
  const [invoicesLease, setInvoicesLease] = useState<Lease | null>(null);
  const [depositLease, setDepositLease] = useState<Lease | null>(null);
  const [statementLease, setStatementLease] = useState<Lease | null>(null);
  const [docLease, setDocLease] = useState<Lease | null>(null);

  const { toast } = useToast();

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : d === 'desc' ? null : 'asc'));
      if (sortDir === 'desc') setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filter = (leases: Lease[], tab: 'active' | 'archive') => {
    let result = leases.filter((l) =>
      tab === 'active' ? l.status === 'active' : l.status !== 'active'
    );
    if (selectedPMC !== 'all') result = result.filter((l) => l.pmcId === selectedPMC);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.property.toLowerCase().includes(q) ||
          l.id.toLowerCase().includes(q) ||
          l.pmcName.toLowerCase().includes(q) ||
          l.unit.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') result = result.filter((l) => l.status === statusFilter);
    if (sortKey && sortDir) {
      result = [...result].sort((a, b) => {
        const av = a[sortKey] as string | number;
        const bv = b[sortKey] as string | number;
        if (av < bv) return sortDir === 'asc' ? -1 : 1;
        if (av > bv) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  };

  const activeLeases = useMemo(() => filter(MOCK_LEASES, 'active'), [selectedPMC, search, statusFilter, sortKey, sortDir]);
  const archiveLeases = useMemo(() => filter(MOCK_LEASES, 'archive'), [selectedPMC, search, statusFilter, sortKey, sortDir]);

  const exportCSV = (leases: Lease[]) => {
    const headers = ['Lease ID', 'Property', 'Unit', 'PMC', 'Start Date', 'End Date', 'Monthly Rent', 'Status'];
    const rows = leases.map((l) => [l.id, l.property, l.unit, l.pmcName, l.startDate, l.endDate, l.monthlyRent, l.status]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-leases.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Export Complete', description: 'Leases exported as CSV.' });
  };

  const SortableHead = ({ label, colKey }: { label: string; colKey: SortKey }) => (
    <TableHead
      className="text-xs font-semibold cursor-pointer select-none whitespace-nowrap"
      onClick={() => handleSort(colKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        <SortIcon dir={sortKey === colKey ? sortDir : null} />
      </div>
    </TableHead>
  );

  const ActiveRow = ({ lease }: { lease: Lease }) => (
    <TableRow className="hover:bg-muted/30 transition-colors">
      <TableCell className="font-mono text-xs text-muted-foreground">{lease.id}</TableCell>
      <TableCell>
        <div>
          <p className="text-sm font-medium text-foreground">{lease.property}</p>
          <p className="text-xs text-muted-foreground">{lease.unit}</p>
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{lease.pmcName}</TableCell>
      <TableCell className="text-sm">{format(new Date(lease.startDate), 'MMM d, yyyy')}</TableCell>
      <TableCell className="text-sm">{format(new Date(lease.endDate), 'MMM d, yyyy')}</TableCell>
      <TableCell className="text-sm font-semibold">${lease.monthlyRent.toLocaleString()}</TableCell>
      <TableCell><StatusBadge status={lease.status} /></TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs gap-1.5">
              Actions <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Lease Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setDocLease(lease)} className="text-sm gap-2">
              <Eye className="h-4 w-4 text-primary" /> View Lease Document
            </DropdownMenuItem>
            <DropdownMenuItem className="text-sm gap-2">
              <DollarSign className="h-4 w-4 text-success" /> Pay Rent Now
            </DropdownMenuItem>
            <DropdownMenuItem className="text-sm gap-2">
              <FileText className="h-4 w-4 text-secondary" /> Request Renewal
            </DropdownMenuItem>
            <DropdownMenuItem className="text-sm gap-2">
              <Calendar className="h-4 w-4 text-warning" /> Request Early Vacate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-sm gap-2">
              <Download className="h-4 w-4 text-muted-foreground" /> View Payment History
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );

  const ArchiveRow = ({ lease }: { lease: Lease }) => (
    <TableRow className="hover:bg-muted/30 transition-colors">
      <TableCell className="font-mono text-xs text-muted-foreground">{lease.id}</TableCell>
      <TableCell>
        <div>
          <p className="text-sm font-medium text-foreground">{lease.property}</p>
          <p className="text-xs text-muted-foreground">{lease.unit}</p>
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{lease.pmcName}</TableCell>
      <TableCell className="text-sm">{format(new Date(lease.startDate), 'MMM d, yyyy')}</TableCell>
      <TableCell className="text-sm">{format(new Date(lease.endDate), 'MMM d, yyyy')}</TableCell>
      <TableCell className="text-sm font-semibold">${lease.monthlyRent.toLocaleString()}</TableCell>
      <TableCell><StatusBadge status={lease.status} /></TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs gap-1.5">
              Actions <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Archive Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setDocLease(lease)} className="text-sm gap-2">
              <Eye className="h-4 w-4 text-primary" /> View Lease Document
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setInvoicesLease(lease)} className="text-sm gap-2">
              <Download className="h-4 w-4 text-secondary" /> Download Historic Invoices
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setDepositLease(lease)} className="text-sm gap-2">
              <Shield className="h-4 w-4 text-success" /> View Security Deposit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatementLease(lease)} className="text-sm gap-2">
              <Mail className="h-4 w-4 text-warning" /> Request Final Statement
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-sm gap-2">
              <Download className="h-4 w-4 text-muted-foreground" /> Download All Documents
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );

  const EmptyState = ({ label }: { label: string }) => (
    <TableRow>
      <TableCell colSpan={8} className="py-16 text-center">
        <AlertCircle className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">{label}</p>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">My Leases</h1>
          <div className="h-1 w-16 rounded-full bg-primary mt-2" />
        </div>

        {/* Switch PMC */}
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
          <Select value={selectedPMC} onValueChange={setSelectedPMC}>
            <SelectTrigger className="w-[200px] h-9 rounded-xl border-border text-sm">
              <SelectValue placeholder="Switch PMC" />
            </SelectTrigger>
            <SelectContent>
              {MOCK_PMCS.map((pmc) => (
                <SelectItem key={pmc.id} value={pmc.id} className="text-sm">
                  {pmc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Active Leases', value: MOCK_LEASES.filter((l) => l.status === 'active').length, color: 'text-success', bg: 'bg-success/5' },
          { label: 'Archived Leases', value: MOCK_LEASES.filter((l) => l.status !== 'active').length, color: 'text-muted-foreground', bg: 'bg-muted/40' },
          { label: 'Total PMCs', value: new Set(MOCK_LEASES.map((l) => l.pmcId)).size, color: 'text-secondary-foreground', bg: 'bg-secondary/10' },
          { label: 'Deposits Held', value: `$${MOCK_LEASES.filter((l) => l.status === 'active').reduce((s, l) => s + l.depositAmount, 0).toLocaleString()}`, color: 'text-warning', bg: 'bg-warning/5' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-xl p-4 border border-border/50`}>
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <TabsList className="h-10 rounded-xl bg-muted/60 p-1">
            <TabsTrigger value="active" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-5 text-sm font-medium">
              Active
              <Badge className="ml-2 bg-success/15 text-success border-0 text-xs px-1.5">
                {activeLeases.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="archives" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-5 text-sm font-medium">
              Archives
              <Badge className="ml-2 bg-muted text-muted-foreground border-0 text-xs px-1.5">
                {archiveLeases.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Search + filters row */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search property, lease ID, PMC..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 w-64 rounded-xl text-sm border-border"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-36 rounded-xl text-sm border-border gap-1">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Active Tab ── */}
        <TabsContent value="active" className="mt-0">
          <Card className="card-elevated">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Active Leases
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-lg text-xs gap-1.5"
                onClick={() => exportCSV(activeLeases)}
              >
                <Download className="h-3.5 w-3.5" /> Export CSV
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 border-b border-border">
                      <SortableHead label="Lease ID" colKey="id" />
                      <SortableHead label="Property / Unit" colKey="property" />
                      <SortableHead label="PMC" colKey="pmcName" />
                      <SortableHead label="Start Date" colKey="startDate" />
                      <SortableHead label="End Date" colKey="endDate" />
                      <SortableHead label="Monthly Rent" colKey="monthlyRent" />
                      <TableHead className="text-xs font-semibold">Status</TableHead>
                      <TableHead className="text-xs font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeLeases.length === 0
                      ? <EmptyState label="No active leases found" />
                      : activeLeases.map((l) => <ActiveRow key={l.id} lease={l} />)
                    }
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Archives Tab ── */}
        <TabsContent value="archives" className="mt-0">
          <Card className="card-elevated">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Archived Leases
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-lg text-xs gap-1.5"
                onClick={() => exportCSV(archiveLeases)}
              >
                <Download className="h-3.5 w-3.5" /> Export CSV
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 border-b border-border">
                      <SortableHead label="Lease ID" colKey="id" />
                      <SortableHead label="Property / Unit" colKey="property" />
                      <SortableHead label="PMC" colKey="pmcName" />
                      <SortableHead label="Start Date" colKey="startDate" />
                      <SortableHead label="End Date" colKey="endDate" />
                      <SortableHead label="Monthly Rent" colKey="monthlyRent" />
                      <TableHead className="text-xs font-semibold">Status</TableHead>
                      <TableHead className="text-xs font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {archiveLeases.length === 0
                      ? <EmptyState label="No archived leases found" />
                      : archiveLeases.map((l) => <ArchiveRow key={l.id} lease={l} />)
                    }
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <InvoicesDialog lease={invoicesLease} open={!!invoicesLease} onClose={() => setInvoicesLease(null)} />
      <DepositDialog lease={depositLease} open={!!depositLease} onClose={() => setDepositLease(null)} />
      <FinalStatementDialog lease={statementLease} open={!!statementLease} onClose={() => setStatementLease(null)} />
      <LeaseDocDialog lease={docLease} open={!!docLease} onClose={() => setDocLease(null)} />
    </div>
  );
}
