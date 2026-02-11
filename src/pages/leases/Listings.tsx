import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ExternalLink, Search, ArrowLeft, Plus, Eye, MessageSquare, UserPlus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

type ListingStatus = 'active' | 'draft' | 'expired';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
}

interface Listing {
  id: string;
  unitLabel: string;
  propertyName: string;
  platform: string;
  status: ListingStatus;
  postedDate: string;
  views: number;
  inquiries: Inquiry[];
  rent: number;
}

const STATUS_BADGE: Record<ListingStatus, string> = {
  active: 'bg-secondary text-secondary-foreground',
  draft: 'bg-muted text-muted-foreground',
  expired: 'bg-warning text-warning-foreground',
};

// Mock listings
const MOCK_LISTINGS: Listing[] = [
  {
    id: 'lst-1', unitLabel: 'Unit 101', propertyName: 'Oakwood Apartments', platform: 'Zillow',
    status: 'active', postedDate: '2026-01-15', views: 234, rent: 1800,
    inquiries: [
      { id: 'inq-1', name: 'Sarah Chen', email: 'sarah@email.com', message: 'Interested in viewing', date: '2026-02-01' },
      { id: 'inq-2', name: 'Mike Johnson', email: 'mike@email.com', message: 'Available for move-in March?', date: '2026-02-05' },
    ],
  },
  {
    id: 'lst-2', unitLabel: 'Unit 205', propertyName: 'Maple Heights', platform: 'Zillow',
    status: 'draft', postedDate: '', views: 0, rent: 2200,
    inquiries: [],
  },
  {
    id: 'lst-3', unitLabel: 'Suite A', propertyName: 'Downtown Commercial', platform: 'Zillow',
    status: 'active', postedDate: '2026-01-20', views: 89, rent: 3500,
    inquiries: [
      { id: 'inq-3', name: 'Lisa Park', email: 'lisa@corp.com', message: 'Need office space ASAP', date: '2026-02-08' },
    ],
  },
];

export default function Listings() {
  const navigate = useNavigate();
  const [listings, setListings] = useState(MOCK_LISTINGS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  // showCreate removed - now navigates to /leases/post-listing

  const filtered = useMemo(() => {
    let list = listings;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((l) => l.unitLabel.toLowerCase().includes(q) || l.propertyName.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') list = list.filter((l) => l.status === statusFilter);
    return list;
  }, [listings, search, statusFilter]);

  const totalInquiries = listings.reduce((s, l) => s + l.inquiries.length, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/leases')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-foreground">Listings</h1>
          <div className="h-1 w-16 bg-secondary rounded-full mt-2" />
          <p className="text-sm text-muted-foreground mt-1">{listings.length} listings · {totalInquiries} inquiries</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => navigate('/leases/post-listing')}>
          <Plus className="h-4 w-4" /> Post Listing
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-2xl font-bold">{listings.filter((l) => l.status === 'active').length}</p>
          <p className="text-xs text-muted-foreground">Active Listings</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-2xl font-bold">{listings.reduce((s, l) => s + l.views, 0)}</p>
          <p className="text-xs text-muted-foreground">Total Views</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-2xl font-bold">{totalInquiries}</p>
          <p className="text-xs text-muted-foreground">Total Inquiries</p>
        </CardContent></Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search listings..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unit / Property</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Rent</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Inquiries</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No listings found</TableCell></TableRow>
              ) : filtered.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>
                    <p className="font-medium text-sm">{l.unitLabel}</p>
                    <p className="text-xs text-muted-foreground">{l.propertyName}</p>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{l.platform}</Badge></TableCell>
                  <TableCell><Badge className={`text-xs ${STATUS_BADGE[l.status]}`}>{l.status}</Badge></TableCell>
                  <TableCell className="text-right text-sm">${l.rent.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-sm">{l.views}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="text-xs">{l.inquiries.length}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setSelectedListing(l)}>
                      <Eye className="h-3 w-3 mr-1" /> Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Listing Detail Modal */}
      <Dialog open={!!selectedListing} onOpenChange={() => setSelectedListing(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedListing?.unitLabel} — {selectedListing?.propertyName}</DialogTitle>
          </DialogHeader>
          {selectedListing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Platform:</span> {selectedListing.platform}</div>
                <div><span className="text-muted-foreground">Status:</span> <Badge className={`text-xs ${STATUS_BADGE[selectedListing.status]}`}>{selectedListing.status}</Badge></div>
                <div><span className="text-muted-foreground">Rent:</span> ${selectedListing.rent.toLocaleString()}/mo</div>
                <div><span className="text-muted-foreground">Views:</span> {selectedListing.views}</div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Inquiries ({selectedListing.inquiries.length})</h4>
                {selectedListing.inquiries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No inquiries yet</p>
                ) : (
                  <div className="space-y-2">
                    {selectedListing.inquiries.map((inq) => (
                      <div key={inq.id} className="p-3 rounded-lg bg-muted/50 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{inq.name}</p>
                          <span className="text-xs text-muted-foreground">{inq.date}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{inq.email}</p>
                        <p className="text-sm">{inq.message}</p>
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1 mt-1" onClick={() => {
                          navigate(`/leases/create`);
                          setSelectedListing(null);
                        }}>
                          <UserPlus className="h-3 w-3" /> Convert to Lease
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
