import { MapPin } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { PROPERTY_TYPE_LABELS } from '@/types/property';
import type { Property } from '@/types/property';

interface Props {
  form: {
    propertyId: string;
    unitId: string;
    bulkUnitIds: string[];
  };
  activeProperties: Property[];
  selectedProperty: Property | undefined;
  vacantUnits: { id: string; label: string }[];
  errors: Record<string, string>;
  onPropertyChange: (id: string) => void;
  onUnitChange: (id: string) => void;
  onBulkToggle: (unitId: string, checked: boolean) => void;
}

export default function ListingStepPropertyUnit({
  form, activeProperties, selectedProperty, vacantUnits, errors,
  onPropertyChange, onUnitChange, onBulkToggle,
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <Label>Select Property <span className="text-destructive">*</span></Label>
        <Select value={form.propertyId} onValueChange={onPropertyChange}>
          <SelectTrigger className={errors.propertyId ? 'border-destructive' : ''}>
            <SelectValue placeholder="Choose a property..." />
          </SelectTrigger>
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
        {errors.propertyId && <p className="text-xs text-destructive mt-1">{errors.propertyId}</p>}
      </div>

      {selectedProperty && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>
            {selectedProperty.address.street}, {selectedProperty.address.city},{' '}
            {selectedProperty.address.state} {selectedProperty.address.zip}
          </span>
        </div>
      )}

      {selectedProperty && vacantUnits.length > 0 && (
        <div>
          <Label>Select Vacant Unit <span className="text-destructive">*</span></Label>
          <Select value={form.unitId} onValueChange={onUnitChange}>
            <SelectTrigger className={errors.unitId ? 'border-destructive' : ''}>
              <SelectValue placeholder="Choose a vacant unit..." />
            </SelectTrigger>
            <SelectContent>
              {vacantUnits.map((u) => (
                <SelectItem key={u.id} value={u.id}>{u.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.unitId && <p className="text-xs text-destructive mt-1">{errors.unitId}</p>}
        </div>
      )}

      {selectedProperty && vacantUnits.length === 0 && (
        <p className="text-sm text-muted-foreground">No vacant units available for this property.</p>
      )}

      {selectedProperty && vacantUnits.length > 1 && (
        <div className="space-y-2">
          <Label>Bulk — Add Multiple Units</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {vacantUnits.map((u) => (
              <label key={u.id} className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted/40 cursor-pointer text-sm">
                <Checkbox
                  checked={form.bulkUnitIds.includes(u.id)}
                  onCheckedChange={(checked) => onBulkToggle(u.id, !!checked)}
                />
                {u.label}
              </label>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Select multiple units to create listings with shared details.</p>
        </div>
      )}
    </div>
  );
}
