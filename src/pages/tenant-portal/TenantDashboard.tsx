import { useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import {
  Home, CreditCard, FileText, Calendar, Clock, Download, Phone,
  ArrowRight, DoorOpen, CheckCircle2, Loader2, Upload, X, Eye,
  DollarSign, Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

// Mock lease data
const MOCK_LEASE = {
  property: 'Sunset Apartments',
  unit: 'Unit 4B',
  monthlyRent: 1850,
  startDate: '2024-06-01',
  endDate: '2025-06-30',
  depositAmount: 2500,
  depositStatus: 'Held' as const,
};

const MOCK_INVOICES = [
  { id: '1', date: '2025-02-01', amount: 1850, status: 'paid' as const },
  { id: '2', date: '2025-01-01', amount: 1850, status: 'paid' as const },
  { id: '3', date: '2024-12-01', amount: 1850, status: 'paid' as const },
  { id: '4', date: '2024-11-01', amount: 1850, status: 'paid' as const },
  { id: '5', date: '2024-10-01', amount: 1850, status: 'paid' as const },
  { id: '6', date: '2024-09-01', amount: 1850, status: 'paid' as const },
];

export default function TenantDashboard() {
  const { toast } = useToast();
  const daysLeft = differenceInDays(new Date(MOCK_LEASE.endDate), new Date());
  const nextDueDate = new Date();
  nextDueDate.setMonth(nextDueDate.getMonth() + 1, 1);

  // Modals
  const [rentModalOpen, setRentModalOpen] = useState(false);
  const [renewalModalOpen, setRenewalModalOpen] = useState(false);
  const [vacateModalOpen, setVacateModalOpen] = useState(false);
  const [leaseDocOpen, setLeaseDocOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Renewal form
  const [renewalDate, setRenewalDate] = useState('');
  const [renewalNotes, setRenewalNotes] = useState('');
  const [renewalSubmitted, setRenewalSubmitted] = useState(false);

  // Vacate form
  const [vacateDate, setVacateDate] = useState('');
  const [vacateReason, setVacateReason] = useState('');
  const [vacateSubmitted, setVacateSubmitted] = useState(false);
  const [vacateApproved, setVacateApproved] = useState(false);
  const [moveOutPhotos, setMoveOutPhotos] = useState<File[]>([]);
  const [photosSubmitted, setPhotosSubmitted] = useState(false);

  // Invoice filter
  const [invoiceFilter, setInvoiceFilter] = useState('all');

  const handlePayRent = async () => {
    setPaymentLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setPaymentLoading(false);
    setPaymentSuccess(true);
    toast({ title: 'Payment Successful', description: `$${MOCK_LEASE.monthlyRent.toLocaleString()} has been processed.` });
  };

  const handleRenewalSubmit = () => {
    if (!renewalDate) return;
    setRenewalSubmitted(true);
    toast({ title: 'Renewal Request Sent', description: 'Your request has been sent to the property manager.' });
  };

  const handleVacateSubmit = () => {
    if (!vacateDate) return;
    setVacateSubmitted(true);
    toast({ title: 'Early Vacate Request Sent', description: 'Your request has been sent to the property manager.' });
  };

  const handlePhotoUpload = (files: FileList | null) => {
    if (!files) return;
    setMoveOutPhotos((prev) => [...prev, ...Array.from(files)]);
  };

  const handlePhotosSubmit = () => {
    if (moveOutPhotos.length === 0) return;
    setPhotosSubmitted(true);
    toast({ title: 'Photos Submitted', description: 'Your move-out photos have been submitted for review.' });
  };

  const filteredInvoices = invoiceFilter === 'all'
    ? MOCK_INVOICES
    : MOCK_INVOICES.filter((inv) => inv.status === invoiceFilter);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <div className="h-1 w-16 rounded-full bg-secondary mt-2" />
      </div>

      {/* Top Row — Lease + Rent Due */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Current Lease Card */}
        <Card className="card-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Home className="h-4 w-4 text-primary" />
              Current Lease
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-lg font-semibold text-foreground">{MOCK_LEASE.property}</p>
                <p className="text-sm text-muted-foreground">{MOCK_LEASE.unit}</p>
              </div>
              <p className="text-2xl font-bold text-foreground">${MOCK_LEASE.monthlyRent.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {format(new Date(MOCK_LEASE.startDate), 'MMM d, yyyy')}</span>
              <ArrowRight className="h-3 w-3" />
              <span>{format(new Date(MOCK_LEASE.endDate), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Expires in {daysLeft} days</p>
                <p className="text-xs text-muted-foreground">Consider requesting a renewal</p>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Dialog open={leaseDocOpen} onOpenChange={setLeaseDocOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1 h-10 rounded-xl gap-1.5 text-sm hover:scale-[1.02] transition-transform">
                    <Eye className="h-4 w-4" /> View Lease
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>Lease Document</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center gap-4 py-6">
                    <div className="w-full h-[400px] rounded-xl bg-muted/50 border border-border flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <FileText className="h-16 w-16 text-muted-foreground/40 mx-auto" />
                        <p className="text-sm text-muted-foreground">Lease PDF Preview</p>
                        <p className="text-xs text-muted-foreground">{MOCK_LEASE.property} — {MOCK_LEASE.unit}</p>
                      </div>
                    </div>
                    <Button className="rounded-xl gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                      <Download className="h-4 w-4" /> Download PDF
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={renewalModalOpen} onOpenChange={(o) => { setRenewalModalOpen(o); if (!o) { setRenewalSubmitted(false); setRenewalDate(''); setRenewalNotes(''); } }}>
                <DialogTrigger asChild>
                  <Button className="flex-1 h-10 rounded-xl gap-1.5 text-sm bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:scale-[1.02] transition-transform">
                    <FileText className="h-4 w-4" /> Request Renewal
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Request Lease Renewal</DialogTitle>
                  </DialogHeader>
                  {renewalSubmitted ? (
                    <div className="flex flex-col items-center gap-4 py-8">
                      <CheckCircle2 className="h-16 w-16 text-secondary" />
                      <p className="text-lg font-semibold text-foreground">Request Sent!</p>
                      <p className="text-sm text-muted-foreground text-center">Your renewal request has been sent. Waiting for approval from your property manager.</p>
                      <Button onClick={() => setRenewalModalOpen(false)} className="rounded-xl">Close</Button>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Desired New End Date</Label>
                        <Input type="date" value={renewalDate} onChange={(e) => setRenewalDate(e.target.value)} className="h-11 rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes (optional)</Label>
                        <Textarea value={renewalNotes} onChange={(e) => setRenewalNotes(e.target.value)} placeholder="Any preferences or notes..." className="rounded-xl resize-none" rows={3} />
                      </div>
                      <Button onClick={handleRenewalSubmit} disabled={!renewalDate} className="w-full h-11 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold">
                        Submit Renewal Request
                      </Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Rent Due Card */}
        <Card className="card-elevated border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4 text-primary" />
              Rent Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Next Due</p>
                <p className="text-lg font-semibold text-foreground">{format(nextDueDate, 'MMMM d, yyyy')}</p>
              </div>
              <p className="text-3xl font-bold text-foreground">${MOCK_LEASE.monthlyRent.toLocaleString()}</p>
            </div>

            <Dialog open={rentModalOpen} onOpenChange={(o) => { setRentModalOpen(o); if (!o) { setPaymentSuccess(false); setPaymentLoading(false); } }}>
              <DialogTrigger asChild>
                <Button className="w-full h-12 rounded-xl text-base font-semibold gap-2 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02] transition-transform">
                  <DollarSign className="h-5 w-5" /> Pay Rent Now
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Pay Rent</DialogTitle>
                </DialogHeader>
                {paymentSuccess ? (
                  <div className="flex flex-col items-center gap-4 py-8">
                    <div className="h-20 w-20 rounded-full bg-secondary/20 flex items-center justify-center">
                      <CheckCircle2 className="h-10 w-10 text-secondary" />
                    </div>
                    <p className="text-xl font-semibold text-foreground">Payment Successful!</p>
                    <p className="text-sm text-muted-foreground">${MOCK_LEASE.monthlyRent.toLocaleString()} paid for {format(nextDueDate, 'MMMM yyyy')}</p>
                    <Button onClick={() => setRentModalOpen(false)} className="rounded-xl">Done</Button>
                  </div>
                ) : (
                  <div className="space-y-5 pt-2">
                    <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-2">
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Property</span><span className="font-medium">{MOCK_LEASE.property} — {MOCK_LEASE.unit}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Period</span><span className="font-medium">{format(nextDueDate, 'MMMM yyyy')}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Amount</span><span className="text-lg font-bold">${MOCK_LEASE.monthlyRent.toLocaleString()}</span></div>
                    </div>
                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-2 text-xs text-muted-foreground">
                      <CreditCard className="h-4 w-4 text-primary shrink-0" />
                      Stripe payment integration placeholder — in production this connects to Stripe Checkout.
                    </div>
                    <Button onClick={handlePayRent} disabled={paymentLoading} className="w-full h-12 rounded-xl text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
                      {paymentLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Pay ${MOCK_LEASE.monthlyRent.toLocaleString()}</>}
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Dialog open={vacateModalOpen} onOpenChange={(o) => { setVacateModalOpen(o); if (!o) { setVacateSubmitted(false); setVacateDate(''); setVacateReason(''); setVacateApproved(false); setMoveOutPhotos([]); setPhotosSubmitted(false); } }}>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-12 rounded-xl gap-2 hover:scale-[1.02] transition-transform text-sm font-medium">
              <DoorOpen className="h-4 w-4" /> Request Early Vacate
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Early Vacate Request</DialogTitle>
            </DialogHeader>
            {photosSubmitted ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <CheckCircle2 className="h-16 w-16 text-secondary" />
                <p className="text-lg font-semibold">Photos Submitted</p>
                <p className="text-sm text-muted-foreground text-center">Your move-out photos have been submitted. The property manager will review and process your security deposit.</p>
                <div className="p-3 rounded-xl bg-muted/50 border border-border w-full text-sm text-center">
                  <p className="text-muted-foreground">Security Deposit: <span className="font-semibold text-foreground">${MOCK_LEASE.depositAmount.toLocaleString()}</span></p>
                  <p className="text-xs text-muted-foreground mt-1">Status: Refund Under Review</p>
                </div>
                <Button onClick={() => setVacateModalOpen(false)} className="rounded-xl">Close</Button>
              </div>
            ) : vacateApproved ? (
              <div className="space-y-4 pt-2">
                <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-secondary shrink-0" />
                  <p className="text-sm text-foreground">Your early vacate request has been <strong>approved</strong>. Please upload move-out photos.</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Upload Move-Out Photos</Label>
                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors" onClick={() => document.getElementById('photo-upload')?.click()}>
                    <Upload className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 10MB each</p>
                  </div>
                  <input id="photo-upload" type="file" accept="image/*" multiple className="hidden" onChange={(e) => handlePhotoUpload(e.target.files)} />
                </div>
                {moveOutPhotos.length > 0 && (
                  <div className="space-y-2">
                    {moveOutPhotos.map((file, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border border-border">
                        <span className="text-sm truncate flex-1">{file.name}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setMoveOutPhotos((prev) => prev.filter((_, j) => j !== i))}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <Button onClick={handlePhotosSubmit} disabled={moveOutPhotos.length === 0} className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                  Submit Photos for Review
                </Button>
              </div>
            ) : vacateSubmitted ? (
              <div className="flex flex-col items-center gap-4 py-6">
                <CheckCircle2 className="h-16 w-16 text-secondary" />
                <p className="text-lg font-semibold">Request Sent!</p>
                <p className="text-sm text-muted-foreground text-center">Waiting for property manager approval.</p>
                <Button variant="outline" className="rounded-xl" onClick={() => setVacateApproved(true)}>
                  Simulate PMC Approval
                </Button>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Preferred Vacate Date</Label>
                  <Input type="date" value={vacateDate} onChange={(e) => setVacateDate(e.target.value)} className="h-11 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reason</Label>
                  <Textarea value={vacateReason} onChange={(e) => setVacateReason(e.target.value)} placeholder="Please explain your reason for early vacate..." className="rounded-xl resize-none" rows={3} />
                </div>
                <Button onClick={handleVacateSubmit} disabled={!vacateDate} className="w-full h-11 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-semibold">
                  Submit Request
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Button variant="outline" className="h-12 rounded-xl gap-2 hover:scale-[1.02] transition-transform text-sm font-medium">
          <Download className="h-4 w-4" /> Download All Documents
        </Button>
        <Button variant="outline" className="h-12 rounded-xl gap-2 hover:scale-[1.02] transition-transform text-sm font-medium">
          <Phone className="h-4 w-4" /> Contact Support
        </Button>
      </div>

      {/* Bottom Row — Invoices + Security Deposit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Invoice History */}
        <Card className="card-elevated lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-primary" />
                Invoice History
              </CardTitle>
              <Select value={invoiceFilter} onValueChange={setInvoiceFilter}>
                <SelectTrigger className="w-[120px] h-8 rounded-lg text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left py-2.5 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                    <th className="text-left py-2.5 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</th>
                    <th className="text-left py-2.5 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="text-right py-2.5 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-4">{format(new Date(inv.date), 'MMM d, yyyy')}</td>
                      <td className="py-2.5 px-4 font-medium">${inv.amount.toLocaleString()}</td>
                      <td className="py-2.5 px-4">
                        <Badge variant={inv.status === 'paid' ? 'secondary' : 'destructive'} className="text-xs capitalize rounded-full">
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                          <Download className="h-3 w-3" /> PDF
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Security Deposit */}
        <Card className="card-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-primary" />
              Security Deposit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <p className="text-3xl font-bold text-foreground">${MOCK_LEASE.depositAmount.toLocaleString()}</p>
              <Badge className="mt-2 rounded-full bg-primary/10 text-primary border-primary/20">
                {MOCK_LEASE.depositStatus}
              </Badge>
            </div>
            <div className="p-3 rounded-xl bg-muted/50 border border-border text-xs text-muted-foreground space-y-1">
              <p>Your security deposit is held per your lease agreement.</p>
              <p>Refund eligibility is determined upon move-out inspection.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
