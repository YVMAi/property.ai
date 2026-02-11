import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const propertyOptions = useMemo(
    () => activeProperties.map((p) => ({
      value: p.id,
      label: `${p.name} — ${PROPERTY_TYPE_LABELS[p.type]}`,
    })),
    [activeProperties]
  );

  const selectedProperty = activeProperties.find((p) => p.id === selectedPropertyId);

  const unitOptions = useMemo(() => {
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
    return unit ? `${selectedProperty.name} — Unit ${unit.unitNumber}` : selectedProperty.name;
  }, [selectedProperty, selectedUnitId]);

  const handleSave = (data: LeaseFormData) => {
    toast({ title: 'Lease created successfully', description: `Lease for ${leasableLabel}` });
    navigate('/leases/active');
  };

  return (
    <LeaseCreationModal
      open={true}
      onOpenChange={(open) => { if (!open) navigate('/leases'); }}
      leasableLabel={leasableLabel || undefined}
      unitId={selectedUnitId === '__entire__' ? undefined : selectedUnitId}
      onSave={handleSave}
      showPropertySelector
      propertyOptions={propertyOptions}
      onPropertySelect={(id) => { setSelectedPropertyId(id); setSelectedUnitId(''); }}
      selectedPropertyId={selectedPropertyId}
      unitOptions={unitOptions}
      onUnitSelect={setSelectedUnitId}
      selectedUnitId={selectedUnitId}
    />
  );
}
