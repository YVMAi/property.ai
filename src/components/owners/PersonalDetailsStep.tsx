import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Building2, User } from 'lucide-react';
import type { OwnerAddress, OwnerType } from '@/types/owner';

import { US_STATES, US_CITIES, DEFAULT_CITIES } from '@/data/usLocations';

interface PersonalDetailsStepProps {
  data: {
    ownerType: OwnerType;
    firstName: string;
    lastName: string;
    companyName: string;
    contactPerson: string;
    phone: string;
    address: OwnerAddress;
    ssn: string;
    ein: string;
  };
  onChange: (data: Partial<PersonalDetailsStepProps['data']>) => void;
  errors: Record<string, string>;
}

export default function PersonalDetailsStep({ data, onChange, errors }: PersonalDetailsStepProps) {
  const citiesForState = data.address.state
    ? US_CITIES[data.address.state] || DEFAULT_CITIES
    : [];

  const handleStateChange = (state: string) => {
    // Reset city when state changes
    onChange({ address: { ...data.address, state, city: '' } });
  };

  return (
    <div className="space-y-5">
      {/* Owner Type Toggle */}
      <div className="space-y-2">
        <Label>Owner Type *</Label>
        <RadioGroup
          value={data.ownerType}
          onValueChange={(val) => onChange({ ownerType: val as OwnerType })}
          className="grid grid-cols-2 gap-3"
        >
          <label
            className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
              data.ownerType === 'individual'
                ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                : 'border-border bg-card hover:bg-accent'
            }`}
          >
            <RadioGroupItem value="individual" id="type-individual" />
            <User className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="font-medium text-sm">Individual</p>
              <p className="text-xs text-muted-foreground">Person owner</p>
            </div>
          </label>
          <label
            className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
              data.ownerType === 'company'
                ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                : 'border-border bg-card hover:bg-accent'
            }`}
          >
            <RadioGroupItem value="company" id="type-company" />
            <Building2 className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="font-medium text-sm">Company</p>
              <p className="text-xs text-muted-foreground">Business entity</p>
            </div>
          </label>
        </RadioGroup>
      </div>

      {/* Conditional Fields */}
      {data.ownerType === 'individual' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={data.firstName}
                onChange={(e) => onChange({ firstName: e.target.value })}
                placeholder="John"
                className={errors.firstName ? 'border-destructive' : ''}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive-foreground">{errors.firstName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={data.lastName}
                onChange={(e) => onChange({ lastName: e.target.value })}
                placeholder="Anderson"
                className={errors.lastName ? 'border-destructive' : ''}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive-foreground">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ssn">Social Security Number (SSN) *</Label>
            <Input
              id="ssn"
              type="password"
              value={data.ssn}
              onChange={(e) => onChange({ ssn: e.target.value })}
              placeholder="•••-••-••••"
              className={errors.ssn ? 'border-destructive' : ''}
            />
            {errors.ssn && (
              <p className="text-sm text-destructive-foreground">{errors.ssn}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Securely stored and masked for privacy.
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              value={data.companyName}
              onChange={(e) => onChange({ companyName: e.target.value })}
              placeholder="Acme Properties LLC"
              className={errors.companyName ? 'border-destructive' : ''}
            />
            {errors.companyName && (
              <p className="text-sm text-destructive-foreground">{errors.companyName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPerson">Contact Person *</Label>
            <Input
              id="contactPerson"
              value={data.contactPerson}
              onChange={(e) => onChange({ contactPerson: e.target.value })}
              placeholder="Jane Smith"
              className={errors.contactPerson ? 'border-destructive' : ''}
            />
            {errors.contactPerson && (
              <p className="text-sm text-destructive-foreground">{errors.contactPerson}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ein">Employer Identification Number (EIN) *</Label>
            <Input
              id="ein"
              type="password"
              value={data.ein}
              onChange={(e) => onChange({ ein: e.target.value })}
              placeholder="••-•••••••"
              className={errors.ein ? 'border-destructive' : ''}
            />
            {errors.ein && (
              <p className="text-sm text-destructive-foreground">{errors.ein}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Securely stored and masked for privacy.
            </p>
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={data.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          placeholder="(555) 123-4567"
        />
      </div>

      <div className="space-y-3">
        <Label>Address</Label>
        <Input
          value={data.address.street}
          onChange={(e) => onChange({ address: { ...data.address, street: e.target.value } })}
          placeholder="Street address"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* State Dropdown */}
          <div className="space-y-1">
            <Select
              value={data.address.state}
              onValueChange={handleStateChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50 max-h-60">
                {US_STATES.map((st) => (
                  <SelectItem key={st} value={st}>
                    {st}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* City Dropdown */}
          <div className="space-y-1">
            <Select
              value={data.address.city}
              onValueChange={(city) =>
                onChange({ address: { ...data.address, city } })
              }
              disabled={!data.address.state}
            >
              <SelectTrigger>
                <SelectValue placeholder={data.address.state ? 'City' : 'Select state first'} />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50 max-h-60">
                {citiesForState.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ZIP */}
          <Input
            value={data.address.zip}
            onChange={(e) => onChange({ address: { ...data.address, zip: e.target.value } })}
            placeholder="ZIP Code"
          />
        </div>
      </div>
    </div>
  );
}
