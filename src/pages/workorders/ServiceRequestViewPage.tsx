import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Clock, Mail, Phone, MapPin, MessageSquare,
  Camera, Send, StickyNote, ChevronRight, Image as ImageIcon,
  User, Calendar, Tag, AlertTriangle,
} from 'lucide-react';
import { useWorkOrdersContext } from '@/contexts/WorkOrdersContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  WO_PRIORITY_LABELS,
  SERVICE_REQUEST_STATUS_LABELS,
  RESOLUTION_TARGET_HOURS,
  type WOPriority,
} from '@/types/workOrder';

const PRIORITY_BADGE: Record<WOPriority, string> = {
  low: 'bg-muted text-muted-foreground border-0',
  medium: 'bg-[hsl(210,50%,90%)] text-[hsl(210,50%,30%)] border-0',
  high: 'bg-warning text-warning-foreground border-0',
  urgent: 'bg-[hsl(0,60%,92%)] text-[hsl(0,60%,35%)] border-0',
  emergency: 'bg-destructive text-destructive-foreground border-0',
};

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-warning text-warning-foreground border-0',
  approved: 'bg-secondary text-secondary-foreground border-0',
  rejected: 'bg-destructive text-destructive-foreground border-0',
};

const ACTION_ICONS: Record<string, typeof Clock> = {
  submitted: Send,
  note_added: StickyNote,
  status_changed: AlertTriangle,
  communication_sent: MessageSquare,
  attachment_added: Camera,
};

export default function ServiceRequestViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    getServiceRequestById, approveRequest, rejectRequest, addRequestNote,
    rfps, workOrders,
  } = useWorkOrdersContext();

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const sr = getServiceRequestById(id || '');

  if (!sr) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <p className="text-muted-foreground">Service Request not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/work-orders')}>Back to Work Orders</Button>
      </div>
    );
  }

  const linkedRFP = rfps.find(r => r.requestId === sr.id);
  const linkedWO = workOrders.find(wo => wo.requestId === sr.id);
  const resolutionHours = RESOLUTION_TARGET_HOURS[sr.priority];
  const sortedHistory = [...sr.history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleApprove = (direct: boolean) => {
    approveRequest(sr.id, direct);
    toast({ title: direct ? 'Work Order Created' : 'RFP Created', description: direct ? 'Request approved and work order created.' : 'Request approved and RFP created.' });
    navigate('/work-orders');
  };

  const handleReject = () => {
    if (!rejectReason) return;
    rejectRequest(sr.id, rejectReason, rejectNotes);
    setRejectOpen(false);
    toast({ title: 'Request Rejected' });
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    addRequestNote(sr.id, noteText.trim());
    setNoteOpen(false);
    setNoteText('');
    toast({ title: 'Note Added' });
  };

  const handleSendMessage = () => {
    if (!messageBody.trim()) return;
    // Placeholder — would integrate with Communications
    setMessageOpen(false);
    setMessageSubject('');
    setMessageBody('');
    toast({ title: 'Message Sent', description: `Message sent to ${sr.tenantName}` });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/work-orders" className="hover:text-foreground transition-colors">Work Orders</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="hover:text-foreground cursor-pointer" onClick={() => navigate('/work-orders')}>Tenant Requests</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">{sr.id}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" className="mt-0.5 shrink-0" onClick={() => navigate('/work-orders')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-semibold text-foreground">{sr.id}</h1>
              <Badge className={STATUS_BADGE[sr.status]}>{SERVICE_REQUEST_STATUS_LABELS[sr.status]}</Badge>
              <Badge className={PRIORITY_BADGE[sr.priority]}>{WO_PRIORITY_LABELS[sr.priority]}</Badge>
            </div>
            <div className="h-1 w-16 bg-secondary rounded-full mt-2" />
            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{sr.propertyName}{sr.unitNumber ? ` #${sr.unitNumber}` : ''}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(sr.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              {sr.category && <span className="flex items-center gap-1"><Tag className="h-3.5 w-3.5" />{sr.category}</span>}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {sr.status === 'pending' && (
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <Button size="sm" className="bg-secondary text-secondary-foreground hover:opacity-90" onClick={() => handleApprove(false)}>
              Approve → RFP
            </Button>
            <Button size="sm" className="bg-primary text-primary-foreground hover:opacity-90" onClick={() => handleApprove(true)}>
              Approve → Direct WO
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setRejectOpen(true)}>
              Reject
            </Button>
            <Button size="sm" variant="outline" onClick={() => setNoteOpen(true)}>
              <StickyNote className="h-4 w-4 mr-1" /> Add Note
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setMessageSubject(`Update on ${sr.id}: ${sr.description.slice(0, 30)}`); setMessageOpen(true); }}>
              <MessageSquare className="h-4 w-4 mr-1" /> Message Tenant
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column – Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-lg">Description & Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{sr.description}</p>
              <Separator />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Category</span>
                  <p className="font-medium mt-0.5">{sr.category || '—'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Priority</span>
                  <p className="font-medium mt-0.5">{WO_PRIORITY_LABELS[sr.priority]}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Target Resolution</span>
                  <p className="font-medium mt-0.5">{resolutionHours < 24 ? `${resolutionHours}h` : `${resolutionHours / 24} days`}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attachments / Media Gallery */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Attachments & Media</CardTitle>
                <span className="text-xs text-muted-foreground">{sr.attachments.length} file(s)</span>
              </div>
            </CardHeader>
            <CardContent>
              {sr.attachments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <ImageIcon className="h-10 w-10 mb-2 opacity-40" />
                  <p className="text-sm">No photos attached</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {sr.attachments.map((file, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg bg-muted border border-border flex items-center justify-center cursor-pointer hover:shadow-md transition-shadow group relative overflow-hidden"
                      onClick={() => setSelectedImage(file)}
                    >
                      <div className="flex flex-col items-center gap-1 text-muted-foreground">
                        <Camera className="h-6 w-6 group-hover:scale-110 transition-transform" />
                        <span className="text-xs truncate max-w-[80%]">{file}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Log / Timeline */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-lg">Activity Log</CardTitle></CardHeader>
            <CardContent>
              {sortedHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No activity recorded.</p>
              ) : (
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
                  <div className="space-y-4">
                    {sortedHistory.map((entry) => {
                      const IconComp = ACTION_ICONS[entry.action] || Clock;
                      return (
                        <div key={entry.id} className="flex gap-3 relative">
                          <div className="h-8 w-8 rounded-full bg-card border border-border flex items-center justify-center shrink-0 z-10">
                            <IconComp className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 pt-1">
                            <p className="text-sm">
                              <span className="font-medium">{entry.userName}</span>
                              <span className="text-muted-foreground ml-1">
                                {entry.action === 'submitted' && 'submitted this request'}
                                {entry.action === 'note_added' && `added a note: "${entry.details}"`}
                                {entry.action === 'status_changed' && entry.details}
                                {entry.action === 'communication_sent' && 'sent a message to tenant'}
                                {entry.action === 'attachment_added' && 'added an attachment'}
                              </span>
                            </p>
                            {entry.reason && (
                              <p className="text-xs text-muted-foreground mt-0.5">Reason: {entry.reason}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              <span className="ml-1.5 capitalize">· {entry.userRole}</span>
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column – Sidebar */}
        <div className="space-y-6">
          {/* Tenant Info */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-lg">Tenant</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">{sr.tenantName}</p>
                  <p className="text-xs text-muted-foreground">Tenant ID: {sr.tenantId}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                {sr.tenantEmail && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{sr.tenantEmail}</span>
                  </div>
                )}
                {sr.tenantPhone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span>{sr.tenantPhone}</span>
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => navigate(`/users/tenants/${sr.tenantId}`)}>
                View Tenant Profile
              </Button>
            </CardContent>
          </Card>

          {/* Property */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-lg">Property</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="font-medium">{sr.propertyName}</span>
              </div>
              {sr.unitNumber && <p className="text-muted-foreground pl-5">Unit #{sr.unitNumber}</p>}
              <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => navigate(`/properties/${sr.propertyId}`)}>
                View Property
              </Button>
            </CardContent>
          </Card>

          {/* Linked Items */}
          {(linkedRFP || linkedWO || sr.status === 'rejected') && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-lg">Related</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {linkedRFP && (
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate(`/work-orders/rfp/${linkedRFP.id}`)}>
                    RFP: {linkedRFP.id} — {linkedRFP.status}
                  </Button>
                )}
                {linkedWO && (
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate(`/work-orders/${linkedWO.id}`)}>
                    WO: {linkedWO.id} — {linkedWO.status}
                  </Button>
                )}
                {sr.status === 'rejected' && (
                  <div className="p-3 rounded-lg bg-destructive/10 space-y-1">
                    <p className="font-medium text-destructive-foreground text-xs">Rejected</p>
                    <p className="text-xs">{sr.rejectionReason}</p>
                    {sr.rejectionNotes && <p className="text-xs text-muted-foreground">{sr.rejectionNotes}</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions (for non-pending too) */}
          {sr.status !== 'pending' && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-lg">Actions</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full" onClick={() => setNoteOpen(true)}>
                  <StickyNote className="h-4 w-4 mr-1" /> Add Note
                </Button>
                <Button variant="outline" size="sm" className="w-full" onClick={() => { setMessageSubject(`Update on ${sr.id}`); setMessageOpen(true); }}>
                  <MessageSquare className="h-4 w-4 mr-1" /> Message Tenant
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ── Dialogs ── */}

      {/* Reject */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Service Request</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Reason</Label>
              <Select value={rejectReason} onValueChange={setRejectReason}>
                <SelectTrigger><SelectValue placeholder="Select reason" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not Maintenance Issue">Not Maintenance Issue</SelectItem>
                  <SelectItem value="Duplicate">Duplicate</SelectItem>
                  <SelectItem value="Tenant Responsibility">Tenant Responsibility</SelectItem>
                  <SelectItem value="Insufficient Info">Insufficient Information</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={rejectNotes} onChange={e => setRejectNotes(e.target.value)} placeholder="Additional details…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note */}
      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Internal Note</DialogTitle></DialogHeader>
          <div>
            <Label>Note</Label>
            <Textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Enter your note…" className="min-h-[100px]" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteOpen(false)}>Cancel</Button>
            <Button className="btn-primary" onClick={handleAddNote} disabled={!noteText.trim()}>Add Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message Tenant */}
      <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Message Tenant</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>To</Label>
              <Input value={`${sr.tenantName} (${sr.tenantEmail || sr.tenantId})`} disabled />
            </div>
            <div>
              <Label>Subject</Label>
              <Input value={messageSubject} onChange={e => setMessageSubject(e.target.value)} />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea value={messageBody} onChange={e => setMessageBody(e.target.value)} placeholder="Type your message…" className="min-h-[100px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageOpen(false)}>Cancel</Button>
            <Button className="btn-primary" onClick={handleSendMessage} disabled={!messageBody.trim()}>
              <Send className="h-4 w-4 mr-1" /> Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{selectedImage}</DialogTitle></DialogHeader>
          <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Camera className="h-12 w-12 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Image preview placeholder</p>
              <p className="text-xs mt-1">{selectedImage}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
