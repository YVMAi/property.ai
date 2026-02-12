import { DollarSign, Plus, Sparkles, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FEE_TYPE_LABELS, type ListingFee, type ListingFormData } from '@/types/listing';
import { useCurrency } from '@/contexts/CurrencyContext';

interface Props {
  form: Pick<ListingFormData, 'rentalAmount' | 'aiSuggestedRent' | 'securityDeposit' | 'depositDueOn' | 'fees'>;
  errors: Record<string, string>;
  moveInTotal: number;
  onRentChange: (v: number | '') => void;
  onDepositChange: (v: number | '') => void;
  onDepositDueChange: (v: 'move_in' | 'application') => void;
  onSuggestRent: () => void;
  addFee: () => void;
  updateFee: (id: string, data: Partial<ListingFee>) => void;
  removeFee: (id: string) => void;
  readOnly?: boolean;
}

export default function ListingStepRentalFees({
  form, errors, moveInTotal,
  onRentChange, onDepositChange, onDepositDueChange, onSuggestRent,
  addFee, updateFee, removeFee, readOnly,
}: Props) {
  const { formatAmount } = useCurrency();

  return (
    <div className="space-y-6">
      {/* Rental Amount */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          <h3 className="font-medium text-sm">Rental Amount</h3>
        </div>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Label>Monthly Rent <span className="text-destructive">*</span></Label>
            <Input
              type="number"
              placeholder="Enter rent amount"
              value={form.rentalAmount}
              onChange={(e) => onRentChange(e.target.value ? Number(e.target.value) : '')}
              className={errors.rentalAmount ? 'border-destructive' : ''}
              readOnly={readOnly}
            />
            {errors.rentalAmount && <p className="text-xs text-destructive mt-1">{errors.rentalAmount}</p>}
          </div>
          {!readOnly && (
            <Button variant="outline" size="sm" onClick={onSuggestRent} className="gap-1.5 shrink-0 bg-secondary/30 hover:bg-secondary/50 text-secondary-foreground">
              <Sparkles className="h-3.5 w-3.5" /> AI Suggest
            </Button>
          )}
        </div>
        {form.aiSuggestedRent && (
          <div className="p-3 rounded-lg bg-secondary/20 border border-secondary/30 text-sm">
            <span className="font-medium">AI Suggested:</span> {formatAmount(form.aiSuggestedRent)}/mo
            <span className="text-xs text-muted-foreground ml-2">(based on market comps)</span>
          </div>
        )}
      </div>

      {/* Security Deposit */}
      <div className="space-y-3">
        <h3 className="font-medium text-sm">Security Deposit</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Deposit Amount</Label>
            <Input
              type="number"
              placeholder="e.g. 1800"
              value={form.securityDeposit}
              onChange={(e) => onDepositChange(e.target.value ? Number(e.target.value) : '')}
              readOnly={readOnly}
            />
          </div>
          <div>
            <Label>Due On</Label>
            <Select value={form.depositDueOn} onValueChange={(v) => onDepositDueChange(v as 'move_in' | 'application')} disabled={readOnly}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="move_in">At Move-In</SelectItem>
                <SelectItem value="application">With Application</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Additional Fees */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">Additional Fees</h3>
          {!readOnly && (
            <Button variant="outline" size="sm" onClick={addFee} className="gap-1">
              <Plus className="h-3 w-3" /> Add Fee
            </Button>
          )}
        </div>
        {form.fees.length === 0 && (
          <p className="text-sm text-muted-foreground">No additional fees added.</p>
        )}
        {form.fees.map((fee) => (
          <div key={fee.id} className="grid grid-cols-12 gap-2 items-end p-3 rounded-lg border border-border">
            <div className="col-span-3">
              <Label className="text-xs">Type</Label>
              <Select value={fee.type} onValueChange={(v) => updateFee(fee.id, { type: v as ListingFee['type'], label: FEE_TYPE_LABELS[v as ListingFee['type']] })} disabled={readOnly}>
                <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(FEE_TYPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-3">
              <Label className="text-xs">Amount</Label>
              <Input type="number" value={fee.amount || ''} onChange={(e) => updateFee(fee.id, { amount: Number(e.target.value) })} className="text-xs" readOnly={readOnly} />
            </div>
            <div className="col-span-3">
              <Label className="text-xs">Frequency</Label>
              <Select value={fee.frequency} onValueChange={(v) => updateFee(fee.id, { frequency: v as 'one_time' | 'monthly' })} disabled={readOnly}>
                <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="one_time">One-Time</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 flex items-center gap-1">
              <Switch checked={fee.required} onCheckedChange={(v) => updateFee(fee.id, { required: v })} disabled={readOnly} />
              <span className="text-xs text-muted-foreground">Req</span>
            </div>
            {!readOnly && (
              <div className="col-span-1 flex justify-end">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeFee(fee.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Move-In Cost Calculator */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-4">
          <h4 className="text-sm font-medium mb-2">Estimated Move-In Cost</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">First Month Rent</span>
              <span>{formatAmount(Number(form.rentalAmount) || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Security Deposit</span>
              <span>{formatAmount(Number(form.securityDeposit) || 0)}</span>
            </div>
            {form.fees.filter((f) => f.frequency === 'one_time').map((f) => (
              <div key={f.id} className="flex justify-between">
                <span className="text-muted-foreground">{FEE_TYPE_LABELS[f.type]}</span>
                <span>{formatAmount(f.amount)}</span>
              </div>
            ))}
            <div className="flex justify-between font-semibold border-t border-border pt-1 mt-1">
              <span>Total Move-In</span>
              <span>{formatAmount(moveInTotal)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
