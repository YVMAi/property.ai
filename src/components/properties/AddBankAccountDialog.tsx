import { useState } from 'react';
import { Landmark, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ACCOUNT_TYPE_LABELS, type AccountType } from '@/types/bankAccount';
import { useBankAccountsContext } from '@/contexts/BankAccountsContext';
import { useToast } from '@/hooks/use-toast';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (accountId: string) => void;
}

export default function AddBankAccountDialog({ open, onOpenChange, onCreated }: Props) {
  const { addAccount } = useBankAccountsContext();
  const { toast } = useToast();

  const [form, setForm] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    accountType: 'checking' as AccountType,
    nickname: '',
    country: 'US',
    currency: 'USD',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAccount, setShowAccount] = useState(false);
  const [showRouting, setShowRouting] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.accountHolderName.trim()) errs.accountHolderName = 'Required';
    if (!form.bankName.trim()) errs.bankName = 'Required';
    if (!form.accountNumber.trim()) errs.accountNumber = 'Required';
    if (form.accountNumber.length < 4) errs.accountNumber = 'Min 4 digits';
    if (!form.routingNumber.trim()) errs.routingNumber = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const created = addAccount({
      accountHolderName: form.accountHolderName.trim(),
      bankName: form.bankName.trim(),
      accountNumber: form.accountNumber.trim(),
      routingNumber: form.routingNumber.trim(),
      accountType: form.accountType,
      country: form.country,
      currency: form.currency,
      nickname: form.nickname.trim() || undefined,
    });
    toast({ title: 'New account added and linked.' });
    onCreated?.(created.id);
    setForm({
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      routingNumber: '',
      accountType: 'checking',
      nickname: '',
      country: 'US',
      currency: 'USD',
    });
    setErrors({});
    onOpenChange(false);
  };

  const maskedAccount = showAccount
    ? form.accountNumber
    : form.accountNumber.length > 4
    ? '•'.repeat(form.accountNumber.length - 4) + form.accountNumber.slice(-4)
    : form.accountNumber;

  const maskedRouting = showRouting
    ? form.routingNumber
    : form.routingNumber.length > 4
    ? '•'.repeat(form.routingNumber.length - 4) + form.routingNumber.slice(-4)
    : form.routingNumber;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-primary" />
            Add New Bank Account
          </DialogTitle>
          <DialogDescription>
            Create a bank account to link to properties for rent collection, expenses, etc.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Account Holder Name *</Label>
              <Input
                value={form.accountHolderName}
                onChange={(e) => setForm({ ...form, accountHolderName: e.target.value })}
                placeholder="e.g. Riverside Properties LLC"
              />
              {errors.accountHolderName && <p className="text-xs text-destructive mt-1">{errors.accountHolderName}</p>}
            </div>
            <div>
              <Label>Bank Name *</Label>
              <Input
                value={form.bankName}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                placeholder="e.g. Chase"
              />
              {errors.bankName && <p className="text-xs text-destructive mt-1">{errors.bankName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="flex items-center gap-1">
                <Lock className="h-3 w-3 text-muted-foreground" />
                Account Number *
              </Label>
              <div className="relative">
                <Input
                  value={showAccount ? form.accountNumber : maskedAccount}
                  onChange={(e) => setForm({ ...form, accountNumber: e.target.value.replace(/\D/g, '') })}
                  onFocus={() => setShowAccount(true)}
                  onBlur={() => setShowAccount(false)}
                  placeholder="Account number"
                  inputMode="numeric"
                  aria-label="Account number (sensitive)"
                />
              </div>
              {errors.accountNumber && <p className="text-xs text-destructive mt-1">{errors.accountNumber}</p>}
            </div>
            <div>
              <Label className="flex items-center gap-1">
                <Lock className="h-3 w-3 text-muted-foreground" />
                Routing / IFSC / SWIFT *
              </Label>
              <Input
                value={showRouting ? form.routingNumber : maskedRouting}
                onChange={(e) => setForm({ ...form, routingNumber: e.target.value.replace(/[^a-zA-Z0-9]/g, '') })}
                onFocus={() => setShowRouting(true)}
                onBlur={() => setShowRouting(false)}
                placeholder="Routing number"
                aria-label="Routing number (sensitive)"
              />
              {errors.routingNumber && <p className="text-xs text-destructive mt-1">{errors.routingNumber}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label>Account Type</Label>
              <SearchableSelect
                options={Object.entries(ACCOUNT_TYPE_LABELS).map(([k, v]) => ({ value: k, label: v }))}
                value={form.accountType}
                onValueChange={(v) => setForm({ ...form, accountType: v as AccountType })}
                placeholder="Select type"
              />
            </div>
            <div>
              <Label>Nickname</Label>
              <Input
                value={form.nickname}
                onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                placeholder="e.g. Chase Rent Acct"
              />
            </div>
            <div>
              <Label>Currency</Label>
              <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Create Account</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
