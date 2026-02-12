import { useState, useMemo } from 'react';
import { Search, Check, AlertTriangle, Clock, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCurrency, CURRENCIES, CurrencyInfo } from '@/contexts/CurrencyContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function CurrencySection() {
  const { currency, setCurrency, formatAmount, changeLog, addChangeLog } = useCurrency();
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedCode, setSelectedCode] = useState(currency.code);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [autoConvert, setAutoConvert] = useState(false);
  const [exchangeApiKey, setExchangeApiKey] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedCurrency = CURRENCIES.find(c => c.code === selectedCode) || CURRENCIES[0];
  const hasChanges = selectedCode !== currency.code;

  const filtered = useMemo(() => {
    if (!search.trim()) return CURRENCIES;
    const q = search.toLowerCase();
    return CURRENCIES.filter(c =>
      c.code.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.symbol.toLowerCase().includes(q)
    );
  }, [search]);

  const handleSave = () => {
    if (!hasChanges) return;
    setConfirmOpen(true);
  };

  const confirmChange = () => {
    const oldCode = currency.code;
    setCurrency(selectedCode);
    addChangeLog(oldCode, selectedCode, user?.name || 'Unknown');
    setConfirmOpen(false);
    toast({
      title: 'Currency updated',
      description: `Default currency changed from ${oldCode} to ${selectedCode}. All displays updated.`,
    });
  };

  const previewFormat = (c: CurrencyInfo) => {
    try {
      return new Intl.NumberFormat(c.locale, {
        style: 'currency',
        currency: c.code,
        minimumFractionDigits: 2,
      }).format(1234.56);
    } catch {
      return `${c.symbol}1,234.56`;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Current Currency */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Default Currency</CardTitle>
          <CardDescription>
            This setting affects all currency displays, symbols, and formatting across the application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current display */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border/50">
            <span className="text-2xl">{currency.flag}</span>
            <div>
              <p className="font-medium text-foreground">{currency.code} — {currency.name}</p>
              <p className="text-sm text-muted-foreground">
                Example: {previewFormat(currency)}
              </p>
            </div>
            <Badge variant="secondary" className="ml-auto">Current</Badge>
          </div>

          {/* Currency Selector */}
          <div className="space-y-2">
            <Label>Select Currency</Label>
            <Popover open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex h-11 w-full items-center justify-between rounded-lg border border-input bg-background px-4 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-all duration-200"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{selectedCurrency.flag}</span>
                    <span>{selectedCurrency.code} — {selectedCurrency.name}</span>
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="p-0 w-[var(--radix-popover-trigger-width)] bg-popover border border-border shadow-lg z-50"
                align="start"
                side="bottom"
                sideOffset={4}
                avoidCollisions={false}
              >
                <div className="flex items-center border-b border-border px-3 py-2">
                  <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
                  <input
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    placeholder="Search by name, code, or symbol..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                  />
                </div>
                <ScrollArea className="h-72">
                  <div className="p-1">
                    {filtered.length === 0 ? (
                      <p className="py-4 text-center text-sm text-muted-foreground">No currencies found</p>
                    ) : (
                      filtered.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          className={cn(
                            'relative flex w-full items-center gap-3 rounded-md py-2 px-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                            selectedCode === c.code && 'bg-accent/50',
                          )}
                          onClick={() => {
                            setSelectedCode(c.code);
                            setDropdownOpen(false);
                            setSearch('');
                          }}
                        >
                          <span className="text-lg shrink-0">{c.flag}</span>
                          <div className="flex-1 text-left">
                            <span className="font-medium">{c.code}</span>
                            <span className="text-muted-foreground ml-2">{c.name}</span>
                          </div>
                          <span className="text-muted-foreground text-xs shrink-0">{c.symbol}</span>
                          {selectedCode === c.code && (
                            <Check className="h-4 w-4 text-primary shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>

          {/* Preview */}
          {hasChanges && (
            <div className="p-4 rounded-lg bg-accent/30 border border-accent/50 space-y-2">
              <p className="text-sm font-medium text-foreground">Preview</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="text-center p-3 bg-background rounded-md border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Formatted Amount</p>
                  <p className="font-semibold text-foreground">{previewFormat(selectedCurrency)}</p>
                </div>
                <div className="text-center p-3 bg-background rounded-md border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Symbol</p>
                  <p className="font-semibold text-foreground text-lg">{selectedCurrency.symbol}</p>
                </div>
                <div className="text-center p-3 bg-background rounded-md border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Locale</p>
                  <p className="font-semibold text-foreground">{selectedCurrency.locale}</p>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Exchange Rate Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Exchange Rate Settings</h3>
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-Convert Historical Data</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Automatically convert existing amounts using live exchange rates
                </p>
              </div>
              <Switch checked={autoConvert} onCheckedChange={setAutoConvert} />
            </div>
            {autoConvert && (
              <div className="space-y-2 pl-0">
                <Label>Exchange Rate API Key (OpenExchangeRates)</Label>
                <Input
                  type="password"
                  placeholder="Enter your API key..."
                  value={exchangeApiKey}
                  onChange={(e) => setExchangeApiKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Get a free key at openexchangerates.org. Required for auto-conversion.
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Save */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {hasChanges
                ? `Changing from ${currency.code} to ${selectedCode}`
                : 'No changes to save'}
            </p>
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              className="bg-[hsl(140,40%,75%)] text-[hsl(140,40%,20%)] hover:bg-[hsl(140,40%,68%)]"
            >
              Update Currency
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log */}
      {changeLog.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Currency Change History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {changeLog.slice(0, 10).map((entry) => {
                const fromC = CURRENCIES.find(c => c.code === entry.fromCode);
                const toC = CURRENCIES.find(c => c.code === entry.toCode);
                return (
                  <div key={entry.id} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0 text-sm">
                    <span className="text-muted-foreground shrink-0">
                      {new Date(entry.changedAt).toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <span>{fromC?.flag}</span>
                      <span className="font-medium">{entry.fromCode}</span>
                      <span className="text-muted-foreground">→</span>
                      <span>{toC?.flag}</span>
                      <span className="font-medium">{entry.toCode}</span>
                    </span>
                    <span className="text-muted-foreground ml-auto">by {entry.changedBy}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Modal */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Confirm Currency Change
            </DialogTitle>
            <DialogDescription>
              You are about to change the default currency for your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <span className="text-xl">{currency.flag}</span>
              <span className="font-medium">{currency.code}</span>
              <span className="text-muted-foreground">→</span>
              <span className="text-xl">{selectedCurrency.flag}</span>
              <span className="font-medium">{selectedCode}</span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1.5">
              <p>This will update all displays and reports to <strong>{selectedCurrency.name} ({selectedCurrency.symbol})</strong>.</p>
              {autoConvert && exchangeApiKey ? (
                <p>Historical data will be converted using current exchange rates from OpenExchangeRates.</p>
              ) : (
                <p className="text-warning-foreground">Historical data will <strong>not</strong> be auto-converted. Manual conversion may be needed.</p>
              )}
              <p>All PMC users will be notified of this change via email.</p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={confirmChange}
              className="bg-[hsl(210,60%,80%)] text-[hsl(210,50%,20%)] hover:bg-[hsl(210,60%,73%)]"
            >
              Yes, Change Currency
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
