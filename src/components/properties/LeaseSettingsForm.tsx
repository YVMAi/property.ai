import { useRef } from 'react';
import { Bell, DollarSign, FileText, Upload, X, Eye, RefreshCw, TrendingUp, PawPrint, Car, ClipboardCheck, ScrollText, ShieldCheck, BarChart3, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';
import type { LeaseSettings, ReminderTiming } from '@/types/leaseSettings';

interface LeaseSettingsFormProps {
  settings: LeaseSettings;
  onChange: (settings: LeaseSettings) => void;
  showHistory?: boolean;
}

export default function LeaseSettingsForm({ settings, onChange, showHistory }: LeaseSettingsFormProps) {
  const [previewDoc, setPreviewDoc] = useState<{ name: string; url: string } | null>(null);
  const leaseTemplateRef = useRef<HTMLInputElement>(null);
  const renewalTemplateRef = useRef<HTMLInputElement>(null);
  const inspectionTemplateRef = useRef<HTMLInputElement>(null);

  const update = <K extends keyof LeaseSettings>(key: K, val: LeaseSettings[K]) => {
    onChange({ ...settings, [key]: val });
  };

  const addReminderTiming = () => {
    const id = Math.random().toString(36).substring(2, 9);
    update('reminderTimings', [...settings.reminderTimings, { id, daysOffset: -3 }]);
  };

  const updateReminderTiming = (id: string, daysOffset: number) => {
    update('reminderTimings', settings.reminderTimings.map(t => t.id === id ? { ...t, daysOffset } : t));
  };

  const removeReminderTiming = (id: string) => {
    update('reminderTimings', settings.reminderTimings.filter(t => t.id !== id));
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    urlKey: 'standardLeaseTemplateURL' | 'standardRenewalTemplateURL' | 'inspectionTemplateURL',
    nameKey: 'standardLeaseTemplateName' | 'standardRenewalTemplateName' | 'inspectionTemplateName'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange({ ...settings, [urlKey]: url, [nameKey]: file.name });
  };

  const toggleChannel = (channel: 'email' | 'sms' | 'push') => {
    const channels = settings.reminderChannels.includes(channel)
      ? settings.reminderChannels.filter(c => c !== channel)
      : [...settings.reminderChannels, channel];
    update('reminderChannels', channels);
  };

  const formatDaysOffset = (d: number) => {
    if (d < 0) return `${Math.abs(d)} days before due`;
    if (d === 0) return 'On due date';
    return `${d} days after due`;
  };

  return (
    <div className="space-y-4">
      {/* Invoice Generation */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            Invoice Generation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs">
            <Label>Days Before Due to Auto-Generate Invoice</Label>
            <Input
              type="number"
              min={1}
              value={settings.invoiceGenDaysBefore}
              onChange={(e) => update('invoiceGenDaysBefore', Math.max(1, Number(e.target.value) || 1))}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">Invoices will be auto-generated this many days before the rent due date.</p>
          </div>
        </CardContent>
      </Card>

      {/* Reminder Notifications */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Reminder Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable Tenant Reminders</Label>
            <Switch checked={settings.remindersEnabled} onCheckedChange={(v) => update('remindersEnabled', v)} />
          </div>

          {settings.remindersEnabled && (
            <div className="space-y-4 pl-1">
              <div>
                <Label className="text-sm mb-2 block">Channels</Label>
                <div className="flex flex-wrap gap-3">
                  {(['email', 'sms', 'push'] as const).map(ch => (
                    <label key={ch} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox checked={settings.reminderChannels.includes(ch)} onCheckedChange={() => toggleChannel(ch)} />
                      <span className="text-sm capitalize">{ch === 'push' ? 'App Push' : ch.toUpperCase()}</span>
                    </label>
                  ))}
                </div>
                {settings.remindersEnabled && settings.reminderChannels.length === 0 && (
                  <p className="text-xs text-destructive mt-1">Select at least one channel</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm">Timing Schedule</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addReminderTiming} className="gap-1 h-7 text-xs">
                    <Plus className="h-3 w-3" /> Add Timing
                  </Button>
                </div>
                {settings.reminderTimings.length === 0 && (
                  <p className="text-xs text-muted-foreground">No timings configured. Add at least one.</p>
                )}
                <div className="space-y-2">
                  {settings.reminderTimings.map(t => (
                    <div key={t.id} className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={t.daysOffset}
                        onChange={(e) => updateReminderTiming(t.id, Number(e.target.value))}
                        className="w-20 h-8 text-sm"
                      />
                      <span className="text-xs text-muted-foreground flex-1">{formatDaysOffset(t.daysOffset)}</span>
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeReminderTiming(t.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">Escalate to Owner if Unpaid</Label>
                <Switch checked={settings.reminderEscalationEnabled} onCheckedChange={(v) => update('reminderEscalationEnabled', v)} />
              </div>
              {settings.reminderEscalationEnabled && (
                <div className="max-w-xs">
                  <Label className="text-xs">Notify Owner After (Days Unpaid)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={settings.reminderEscalationDays}
                    onChange={(e) => update('reminderEscalationDays', Math.max(1, Number(e.target.value) || 1))}
                    className="mt-1 h-8"
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Standard Late Fees */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-destructive" />
            Standard Late Fees
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Apply Default Late Fees</Label>
            <Switch checked={settings.lateFeesDefaultEnabled} onCheckedChange={(v) => update('lateFeesDefaultEnabled', v)} />
          </div>

          {settings.lateFeesDefaultEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-1">
              <div>
                <Label className="text-sm">Type</Label>
                <Select value={settings.lateFeeType} onValueChange={(v) => update('lateFeeType', v as any)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">% of Rent</SelectItem>
                    <SelectItem value="flat">Flat Fee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Value {settings.lateFeeType === 'percent' ? '(%)' : '($)'}</Label>
                <Input
                  type="number"
                  min={0}
                  value={settings.lateFeeValue}
                  onChange={(e) => update('lateFeeValue', e.target.value ? Number(e.target.value) : '')}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Grace Period (Days)</Label>
                <Input
                  type="number"
                  min={0}
                  value={settings.lateGraceDays}
                  onChange={(e) => update('lateGraceDays', e.target.value ? Number(e.target.value) : '')}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Apply After (Days Late)</Label>
                <Input
                  type="number"
                  min={0}
                  value={settings.lateApplyAfterDays}
                  onChange={(e) => update('lateApplyAfterDays', e.target.value ? Number(e.target.value) : '')}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Max Cap ($, optional)</Label>
                <Input
                  type="number"
                  min={0}
                  value={settings.lateMaxCap}
                  onChange={(e) => update('lateMaxCap', e.target.value ? Number(e.target.value) : '')}
                  className="mt-1"
                  placeholder="No cap"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Standard Renewal Fees */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-primary" />
            Standard Renewal Fees
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Apply Default Renewal Fees</Label>
            <Switch checked={settings.renewalFeesDefaultEnabled} onCheckedChange={(v) => update('renewalFeesDefaultEnabled', v)} />
          </div>

          {settings.renewalFeesDefaultEnabled && (
            <div className="space-y-3 pl-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Type</Label>
                  <Select value={settings.renewalFeeType} onValueChange={(v) => update('renewalFeeType', v as any)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                      <SelectItem value="percent">% of Rent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Value {settings.renewalFeeType === 'percent' ? '(%)' : '($)'}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={settings.renewalFeeValue}
                    onChange={(e) => update('renewalFeeValue', e.target.value ? Number(e.target.value) : '')}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm">Apply On</Label>
                <Select value={settings.renewalApplyOn} onValueChange={(v) => update('renewalApplyOn', v as any)}>
                  <SelectTrigger className="mt-1 max-w-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="renewal_date">Renewal Date</SelectItem>
                    <SelectItem value="anniversary">Anniversary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Waive Conditions</Label>
                <Textarea
                  value={settings.renewalWaiveConditions}
                  onChange={(e) => update('renewalWaiveConditions', e.target.value)}
                  placeholder="e.g. Waive for tenants >12 months"
                  className="mt-1"
                  rows={2}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lease & Renewal Templates */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Standard Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Lease Template */}
          <div>
            <Label className="text-sm">Standard Lease Template</Label>
            <p className="text-xs text-muted-foreground mb-2">Placeholders like [TenantName], [RentAmount] will be replaced on generation.</p>
            {settings.standardLeaseTemplateName ? (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm truncate flex-1">{settings.standardLeaseTemplateName}</span>
                <Button type="button" variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setPreviewDoc({ name: settings.standardLeaseTemplateName, url: settings.standardLeaseTemplateURL })}>
                  <Eye className="h-3 w-3" /> Preview
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => { update('standardLeaseTemplateURL', ''); update('standardLeaseTemplateName', ''); }}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors border-border hover:border-primary/50"
                onClick={() => leaseTemplateRef.current?.click()}
              >
                <Upload className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                <p className="text-sm text-muted-foreground">Upload Lease Template (PDF/DOC)</p>
                <input ref={leaseTemplateRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => handleFileUpload(e, 'standardLeaseTemplateURL', 'standardLeaseTemplateName')} />
              </div>
            )}
          </div>

          {/* Renewal Template */}
          <div>
            <Label className="text-sm">Standard Renewal Template</Label>
            {settings.standardRenewalTemplateName ? (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 mt-1">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm truncate flex-1">{settings.standardRenewalTemplateName}</span>
                <Button type="button" variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setPreviewDoc({ name: settings.standardRenewalTemplateName, url: settings.standardRenewalTemplateURL })}>
                  <Eye className="h-3 w-3" /> Preview
                </Button>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => { update('standardRenewalTemplateURL', ''); update('standardRenewalTemplateName', ''); }}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors border-border hover:border-primary/50 mt-1"
                onClick={() => renewalTemplateRef.current?.click()}
              >
                <Upload className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                <p className="text-sm text-muted-foreground">Upload Renewal Template (PDF/DOC)</p>
                <input ref={renewalTemplateRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => handleFileUpload(e, 'standardRenewalTemplateURL', 'standardRenewalTemplateName')} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expanded Settings */}
      <Accordion type="multiple" className="space-y-2">
        {/* Auto-Renewal */}
        <AccordionItem value="auto-renewal" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-medium gap-2">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-primary" />
              Auto-Renewal Default
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pb-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Enable Auto-Renewal by Default</Label>
              <Switch checked={settings.autoRenewDefault} onCheckedChange={(v) => update('autoRenewDefault', v)} />
            </div>
            {settings.autoRenewDefault && (
              <div className="max-w-xs">
                <Label className="text-sm">Notice Period for Cancellation (Days)</Label>
                <Input
                  type="number"
                  min={1}
                  value={settings.autoRenewNoticeDays}
                  onChange={(e) => update('autoRenewNoticeDays', e.target.value ? Number(e.target.value) : '')}
                  className="mt-1"
                />
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Escalation */}
        <AccordionItem value="escalation" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-medium gap-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Escalation Default
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pb-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Enable Escalation by Default</Label>
              <Switch checked={settings.escalationDefaultEnabled} onCheckedChange={(v) => update('escalationDefaultEnabled', v)} />
            </div>
            {settings.escalationDefaultEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-sm">Type</Label>
                  <Select value={settings.escalationType} onValueChange={(v) => update('escalationType', v as any)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">% Annual</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Value {settings.escalationType === 'percent' ? '(%)' : '($)'}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={settings.escalationValue}
                    onChange={(e) => update('escalationValue', e.target.value ? Number(e.target.value) : '')}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">Start After (Months)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={settings.escalationStartAfterMonths}
                    onChange={(e) => update('escalationStartAfterMonths', e.target.value ? Number(e.target.value) : '')}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Pet Policy */}
        <AccordionItem value="pet-policy" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-medium gap-2">
            <div className="flex items-center gap-2">
              <PawPrint className="h-4 w-4 text-primary" />
              Pet Policy Default
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pb-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Pets Allowed</Label>
              <Switch checked={settings.petsAllowedDefault} onCheckedChange={(v) => update('petsAllowedDefault', v)} />
            </div>
            {settings.petsAllowedDefault && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Pet Fee ($)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={settings.petFee}
                      onChange={(e) => update('petFee', e.target.value ? Number(e.target.value) : '')}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Frequency</Label>
                    <Select value={settings.petFeeFrequency} onValueChange={(v) => update('petFeeFrequency', v as any)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one_time">One-Time</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-sm">Restrictions</Label>
                  <Textarea
                    value={settings.petRestrictions}
                    onChange={(e) => update('petRestrictions', e.target.value)}
                    placeholder="e.g. Max 2, under 50lbs"
                    className="mt-1"
                    rows={2}
                  />
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Parking / Utilities */}
        <AccordionItem value="parking-utilities" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-medium gap-2">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-primary" />
              Parking & Utilities Defaults
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Assigned Parking Spots</Label>
                <Input
                  type="number"
                  min={0}
                  value={settings.parkingSpots}
                  onChange={(e) => update('parkingSpots', e.target.value ? Number(e.target.value) : '')}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">Parking Fee ($)</Label>
                <Input
                  type="number"
                  min={0}
                  value={settings.parkingFee}
                  onChange={(e) => update('parkingFee', e.target.value ? Number(e.target.value) : '')}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm">Utilities Responsibility</Label>
              <Select value={settings.utilitiesResponsibility} onValueChange={(v) => update('utilitiesResponsibility', v as any)}>
                <SelectTrigger className="mt-1 max-w-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tenant">Tenant</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="included">Included in Rent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Inspection */}
        <AccordionItem value="inspection" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-medium gap-2">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-primary" />
              Inspection Defaults
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pb-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Move-In/Out Inspection Required</Label>
              <Switch checked={settings.inspectionRequired} onCheckedChange={(v) => update('inspectionRequired', v)} />
            </div>
            <div>
              <Label className="text-sm">Inspection Checklist Template</Label>
              {settings.inspectionTemplateName ? (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 mt-1">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm truncate flex-1">{settings.inspectionTemplateName}</span>
                  <Button type="button" variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setPreviewDoc({ name: settings.inspectionTemplateName, url: settings.inspectionTemplateURL })}>
                    <Eye className="h-3 w-3" /> Preview
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => { update('inspectionTemplateURL', ''); update('inspectionTemplateName', ''); }}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors border-border hover:border-primary/50 mt-1"
                  onClick={() => inspectionTemplateRef.current?.click()}
                >
                  <Upload className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                  <p className="text-sm text-muted-foreground">Upload Checklist Template (PDF)</p>
                  <input ref={inspectionTemplateRef} type="file" accept=".pdf" className="hidden" onChange={(e) => handleFileUpload(e, 'inspectionTemplateURL', 'inspectionTemplateName')} />
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Custom Rules */}
        <AccordionItem value="custom-rules" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-medium gap-2">
            <div className="flex items-center gap-2">
              <ScrollText className="h-4 w-4 text-primary" />
              Custom Rules
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <Label className="text-sm">Boilerplate Clauses</Label>
            <p className="text-xs text-muted-foreground mb-2">These clauses will be appended to all generated leases.</p>
            <Textarea
              value={settings.customRulesBoilerplate}
              onChange={(e) => update('customRulesBoilerplate', e.target.value)}
              placeholder="e.g. No smoking policy. Quiet hours 10pm-8am."
              rows={4}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Approval Workflow */}
        <AccordionItem value="approval" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-medium gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Approval Workflow
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Require Owner Approval for Non-Standard Leases</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Leases deviating from defaults will trigger an owner notification.</p>
              </div>
              <Switch checked={settings.requireOwnerApprovalNonStandard} onCheckedChange={(v) => update('requireOwnerApprovalNonStandard', v)} />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Reporting */}
        <AccordionItem value="reporting" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-medium gap-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Reporting Defaults
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="max-w-xs">
              <Label className="text-sm">Notify on Expiration (Months Before End)</Label>
              <Input
                type="number"
                min={1}
                value={settings.expirationNotifyMonthsBefore}
                onChange={(e) => update('expirationNotifyMonthsBefore', e.target.value ? Number(e.target.value) : '')}
                className="mt-1"
                placeholder="e.g. 3"
              />
              <p className="text-xs text-muted-foreground mt-1">Notify PM & Owner this many months before lease expiration.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Change History */}
      {showHistory && settings.settingsHistory.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Change History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {settings.settingsHistory.slice().reverse().map((h, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div>
                    <p className="font-medium">{h.changeSummary}</p>
                    <p className="text-xs text-muted-foreground">{h.user} · {new Date(h.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Preview Modal */}
      <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              {previewDoc?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center min-h-[400px] bg-muted/30 rounded-lg">
            {previewDoc?.url ? (
              <iframe src={previewDoc.url} className="w-full h-[60vh] rounded-lg" title="Document Preview" />
            ) : (
              <p className="text-muted-foreground text-sm">Preview not available</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
