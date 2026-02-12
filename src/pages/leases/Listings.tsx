import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, ArrowLeft, Plus, Eye, Pause, Play, Trash2, Send,
  RotateCcw, MoreHorizontal, CheckSquare,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { useCurrency } from '@/contexts/CurrencyContext';
import {
  LISTING_STATUS_CONFIG,
  MOCK_LISTINGS,
  type ListingRecord,
  type ListingStatus,
} from '@/types/listing';

export default function Listings() {
  const navigate = useNavigate();
  const { formatAmount } = useCurrency();
  const [listings, setListings] = useState<ListingRecord[]>(MOCK_LISTINGS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmAction, setConfirmAction] = useState<{ type: string; ids: string[]; targetStatus?: ListingStatus } | null>(null);

  const filtered = useMemo(() => {
    let list = listings;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((l) => l.unitLabel.toLowerCase().includes(q) || l.propertyName.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') list = list.filter((l) => l.status === statusFilter);
    return list;
  }, [listings, search, statusFilter]);

  const stats = useMemo(() => ({
    active: listings.filter((l) => l.status === 'active').length,
    draft: listings.filter((l) => l.status === 'draft').length,
    inactive: listings.filter((l) => l.status === 'inactive').length,
    expired: listings.filter((l) => l.status === 'expired').length,
    views: listings.reduce((s, l) => s + l.views, 0),
    inquiries: listings.reduce((s, l) => s + l.inquiries.length, 0),
  }), [listings]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((l) => l.id)));
    }
  };

  const changeStatus = (ids: string[], newStatus: ListingStatus) => {
    const today = new Date().toISOString().split('T')[0];
    setListings((prev) =>
      prev.map((l) => {
        if (!ids.includes(l.id)) return l;
        return {
          ...l,
          status: newStatus,
          lastStatusChange: today,
          postedDate: newStatus === 'active' && !l.postedDate ? today : l.postedDate,
          statusHistory: [
            ...l.statusHistory,
            { date: today, from: l.status, to: newStatus, note: `Status changed to ${newStatus}` },
          ],
        };
      })
    );
    setSelected(new Set());
    toast({ title: `${ids.length} listing(s) updated to ${LISTING_STATUS_CONFIG[newStatus].label}` });
  };

  const deleteListing = (ids: string[]) => {
    setListings((prev) => prev.filter((l) => !ids.includes(l.id)));
    setSelected(new Set());
    toast({ title: `${ids.length} listing(s) deleted` });
  };

  const executeConfirm = () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'delete') {
      deleteListing(confirmAction.ids);
    } else if (confirmAction.targetStatus) {
      changeStatus(confirmAction.ids, confirmAction.targetStatus);
    }
    setConfirmAction(null);
  };

  const getDaysUntilExpiry = (date: string | null) => {
    if (!date) return null;
    const diff = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/leases')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-foreground">Listings</h1>
          <div className="h-1 w-16 bg-secondary rounded-full mt-2" />
          <p className="text-sm text-muted-foreground mt-1">{listings.length} listings · {stats.inquiries} inquiries</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => navigate('/leases/post-listing')}>
          <Plus className="h-4 w-4" /> Post Listing
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {([
          { label: 'Active', value: stats.active, color: 'text-secondary' },
          { label: 'Draft', value: stats.draft, color: 'text-muted-foreground' },
          { label: 'Inactive', value: stats.inactive, color: 'text-warning' },
          { label: 'Expired', value: stats.expired, color: 'text-destructive' },
          { label: 'Total Views', value: stats.views, color: 'text-foreground' },
          { label: 'Inquiries', value: stats.inquiries, color: 'text-foreground' },
        ]).map((s) => (
          <Card key={s.label}><CardContent className="p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </CardContent></Card>
        ))}
      </div>

      {/* Filters + Bulk Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search listings..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        {selected.size > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <CheckSquare className="h-4 w-4" /> Bulk ({selected.size})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setConfirmAction({ type: 'status', ids: [...selected], targetStatus: 'active' })}>
                <Play className="h-3.5 w-3.5 mr-2" /> Activate Selected
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setConfirmAction({ type: 'status', ids: [...selected], targetStatus: 'inactive' })}>
                <Pause className="h-3.5 w-3.5 mr-2" /> Pause Selected
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => setConfirmAction({ type: 'delete', ids: [...selected] })}>
                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox checked={filtered.length > 0 && selected.size === filtered.length} onCheckedChange={toggleAll} />
                </TableHead>
                <TableHead>Unit / Property</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead className="text-right">Rent</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Inquiries</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No listings found</TableCell></TableRow>
              ) : filtered.map((l) => {
                const cfg = LISTING_STATUS_CONFIG[l.status];
                const daysLeft = getDaysUntilExpiry(l.expiryDate);
                return (
                  <TableRow key={l.id} className="group">
                    <TableCell>
                      <Checkbox checked={selected.has(l.id)} onCheckedChange={() => toggleSelect(l.id)} />
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{l.unitLabel}</p>
                      <p className="text-xs text-muted-foreground">{l.propertyName}</p>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{l.platform}</Badge></TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${cfg.badgeClass}`}>{cfg.label}</Badge>
                    </TableCell>
                    <TableCell>
                      {l.expiryDate ? (
                        <div className="text-xs">
                          <span>{l.expiryDate}</span>
                          {daysLeft !== null && daysLeft > 0 && daysLeft <= 7 && (
                            <p className="text-destructive font-medium">{daysLeft}d left</p>
                          )}
                          {daysLeft !== null && daysLeft <= 0 && (
                            <p className="text-destructive font-medium">Expired</p>
                          )}
                        </div>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-right text-sm">{formatAmount(l.rent)}</TableCell>
                    <TableCell className="text-right text-sm">{l.views}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="text-xs">{l.inquiries.length}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => navigate(`/leases/listings/${l.id}`)}>
                          <Eye className="h-3 w-3 mr-1" /> View
                        </Button>
                        <ListingActionsMenu
                          listing={l}
                          onPublish={() => setConfirmAction({ type: 'status', ids: [l.id], targetStatus: 'active' })}
                          onPause={() => setConfirmAction({ type: 'status', ids: [l.id], targetStatus: 'inactive' })}
                          onActivate={() => setConfirmAction({ type: 'status', ids: [l.id], targetStatus: 'active' })}
                          onReactivate={() => setConfirmAction({ type: 'status', ids: [l.id], targetStatus: 'active' })}
                          onDelete={() => setConfirmAction({ type: 'delete', ids: [l.id] })}
                          onEdit={() => navigate(`/leases/post-listing?mode=edit&listingId=${l.id}`)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === 'delete' ? 'Delete Listing(s)?' : `Change Status to ${confirmAction?.targetStatus ? LISTING_STATUS_CONFIG[confirmAction.targetStatus].label : ''}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === 'delete'
                ? `This will permanently delete ${confirmAction.ids.length} listing(s). Active listings will be removed from Zillow.`
                : confirmAction?.targetStatus === 'active'
                ? `${confirmAction?.ids.length} listing(s) will be published to Zillow.`
                : `${confirmAction?.ids.length} listing(s) will be paused and hidden from Zillow.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeConfirm} className={confirmAction?.type === 'delete' ? 'bg-destructive hover:bg-destructive/90' : ''}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ListingActionsMenu({ listing, onPublish, onPause, onActivate, onReactivate, onDelete, onEdit }: {
  listing: ListingRecord;
  onPublish: () => void;
  onPause: () => void;
  onActivate: () => void;
  onReactivate: () => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>Edit Listing</DropdownMenuItem>

        {listing.status === 'draft' && (
          <DropdownMenuItem onClick={onPublish}>
            <Send className="h-3.5 w-3.5 mr-2" /> Publish to Zillow
          </DropdownMenuItem>
        )}

        {listing.status === 'active' && (
          <DropdownMenuItem onClick={onPause}>
            <Pause className="h-3.5 w-3.5 mr-2" /> Pause Listing
          </DropdownMenuItem>
        )}

        {listing.status === 'inactive' && (
          <DropdownMenuItem onClick={onActivate}>
            <Play className="h-3.5 w-3.5 mr-2" /> Activate
          </DropdownMenuItem>
        )}

        {listing.status === 'expired' && (
          <DropdownMenuItem onClick={onReactivate}>
            <RotateCcw className="h-3.5 w-3.5 mr-2" /> Reactivate
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
