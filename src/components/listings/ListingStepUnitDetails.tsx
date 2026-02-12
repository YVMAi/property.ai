import { useState } from 'react';
import { Bed, Plus, X, Image } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { UNIT_AMENITIES_OPTIONS, type ListingAmenity } from '@/types/listing';

interface Props {
  amenities: ListingAmenity[];
  locationNotes: string;
  photos: string[];
  onAmenitiesChange: (amenities: ListingAmenity[]) => void;
  onLocationChange: (desc: string) => void;
  onPhotosChange: (photos: string[]) => void;
  readOnly?: boolean;
}

export default function ListingStepUnitDetails({
  amenities, locationNotes, photos,
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

  const addCustom = () => {
    if (!customAmenity.trim()) return;
    onAmenitiesChange([...amenities, { name: customAmenity.trim(), included: true }]);
    setCustomAmenity('');
  };

  return (
    <div className="space-y-4">
      <Accordion type="multiple" defaultValue={['amenities', 'location', 'photos']} className="space-y-2">
        <AccordionItem value="amenities" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Bed className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Unit Amenities</span>
              <Badge variant="outline" className="text-xs ml-2">{amenities.length} selected</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {UNIT_AMENITIES_OPTIONS.map((name) => (
                  <label key={name} className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted/40 cursor-pointer text-sm">
                    <Checkbox
                      checked={!!amenities.find((a) => a.name === name)}
                      onCheckedChange={() => toggleAmenity(name)}
                      disabled={readOnly}
                    />
                    {name}
                  </label>
                ))}
              </div>
              {amenities.filter((a) => !UNIT_AMENITIES_OPTIONS.includes(a.name)).map((a) => (
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
                  <Input placeholder="Add custom amenity..." value={customAmenity} onChange={(e) => setCustomAmenity(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustom())} className="text-sm" />
                  <Button variant="outline" size="sm" onClick={addCustom} className="shrink-0"><Plus className="h-3 w-3 mr-1" /> Add</Button>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="location" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Bed className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Unit Location Notes</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <Textarea placeholder="e.g. Top floor with balcony, city view..." value={locationNotes} onChange={(e) => onLocationChange(e.target.value)} className="min-h-[80px]" readOnly={readOnly} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="photos" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <Image className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Unit Photos</span>
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
                <p className="text-sm text-muted-foreground">No unit photos available.</p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
