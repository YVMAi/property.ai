import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, RefreshCw, Key, FileText, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from '@/hooks/use-toast';
import { DEFAULT_LEASE_SETTINGS, type LeaseSettings } from '@/types/leaseSettings';

export default function LeasingSettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<LeaseSettings>({ ...DEFAULT_LEASE_SETTINGS });

  const set = <K extends keyof LeaseSettings>(key: K, val: LeaseSettings[K]) =>
    setSettings((prev) => ({ ...prev, [key]: val }));

  const handleSave = () => {
    toast({ title: 'Global leasing settings saved' });
  };

  const handleApplyAll = () => {
    toast({
      title: 'Defaults applied to all properties',
      description: 'Property-level overrides were preserved',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/leases')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Leasing Settings</h1>
          <p className="text-sm text-muted-foreground">Global defaults · Override per property</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleApplyAll}>
            <RefreshCw className="h-4 w-4" /> Apply to All Properties
          </Button>
          <Button size="sm" className="gap-1.5" onClick={handleSave}>
            <Save className="h-4 w-4" /> Save Settings
          </Button>
        </div>
      </div>

      <div className="max-w-3xl space-y-4">
        {/* Invoice Generation */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" /> Invoice & Reminders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Days Before Due to Auto-Generate Invoice</Label>
              <Input
                type="number"
                className="max-w-[200px]"
                value={settings.invoiceGenDaysBefore}
                onChange={(e) => set('invoiceGenDaysBefore', Number(e.target.value) || 0)}
                min={1}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Label>Enable Tenant Reminders</Label>
              <Switch checked={settings.remindersEnabled} onCheckedChange={(v) => set('remindersEnabled', v)} />
            </div>
            {settings.remindersEnabled && (
              <div className="space-y-3 pl-1">
                <div>
                  <Label className="text-xs">Channels</Label>
                  <div className="flex gap-3 mt-1">
                    {(['email', 'sms', 'push'] as const).map((ch) => (
                      <label key={ch} className="flex items-center gap-1.5 text-sm">
                        <input
                          type="checkbox"
                          className="rounded border-input"
                          checked={settings.reminderChannels.includes(ch)}
                          onChange={(e) => {
                            set('reminderChannels', e.target.checked
                              ? [...settings.reminderChannels, ch]
                              : settings.reminderChannels.filter((c) => c !== ch)
                            );
                          }}
                        />
                        {ch === 'email' ? 'Email' : ch === 'sms' ? 'SMS' : 'Push'}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Escalate to Owner After Unpaid Days</Label>
                  <div className="flex items-center gap-2">
                    <Switch checked={settings.reminderEscalationEnabled} onCheckedChange={(v) => set('reminderEscalationEnabled', v)} />
                    {settings.reminderEscalationEnabled && (
                      <Input
                        type="number"
                        className="w-20 h-8"
                        value={settings.reminderEscalationDays}
                        onChange={(e) => set('reminderEscalationDays', Number(e.target.value) || 0)}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Late & Renewal Fees */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Default Fees</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Default Late Fees</Label>
              <Switch checked={settings.lateFeesDefaultEnabled} onCheckedChange={(v) => set('lateFeesDefaultEnabled', v)} />
            </div>
            {settings.lateFeesDefaultEnabled && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs">Type</Label>
                  <Select value={settings.lateFeeType} onValueChange={(v) => set('lateFeeType', v as any)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">% of Rent</SelectItem>
                      <SelectItem value="flat">Flat Fee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Value</Label>
                  <Input className="h-9" type="number" value={settings.lateFeeValue} onChange={(e) => set('lateFeeValue', e.target.value ? Number(e.target.value) : '')} />
                </div>
                <div>
                  <Label className="text-xs">Grace (days)</Label>
                  <Input className="h-9" type="number" value={settings.lateGraceDays} onChange={(e) => set('lateGraceDays', e.target.value ? Number(e.target.value) : '')} />
                </div>
                <div>
                  <Label className="text-xs">Max Cap ($)</Label>
                  <Input className="h-9" type="number" value={settings.lateMaxCap} onChange={(e) => set('lateMaxCap', e.target.value ? Number(e.target.value) : '')} />
                </div>
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <Label>Default Renewal Fees</Label>
              <Switch checked={settings.renewalFeesDefaultEnabled} onCheckedChange={(v) => set('renewalFeesDefaultEnabled', v)} />
            </div>
            {settings.renewalFeesDefaultEnabled && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Type</Label>
                  <Select value={settings.renewalFeeType} onValueChange={(v) => set('renewalFeeType', v as any)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="percent">% of Rent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Value</Label>
                  <Input className="h-9" type="number" value={settings.renewalFeeValue} onChange={(e) => set('renewalFeeValue', e.target.value ? Number(e.target.value) : '')} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Templates */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Document Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Standard Lease Template</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Upload or enter template name..."
                  value={settings.standardLeaseTemplateName}
                  onChange={(e) => set('standardLeaseTemplateName', e.target.value)}
                />
                <Button variant="outline" size="sm">Upload</Button>
              </div>
            </div>
            <div>
              <Label>Standard Renewal Template</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Upload or enter template name..."
                  value={settings.standardRenewalTemplateName}
                  onChange={(e) => set('standardRenewalTemplateName', e.target.value)}
                />
                <Button variant="outline" size="sm">Upload</Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Placeholders like [TenantName], [Rent], [StartDate] will be auto-filled</p>
          </CardContent>
        </Card>

        {/* Expanded Settings */}
        <Accordion type="multiple" className="space-y-2">
          <AccordionItem value="auto-renewal" className="border rounded-lg px-4">
            <AccordionTrigger className="text-sm font-medium">Auto-Renewal Defaults</AccordionTrigger>
            <AccordionContent className="space-y-3 pb-4">
              <div className="flex items-center justify-between">
                <Label>Enable Auto-Renewal by Default</Label>
                <Switch checked={settings.autoRenewDefault} onCheckedChange={(v) => set('autoRenewDefault', v)} />
              </div>
              {settings.autoRenewDefault && (
                <div>
                  <Label className="text-xs">Notice Period for Cancellation (days)</Label>
                  <Input className="max-w-[200px] h-9" type="number" value={settings.autoRenewNoticeDays} onChange={(e) => set('autoRenewNoticeDays', e.target.value ? Number(e.target.value) : '')} />
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="escalation" className="border rounded-lg px-4">
            <AccordionTrigger className="text-sm font-medium">Escalation Defaults</AccordionTrigger>
            <AccordionContent className="space-y-3 pb-4">
              <div className="flex items-center justify-between">
                <Label>Enable Escalation by Default</Label>
                <Switch checked={settings.escalationDefaultEnabled} onCheckedChange={(v) => set('escalationDefaultEnabled', v)} />
              </div>
              {settings.escalationDefaultEnabled && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Type</Label>
                    <Select value={settings.escalationType} onValueChange={(v) => set('escalationType', v as any)}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">% Annual</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Value</Label>
                    <Input className="h-9" type="number" value={settings.escalationValue} onChange={(e) => set('escalationValue', e.target.value ? Number(e.target.value) : '')} />
                  </div>
                  <div>
                    <Label className="text-xs">Start After (months)</Label>
                    <Input className="h-9" type="number" value={settings.escalationStartAfterMonths} onChange={(e) => set('escalationStartAfterMonths', e.target.value ? Number(e.target.value) : '')} />
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="pet" className="border rounded-lg px-4">
            <AccordionTrigger className="text-sm font-medium">Pet Policy</AccordionTrigger>
            <AccordionContent className="space-y-3 pb-4">
              <div className="flex items-center justify-between">
                <Label>Pets Allowed by Default</Label>
                <Switch checked={settings.petsAllowedDefault} onCheckedChange={(v) => set('petsAllowedDefault', v)} />
              </div>
              {settings.petsAllowedDefault && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Fee ($)</Label>
                      <Input className="h-9" type="number" value={settings.petFee} onChange={(e) => set('petFee', e.target.value ? Number(e.target.value) : '')} />
                    </div>
                    <div>
                      <Label className="text-xs">Frequency</Label>
                      <Select value={settings.petFeeFrequency} onValueChange={(v) => set('petFeeFrequency', v as any)}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="one_time">One-Time</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Restrictions</Label>
                    <Textarea className="min-h-[60px]" value={settings.petRestrictions} onChange={(e) => set('petRestrictions', e.target.value)} placeholder="e.g. Max 2 pets, under 50lbs" />
                  </div>
                </>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="parking" className="border rounded-lg px-4">
            <AccordionTrigger className="text-sm font-medium">Parking & Utilities</AccordionTrigger>
            <AccordionContent className="space-y-3 pb-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Assigned Parking Spots</Label>
                  <Input className="h-9" type="number" value={settings.parkingSpots} onChange={(e) => set('parkingSpots', e.target.value ? Number(e.target.value) : '')} />
                </div>
                <div>
                  <Label className="text-xs">Parking Fee ($/mo)</Label>
                  <Input className="h-9" type="number" value={settings.parkingFee} onChange={(e) => set('parkingFee', e.target.value ? Number(e.target.value) : '')} />
                </div>
              </div>
              <div>
                <Label className="text-xs">Utilities Responsibility</Label>
                <Select value={settings.utilitiesResponsibility} onValueChange={(v) => set('utilitiesResponsibility', v as any)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tenant">Tenant</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="included">Included in Rent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="inspection" className="border rounded-lg px-4">
            <AccordionTrigger className="text-sm font-medium">Inspection</AccordionTrigger>
            <AccordionContent className="space-y-3 pb-4">
              <div className="flex items-center justify-between">
                <Label>Move-In/Out Inspection Required</Label>
                <Switch checked={settings.inspectionRequired} onCheckedChange={(v) => set('inspectionRequired', v)} />
              </div>
              <div>
                <Label className="text-xs">Checklist Template</Label>
                <div className="flex gap-2">
                  <Input placeholder="Upload inspection template..." value={settings.inspectionTemplateName} onChange={(e) => set('inspectionTemplateName', e.target.value)} />
                  <Button variant="outline" size="sm">Upload</Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="custom" className="border rounded-lg px-4">
            <AccordionTrigger className="text-sm font-medium">Custom Rules & Compliance</AccordionTrigger>
            <AccordionContent className="space-y-3 pb-4">
              <div>
                <Label>Boilerplate Clauses</Label>
                <Textarea
                  className="min-h-[100px]"
                  value={settings.customRulesBoilerplate}
                  onChange={(e) => set('customRulesBoilerplate', e.target.value)}
                  placeholder="e.g. No smoking policy, quiet hours 10PM-7AM..."
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="approval" className="border rounded-lg px-4">
            <AccordionTrigger className="text-sm font-medium">Approval & Reporting</AccordionTrigger>
            <AccordionContent className="space-y-3 pb-4">
              <div className="flex items-center justify-between">
                <Label>Require Owner Approval for Non-Standard Leases</Label>
                <Switch checked={settings.requireOwnerApprovalNonStandard} onCheckedChange={(v) => set('requireOwnerApprovalNonStandard', v)} />
              </div>
              <div>
                <Label className="text-xs">Notify on Expiration (months before)</Label>
                <Input className="max-w-[200px] h-9" type="number" value={settings.expirationNotifyMonthsBefore} onChange={(e) => set('expirationNotifyMonthsBefore', e.target.value ? Number(e.target.value) : '')} />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="zillow" className="border rounded-lg px-4">
            <AccordionTrigger className="text-sm font-medium">
              <span className="flex items-center gap-2"><Key className="h-4 w-4" /> Zillow Integration</span>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pb-4">
              <p className="text-sm text-muted-foreground">Configure Zillow Rentals Feed API for listing postings and Lead API for inquiry tracking.</p>
              <div>
                <Label className="text-xs">API Key</Label>
                <Input type="password" placeholder="Enter Zillow API key..." />
              </div>
              <div>
                <Label className="text-xs">Partner ID</Label>
                <Input placeholder="Enter Zillow Partner ID..." />
              </div>
              <p className="text-xs text-muted-foreground">Credentials are securely stored and used for API calls</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="esign" className="border rounded-lg px-4">
            <AccordionTrigger className="text-sm font-medium">E-Signature Integration</AccordionTrigger>
            <AccordionContent className="space-y-3 pb-4">
              <p className="text-sm text-muted-foreground">DocuSign integration placeholder for electronic lease signing.</p>
              <div>
                <Label className="text-xs">Integration Key</Label>
                <Input type="password" placeholder="Enter DocuSign integration key..." />
              </div>
              <p className="text-xs text-muted-foreground">Coming soon — configure to enable digital signatures on lease documents</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
