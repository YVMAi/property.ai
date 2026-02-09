import { format } from 'date-fns';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Download, FileText, ShieldCheck, StickyNote } from 'lucide-react';
import type { Tenant } from '@/types/tenant';
import { getTenantCategory, getTenantDisplayName } from '@/types/tenant';
import { useState } from 'react';

interface TenantDashboardProps {
  open: boolean;
  onClose: () => void;
  tenant: Tenant;
  onRunBGV: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
}

export default function TenantDashboard({
  open,
  onClose,
  tenant,
  onRunBGV,
  onUpdateNotes,
}: TenantDashboardProps) {
  const [notes, setNotes] = useState(tenant.notes);
  const category = getTenantCategory(tenant);

  const getCategoryBadge = () => {
    switch (category) {
      case 'active':
        return <Badge className="bg-secondary text-secondary-foreground border-0">Active</Badge>;
      case 'archived':
        return <Badge className="bg-muted text-muted-foreground border-0">Archived</Badge>;
      case 'new':
        return <Badge className="bg-primary text-primary-foreground border-0">New</Badge>;
    }
  };

  // Payment chart data — last 12 payments
  const chartData = [...tenant.payments]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-12)
    .map((p) => ({
      month: format(new Date(p.date), 'MMM yy'),
      amount: p.amount,
      status: p.status,
    }));

  const onTimePct = tenant.payments.length
    ? Math.round((tenant.payments.filter((p) => p.status === 'paid').length / tenant.payments.length) * 100)
    : 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="text-xl">{getTenantDisplayName(tenant)}</DialogTitle>
            {getCategoryBadge()}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{tenant.email} · {tenant.phone || 'No phone'}</p>
        </DialogHeader>

        <Tabs defaultValue="leases" className="mt-4">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="leases">Leases</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="bgv">BGV Reports</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          {/* Leases Tab */}
          <TabsContent value="leases">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Historic Leases
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tenant.leases.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6 text-center">No leases linked to this tenant.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Property</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Rent</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tenant.leases.map((l) => (
                        <TableRow key={l.id}>
                          <TableCell className="font-medium">{l.propertyName}</TableCell>
                          <TableCell>{l.unit || '—'}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(l.startDate), 'MMM yyyy')} – {format(new Date(l.endDate), 'MMM yyyy')}
                          </TableCell>
                          <TableCell>${l.monthlyRent.toLocaleString()}/mo</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={l.status === 'active' ? 'border-secondary text-secondary-foreground' : ''}>
                              {l.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Payment Patterns</CardTitle>
                  <Badge variant="outline">{onTimePct}% on-time</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {chartData.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6 text-center">No payment history.</p>
                ) : (
                  <>
                    <div className="h-48 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                          <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                          <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                          <Tooltip />
                          <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                              <Cell
                                key={index}
                                fill={entry.status === 'late' ? 'hsl(var(--destructive))' : 'hsl(var(--secondary))'}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tenant.payments.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="text-sm">{format(new Date(p.date), 'MMM d, yyyy')}</TableCell>
                            <TableCell>${p.amount.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={p.status === 'late' ? 'border-destructive text-destructive-foreground' : 'border-secondary text-secondary-foreground'}>
                                {p.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* BGV Tab */}
          <TabsContent value="bgv">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" /> Background Verification
                  </CardTitle>
                  <Button size="sm" variant="outline" onClick={() => onRunBGV(tenant.id)}>
                    Run BGV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {tenant.bgvReports.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6 text-center">No BGV reports yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Credit</TableHead>
                        <TableHead>Criminal</TableHead>
                        <TableHead>Eviction</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tenant.bgvReports.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="text-sm">{format(new Date(r.runDate), 'MMM d, yyyy')}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={
                              r.status === 'completed' ? 'border-secondary text-secondary-foreground'
                                : r.status === 'pending' ? 'border-warning text-warning-foreground'
                                : 'border-destructive text-destructive-foreground'
                            }>
                              {r.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{r.sections?.credit || '—'}</TableCell>
                          <TableCell className="text-sm">{r.sections?.criminal || '—'}</TableCell>
                          <TableCell className="text-sm">{r.sections?.eviction || '—'}</TableCell>
                          <TableCell className="text-right">
                            {r.status === 'completed' && (
                              <Button variant="ghost" size="icon" className="h-7 w-7" title="Download">
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes">
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <StickyNote className="h-4 w-4" /> Admin Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this tenant..."
                  rows={5}
                />
                <Button
                  size="sm"
                  className="mt-3 btn-primary"
                  onClick={() => onUpdateNotes(tenant.id, notes)}
                >
                  Save Notes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
