import { ExternalLink, Home, Bed, Shield, DollarSign, Calendar as CalendarIcon, Image } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LEASE_TYPE_LABELS, FEE_TYPE_LABELS, type ListingFormData } from '@/types/listing';
import { PROPERTY_TYPE_LABELS, type Property } from '@/types/property';
import { useCurrency } from '@/contexts/CurrencyContext';

interface Props {
  form: ListingFormData;
  selectedProperty: Property | undefined;
  moveInTotal: number;
}

export default function ListingStepPreview({ form, selectedProperty, moveInTotal }: Props) {
  const { formatAmount } = useCurrency();

  if (!selectedProperty) {
    return <p className="text-muted-foreground">Please select a property to preview the listing.</p>;
  }

  const unit = selectedProperty.units.find((u) => u.id === form.unitId);

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <Badge variant="outline" className="text-xs mb-2">Listing Preview</Badge>
        <h2 className="text-lg font-semibold">
          {unit ? `Unit ${unit.unitNumber}` : 'Entire Property'} — {selectedProperty.name}
        </h2>
        <p className="text-sm text-muted-foreground">{PROPERTY_TYPE_LABELS[selectedProperty.type]}</p>
      </div>

      {/* Photos Carousel Placeholder */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(form.propertyPhotos.length > 0 ? form.propertyPhotos : [1, 2, 3]).slice(0, 6).map((_, i) => (
          <div key={i} className="h-32 w-48 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border">
            <Image className="h-8 w-8 text-muted-foreground" />
          </div>
        ))}
      </div>

      <Separator />

      {/* Property Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Home className="h-4 w-4 text-primary" /> Property Details</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>{form.locationDescription || `${selectedProperty.address.street}, ${selectedProperty.address.city}`}</p>
          {form.propertyAmenities.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {form.propertyAmenities.map((a) => (
                <Badge key={a.name} variant="outline" className="text-xs">
                  {a.name} {!a.included && '(Paid)'}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unit Info */}
      {unit && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Bed className="h-4 w-4 text-primary" /> Unit Details</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>{form.unitLocationNotes || `${unit.size} sqft · ${unit.bedrooms} bed · ${unit.bathrooms} bath`}</p>
            {form.unitAmenities.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {form.unitAmenities.map((a) => (
                  <Badge key={a.name} variant="outline" className="text-xs">{a.name}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tenant Requirements */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Tenant Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>Credit Score: {form.tenantCriteria.minCreditScore}+</li>
            <li>Income: {form.tenantCriteria.incomeRatio}× rent</li>
            <li>Max Occupants: {form.tenantCriteria.maxOccupants}</li>
            <li>Pets: {form.tenantCriteria.petPolicy === 'allowed' ? 'Allowed' : form.tenantCriteria.petPolicy === 'not_allowed' ? 'Not Allowed' : 'Case by Case'}</li>
            {form.tenantCriteria.noEvictions && <li>No prior evictions</li>}
            {form.tenantCriteria.backgroundCheck && <li>Background check required</li>}
          </ul>
          {form.houseRules && (
            <div className="mt-2 p-2 rounded bg-muted/50 text-xs whitespace-pre-wrap">{form.houseRules}</div>
          )}
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /> Pricing & Fees</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <div className="flex justify-between">
            <span>Monthly Rent</span>
            <span className="font-semibold">{formatAmount(Number(form.rentalAmount) || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span>Security Deposit</span>
            <span>{formatAmount(Number(form.securityDeposit) || 0)}</span>
          </div>
          {form.fees.map((f) => (
            <div key={f.id} className="flex justify-between text-muted-foreground">
              <span>{FEE_TYPE_LABELS[f.type]} ({f.frequency === 'one_time' ? 'Once' : 'Monthly'})</span>
              <span>{formatAmount(f.amount)}</span>
            </div>
          ))}
          <Separator className="my-1" />
          <div className="flex justify-between font-semibold">
            <span>Est. Move-In Total</span>
            <span>{formatAmount(moveInTotal)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Lease & Availability */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-primary" /> Lease & Availability</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <div className="flex justify-between">
            <span>Lease Type</span>
            <span>{LEASE_TYPE_LABELS[form.leaseType]}</span>
          </div>
          <div className="flex justify-between">
            <span>Available From</span>
            <span>{form.availableFrom || '—'}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
