import { useState } from 'react';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Search, MoreHorizontal, Plus, Edit, Trash2, Pause, Play, Eye, ArrowUpCircle, Download } from 'lucide-react';
import { PMC, STATUS_BADGE_COLORS, PLAN_BADGE_COLORS } from '@/types/superAdmin';
import { useToast } from '@/hooks/use-toast';

export default function SuperAdminPMCList({ onAddNew }: { onAddNew: () => void }) {
  const { pmcs, updatePMCStatus, deletePMC } = useSuperAdmin();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; pmc?: PMC; action?: string }>({ open: false });

  const filtered = pmcs.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (planFilter !== 'all' && p.subscriptionPlan !== planFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.adminEmail.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleAction = (pmc: PMC, action: string) => {
    if (action === 'suspend') {
      updatePMCStatus(pmc.id, 'suspended');
      toast({ title: 'PMC Suspended', description: `${pmc.name} has been suspended.` });
    } else if (action === 'activate') {
      updatePMCStatus(pmc.id, 'active');
      toast({ title: 'PMC Activated', description: `${pmc.name} is now active.` });
    } else if (action === 'delete') {
      setConfirmDialog({ open: true, pmc, action: 'delete' });
    }
  };

  const confirmDelete = () => {
    if (confirmDialog.pmc) {
      deletePMC(confirmDialog.pmc.id);
      toast({ title: 'PMC Deleted', description: `${confirmDialog.pmc.name} has been removed.`, variant: 'destructive' });
    }
    setConfirmDialog({ open: false });
  };

  return (
    <Card className="border-border/50 mt-4">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-lg">Property Management Companies</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search PMCs..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 w-48" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 h-9"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-32 h-9"><SelectValue placeholder="Plan" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="pro_max">Pro Max</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={onAddNew} className="gap-1.5 btn-primary"><Plus className="h-3.5 w-3.5" /> Add PMC</Button>
            <Button size="sm" variant="outline" className="gap-1.5"><Download className="h-3.5 w-3.5" /> Export</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PMC Name</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Storage</TableHead>
                <TableHead className="text-right">Revenue YTD</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(pmc => (
                <TableRow key={pmc.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{pmc.name}</p>
                      <p className="text-xs text-muted-foreground">{pmc.customDomain || pmc.id}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{pmc.adminEmail}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] ${PLAN_BADGE_COLORS[pmc.subscriptionPlan]}`}>
                      {pmc.subscriptionPlan.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-[10px] ${STATUS_BADGE_COLORS[pmc.status]}`}>
                      {pmc.status.charAt(0).toUpperCase() + pmc.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-xs">{pmc.usersUsed}{pmc.userLimit > 0 ? `/${pmc.userLimit}` : '/∞'}</p>
                      {pmc.userLimit > 0 && <Progress value={(pmc.usersUsed / pmc.userLimit) * 100} className="h-1.5" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-xs">{pmc.storageUsedGB}/{pmc.storageQuotaGB} GB</p>
                      <Progress value={(pmc.storageUsedGB / pmc.storageQuotaGB) * 100} className="h-1.5" />
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">${pmc.revenueYTD.toLocaleString()}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(pmc.lastActivity).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2"><Eye className="h-3.5 w-3.5" /> View Details</DropdownMenuItem>
                        <DropdownMenuItem className="gap-2"><Edit className="h-3.5 w-3.5" /> Edit PMC</DropdownMenuItem>
                        <DropdownMenuItem className="gap-2"><ArrowUpCircle className="h-3.5 w-3.5" /> Upgrade Plan</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {pmc.status === 'active' ? (
                          <DropdownMenuItem className="gap-2" onClick={() => handleAction(pmc, 'suspend')}>
                            <Pause className="h-3.5 w-3.5" /> Suspend
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="gap-2" onClick={() => handleAction(pmc, 'activate')}>
                            <Play className="h-3.5 w-3.5" /> Activate
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="gap-2 text-destructive-foreground" onClick={() => handleAction(pmc, 'delete')}>
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No PMCs found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={confirmDialog.open} onOpenChange={o => setConfirmDialog({ open: o })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete PMC</DialogTitle>
            <DialogDescription>Are you sure you want to delete "{confirmDialog.pmc?.name}"? This action cannot be undone. A backup will be created automatically.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog({ open: false })}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete PMC</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
