import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Image, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePropertiesContext } from '@/contexts/PropertiesContext';
import { PROPERTY_TYPE_LABELS } from '@/types/property';
import { toast } from '@/hooks/use-toast';

export default function PostListing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { activeProperties } = usePropertiesContext();

  const prePropertyId = searchParams.get('propertyId') || '';
  const preUnitId = searchParams.get('unitId') || '';

  const [selectedPropertyId, setSelectedPropertyId] = useState(prePropertyId);
  const [selectedUnitId, setSelectedUnitId] = useState(preUnitId);
  const [description, setDescription] = useState('');
  const [rent, setRent] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const selectedProperty = activeProperties.find((p) => p.id === selectedPropertyId);

  const vacantUnits = useMemo(() => {
    if (!selectedProperty) return [];
    const activeLeaseUnitIds = new Set(
      selectedProperty.leases.filter((l) => l.status === 'active').map((l) => l.unitId || l.propertyId)
    );
    if (selectedProperty.units.length === 0) {
      if (!activeLeaseUnitIds.has(selectedProperty.id)) {
        return [{ id: selectedProperty.id, label: 'Entire Property' }];
      }
      return [];
    }
    return selectedProperty.units
      .filter((u) => !activeLeaseUnitIds.has(u.id))
      .map((u) => ({ id: u.id, label: `Unit ${u.unitNumber}` }));
  }, [selectedProperty]);

  // Auto-generate description when property/unit selected
  const autoDescription = useMemo(() => {
    if (!selectedProperty) return '';
    const unit = selectedProperty.units.find((u) => u.id === selectedUnitId);
    const parts = [
      `${PROPERTY_TYPE_LABELS[selectedProperty.type]} at ${selectedProperty.address.street}, ${selectedProperty.address.city}, ${selectedProperty.address.state} ${selectedProperty.address.zip}.`,
    ];
    if (unit) {
      parts.push(`Unit ${unit.unitNumber} — ${unit.size} sqft, ${unit.bedrooms} bed / ${unit.bathrooms} bath.`);
    }
    if (selectedProperty.amenities.length > 0) {
      parts.push(`Amenities: ${selectedProperty.amenities.join(', ')}.`);
    }
    return parts.join(' ');
  }, [selectedProperty, selectedUnitId]);

  const handleSaveDraft = () => {
    toast({ title: 'Listing saved as draft', description: 'You can publish it from the Listings page.' });
    navigate('/leases/listings');
  };

  const handlePublish = () => {
    toast({ title: 'Listing published to Zillow', description: 'It may take a few minutes to appear on Zillow.' });
    navigate('/leases/listings');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/leases/listings')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Post Listing to Zillow</h1>
          <div className="h-1 w-16 bg-secondary rounded-full mt-2" />
          <p className="text-sm text-muted-foreground mt-1">
            Zillow Rentals Feed integration will auto-fill property details, photos, and rent from your property data.
          </p>
        </div>
      </div>

      {/* Property & Unit Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Property & Unit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Select Property</Label>
            <Select value={selectedPropertyId} onValueChange={(v) => { setSelectedPropertyId(v); setSelectedUnitId(''); }}>
              <SelectTrigger><SelectValue placeholder="Choose a property..." /></SelectTrigger>
              <SelectContent>
                {activeProperties.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <div className="flex items-center gap-2">
                      <span>{p.name}</span>
                      <Badge variant="outline" className="text-xs">{PROPERTY_TYPE_LABELS[p.type]}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProperty && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{selectedProperty.address.street}, {selectedProperty.address.city}, {selectedProperty.address.state} {selectedProperty.address.zip}</span>
            </div>
          )}

          {selectedProperty && vacantUnits.length > 0 && (
            <div>
              <Label>Select Vacant Unit</Label>
              <Select value={selectedUnitId} onValueChange={setSelectedUnitId}>
                <SelectTrigger><SelectValue placeholder="Choose a vacant unit..." /></SelectTrigger>
                <SelectContent>
                  {vacantUnits.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedProperty && vacantUnits.length === 0 && (
            <p className="text-sm text-muted-foreground">No vacant units available for this property.</p>
          )}
        </CardContent>
      </Card>

      {/* Listing Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Listing Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Monthly Rent</Label>
            <Input
              type="number"
              placeholder={selectedProperty?.marketRentAvg ? `Suggested: $${selectedProperty.marketRentAvg}` : 'Enter rent amount'}
              value={rent}
              onChange={(e) => setRent(e.target.value)}
            />
          </div>

          <div>
            <Label>Listing Description</Label>
            <Textarea
              placeholder="Auto-generated from property details..."
              className="min-h-[120px]"
              value={description || autoDescription}
              onChange={(e) => setDescription(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">This description will appear on your Zillow listing.</p>
          </div>

          {selectedProperty && selectedProperty.photos.length > 0 && (
            <div>
              <Label className="mb-2 block">Property Photos</Label>
              <div className="flex gap-2 flex-wrap">
                {selectedProperty.photos.slice(0, 4).map((photo, i) => (
                  <div key={i} className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    <Image className="h-6 w-6 text-muted-foreground" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Photos will be synced from property data.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input placeholder="leasing@company.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input placeholder="(555) 000-0000" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Note */}
      <p className="text-xs text-muted-foreground">
        Configure Zillow API credentials in{' '}
        <button className="text-primary underline" onClick={() => navigate('/leases/settings')}>
          Leasing Settings → Integrations
        </button>
      </p>

      {/* Actions */}
      <div className="flex justify-end gap-3 pb-6">
        <Button variant="outline" onClick={() => navigate('/leases/listings')}>Cancel</Button>
        <Button variant="outline" onClick={handleSaveDraft}>Save as Draft</Button>
        <Button onClick={handlePublish} className="gap-1.5">
          <ExternalLink className="h-4 w-4" /> Publish to Zillow
        </Button>
      </div>
    </div>
  );
}
