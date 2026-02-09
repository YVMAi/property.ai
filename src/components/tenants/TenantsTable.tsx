import { useState } from 'react';
import { format } from 'date-fns';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Pencil, Trash2, ToggleLeft, ToggleRight, Download, Plus, Search, RotateCcw, Eye,
} from 'lucide-react';
import type { Tenant, TenantCategory } from '@/types/tenant';
import { getTenantCategory, getTenantDisplayName } from '@/types/tenant';
import ConfirmActionDialog from '@/components/owners/ConfirmActionDialog';

interface TenantsTableProps {
  tenants: Tenant[];
  isArchived?: boolean;
  onView: (tenant: Tenant) => void;
  onEdit: (tenant: Tenant) => void;
  onToggleStatus: (id: string) => void;
  onSoftDelete: (id: string) => void;
  onRestore?: (id: string) => void;
  onAddNew: () => void;
}

export default function TenantsTable({
  tenants,
  isArchived = false,
  onView,
  onEdit,
  onToggleStatus,
  onSoftDelete,
  onRestore,
  onAddNew,
}: TenantsTableProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [confirmAction, setConfirmAction] = useState<{
    type: 'deactivate' | 'activate' | 'delete' | 'restore';
    tenant: Tenant;
  } | null>(null);

  const filtered = tenants.filter((t) => {
    const term = search.toLowerCase();
    const name = getTenantDisplayName(t).toLowerCase();
    const matchesSearch = name.includes(term) || t.email.toLowerCase().includes(term);
    const category = getTenantCategory(t);
    const matchesType = typeFilter === 'all' || category === typeFilter;
    return matchesSearch && matchesType;
  });

  const exportCsv = () => {
    const headers = ['Name', 'Email', 'Type', 'Status', 'Leases', 'Last Payment'];
    const rows = filtered.map((t) => {
      const lastPay = t.payments.length ? format(new Date(t.payments[0].date), 'MMM d, yyyy') : 'N/A';
      return [
        getTenantDisplayName(t),
        t.email,
        getTenantCategory(t),
        t.status,
        t.leases.length.toString(),
        lastPay,
      ];
    });
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tenants_${isArchived ? 'archived' : 'active'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleConfirm = () => {
    if (!confirmAction) return;
    switch (confirmAction.type) {
      case 'deactivate':
      case 'activate':
        onToggleStatus(confirmAction.tenant.id);
        break;
      case 'delete':
        onSoftDelete(confirmAction.tenant.id);
        break;
      case 'restore':
        onRestore?.(confirmAction.tenant.id);
        break;
    }
    setConfirmAction(null);
  };

  const getCategoryBadge = (cat: TenantCategory) => {
    switch (cat) {
      case 'active':
        return <Badge className="bg-secondary text-secondary-foreground border-0">Active</Badge>;
      case 'archived':
        return <Badge className="bg-muted text-muted-foreground border-0">Archived</Badge>;
      case 'new':
        return <Badge className="bg-primary text-primary-foreground border-0">New</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="text-secondary-foreground border-secondary">Active</Badge>;
      case 'deactivated':
        return <Badge variant="outline" className="text-warning-foreground border-warning">Deactivated</Badge>;
      default:
        return null;
    }
  };

  const getInviteBadge = (inviteStatus: string) => {
    switch (inviteStatus) {
      case 'pending':
        return <Badge variant="outline" className="text-warning-foreground border-warning text-xs">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="text-secondary-foreground border-secondary text-xs">Accepted</Badge>;
      case 'expired':
        return <Badge variant="outline" className="text-destructive-foreground border-destructive text-xs">Expired</Badge>;
      default:
        return null;
    }
  };

  if (tenants.length === 0 && !isArchived) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-lg text-muted-foreground mb-4">No tenants added yet.</p>
        <Button onClick={onAddNew} className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add New Tenant
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
              <SelectItem value="new">New</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          {!isArchived && (
            <Button size="sm" className="btn-primary" onClick={onAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Tenant
            </Button>
          )}
        </div>
      </div>

      <div className="card-elevated overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-card hover:bg-card">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Invite</TableHead>
              <TableHead className="text-center">Leases</TableHead>
              <TableHead>Last Payment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  No tenants match your search.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((tenant) => {
                const category = getTenantCategory(tenant);
                const lastPayment = tenant.payments.length
                  ? format(new Date(tenant.payments[0].date), 'MMM d, yyyy')
                  : '—';
                const hasActiveLease = tenant.leases.some((l) => l.status === 'active');
                return (
                  <TableRow key={tenant.id} className="bg-card">
                    <TableCell className="font-medium">{getTenantDisplayName(tenant)}</TableCell>
                    <TableCell className="text-muted-foreground">{tenant.email}</TableCell>
                    <TableCell>{getCategoryBadge(category)}</TableCell>
                    <TableCell>{getStatusBadge(tenant.status)}</TableCell>
                    <TableCell>{getInviteBadge(tenant.inviteStatus)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-background">{tenant.leases.length}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{lastPayment}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {isArchived ? (
                          <Button
                            variant="ghost" size="icon" className="h-8 w-8" title="Restore"
                            onClick={() => setConfirmAction({ type: 'restore', tenant })}
                          >
                            <RotateCcw className="h-4 w-4 text-primary" />
                          </Button>
                        ) : (
                          <>
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="View Dashboard" onClick={() => onView(tenant)}>
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => onEdit(tenant)}>
                              <Pencil className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost" size="icon" className="h-8 w-8"
                              title={tenant.status === 'active' ? 'Deactivate' : 'Activate'}
                              onClick={() => setConfirmAction({ type: tenant.status === 'active' ? 'deactivate' : 'activate', tenant })}
                            >
                              {tenant.status === 'active' ? (
                                <ToggleRight className="h-4 w-4 text-secondary" />
                              ) : (
                                <ToggleLeft className="h-4 w-4 text-warning-foreground" />
                              )}
                            </Button>
                            <Button
                              variant="ghost" size="icon" className="h-8 w-8" title="Archive"
                              disabled={hasActiveLease}
                              onClick={() => {
                                if (hasActiveLease) return;
                                setConfirmAction({ type: 'delete', tenant });
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive-foreground" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {confirmAction && (
        <ConfirmActionDialog
          open={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          onConfirm={handleConfirm}
          title={
            confirmAction.type === 'deactivate' ? 'Deactivate Tenant'
              : confirmAction.type === 'activate' ? 'Activate Tenant'
              : confirmAction.type === 'delete' ? 'Archive Tenant'
              : 'Restore Tenant'
          }
          description={
            confirmAction.type === 'deactivate'
              ? `Are you sure you want to deactivate ${getTenantDisplayName(confirmAction.tenant)}?`
              : confirmAction.type === 'activate'
              ? `Reactivate ${getTenantDisplayName(confirmAction.tenant)}?`
              : confirmAction.type === 'delete'
              ? `Archive ${getTenantDisplayName(confirmAction.tenant)}? Their data will be retained but hidden.`
              : `Restore ${getTenantDisplayName(confirmAction.tenant)} to the active list?`
          }
          variant={confirmAction.type === 'delete' ? 'destructive' : 'default'}
        />
      )}
    </div>
  );
}
