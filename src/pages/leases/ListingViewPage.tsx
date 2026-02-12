import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ExternalLink, Eye, Send, Pause, Play, RotateCcw, Trash2,
  MessageSquare, Calendar, FileText, Clock, UserPlus, RefreshCw,
  Home, DollarSign, Shield, History,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { useCurrency } from '@/contexts/CurrencyContext';
import {
  LISTING_STATUS_CONFIG, MOCK_LISTINGS,
  type ListingRecord, type ListingStatus, type ListingInquiry,
} from '@/types/listing';

const INQUIRY_TYPE_ICON: Record<string, typeof MessageSquare> = {
  question: MessageSquare,
  tour: Calendar,
  application: FileText,
};

const INQUIRY_TYPE_LABEL: Record<string, string> = {
  question: 'Question',
  tour: 'Tour Request',
  application: 'Application',
};

const INQUIRY_STATUS_BADGE: Record<string, string> = {
  pending: 'bg-warning/20 text-warning-foreground',
  responded: 'bg-secondary/20 text-secondary-foreground',
  converted: 'bg-primary/20 text-primary-foreground',
  rejected: 'bg-destructive/15 text-destructive',
};

export default function ListingViewPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { formatAmount } = useCurrency();

  const [listings, setListings] = useState(MOCK_LISTINGS);
  const [confirmAction, setConfirmAction] = useState<{ type: string; targetStatus?: ListingStatus } | null>(null);

  const listing = listings.find((l) => l.id === id);

  const inquirysByType = useMemo(() => {
    if (!listing) return { all: [], question: [], tour: [], application: [] };
    return {
      all: listing.inquiries,
      question: listing.inquiries.filter((i) => i.type === 'question'),
      tour: listing.inquiries.filter((i) => i.type === 'tour'),
      application: listing.inquiries.filter((i) => i.type === 'application'),
    };
  }, [listing]);

  if (!listing) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Button variant="ghost" onClick={() => navigate('/leases/listings')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Listings
        </Button>
        <p className="text-muted-foreground text-center py-12">Listing not found.</p>
      </div>
    );
  }

  const cfg = LISTING_STATUS_CONFIG[listing.status];

  const daysUntilExpiry = listing.expiryDate
    ? Math.ceil((new Date(listing.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const changeStatus = (newStatus: ListingStatus) => {
    const today = new Date().toISOString().split('T')[0];
    setListings((prev) =>
      prev.map((l) => l.id !== listing.id ? l : {
        ...l, status: newStatus, lastStatusChange: today,
        postedDate: newStatus === 'active' && !l.postedDate ? today : l.postedDate,
        statusHistory: [...l.statusHistory, { date: today, from: l.status, to: newStatus }],
      })
    );
    toast({ title: `Listing updated to ${LISTING_STATUS_CONFIG[newStatus].label}` });
  };

  const deleteListing = () => {
    setListings((prev) => prev.filter((l) => l.id !== listing.id));
    toast({ title: 'Listing deleted' });
    navigate('/leases/listings');
  };

  const executeConfirm = () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'delete') deleteListing();
    else if (confirmAction.targetStatus) changeStatus(confirmAction.targetStatus);
    setConfirmAction(null);
  };

  const updateInquiryStatus = (inqId: string, status: string) => {
    setListings((prev) =>
      prev.map((l) => l.id !== listing.id ? l : {
        ...l,
        inquiries: l.inquiries.map((i) => i.id === inqId ? { ...i, status: status as any } : i),
      })
    );
    toast({ title: `Inquiry marked as ${status}` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/leases/listings')} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-foreground">{listing.unitLabel} — {listing.propertyName}</h1>
            <Badge className={`text-xs ${cfg.badgeClass}`}>{cfg.label}</Badge>
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            <span>{listing.platform}</span>
            {listing.postedDate && <span>Posted {listing.postedDate}</span>}
            {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
              <span className={daysUntilExpiry <= 7 ? 'text-destructive font-medium' : ''}>
                <Clock className="h-3 w-3 inline mr-1" />Expires in {daysUntilExpiry} days
              </span>
            )}
            {daysUntilExpiry !== null && daysUntilExpiry <= 0 && (
              <span className="text-destructive font-medium">Expired</span>
            )}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {listing.status === 'active' && (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.open('#', '_blank')}>
              <ExternalLink className="h-3.5 w-3.5" /> View on Zillow
            </Button>
          )}
          <StatusActions
            status={listing.status}
            onEdit={() => navigate(`/leases/post-listing?mode=edit&listingId=${listing.id}`)}
            onPublish={() => setConfirmAction({ type: 'status', targetStatus: 'active' })}
            onPause={() => setConfirmAction({ type: 'status', targetStatus: 'inactive' })}
            onActivate={() => setConfirmAction({ type: 'status', targetStatus: 'active' })}
            onReactivate={() => setConfirmAction({ type: 'status', targetStatus: 'active' })}
            onDelete={() => setConfirmAction({ type: 'delete' })}
          />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card><CardContent className="p-4">
          <p className="text-2xl font-bold">{listing.views}</p>
          <p className="text-xs text-muted-foreground">Views</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-2xl font-bold">{inquirysByType.all.length}</p>
          <p className="text-xs text-muted-foreground">Total Inquiries</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-2xl font-bold">{inquirysByType.tour.length}</p>
          <p className="text-xs text-muted-foreground">Tour Requests</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-2xl font-bold">{inquirysByType.application.length}</p>
          <p className="text-xs text-muted-foreground">Applications</p>
        </CardContent></Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="inquiries" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inquiries">Inquiries ({inquirysByType.all.length})</TabsTrigger>
          <TabsTrigger value="details">Listing Details</TabsTrigger>
          <TabsTrigger value="history">Status History</TabsTrigger>
        </TabsList>

        {/* Inquiries Tab */}
        <TabsContent value="inquiries" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Zillow Inquiries</h3>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast({ title: 'Refreshing Zillow data...', description: 'Pulling latest leads and views.' })}>
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
          </div>

          {inquirysByType.all.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No Zillow responses yet</p>
                <p className="text-xs text-muted-foreground mt-1">Inquiries will appear here when leads respond to your listing.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Lead</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inquirysByType.all.map((inq) => {
                      const Icon = INQUIRY_TYPE_ICON[inq.type];
                      return (
                        <TableRow key={inq.id}>
                          <TableCell className="text-xs">{inq.date}</TableCell>
                          <TableCell>
                            <p className="text-sm font-medium">{inq.leadName}</p>
                            <p className="text-xs text-muted-foreground">{inq.leadEmail}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs gap-1">
                              <Icon className="h-3 w-3" /> {INQUIRY_TYPE_LABEL[inq.type]}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <p className="text-xs truncate">{inq.message}</p>
                          </TableCell>
                          <TableCell>
                            <Badge className={`text-xs ${INQUIRY_STATUS_BADGE[inq.status]}`}>
                              {inq.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <InquiryActions
                              inquiry={inq}
                              onRespond={() => {
                                updateInquiryStatus(inq.id, 'responded');
                                navigate('/communications');
                              }}
                              onScheduleTour={() => {
                                updateInquiryStatus(inq.id, 'responded');
                                toast({ title: 'Tour scheduled', description: `Tour request for ${inq.leadName} has been noted.` });
                              }}
                              onStartApplication={() => {
                                updateInquiryStatus(inq.id, 'converted');
                                navigate('/leases/create');
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Home className="h-4 w-4 text-primary" /> Property</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Property</span><span>{listing.propertyName}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Unit</span><span>{listing.unitLabel}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Platform</span><span>{listing.platform}</span></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /> Pricing</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Monthly Rent</span><span className="font-semibold">{formatAmount(listing.rent)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Security Deposit</span><span>{formatAmount(listing.securityDeposit)}</span></div>
                <Separator />
                <div className="flex justify-between font-semibold"><span>Est. Move-In</span><span>{formatAmount(listing.rent + listing.securityDeposit)}</span></div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Status & Timeline</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge className={`text-xs ${cfg.badgeClass}`}>{cfg.label}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Posted</span><span>{listing.postedDate || '—'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Expiry</span><span>{listing.expiryDate || 'None'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Last Changed</span><span>{listing.lastStatusChange}</span></div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><History className="h-4 w-4 text-primary" /> Status History</CardTitle>
            </CardHeader>
            <CardContent>
              {listing.statusHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No status changes recorded.</p>
              ) : (
                <div className="space-y-3">
                  {listing.statusHistory.map((entry, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge className={`text-[10px] ${LISTING_STATUS_CONFIG[entry.from].badgeClass}`}>{LISTING_STATUS_CONFIG[entry.from].label}</Badge>
                          <span className="text-xs text-muted-foreground">→</span>
                          <Badge className={`text-[10px] ${LISTING_STATUS_CONFIG[entry.to].badgeClass}`}>{LISTING_STATUS_CONFIG[entry.to].label}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{entry.date}{entry.note ? ` — ${entry.note}` : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirm Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === 'delete' ? 'Delete this listing?' : `Change to ${confirmAction?.targetStatus ? LISTING_STATUS_CONFIG[confirmAction.targetStatus].label : ''}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === 'delete'
                ? 'This listing will be permanently removed. If active, it will be removed from Zillow.'
                : confirmAction?.targetStatus === 'active'
                ? 'This listing will be published/reactivated on Zillow.'
                : 'This listing will be paused and hidden from Zillow.'}
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

function StatusActions({ status, onEdit, onPublish, onPause, onActivate, onReactivate, onDelete }: {
  status: ListingStatus;
  onEdit: () => void;
  onPublish: () => void;
  onPause: () => void;
  onActivate: () => void;
  onReactivate: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={onEdit}>Edit</Button>
      {status === 'draft' && (
        <Button size="sm" className="gap-1.5" onClick={onPublish}>
          <Send className="h-3.5 w-3.5" /> Publish
        </Button>
      )}
      {status === 'active' && (
        <Button variant="outline" size="sm" className="gap-1.5" onClick={onPause}>
          <Pause className="h-3.5 w-3.5" /> Pause
        </Button>
      )}
      {status === 'inactive' && (
        <Button size="sm" className="gap-1.5" onClick={onActivate}>
          <Play className="h-3.5 w-3.5" /> Activate
        </Button>
      )}
      {status === 'expired' && (
        <Button size="sm" className="gap-1.5" onClick={onReactivate}>
          <RotateCcw className="h-3.5 w-3.5" /> Reactivate
        </Button>
      )}
      <Button variant="ghost" size="sm" className="text-destructive" onClick={onDelete}>
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function InquiryActions({ inquiry, onRespond, onScheduleTour, onStartApplication }: {
  inquiry: ListingInquiry;
  onRespond: () => void;
  onScheduleTour: () => void;
  onStartApplication: () => void;
}) {
  return (
    <div className="flex gap-1 justify-end">
      {inquiry.type === 'question' && (
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={onRespond}>
          <MessageSquare className="h-3 w-3" /> Respond
        </Button>
      )}
      {inquiry.type === 'tour' && (
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={onScheduleTour}>
          <Calendar className="h-3 w-3" /> Schedule
        </Button>
      )}
      {inquiry.type === 'application' && inquiry.status !== 'converted' && (
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={onStartApplication}>
          <UserPlus className="h-3 w-3" /> Start Lease
        </Button>
      )}
    </div>
  );
}
