import { useState } from 'react';
import { useSuperAdmin } from '@/contexts/SuperAdminContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Building2, Globe, Palette, Settings, Shield } from 'lucide-react';
import { SubscriptionPlanType, PMCFeatureToggles, SUBSCRIPTION_PLANS } from '@/types/superAdmin';
import { useToast } from '@/hooks/use-toast';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddPMCDialog({ open, onOpenChange }: Props) {
  const { addPMC } = useSuperAdmin();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [plan, setPlan] = useState<SubscriptionPlanType>('basic');
  const [customDomain, setCustomDomain] = useState('');
  const [timezone, setTimezone] = useState('America/New_York');
  const [locale, setLocale] = useState('en-US');
  const [userLimit, setUserLimit] = useState(5);
  const [storageQuotaGB, setStorageQuotaGB] = useState(10);
  const [currency, setCurrency] = useState('USD');
  const [complianceLevel, setComplianceLevel] = useState<'basic' | 'advanced'>('basic');
  const [features, setFeatures] = useState<PMCFeatureToggles>({
    aiChat: false, zillowIntegration: false, multiCurrency: false,
    customReports: false, advancedAnalytics: false, apiAccess: false,
  });

  const selectedPlan = SUBSCRIPTION_PLANS.find(p => p.type === plan);

  const handlePlanChange = (newPlan: SubscriptionPlanType) => {
    setPlan(newPlan);
    const p = SUBSCRIPTION_PLANS.find(sp => sp.type === newPlan);
    if (p) {
      setUserLimit(p.userLimit === -1 ? 999 : p.userLimit);
      setStorageQuotaGB(p.storageGB);
      setFeatures({
        aiChat: p.features.includes('AI Chat'),
        zillowIntegration: p.features.includes('Zillow Integration'),
        multiCurrency: p.features.includes('Multi-Currency'),
        customReports: p.features.includes('Custom Reports'),
        advancedAnalytics: p.features.includes('Advanced Analytics'),
        apiAccess: p.features.includes('API Access'),
      });
    }
  };

  const handleSubmit = () => {
    if (!name.trim() || !adminEmail.trim()) return;
    addPMC({
      name, address, adminEmail, subscriptionPlan: plan, customDomain: customDomain || undefined,
      timezone, locale, userLimit, storageQuotaGB, featureToggles: features,
      complianceLevel, currency, status: plan === 'basic' ? 'trial' : 'active',
    });
    toast({ title: 'PMC Created', description: `${name} has been created. Invite sent to ${adminEmail}.` });
    onOpenChange(false);
    // Reset
    setName(''); setAddress(''); setAdminEmail(''); setPlan('basic');
    setCustomDomain(''); setTimezone('America/New_York'); setLocale('en-US');
    setUserLimit(5); setStorageQuotaGB(10); setCurrency('USD');
    setComplianceLevel('basic');
    setFeatures({ aiChat: false, zillowIntegration: false, multiCurrency: false, customReports: false, advancedAnalytics: false, apiAccess: false });
  };

  const toggleFeature = (key: keyof PMCFeatureToggles) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Add New PMC</DialogTitle>
          <DialogDescription>Set up a new Property Management Company with all configuration details.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4 text-primary-foreground" /> Company Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Company Name *</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Acme Property Group" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Admin Email *</Label>
                  <Input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="admin@acme.com" />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs">Address</Label>
                  <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main St, City, State ZIP" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Subscription */}
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-primary-foreground" /> Subscription Plan
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Plan</Label>
                  <Select value={plan} onValueChange={v => handlePlanChange(v as SubscriptionPlanType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic – ${SUBSCRIPTION_PLANS[0].priceMonthly}/mo</SelectItem>
                      <SelectItem value="pro">Pro – ${SUBSCRIPTION_PLANS[1].priceMonthly}/mo</SelectItem>
                      <SelectItem value="pro_max">Pro Max – ${SUBSCRIPTION_PLANS[2].priceMonthly}/mo</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">User Limit</Label>
                  <Input type="number" value={userLimit} onChange={e => setUserLimit(Number(e.target.value))} min={1} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Storage (GB)</Label>
                  <Input type="number" value={storageQuotaGB} onChange={e => setStorageQuotaGB(Number(e.target.value))} min={1} />
                </div>
              </div>
            </div>

            <Separator />

            {/* Configuration */}
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <Globe className="h-4 w-4 text-primary-foreground" /> Configuration
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Custom Domain</Label>
                  <Input value={customDomain} onChange={e => setCustomDomain(e.target.value)} placeholder="acme.mypms.com" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Default Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="INR">INR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific (PT)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Compliance Level</Label>
                  <Select value={complianceLevel} onValueChange={v => setComplianceLevel(v as 'basic' | 'advanced')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="advanced">Advanced (GDPR-ready)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Feature Toggles */}
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <Settings className="h-4 w-4 text-primary-foreground" /> Feature Toggles
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([
                  ['aiChat', 'AI Chat'],
                  ['zillowIntegration', 'Zillow Integration'],
                  ['multiCurrency', 'Multi-Currency'],
                  ['customReports', 'Custom Reports'],
                  ['advancedAnalytics', 'Advanced Analytics'],
                  ['apiAccess', 'API Access'],
                ] as [keyof PMCFeatureToggles, string][]).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/30">
                    <span className="text-sm text-foreground">{label}</span>
                    <Switch checked={features[key]} onCheckedChange={() => toggleFeature(key)} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || !adminEmail.trim()} className="btn-primary">
            Create PMC & Send Invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
