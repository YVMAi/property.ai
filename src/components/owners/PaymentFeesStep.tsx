import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Landmark, Calculator, ShieldCheck, Info, Zap, ClipboardList } from 'lucide-react';
import { MOCK_PROPERTIES } from '@/hooks/useOwners';
import type {
  PaymentSetup,
  PayoutMethod,
  PayoutFrequency,
  PayoutAccountType,
  ManagementFeeType,
  ManagementFeeApplyTo,
  OwnerAgreement,
} from '@/types/owner';

interface PaymentFeesStepProps {
  data: PaymentSetup;
  linkedPropertyIds: string[];
  agreements: (Omit<OwnerAgreement, 'id'> & { id?: string })[];
  onChange: (data: Partial<PaymentSetup>) => void;
  errors: Record<string, string>;
}

const PAYOUT_DAYS = [
  '1st', '5th', '10th', '15th', '20th', '25th', 'End of month',
];

function AgreementFeePreview({
  agreements,
  linkedPropertyIds,
}: {
  agreements: PaymentFeesStepProps['agreements'];
  linkedPropertyIds: string[];
}) {
  const linkedProps = MOCK_PROPERTIES.filter((p) => linkedPropertyIds.includes(p.id));
  if (linkedProps.length === 0 || agreements.length === 0) return null;

  const hasAnyFee = agreements.some((a) => a.feePerUnit || a.feePercentRent);
  if (!hasAnyFee) return null;

  let totalFees = 0;
  let totalRent = 0;

  linkedProps.forEach((prop) => {
    const propAgreement = agreements.find((a) => a.propertyId === prop.id) || agreements.find((a) => !a.propertyId);
    if (!propAgreement) return;

    const unitFee = Number(propAgreement.feePerUnit) || 0;
    const percentFee = Number(propAgreement.feePercentRent) || 0;
    const propRent = prop.units * prop.rent;

    totalRent += propRent;
    totalFees += (unitFee * prop.units) + (propRent * percentFee / 100);
  });

  const netAmount = totalRent - totalFees;

  return (
    <div className="p-3 rounded-lg bg-accent/50 border border-border/50 text-sm text-muted-foreground flex items-start gap-2">
      <Calculator className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
      <span>
        Example: On <strong>{linkedProps.length}</strong> propert{linkedProps.length === 1 ? 'y' : 'ies'} with{' '}
        <strong>${totalRent.toLocaleString()}</strong> total rent → <strong>${totalFees.toFixed(0)}</strong> fees
        (per-unit + % of rent) deducted → Owner receives <strong>${netAmount.toFixed(0)}</strong>.
      </span>
    </div>
  );
}

export default function PaymentFeesStep({
  data,
  linkedPropertyIds,
  agreements,
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
      {/* ─── Auto-Pay ─── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold text-foreground">Auto-Pay</h3>
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card">
          <div className="space-y-0.5">
            <Label className="cursor-pointer" htmlFor="autopay-toggle">
              Enable Auto-Pay for Owner Disbursements
            </Label>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="h-3 w-3" />
              {data.autoPayEnabled
                ? 'Payouts will be processed automatically based on frequency.'
                : 'Manual tasks will be created for each payout due date.'}
            </p>
          </div>
          <Switch
            id="autopay-toggle"
            checked={data.autoPayEnabled}
            onCheckedChange={(checked) => onChange({ autoPayEnabled: checked })}
          />
        </div>

        {!data.autoPayEnabled && (
          <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 text-sm flex items-start gap-2 animate-fade-in">
            <ClipboardList className="h-4 w-4 mt-0.5 shrink-0 text-warning-foreground" />
            <span className="text-warning-foreground">
              With auto-pay disabled, a task will be auto-created in the Tasks section on each payout due date:
              &quot;Process Manual Payment for [Owner] - [Amount]&quot;.
            </span>
          </div>
        )}
      </section>

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
            <SearchableSelect
              options={[
                { value: 'ach', label: 'ACH / Bank Transfer' },
                { value: 'check', label: 'Check' },
                { value: 'wire', label: 'Wire Transfer' },
                { value: 'other', label: 'Other' },
              ]}
              value={data.payoutMethod}
              onValueChange={(v) => onChange({ payoutMethod: v as PayoutMethod })}
              triggerClassName={errors.payoutMethod ? 'border-destructive' : ''}
            />
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
              <SearchableSelect
                options={[
                  { value: 'checking', label: 'Checking' },
                  { value: 'savings', label: 'Savings' },
                ]}
                value={data.accountType}
                onValueChange={(v) => onChange({ accountType: v as PayoutAccountType })}
              />
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
            <SearchableSelect
              options={[
                { value: 'monthly', label: 'Monthly' },
                { value: 'bi-weekly', label: 'Bi-weekly' },
                { value: 'quarterly', label: 'Quarterly' },
                { value: 'on-demand', label: 'On-Demand / Manual' },
              ]}
              value={data.payoutFrequency}
              onValueChange={(v) => onChange({ payoutFrequency: v as PayoutFrequency })}
            />
          </div>

          {(data.payoutFrequency === 'monthly' || data.payoutFrequency === 'quarterly') && (
            <div className="space-y-2">
              <Label>Preferred Day</Label>
              <SearchableSelect
                options={PAYOUT_DAYS.map((d) => ({ value: d, label: d }))}
                value={data.payoutDay}
                onValueChange={(v) => onChange({ payoutDay: v })}
                placeholder="Select day"
              />
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
                <SearchableSelect
                  options={[
                    { value: 'percentage', label: 'Percentage of Gross Income' },
                    { value: 'flat_monthly', label: 'Flat Fee per Month' },
                    { value: 'flat_per_property', label: 'Flat Fee per Property' },
                  ]}
                  value={data.managementFeeType}
                  onValueChange={(v) => onChange({ managementFeeType: v as ManagementFeeType })}
                />
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
                    onChange({ managementFeeValue: e.target.value === '' ? '' : Number(e.target.value) })
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
                    onChange({ managementFeeMinimum: e.target.value === '' ? '' : Number(e.target.value) })
                  }
                  placeholder="e.g. 50 (optional)"
                />
                <p className="text-xs text-muted-foreground">
                  Ensures a minimum amount is deducted even if the percentage yields less.
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Label>Apply To</Label>
              <SearchableSelect
                options={[
                  { value: 'all', label: 'All Linked Properties' },
                  { value: 'specific', label: 'Specific Properties' },
                ]}
                value={data.managementFeeApplyTo}
                onValueChange={(v) => onChange({ managementFeeApplyTo: v as ManagementFeeApplyTo })}
                triggerClassName="max-w-xs"
              />

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
          </div>
        )}

        {/* Agreement-Based Fee Preview */}
        <AgreementFeePreview agreements={agreements} linkedPropertyIds={linkedPropertyIds} />
      </section>
    </div>
  );
}
