import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Pencil, Building2, FileText, DollarSign, Mail, CreditCard, CalendarDays, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOwnersContext } from '@/contexts/OwnersContext';
import { MOCK_PROPERTIES } from '@/hooks/useOwners';

function getOwnerDisplayName(owner: { ownerType: string; companyName: string; firstName: string; lastName: string }) {
  return owner.ownerType === 'company' ? owner.companyName : `${owner.firstName} ${owner.lastName}`;
}

export default function OwnerViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOwnerById, owners } = useOwnersContext();
  const allOwners = owners.filter((o) => o.status !== 'deleted');

  const owner = id ? getOwnerById(id) : undefined;

  if (!owner) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg text-muted-foreground mb-4">Owner not found.</p>
        <Button variant="outline" onClick={() => navigate('/users/owners')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Owners
        </Button>
      </div>
    );
  }

  const displayName = getOwnerDisplayName(owner);
  const primaryEmail = owner.emails.find((e) => e.isPrimary);
  const linkedProperties = MOCK_PROPERTIES.filter((p) => owner.linkedPropertyIds.includes(p.id));
  const totalUnits = linkedProperties.reduce((sum, p) => sum + p.units, 0);
  const totalMonthlyRent = linkedProperties.reduce((sum, p) => sum + p.units * p.rent, 0);

  const statusBadge = owner.status === 'active'
    ? <Badge className="bg-secondary text-secondary-foreground border-0">Active</Badge>
    : owner.status === 'deactivated'
    ? <Badge className="bg-warning text-warning-foreground border-0">Deactivated</Badge>
    : <Badge className="bg-destructive text-destructive-foreground border-0">Archived</Badge>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/users/owners')} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-foreground">{displayName}</h1>
              {statusBadge}
            </div>
            <p className="text-muted-foreground mt-0.5">
              {owner.ownerType === 'company' ? 'Company' : 'Individual'} • Member since {format(new Date(owner.createdAt), 'MMM yyyy')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={owner.id} onValueChange={(val) => navigate(`/users/owners/${val}`)}>
            <SelectTrigger className="w-[200px]">
              <ChevronsUpDown className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Switch Owner" />
            </SelectTrigger>
            <SelectContent>
              {allOwners.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {getOwnerDisplayName(o)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => navigate(`/users/owners/${owner.id}/edit`)} className="btn-primary">
            <Pencil className="h-4 w-4 mr-2" /> Edit Owner
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Properties</p>
                <p className="text-2xl font-semibold">{linkedProperties.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Units</p>
                <p className="text-2xl font-semibold">{totalUnits}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Rent</p>
                <p className="text-2xl font-semibold">${totalMonthlyRent.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Payouts</p>
                <p className="text-2xl font-semibold">{owner.payments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Dashboard */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="properties">Properties & Units</TabsTrigger>
          <TabsTrigger value="agreements">Agreements</TabsTrigger>
          <TabsTrigger value="payouts">Payout History</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{owner.phone || '—'}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Address</span>
                  <span className="font-medium text-right">
                    {owner.address.street ? `${owner.address.street}, ${owner.address.city}, ${owner.address.state} ${owner.address.zip}` : '—'}
                  </span>
                </div>
                {owner.ownerType === 'company' && (
                  <>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contact Person</span>
                      <span className="font-medium">{owner.contactPerson || '—'}</span>
                    </div>
                  </>
                )}
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax Classification</span>
                  <span className="font-medium capitalize">{owner.taxClassification}</span>
                </div>
              </CardContent>
            </Card>

            {/* Emails */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email Accounts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {owner.emails.map((email) => (
                  <div key={email.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{email.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {email.loginCount} logins • Last: {email.lastLogin ? format(new Date(email.lastLogin), 'MMM d, yyyy') : 'Never'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {email.isPrimary && <Badge variant="outline" className="text-xs">Primary</Badge>}
                      <Badge className={email.status === 'active' ? 'bg-secondary text-secondary-foreground border-0' : 'bg-muted text-muted-foreground border-0'}>
                        {email.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Payment Setup */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Payment Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Payout Method</p>
                    <p className="font-medium uppercase">{owner.paymentSetup.payoutMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Frequency</p>
                    <p className="font-medium capitalize">{owner.paymentSetup.payoutFrequency}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Auto-Pay</p>
                    <Badge className={owner.paymentSetup.autoPayEnabled ? 'bg-secondary text-secondary-foreground border-0' : 'bg-muted text-muted-foreground border-0'}>
                      {owner.paymentSetup.autoPayEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Management Fee</p>
                    <p className="font-medium">
                      {owner.paymentSetup.managementFeeEnabled
                        ? owner.paymentSetup.managementFeeType === 'percentage'
                          ? `${owner.paymentSetup.managementFeeValue}%`
                          : `$${owner.paymentSetup.managementFeeValue}`
                        : 'None'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Properties Tab */}
        <TabsContent value="properties">
          <Card>
            <CardContent className="pt-6">
              {linkedProperties.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No properties linked to this owner.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property Name</TableHead>
                      <TableHead className="text-center">Units</TableHead>
                      <TableHead className="text-right">Rent / Unit</TableHead>
                      <TableHead className="text-right">Total Monthly</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {linkedProperties.map((prop) => (
                      <TableRow key={prop.id}>
                        <TableCell className="font-medium">{prop.name}</TableCell>
                        <TableCell className="text-center">{prop.units}</TableCell>
                        <TableCell className="text-right">${prop.rent.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-medium">${(prop.units * prop.rent).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50">
                      <TableCell className="font-semibold">Total</TableCell>
                      <TableCell className="text-center font-semibold">{totalUnits}</TableCell>
                      <TableCell />
                      <TableCell className="text-right font-semibold">${totalMonthlyRent.toLocaleString()}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agreements Tab */}
        <TabsContent value="agreements">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Agreement Mode: <span className="capitalize">{owner.agreementMode === 'single' ? 'Global' : 'Per Property'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {owner.agreements.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No agreements on file.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      {owner.agreementMode === 'per_property' && <TableHead>Property</TableHead>}
                      <TableHead className="text-right">Fee / Unit</TableHead>
                      <TableHead className="text-right">% of Rent</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {owner.agreements.map((ag) => {
                      const prop = ag.propertyId ? MOCK_PROPERTIES.find((p) => p.id === ag.propertyId) : null;
                      return (
                        <TableRow key={ag.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{ag.fileName}</span>
                            </div>
                          </TableCell>
                          {owner.agreementMode === 'per_property' && (
                            <TableCell>{prop?.name || '—'}</TableCell>
                          )}
                          <TableCell className="text-right">{ag.feePerUnit !== '' ? `$${ag.feePerUnit}` : '—'}</TableCell>
                          <TableCell className="text-right">{ag.feePercentRent !== '' ? `${ag.feePercentRent}%` : '—'}</TableCell>
                          <TableCell className="text-muted-foreground">{format(new Date(ag.createdAt), 'MMM d, yyyy')}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts">
          <Card>
            <CardContent className="pt-6">
              {owner.payments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No payout history available.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {owner.payments
                      .slice()
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((pmt) => (
                        <TableRow key={pmt.id}>
                          <TableCell className="font-medium">{format(new Date(pmt.date), 'MMM d, yyyy')}</TableCell>
                          <TableCell>{pmt.method}</TableCell>
                          <TableCell className="text-right font-medium">${pmt.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={pmt.status === 'paid' ? 'bg-secondary text-secondary-foreground border-0' : 'bg-warning text-warning-foreground border-0'}>
                              {pmt.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {pmt.invoiceUrl && (
                                <Button variant="ghost" size="sm" className="text-xs">Invoice</Button>
                              )}
                              {pmt.receiptUrl && (
                                <Button variant="ghost" size="sm" className="text-xs">Receipt</Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardContent className="pt-6">
              {owner.documents.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No documents uploaded.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Uploaded</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {owner.documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{doc.fileName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {doc.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{format(new Date(doc.uploadedAt), 'MMM d, yyyy')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
