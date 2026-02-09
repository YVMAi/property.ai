import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { OwnerAddress } from '@/types/owner';

interface PersonalDetailsStepProps {
  data: {
    firstName: string;
    lastName: string;
    phone: string;
    address: OwnerAddress;
  };
  onChange: (data: Partial<PersonalDetailsStepProps['data']>) => void;
  errors: Record<string, string>;
}

export default function PersonalDetailsStep({ data, onChange, errors }: PersonalDetailsStepProps) {
  return (
    <div className="space-y-4">
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
          placeholder="Street"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Input
            value={data.address.city}
            onChange={(e) => onChange({ address: { ...data.address, city: e.target.value } })}
            placeholder="City"
          />
          <Input
            value={data.address.state}
            onChange={(e) => onChange({ address: { ...data.address, state: e.target.value } })}
            placeholder="State"
          />
          <Input
            value={data.address.zip}
            onChange={(e) => onChange({ address: { ...data.address, zip: e.target.value } })}
            placeholder="ZIP"
          />
        </div>
      </div>
    </div>
  );
}
