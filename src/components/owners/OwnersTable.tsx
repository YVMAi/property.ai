import { useState } from 'react';
import { format } from 'date-fns';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Eye, Pencil, Trash2, ToggleLeft, ToggleRight, Download, Plus, Search, RotateCcw,
} from 'lucide-react';
import type { Owner } from '@/types/owner';
import ConfirmActionDialog from './ConfirmActionDialog';

interface OwnersTableProps {
  owners: Owner[];
  isArchived?: boolean;
  onView: (owner: { id: string }) => void;
  onEdit: (owner: { id: string }) => void;
  onToggleStatus: (id: string) => void;
  onSoftDelete: (id: string) => void;
  onRestore?: (id: string) => void;
  onAddNew: () => void;
}

function getOwnerDisplayName(owner: Owner): string {
  return owner.ownerType === 'company' ? owner.companyName : `${owner.firstName} ${owner.lastName}`;
}

export default function OwnersTable({
  owners,
  isArchived = false,
  onView,
  onEdit,
  onToggleStatus,
  onSoftDelete,
  onRestore,
  onAddNew,
}: OwnersTableProps) {
  const [search, setSearch] = useState('');
  const [confirmAction, setConfirmAction] = useState<{
    type: 'deactivate' | 'activate' | 'delete' | 'restore';
    owner: Owner;
  } | null>(null);

  const filtered = owners.filter((o) => {
    const term = search.toLowerCase();
    const primaryEmail = o.emails.find((e) => e.isPrimary)?.email || '';
    const displayName = getOwnerDisplayName(o).toLowerCase();
    return displayName.includes(term) || primaryEmail.toLowerCase().includes(term);
  });

  const exportCsv = () => {
    const headers = ['Name', 'Type', 'Primary Email', 'Status', 'Linked Properties', 'Auto-Pay', 'Last Login'];
    const rows = filtered.map((o) => {
      const primary = o.emails.find((e) => e.isPrimary);
      const lastLogin = primary?.lastLogin ? format(new Date(primary.lastLogin), 'MMM d, yyyy') : 'Never';
      return [
        getOwnerDisplayName(o),
        o.ownerType,
        primary?.email || '',
        o.status,
        o.linkedPropertyIds.length.toString(),
        o.paymentSetup.autoPayEnabled ? 'Yes' : 'No',
        lastLogin,
      ];
    });
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `owners_${isArchived ? 'archived' : 'active'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleConfirm = () => {
    if (!confirmAction) return;
    switch (confirmAction.type) {
      case 'deactivate':
      case 'activate':
        onToggleStatus(confirmAction.owner.id);
        break;
      case 'delete':
        onSoftDelete(confirmAction.owner.id);
        break;
      case 'restore':
        onRestore?.(confirmAction.owner.id);
        break;
    }
    setConfirmAction(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-secondary text-secondary-foreground border-0">Active</Badge>;
      case 'deactivated':
        return <Badge className="bg-warning text-warning-foreground border-0">Deactivated</Badge>;
      case 'deleted':
        return <Badge className="bg-destructive text-destructive-foreground border-0">Archived</Badge>;
      default:
        return null;
    }
  };

  if (owners.length === 0 && !isArchived) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-lg text-muted-foreground mb-4">No owners added yet.</p>
        <Button onClick={onAddNew} className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add New Owner
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          {!isArchived && (
            <Button size="sm" className="btn-primary" onClick={onAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Owner
            </Button>
          )}
        </div>
      </div>

      <div className="card-elevated overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-card hover:bg-card">
              <TableHead>Name</TableHead>
              <TableHead>Primary Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Properties</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No owners match your search.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((owner) => {
                const primaryEmail = owner.emails.find((e) => e.isPrimary);
                const lastLogin = primaryEmail?.lastLogin
                  ? format(new Date(primaryEmail.lastLogin), 'MMM d, yyyy h:mm a')
                  : 'Never';
                const displayName = getOwnerDisplayName(owner);
                return (
                  <TableRow key={owner.id} className="bg-card">
                    <TableCell className="font-medium">{displayName}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {primaryEmail?.email || '—'}
                    </TableCell>
                    <TableCell>{getStatusBadge(owner.status)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-background">
                        {owner.linkedPropertyIds.length}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{lastLogin}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {isArchived ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Restore"
                            onClick={() => setConfirmAction({ type: 'restore', owner })}
                          >
                            <RotateCcw className="h-4 w-4 text-primary" />
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="View"
                              onClick={() => onView(owner)}
                            >
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="Edit"
                              onClick={() => onEdit(owner)}
                            >
                              <Pencil className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title={owner.status === 'active' ? 'Deactivate' : 'Activate'}
                              onClick={() =>
                                setConfirmAction({
                                  type: owner.status === 'active' ? 'deactivate' : 'activate',
                                  owner,
                                })
                              }
                            >
                              {owner.status === 'active' ? (
                                <ToggleRight className="h-4 w-4 text-secondary" />
                              ) : (
                                <ToggleLeft className="h-4 w-4 text-warning-foreground" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="Archive"
                              onClick={() => setConfirmAction({ type: 'delete', owner })}
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
            confirmAction.type === 'deactivate'
              ? 'Deactivate Owner'
              : confirmAction.type === 'activate'
              ? 'Activate Owner'
              : confirmAction.type === 'delete'
              ? 'Archive Owner'
              : 'Restore Owner'
          }
          description={
            confirmAction.type === 'deactivate'
              ? `Are you sure you want to deactivate ${getOwnerDisplayName(confirmAction.owner)}? They will not be able to log in.`
              : confirmAction.type === 'activate'
              ? `Reactivate ${getOwnerDisplayName(confirmAction.owner)}?`
              : confirmAction.type === 'delete'
              ? `Archive ${getOwnerDisplayName(confirmAction.owner)}? Their data will be retained but hidden from the main list.`
              : `Restore ${getOwnerDisplayName(confirmAction.owner)} to the active owners list?`
          }
          variant={confirmAction.type === 'delete' ? 'destructive' : 'default'}
        />
      )}
    </div>
  );
}
