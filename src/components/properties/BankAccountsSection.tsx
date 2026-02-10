import { useState } from 'react';
import { Landmark, Plus, X, Check, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useBankAccountsContext } from '@/contexts/BankAccountsContext';
import AddBankAccountDialog from '@/components/properties/AddBankAccountDialog';
import {
  maskNumber,
  BANK_PURPOSE_LABELS,
  PURPOSE_COLORS,
  type BankPurpose,
  type PropertyBankLink,
} from '@/types/bankAccount';

interface Props {
  /** Temporary links managed by wizard (not yet persisted) */
  linkedAccounts: PropertyBankLink[];
  onLinksChange: (links: PropertyBankLink[]) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export default function BankAccountsSection({ linkedAccounts, onLinksChange }: Props) {
  const { accounts, getAccountById } = useBankAccountsContext();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState('');

  const linkedAccountIds = linkedAccounts.map((l) => l.bankAccountId);

  const accountOptions = accounts
    .filter((a) => !linkedAccountIds.includes(a.id))
    .map((a) => ({
      value: a.id,
      label: `${a.bankName} - ••••${a.accountNumber.slice(-4)} (${a.accountHolderName})`,
    }));

  const handleLinkExisting = (accountId: string) => {
    if (!accountId || linkedAccountIds.includes(accountId)) return;
    const newLink: PropertyBankLink = {
      id: generateId(),
      propertyId: '', // will be set on save
      bankAccountId: accountId,
      purpose: 'rent_collection',
      primaryForPurpose: linkedAccounts.length === 0,
      linkedAt: new Date().toISOString(),
    };
    onLinksChange([...linkedAccounts, newLink]);
    setSelectedAccountId('');
  };

  const handleNewAccountCreated = (accountId: string) => {
    const newLink: PropertyBankLink = {
      id: generateId(),
      propertyId: '',
      bankAccountId: accountId,
      purpose: 'rent_collection',
      primaryForPurpose: linkedAccounts.length === 0,
      linkedAt: new Date().toISOString(),
    };
    onLinksChange([...linkedAccounts, newLink]);
  };

  const handleUnlink = (linkId: string) => {
    onLinksChange(linkedAccounts.filter((l) => l.id !== linkId));
  };

  const handlePurposeChange = (linkId: string, purpose: BankPurpose) => {
    onLinksChange(
      linkedAccounts.map((l) =>
        l.id === linkId ? { ...l, purpose, customPurpose: purpose === 'other' ? l.customPurpose : undefined } : l
      )
    );
  };

  const handleCustomPurpose = (linkId: string, custom: string) => {
    onLinksChange(
      linkedAccounts.map((l) => (l.id === linkId ? { ...l, customPurpose: custom } : l))
    );
  };

  const handlePrimaryToggle = (linkId: string, checked: boolean) => {
    const link = linkedAccounts.find((l) => l.id === linkId);
    if (!link) return;
    onLinksChange(
      linkedAccounts.map((l) => {
        if (l.id === linkId) return { ...l, primaryForPurpose: checked };
        // Unset other primaries for the same purpose
        if (checked && l.purpose === link.purpose && l.primaryForPurpose) {
          return { ...l, primaryForPurpose: false };
        }
        return l;
      })
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Landmark className="h-[18px] w-[18px] text-primary" />
              Bank Accounts
            </CardTitle>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setAddDialogOpen(true)}
              className="gap-1 h-8 text-xs"
            >
              <Plus className="h-3 w-3" /> Add & Link New Account
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Link bank accounts for rent auto-collection, expense payouts, security deposit holding, etc. You can reuse accounts across properties.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Link existing */}
          <div>
            <Label className="text-sm mb-1.5 block">Link Existing Bank Account</Label>
            <SearchableSelect
              options={accountOptions}
              value={selectedAccountId}
              onValueChange={handleLinkExisting}
              placeholder="Search and select account..."
            />
          </div>

          {/* Linked accounts list */}
          {linkedAccounts.length > 0 && (
            <div className="space-y-3">
              {linkedAccounts.map((link) => {
                const account = getAccountById(link.bankAccountId);
                if (!account) return null;
                return (
                  <div
                    key={link.id}
                    className="p-3 rounded-lg border border-border bg-card shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Landmark className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{account.bankName}</span>
                        <span className="text-xs text-muted-foreground">
                          ••••{account.accountNumber.slice(-4)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({account.accountHolderName})
                        </span>
                        {account.nickname && (
                          <Badge variant="outline" className="text-xs">
                            {account.nickname}
                          </Badge>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => handleUnlink(link.id)}
                      >
                        <X className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex-1 min-w-[150px]">
                        <SearchableSelect
                          options={Object.entries(BANK_PURPOSE_LABELS).map(([k, v]) => ({
                            value: k,
                            label: v,
                          }))}
                          value={link.purpose}
                          onValueChange={(v) => handlePurposeChange(link.id, v as BankPurpose)}
                          placeholder="Select purpose"
                          triggerClassName="h-8 text-xs"
                        />
                      </div>
                      {link.purpose === 'other' && (
                        <Input
                          className="h-8 text-xs max-w-[150px]"
                          placeholder="Custom purpose..."
                          value={link.customPurpose || ''}
                          onChange={(e) => handleCustomPurpose(link.id, e.target.value)}
                        />
                      )}
                      <Badge
                        className="text-xs"
                        style={{
                          backgroundColor: PURPOSE_COLORS[link.purpose],
                          color: 'hsl(0,0%,20%)',
                        }}
                      >
                        {link.purpose === 'other' && link.customPurpose
                          ? link.customPurpose
                          : BANK_PURPOSE_LABELS[link.purpose]}
                      </Badge>
                      <div className="flex items-center gap-1.5">
                        <Switch
                          checked={link.primaryForPurpose}
                          onCheckedChange={(c) => handlePrimaryToggle(link.id, c)}
                          className="scale-75"
                        />
                        <span className="text-xs text-muted-foreground">Primary</span>
                        {link.primaryForPurpose && (
                          <Check className="h-3.5 w-3.5 text-primary" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {linkedAccounts.length === 0 && (
            <div className="p-4 rounded-lg bg-muted/30 text-center">
              <Shield className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
              <p className="text-sm text-muted-foreground">
                No bank accounts linked yet. Link one for rent collection, expenses, etc.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <AddBankAccountDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCreated={handleNewAccountCreated}
      />
    </>
  );
}
