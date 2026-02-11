import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Trash2, ChevronDown, ChevronUp, Calendar as CalendarIcon,
  FileText, Upload, X, ExternalLink, Building2,
} from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useTenantsContext } from '@/contexts/TenantsContext';
import { getTenantDisplayName } from '@/types/tenant';
import {
  LEASE_TYPE_LABELS,
  ADDITIONAL_FEE_TYPES,
  type LeaseFormData,
  type AdditionalFeeFrequency,
  emptyLeaseForm,
} from '@/types/lease';

interface LeaseCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leasableLabel?: string;
  unitId?: string;
  onSave: (data: LeaseFormData) => void;
  /** When true, shows property/unit selectors inside the modal */
  showPropertySelector?: boolean;
  propertyOptions?: { value: string; label: string }[];
  onPropertySelect?: (propertyId: string) => void;
  selectedPropertyId?: string;
  unitOptions?: { value: string; label: string }[];
  onUnitSelect?: (unitId: string) => void;
  selectedUnitId?: string;
}

const EVICTION_GROUNDS = ['Non-Payment', 'Lease Breach', 'Criminal Activity', 'Other'];

export default function LeaseCreationModal({
  open,
  onOpenChange,
  leasableLabel,
  unitId,
  onSave,
  showPropertySelector = false,
  propertyOptions = [],
  onPropertySelect,
  selectedPropertyId,
  unitOptions = [],
  onUnitSelect,
  selectedUnitId,
}: LeaseCreationModalProps) {
  const navigate = useNavigate();
  const { activeTenants } = useTenantsContext();
  const [form, setForm] = useState<LeaseFormData>({ ...emptyLeaseForm });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const set = <K extends keyof LeaseFormData>(key: K, val: LeaseFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const tenantOptions = useMemo(
    () => activeTenants.map((t) => ({ value: t.id, label: getTenantDisplayName(t) })),
    [activeTenants]
  );

  const addFee = () => {
    set('additionalFees', [
      ...form.additionalFees,
      { type: 'Utilities', amount: 0, frequency: 'monthly' as AdditionalFeeFrequency },
    ]);
  };

  const removeFee = (idx: number) =>
    set('additionalFees', form.additionalFees.filter((_, i) => i !== idx));

  const updateFee = (idx: number, field: string, val: any) =>
    set(
      'additionalFees',
      form.additionalFees.map((f, i) => (i === idx ? { ...f, [field]: val } : f))
    );

  const toggleEvictionGround = (ground: string) => {
    set(
      'evictionGrounds',
      form.evictionGrounds.includes(ground)
        ? form.evictionGrounds.filter((g) => g !== ground)
        : [...form.evictionGrounds, ground]
    );
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (showPropertySelector && !selectedPropertyId) errs.property = 'Select a property';
    if (showPropertySelector && !selectedUnitId) errs.unit = 'Select a unit';
    if (!form.tenantId) errs.tenantId = 'Select a tenant';
    if (!form.startDate) errs.startDate = 'Start date required';
    if (!form.endDate) errs.endDate = 'End date required';
    if (form.startDate && form.endDate && form.endDate <= form.startDate)
      errs.endDate = 'End date must be after start';
    if (!form.rent || Number(form.rent) <= 0) errs.rent = 'Enter a valid rent';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(form);
    setForm({ ...emptyLeaseForm });
    setErrors({});
    setShowAdvanced(false);
    onOpenChange(false);
  };

  const escalationPreview = useMemo(() => {
    if (!form.escalationEnabled || !form.rent || !form.escalationValue) return null;
    const rent = Number(form.rent);
    const val = Number(form.escalationValue);
    if (form.escalationType === 'percent') {
      return `Year 2 rent = $${rent.toLocaleString()} + ${val}% = $${Math.round(rent * (1 + val / 100)).toLocaleString()}`;
    }
    return `Year 2 rent = $${rent.toLocaleString()} + $${val.toLocaleString()} = $${(rent + val).toLocaleString()}`;
  }, [form.escalationEnabled, form.rent, form.escalationValue, form.escalationType]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Create Lease{leasableLabel ? ` — ${leasableLabel}` : ''}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Property & Unit Selector (for global create) */}
          {showPropertySelector && (
            <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Property & Unit</Label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Property *</Label>
                  <SearchableSelect
                    options={propertyOptions}
                    value={selectedPropertyId || ''}
                    onValueChange={(v) => onPropertySelect?.(v)}
                    placeholder="Search properties..."
                  />
                </div>
                {selectedPropertyId && unitOptions.length > 0 && (
                  <div>
                    <Label className="text-xs">Unit / Leasable Item *</Label>
                    <Select value={selectedUnitId || ''} onValueChange={(v) => onUnitSelect?.(v)}>
                      <SelectTrigger><SelectValue placeholder="Select unit..." /></SelectTrigger>
                      <SelectContent>
                        {unitOptions.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tenant */}
          <div>
            <Label>Tenant *</Label>
            <div className="flex gap-2 mt-1">
              <div className="flex-1">
                <SearchableSelect
                  options={tenantOptions}
                  value={form.tenantId}
                  onValueChange={(v) => set('tenantId', v)}
                  placeholder="Search tenants..."
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1 shrink-0"
                onClick={() => navigate('/users/tenants/new')}
              >
                <Plus className="h-3.5 w-3.5" /> Add New
              </Button>
            </div>
            {errors.tenantId && <p className="text-xs text-destructive mt-1">{errors.tenantId}</p>}
          </div>

          {/* Core terms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Lease Type *</Label>
              <Select value={form.leaseType} onValueChange={(v) => set('leaseType', v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(LEASE_TYPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment Due Day</Label>
              <Select
                value={String(form.paymentDueDay)}
                onValueChange={(v) => set('paymentDueDay', Number(v))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 5, 10, 15, 20, 25, 28].map((d) => (
                    <SelectItem key={d} value={String(d)}>{d === 1 ? '1st' : `${d}th`} of month</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn('w-full justify-start text-left font-normal', !form.startDate && 'text-muted-foreground')}
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {form.startDate ? format(new Date(form.startDate), 'PPP') : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.startDate ? new Date(form.startDate) : undefined}
                    onSelect={(d) => d && set('startDate', format(d, 'yyyy-MM-dd'))}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {errors.startDate && <p className="text-xs text-destructive mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <Label>End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn('w-full justify-start text-left font-normal', !form.endDate && 'text-muted-foreground')}
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {form.endDate ? format(new Date(form.endDate), 'PPP') : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.endDate ? new Date(form.endDate) : undefined}
                    onSelect={(d) => d && set('endDate', format(d, 'yyyy-MM-dd'))}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {errors.endDate && <p className="text-xs text-destructive mt-1">{errors.endDate}</p>}
            </div>
            <div>
              <Label>Rent ($/mo) *</Label>
              <Input
                type="text"
                value={form.rent === '' ? '' : Number(form.rent).toLocaleString()}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9]/g, '');
                  set('rent', cleaned ? Number(cleaned) : '');
                }}
                placeholder="e.g. 1,500"
                inputMode="numeric"
              />
              {errors.rent && <p className="text-xs text-destructive mt-1">{errors.rent}</p>}
            </div>
          </div>

          {/* Escalation */}
          <div className="p-3 rounded-lg border border-border space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Rent Escalation</Label>
              <Switch checked={form.escalationEnabled} onCheckedChange={(v) => set('escalationEnabled', v)} />
            </div>
            {form.escalationEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Type</Label>
                  <Select value={form.escalationType} onValueChange={(v) => set('escalationType', v as any)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percent">Annual % Increase</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Value</Label>
                  <Input
                    className="h-9"
                    type="number"
                    value={form.escalationValue}
                    onChange={(e) => set('escalationValue', e.target.value ? Number(e.target.value) : '')}
                    placeholder={form.escalationType === 'percent' ? '5%' : '$100'}
                  />
                </div>
                <div>
                  <Label className="text-xs">Schedule</Label>
                  <Select value={form.escalationSchedule} onValueChange={(v) => set('escalationSchedule', v as any)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yearly_anniversary">Yearly (Anniversary)</SelectItem>
                      <SelectItem value="specific_date">Specific Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {escalationPreview && (
                  <p className="text-xs text-muted-foreground col-span-full">{escalationPreview}</p>
                )}
              </div>
            )}
          </div>

          {/* Additional Fees */}
          <div className="p-3 rounded-lg border border-border space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Additional Fees</Label>
              <Button type="button" variant="outline" size="sm" className="gap-1 h-7 text-xs" onClick={addFee}>
                <Plus className="h-3 w-3" /> Add Fee
              </Button>
            </div>
            {form.additionalFees.map((fee, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_100px_120px_32px] gap-2 items-end">
                <div>
                  <Label className="text-xs">Type</Label>
                  <Select value={fee.type} onValueChange={(v) => updateFee(idx, 'type', v)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ADDITIONAL_FEE_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Amount</Label>
                  <Input
                    className="h-9"
                    type="number"
                    value={fee.amount || ''}
                    onChange={(e) => updateFee(idx, 'amount', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label className="text-xs">Frequency</Label>
                  <Select value={fee.frequency} onValueChange={(v) => updateFee(idx, 'frequency', v)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one_time">One-Time</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => removeFee(idx)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>

          {/* Security Deposit */}
          <div className="p-3 rounded-lg border border-border space-y-3">
            <Label className="text-sm font-medium">Security Deposit</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Amount ($)</Label>
                <Input
                  className="h-9"
                  type="number"
                  value={form.securityDepositAmount}
                  onChange={(e) => set('securityDepositAmount', e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 2000"
                />
              </div>
              <div>
                <Label className="text-xs">Due Date</Label>
                <Input
                  className="h-9"
                  type="date"
                  value={form.securityDueDate}
                  onChange={(e) => set('securityDueDate', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Refund Terms</Label>
              <Textarea
                className="min-h-[60px]"
                value={form.securityRefundTerms}
                onChange={(e) => set('securityRefundTerms', e.target.value)}
                placeholder="e.g. Full refund less damages within 14 days"
              />
            </div>
          </div>

          {/* Advanced Section (collapsible) */}
          <button
            type="button"
            className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          </button>

          {showAdvanced && (
            <div className="space-y-4">
              {/* Late Fees */}
              <div className="p-3 rounded-lg border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Late Fees</Label>
                  <Switch checked={form.lateFeeEnabled} onCheckedChange={(v) => set('lateFeeEnabled', v)} />
                </div>
                {form.lateFeeEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Type</Label>
                      <Select value={form.lateFeeType} onValueChange={(v) => set('lateFeeType', v as any)}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percent">% of Rent</SelectItem>
                          <SelectItem value="flat">Flat Fee</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Value</Label>
                      <Input className="h-9" type="number" value={form.lateFeeValue} onChange={(e) => set('lateFeeValue', e.target.value ? Number(e.target.value) : '')} />
                    </div>
                    <div>
                      <Label className="text-xs">Grace Period (days)</Label>
                      <Input className="h-9" type="number" value={form.lateGraceDays} onChange={(e) => set('lateGraceDays', e.target.value ? Number(e.target.value) : '')} />
                    </div>
                  </div>
                )}
              </div>

              {/* Eviction */}
              <div className="p-3 rounded-lg border border-border space-y-3">
                <Label className="text-sm font-medium">Eviction Terms</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Notice Period (days)</Label>
                    <Input className="h-9" type="number" value={form.evictionNoticeDays} onChange={(e) => set('evictionNoticeDays', e.target.value ? Number(e.target.value) : '')} />
                  </div>
                  <div>
                    <Label className="text-xs">Grounds</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {EVICTION_GROUNDS.map((g) => (
                        <label key={g} className="flex items-center gap-1.5 text-xs cursor-pointer">
                          <Checkbox
                            checked={form.evictionGrounds.includes(g)}
                            onCheckedChange={() => toggleEvictionGround(g)}
                          />
                          {g}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Auto-Renewal */}
              <div className="p-3 rounded-lg border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Auto-Renewal</Label>
                  <Switch checked={form.autoRenew} onCheckedChange={(v) => set('autoRenew', v)} />
                </div>
                {form.autoRenew && (
                  <div>
                    <Label className="text-xs">Cancellation Notice Period (days)</Label>
                    <Input className="h-9 max-w-[200px]" type="number" value={form.autoRenewNoticeDays} onChange={(e) => set('autoRenewNoticeDays', e.target.value ? Number(e.target.value) : '')} />
                  </div>
                )}
              </div>

              {/* Subletting */}
              <div className="p-3 rounded-lg border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Subletting</Label>
                  <Switch checked={form.sublettingAllowed} onCheckedChange={(v) => set('sublettingAllowed', v)} />
                </div>
                {form.sublettingAllowed && (
                  <Textarea
                    className="min-h-[60px]"
                    value={form.sublettingConditions}
                    onChange={(e) => set('sublettingConditions', e.target.value)}
                    placeholder="Conditions for subletting..."
                  />
                )}
              </div>

              {/* Insurance */}
              <div className="p-3 rounded-lg border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Insurance Requirement</Label>
                  <Switch checked={form.insuranceRequired} onCheckedChange={(v) => set('insuranceRequired', v)} />
                </div>
                {form.insuranceRequired && (
                  <div>
                    <Label className="text-xs">Tenant Liability Amount ($)</Label>
                    <Input className="h-9 max-w-[200px]" type="number" value={form.insuranceAmount} onChange={(e) => set('insuranceAmount', e.target.value ? Number(e.target.value) : '')} />
                  </div>
                )}
              </div>

              {/* Custom Clauses */}
              <div>
                <Label className="text-sm font-medium">Custom Clauses</Label>
                <Textarea
                  className="min-h-[80px] mt-1"
                  value={form.customClauses}
                  onChange={(e) => set('customClauses', e.target.value)}
                  placeholder="Any additional terms or conditions..."
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Create Lease</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
