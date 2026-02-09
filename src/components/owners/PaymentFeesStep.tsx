import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Landmark, Calculator, ShieldCheck, Info } from 'lucide-react';
import { MOCK_PROPERTIES } from '@/hooks/useOwners';
import type {
  PaymentSetup,
  PayoutMethod,
  PayoutFrequency,
  PayoutAccountType,
  ManagementFeeType,
  ManagementFeeApplyTo,
} from '@/types/owner';

interface PaymentFeesStepProps {
  data: PaymentSetup;
  linkedPropertyIds: string[];
  onChange: (data: Partial<PaymentSetup>) => void;
  errors: Record<string, string>;
}

const PAYOUT_DAYS = [
  '1st', '5th', '10th', '15th', '20th', '25th', 'End of month',
];

function FeePreview({ feeType, feeValue }: { feeType: ManagementFeeType; feeValue: number | '' }) {
  if (!feeValue || feeValue <= 0) return null;

  if (feeType === 'percentage') {
    const rent = 2000;
    const fee = (rent * Number(feeValue)) / 100;
    const net = rent - fee;
    return (
      <div className="p-3 rounded-lg bg-accent/50 border border-border/50 text-sm text-muted-foreground flex items-start gap-2">
        <Calculator className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
        <span>
          Example: On <strong>${rent.toLocaleString()}</strong> monthly rent →{' '}
          <strong>${fee.toFixed(0)}</strong> fee ({feeValue}%) deducted → Owner receives{' '}
          <strong>${net.toFixed(0)}</strong>.
        </span>
      </div>
    );
  }

  if (feeType === 'flat_monthly') {
    return (
      <div className="p-3 rounded-lg bg-accent/50 border border-border/50 text-sm text-muted-foreground flex items-start gap-2">
        <Calculator className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
        <span>
          A flat fee of <strong>${Number(feeValue).toLocaleString()}</strong> will be deducted each
          month before disbursement.
        </span>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-lg bg-accent/50 border border-border/50 text-sm text-muted-foreground flex items-start gap-2">
      <Calculator className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
      <span>
        A flat fee of <strong>${Number(feeValue).toLocaleString()}</strong> per property will be
        deducted each month.
      </span>
    </div>
  );
}

export default function PaymentFeesStep({
  data,
  linkedPropertyIds,
  onChange,
  errors,
}: PaymentFeesStepProps) {
  const linkedProperties = MOCK_PROPERTIES.filter((p) => linkedPropertyIds.includes(p.id));

  const toggleFeeProperty = (id: string) => {
    const current = data.managementFeePropertyIds;
    onChange({
      managementFeePropertyIds: current.includes(id)
        ? current.filter((pid) => pid !== id)
        : [...current, id],
    });
  };

  return (
    <div className="space-y-8">
      {/* ─── Payout Method ─── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Landmark className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold text-foreground">Payout Method</h3>
        </div>
        <p className="text-sm text-muted-foreground -mt-2">
          How the owner receives distributions.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Method *</Label>
            <Select
              value={data.payoutMethod}
              onValueChange={(v) => onChange({ payoutMethod: v as PayoutMethod })}
            >
              <SelectTrigger className={errors.payoutMethod ? 'border-destructive' : ''}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="ach">ACH / Bank Transfer</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="wire">Wire Transfer</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.payoutMethod && (
              <p className="text-sm text-destructive-foreground">{errors.payoutMethod}</p>
            )}
          </div>

          {data.payoutMethod === 'other' && (
            <div className="space-y-2">
              <Label>Specify Method *</Label>
              <Input
                value={data.payoutMethodOther}
                onChange={(e) => onChange({ payoutMethodOther: e.target.value })}
                placeholder="e.g. PayPal, Zelle"
                className={errors.payoutMethodOther ? 'border-destructive' : ''}
              />
              {errors.payoutMethodOther && (
                <p className="text-sm text-destructive-foreground">{errors.payoutMethodOther}</p>
              )}
            </div>
          )}
        </div>

        {/* ACH Bank Details */}
        {data.payoutMethod === 'ach' && (
          <div className="space-y-4 p-4 rounded-lg border border-border/50 bg-card">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-secondary" />
              Data will be encrypted and stored securely.
            </div>

            <div className="space-y-2">
              <Label>Bank Name *</Label>
              <Input
                value={data.bankName}
                onChange={(e) => onChange({ bankName: e.target.value })}
                placeholder="Chase, Wells Fargo, etc."
                className={errors.bankName ? 'border-destructive' : ''}
              />
              {errors.bankName && (
                <p className="text-sm text-destructive-foreground">{errors.bankName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Account Number *</Label>
                <Input
                  type="password"
                  value={data.accountNumber}
                  onChange={(e) => onChange({ accountNumber: e.target.value })}
                  placeholder="••••••••"
                  className={errors.accountNumber ? 'border-destructive' : ''}
                />
                {errors.accountNumber && (
                  <p className="text-sm text-destructive-foreground">{errors.accountNumber}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Routing Number *</Label>
                <Input
                  type="password"
                  value={data.routingNumber}
                  onChange={(e) => onChange({ routingNumber: e.target.value })}
                  placeholder="•••••••••"
                  className={errors.routingNumber ? 'border-destructive' : ''}
                />
                {errors.routingNumber && (
                  <p className="text-sm text-destructive-foreground">{errors.routingNumber}</p>
                )}
              </div>
            </div>

            <div className="space-y-2 max-w-xs">
              <Label>Account Type</Label>
              <Select
                value={data.accountType}
                onValueChange={(v) => onChange({ accountType: v as PayoutAccountType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="checking">Checking</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </section>

      {/* ─── Payout Frequency ─── */}
      <section className="space-y-4">
        <Label className="text-base font-semibold text-foreground">Payout Frequency</Label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select
              value={data.payoutFrequency}
              onValueChange={(v) => onChange({ payoutFrequency: v as PayoutFrequency })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="on-demand">On-Demand / Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(data.payoutFrequency === 'monthly' || data.payoutFrequency === 'quarterly') && (
            <div className="space-y-2">
              <Label>Preferred Day</Label>
              <Select
                value={data.payoutDay}
                onValueChange={(v) => onChange({ payoutDay: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {PAYOUT_DAYS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </section>

      {/* ─── Management Fees ─── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold text-foreground">Management Fees</h3>
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card">
          <div className="space-y-0.5">
            <Label className="cursor-pointer" htmlFor="fee-toggle">
              Enable Auto-Deduction of Management Fees
            </Label>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="h-3 w-3" />
              Fees will be automatically deducted from rental income before owner disbursement.
            </p>
          </div>
          <Switch
            id="fee-toggle"
            checked={data.managementFeeEnabled}
            onCheckedChange={(checked) => onChange({ managementFeeEnabled: checked })}
          />
        </div>

        {data.managementFeeEnabled && (
          <div className="space-y-5 p-4 rounded-lg border border-border/50 bg-card animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fee Structure *</Label>
                <Select
                  value={data.managementFeeType}
                  onValueChange={(v) => onChange({ managementFeeType: v as ManagementFeeType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="percentage">Percentage of Gross Income</SelectItem>
                    <SelectItem value="flat_monthly">Flat Fee per Month</SelectItem>
                    <SelectItem value="flat_per_property">Flat Fee per Property</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  {data.managementFeeType === 'percentage' ? 'Percentage (%) *' : 'Amount ($) *'}
                </Label>
                <Input
                  type="number"
                  min={0}
                  step={data.managementFeeType === 'percentage' ? '0.5' : '1'}
                  value={data.managementFeeValue}
                  onChange={(e) =>
                    onChange({
                      managementFeeValue: e.target.value === '' ? '' : Number(e.target.value),
                    })
                  }
                  placeholder={data.managementFeeType === 'percentage' ? 'e.g. 8' : 'e.g. 150'}
                  className={errors.managementFeeValue ? 'border-destructive' : ''}
                />
                {errors.managementFeeValue && (
                  <p className="text-sm text-destructive-foreground">{errors.managementFeeValue}</p>
                )}
              </div>
            </div>

            {data.managementFeeType === 'percentage' && (
              <div className="space-y-2 max-w-xs">
                <Label>Minimum Fee ($)</Label>
                <Input
                  type="number"
                  min={0}
                  value={data.managementFeeMinimum}
                  onChange={(e) =>
                    onChange({
                      managementFeeMinimum: e.target.value === '' ? '' : Number(e.target.value),
                    })
                  }
                  placeholder="e.g. 50 (optional)"
                />
                <p className="text-xs text-muted-foreground">
                  Ensures a minimum amount is deducted even if the percentage yields less.
                </p>
              </div>
            )}

            {/* Apply To */}
            <div className="space-y-3">
              <Label>Apply To</Label>
              <Select
                value={data.managementFeeApplyTo}
                onValueChange={(v) => onChange({ managementFeeApplyTo: v as ManagementFeeApplyTo })}
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="all">All Linked Properties</SelectItem>
                  <SelectItem value="specific">Specific Properties</SelectItem>
                </SelectContent>
              </Select>

              {data.managementFeeApplyTo === 'specific' && (
                <div className="space-y-2">
                  {linkedProperties.length === 0 ? (
                    <p className="text-sm text-warning-foreground bg-warning/20 p-2 rounded-md">
                      No linked properties. Link properties in the previous step first.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
                      {linkedProperties.map((prop) => (
                        <label
                          key={prop.id}
                          className="flex items-center gap-2 p-2 rounded-lg border border-border/50 bg-background cursor-pointer hover:bg-accent transition-colors"
                        >
                          <Checkbox
                            checked={data.managementFeePropertyIds.includes(prop.id)}
                            onCheckedChange={() => toggleFeeProperty(prop.id)}
                          />
                          <span className="text-sm">{prop.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea
                value={data.managementFeeNotes}
                onChange={(e) => onChange({ managementFeeNotes: e.target.value })}
                placeholder="Any custom fee rules, per-transaction fees, or special arrangements..."
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Fee Preview */}
            <FeePreview feeType={data.managementFeeType} feeValue={data.managementFeeValue} />
          </div>
        )}
      </section>
    </div>
  );
}