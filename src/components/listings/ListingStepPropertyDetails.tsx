import { useState } from 'react';
import { Home, Plus, X, Image } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PROPERTY_AMENITIES_OPTIONS, type ListingAmenity } from '@/types/listing';

interface Props {
  amenities: ListingAmenity[];
  locationDescription: string;
  photos: string[];
  onAmenitiesChange: (amenities: ListingAmenity[]) => void;
  onLocationChange: (desc: string) => void;
  onPhotosChange: (photos: string[]) => void;
  readOnly?: boolean;
}

export default function ListingStepPropertyDetails({
  amenities, locationDescription, photos,
  onAmenitiesChange, onLocationChange, onPhotosChange, readOnly,
}: Props) {
  const [customAmenity, setCustomAmenity] = useState('');

  const toggleAmenity = (name: string) => {
    const exists = amenities.find((a) => a.name === name);
    if (exists) {
      onAmenitiesChange(amenities.filter((a) => a.name !== name));
    } else {
      onAmenitiesChange([...amenities, { name, included: true }]);
    }
  };

  const toggleIncluded = (name: string) => {
    onAmenitiesChange(
      amenities.map((a) => (a.name === name ? { ...a, included: !a.included } : a))
    );
  };

  const addCustom = () => {
    if (!customAmenity.trim()) return;
    onAmenitiesChange([...amenities, { name: customAmenity.trim(), included: true }]);
    setCustomAmenity('');
  };

  return (
    <div className="space-y-4">
      <Accordion type="multiple" defaultValue={['amenities', 'location', 'photos']} className="space-y-2">
        {/* Amenities */}
        <AccordionItem value="amenities" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Property Amenities</span>
              <Badge variant="outline" className="text-xs ml-2">{amenities.length} selected</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PROPERTY_AMENITIES_OPTIONS.map((name) => {
                  const selected = amenities.find((a) => a.name === name);
                  return (
                    <label key={name} className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted/40 cursor-pointer text-sm">
                      <Checkbox
                        checked={!!selected}
                        onCheckedChange={() => toggleAmenity(name)}
                        disabled={readOnly}
                      />
                      <span className="flex-1">{name}</span>
                      {selected && (
                        <Badge
                          variant="outline"
                          className={`text-[10px] cursor-pointer ${selected.included ? 'bg-secondary/30' : 'bg-warning/30'}`}
                          onClick={(e) => { e.preventDefault(); toggleIncluded(name); }}
                        >
                          {selected.included ? 'Included' : 'Paid'}
                        </Badge>
                      )}
                    </label>
                  );
                })}
              </div>
              {/* Custom amenities */}
              {amenities.filter((a) => !PROPERTY_AMENITIES_OPTIONS.includes(a.name)).map((a) => (
                <div key={a.name} className="flex items-center gap-2 p-2 rounded-lg border border-dashed border-border text-sm">
                  <span className="flex-1">{a.name}</span>
                  {!readOnly && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleAmenity(a.name)}>
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
              {!readOnly && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom amenity..."
                    value={customAmenity}
                    onChange={(e) => setCustomAmenity(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustom())}
                    className="text-sm"
                  />
                  <Button variant="outline" size="sm" onClick={addCustom} className="shrink-0">
                    <Plus className="h-3 w-3 mr-1" /> Add
                  </Button>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Location */}
        <AccordionItem value="location" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Location Description</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Textarea
              placeholder="Describe the property location for the listing..."
              value={locationDescription}
              onChange={(e) => onLocationChange(e.target.value)}
              className="min-h-[80px]"
              readOnly={readOnly}
            />
            <p className="text-xs text-muted-foreground mt-1">Highlight nearby amenities, transit, schools, etc.</p>
          </AccordionContent>
        </AccordionItem>

        {/* Photos */}
        <AccordionItem value="photos" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Image className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Property Photos</span>
              <Badge variant="outline" className="text-xs ml-2">{photos.length} photos</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex gap-2 flex-wrap">
              {photos.length > 0 ? photos.slice(0, 8).map((_, i) => (
                <div key={i} className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border">
                  <Image className="h-6 w-6 text-muted-foreground" />
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">No photos synced from property data.</p>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Photos are synced from property data. Max 20, 5MB each.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
