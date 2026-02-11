import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePropertiesContext } from '@/contexts/PropertiesContext';
import { PROPERTY_TYPE_LABELS } from '@/types/property';
import LeaseCreationModal from '@/components/properties/LeaseCreationModal';
import { toast } from '@/hooks/use-toast';
import type { LeaseFormData } from '@/types/lease';

export default function CreateLease() {
  const navigate = useNavigate();
  const { activeProperties } = usePropertiesContext();
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [showModal, setShowModal] = useState(false);

  const propertyOptions = useMemo(
    () => activeProperties.map((p) => ({
      value: p.id,
      label: `${p.name} — ${PROPERTY_TYPE_LABELS[p.type]}`,
    })),
    [activeProperties]
  );

  const selectedProperty = activeProperties.find((p) => p.id === selectedPropertyId);

  const leasableOptions = useMemo(() => {
    if (!selectedProperty) return [];
    if (selectedProperty.units.length === 0) {
      return [{ value: '__entire__', label: 'Entire Property' }];
    }
    return selectedProperty.units.map((u) => ({
      value: u.id,
      label: `Unit ${u.unitNumber}`,
    }));
  }, [selectedProperty]);

  const leasableLabel = useMemo(() => {
    if (!selectedProperty) return '';
    if (selectedUnitId === '__entire__') return `${selectedProperty.name} — Entire Property`;
    const unit = selectedProperty.units.find((u) => u.id === selectedUnitId);
    return unit ? `${selectedProperty.name} — Unit ${unit.unitNumber}` : '';
  }, [selectedProperty, selectedUnitId]);

  const handleSave = (data: LeaseFormData) => {
    toast({ title: 'Lease created successfully', description: `Lease for ${leasableLabel}` });
    navigate('/leases/active');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/leases')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Create a Lease</h1>
          <p className="text-sm text-muted-foreground">Select a property and unit to begin</p>
        </div>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="text-base">Step 1: Select Property & Unit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Property *</Label>
            <SearchableSelect
              options={propertyOptions}
              value={selectedPropertyId}
              onValueChange={(v) => { setSelectedPropertyId(v); setSelectedUnitId(''); }}
              placeholder="Search properties..."
            />
          </div>

          {selectedProperty && (
            <div>
              <Label>Unit / Leasable Item *</Label>
              <Select value={selectedUnitId} onValueChange={setSelectedUnitId}>
                <SelectTrigger><SelectValue placeholder="Select unit..." /></SelectTrigger>
                <SelectContent>
                  {leasableOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedUnitId && (
            <Button className="w-full gap-1.5" onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4" /> Continue to Lease Details
            </Button>
          )}
        </CardContent>
      </Card>

      {showModal && (
        <LeaseCreationModal
          open={showModal}
          onOpenChange={setShowModal}
          leasableLabel={leasableLabel}
          unitId={selectedUnitId === '__entire__' ? undefined : selectedUnitId}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
