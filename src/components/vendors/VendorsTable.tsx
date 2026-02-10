import { useState } from 'react';
import { format } from 'date-fns';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Eye, Pencil, Trash2, Download, Plus, Search, RotateCcw, MoreHorizontal, ShieldAlert, Archive, CheckCircle2,
} from 'lucide-react';
import type { Vendor, VendorStatus } from '@/types/vendor';
import { getVendorDisplayName, PREDEFINED_CATEGORIES } from '@/types/vendor';
import ConfirmActionDialog from '@/components/owners/ConfirmActionDialog';

interface VendorsTableProps {
  vendors: Vendor[];
  tab: 'active' | 'archived' | 'blacklisted';
  onView: (vendor: Vendor) => void;
  onEdit: (vendor: Vendor) => void;
  onChangeStatus: (id: string, status: VendorStatus) => void;
  onSoftDelete: (id: string) => boolean;
  onRestore?: (id: string) => void;
  onAddNew: () => void;
}

export default function VendorsTable({
  vendors,
  tab,
  onView,
  onEdit,
  onChangeStatus,
  onSoftDelete,
  onRestore,
  onAddNew,
}: VendorsTableProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmAction, setConfirmAction] = useState<{
    type: 'delete' | 'blacklist' | 'archive' | 'activate' | 'restore';
    vendor: Vendor;
  } | null>(null);

  const filtered = vendors.filter((v) => {
    const term = search.toLowerCase();
    const name = getVendorDisplayName(v).toLowerCase();
    const matchesSearch = name.includes(term) || v.email.toLowerCase().includes(term);
    const matchesCategory = categoryFilter === 'all' || v.categories.includes(categoryFilter);
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const exportCsv = () => {
    const headers = ['Name', 'Email', 'Categories', 'Status', 'Regions', 'Work Orders', 'Last Activity'];
    const rows = filtered.map((v) => [
      getVendorDisplayName(v),
      v.email,
      v.categories.join('; '),
      v.status,
      v.regions.join('; '),
      v.workOrders.length.toString(),
      format(new Date(v.updatedAt), 'MMM d, yyyy'),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vendors_${tab}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleConfirm = () => {
    if (!confirmAction) return;
    switch (confirmAction.type) {
      case 'delete':
        onSoftDelete(confirmAction.vendor.id);
        break;
      case 'blacklist':
        onChangeStatus(confirmAction.vendor.id, 'blacklisted');
        break;
      case 'archive':
        onChangeStatus(confirmAction.vendor.id, 'archived');
        break;
      case 'activate':
        onChangeStatus(confirmAction.vendor.id, 'active');
        break;
      case 'restore':
        onRestore?.(confirmAction.vendor.id);
        break;
    }
    setConfirmAction(null);
  };

  const getStatusBadge = (status: VendorStatus) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-secondary text-secondary-foreground border-0">Active</Badge>;
      case 'archived':
        return <Badge className="bg-muted text-muted-foreground border-0">Archived</Badge>;
      case 'blacklisted':
        return <Badge className="bg-destructive text-destructive-foreground border-0">Blacklisted</Badge>;
      default:
        return null;
    }
  };

  if (vendors.length === 0 && tab === 'active') {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-lg text-muted-foreground mb-4">No vendors added. Add one to start.</p>
        <Button onClick={onAddNew} className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add New Vendor
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <div className="relative flex-1 sm:w-64 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <SearchableSelect
            options={[{ value: 'all', label: 'All Categories' }, ...PREDEFINED_CATEGORIES.map((c) => ({ value: c, label: c }))]}
            value={categoryFilter}
            onValueChange={setCategoryFilter}
            placeholder="Category"
            triggerClassName="w-40"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          {tab === 'active' && (
            <Button size="sm" className="btn-primary" onClick={onAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Vendor
            </Button>
          )}
        </div>
      </div>

      <div className="card-elevated overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-card hover:bg-card">
              <TableHead>Name / Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Regions</TableHead>
              <TableHead className="text-center">WOs</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  No vendors match your search.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((vendor) => (
                <TableRow key={vendor.id} className="bg-card">
                  <TableCell className="font-medium">{getVendorDisplayName(vendor)}</TableCell>
                  <TableCell className="text-muted-foreground">{vendor.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {vendor.categories.slice(0, 2).map((c) => (
                        <Badge key={c} variant="outline" className="text-xs bg-primary/10 text-primary-foreground border-primary/20">{c}</Badge>
                      ))}
                      {vendor.categories.length > 2 && (
                        <Badge variant="outline" className="text-xs">+{vendor.categories.length - 2}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(vendor.status)}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-background">{vendor.regions.length}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-background">{vendor.workOrders.length}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(vendor.updatedAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {tab === 'archived' ? (
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Restore"
                          onClick={() => setConfirmAction({ type: 'restore', vendor })}>
                          <RotateCcw className="h-4 w-4 text-primary" />
                        </Button>
                      ) : (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="View Dashboard" onClick={() => onView(vendor)}>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => onEdit(vendor)}>
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {vendor.status !== 'active' && (
                                <DropdownMenuItem onClick={() => setConfirmAction({ type: 'activate', vendor })}>
                                  <CheckCircle2 className="h-4 w-4 mr-2" /> Set Active
                                </DropdownMenuItem>
                              )}
                              {vendor.status !== 'archived' && (
                                <DropdownMenuItem onClick={() => setConfirmAction({ type: 'archive', vendor })}>
                                  <Archive className="h-4 w-4 mr-2" /> Archive
                                </DropdownMenuItem>
                              )}
                              {vendor.status !== 'blacklisted' && (
                                <DropdownMenuItem onClick={() => setConfirmAction({ type: 'blacklist', vendor })} className="text-destructive-foreground">
                                  <ShieldAlert className="h-4 w-4 mr-2" /> Blacklist
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => {
                                  const hasActive = vendor.workOrders.some((wo) => wo.status === 'open' || wo.status === 'in_progress');
                                  if (hasActive) return;
                                  setConfirmAction({ type: 'delete', vendor });
                                }}
                                disabled={vendor.workOrders.some((wo) => wo.status === 'open' || wo.status === 'in_progress')}
                                className="text-destructive-foreground"
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
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
            confirmAction.type === 'delete' ? 'Delete Vendor'
              : confirmAction.type === 'blacklist' ? 'Blacklist Vendor'
              : confirmAction.type === 'archive' ? 'Archive Vendor'
              : confirmAction.type === 'activate' ? 'Activate Vendor'
              : 'Restore Vendor'
          }
          description={
            confirmAction.type === 'delete'
              ? `Are you sure you want to delete ${getVendorDisplayName(confirmAction.vendor)}? Their data will be retained but hidden.`
              : confirmAction.type === 'blacklist'
              ? `Blacklist ${getVendorDisplayName(confirmAction.vendor)}? They will be prevented from receiving new work order assignments.`
              : confirmAction.type === 'archive'
              ? `Archive ${getVendorDisplayName(confirmAction.vendor)}? They will be moved to the archived list.`
              : confirmAction.type === 'activate'
              ? `Reactivate ${getVendorDisplayName(confirmAction.vendor)}?`
              : `Restore ${getVendorDisplayName(confirmAction.vendor)} to the active vendors list?`
          }
          variant={confirmAction.type === 'delete' || confirmAction.type === 'blacklist' ? 'destructive' : 'default'}
        />
      )}
    </div>
  );
}
