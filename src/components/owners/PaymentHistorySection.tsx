import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Download, Plus, FileText, Receipt,
} from 'lucide-react';
import type { OwnerPayment, PaymentHistoryStatus } from '@/types/owner';

interface PaymentHistorySectionProps {
  payments: OwnerPayment[];
  onAddPayment: (payment: Omit<OwnerPayment, 'id'>) => void;
}

export default function PaymentHistorySection({ payments, onAddPayment }: PaymentHistorySectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newAmount, setNewAmount] = useState('');
  const [newDate, setNewDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newMethod, setNewMethod] = useState('ACH');
  const [newStatus, setNewStatus] = useState<PaymentHistoryStatus>('paid');

  const handleRecordPayment = () => {
    if (!newAmount || Number(newAmount) <= 0) return;
    onAddPayment({
      amount: Number(newAmount),
      date: newDate,
      method: newMethod,
      status: newStatus,
      invoiceUrl: '#',
      receiptUrl: newStatus === 'paid' ? '#' : undefined,
    });
    setNewAmount('');
    setNewDate(format(new Date(), 'yyyy-MM-dd'));
    setNewMethod('ACH');
    setNewStatus('paid');
    setDialogOpen(false);
  };

  const getStatusBadge = (status: PaymentHistoryStatus) => {
    return status === 'paid' ? (
      <Badge className="bg-secondary/30 text-secondary-foreground border-0 text-xs">Paid</Badge>
    ) : (
      <Badge className="bg-warning/30 text-warning-foreground border-0 text-xs">Pending</Badge>
    );
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold text-foreground">Payment History</h3>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Record Manual Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Amount ($) *</Label>
                <Input
                  type="number"
                  min={0}
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="e.g. 1840"
                />
              </div>
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Method</Label>
                  <Select value={newMethod} onValueChange={setNewMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="ACH">ACH</SelectItem>
                      <SelectItem value="Check">Check</SelectItem>
                      <SelectItem value="Wire">Wire</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={newStatus} onValueChange={(v) => setNewStatus(v as PaymentHistoryStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full btn-primary" onClick={handleRecordPayment}>
                Save Payment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-border rounded-lg bg-card">
          <Receipt className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No payments yet.</p>
        </div>
      ) : (
        <div className="card-elevated overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-card hover:bg-card">
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((payment) => (
                  <TableRow key={payment.id} className="bg-card">
                    <TableCell className="text-sm">
                      {format(new Date(payment.date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${payment.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {payment.method}
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {payment.invoiceUrl && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title="Download Invoice"
                            onClick={() => window.open(payment.invoiceUrl, '_blank')}
                          >
                            <FileText className="h-3.5 w-3.5 text-primary" />
                          </Button>
                        )}
                        {payment.receiptUrl && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            title="Download Receipt"
                            onClick={() => window.open(payment.receiptUrl, '_blank')}
                          >
                            <Download className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
