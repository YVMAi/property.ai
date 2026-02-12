import { useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePropertiesContext } from '@/contexts/PropertiesContext';
import { toast } from '@/hooks/use-toast';
import {
  EMPTY_LISTING_FORM,
  PROPERTY_AMENITIES_OPTIONS,
  UNIT_AMENITIES_OPTIONS,
  type ListingFormData,
  type ListingAmenity,
  type ListingFee,
} from '@/types/listing';

const generateId = () => Math.random().toString(36).substring(2, 11);

export function useListingFormState() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { activeProperties } = usePropertiesContext();

  const prePropertyId = searchParams.get('propertyId') || '';
  const preUnitId = searchParams.get('unitId') || '';
  const mode = (searchParams.get('mode') as 'create' | 'edit' | 'view') || 'create';

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ListingFormData>({
    ...EMPTY_LISTING_FORM,
    propertyId: prePropertyId,
    unitId: preUnitId,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedProperty = activeProperties.find((p) => p.id === form.propertyId);

  const vacantUnits = useMemo(() => {
    if (!selectedProperty) return [];
    const activeLeaseUnitIds = new Set(
      selectedProperty.leases
        .filter((l) => l.status === 'active')
        .map((l) => l.unitId || l.propertyId)
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

  const selectedUnit = selectedProperty?.units.find((u) => u.id === form.unitId);

  const updateForm = useCallback(<K extends keyof ListingFormData>(key: K, value: ListingFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  // Auto-populate amenities from property when property changes
  const initPropertyAmenities = useCallback(() => {
    if (!selectedProperty) return;
    const amenities: ListingAmenity[] = selectedProperty.amenities.map((a) => ({
      name: a,
      included: true,
    }));
    updateForm('propertyAmenities', amenities);

    const addr = selectedProperty.address;
    updateForm(
      'locationDescription',
      `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}`
    );
    updateForm('propertyPhotos', [...selectedProperty.photos]);
  }, [selectedProperty, updateForm]);

  const initUnitAmenities = useCallback(() => {
    if (!selectedUnit) return;
    const amenities: ListingAmenity[] = (selectedUnit.unitAmenities || []).map((a) => ({
      name: a,
      included: true,
    }));
    updateForm('unitAmenities', amenities);
    updateForm('unitLocationNotes', `Unit ${selectedUnit.unitNumber} — ${selectedUnit.size} sqft, ${selectedUnit.bedrooms} bed / ${selectedUnit.bathrooms} bath`);
  }, [selectedUnit, updateForm]);

  const addFee = useCallback(() => {
    const newFee: ListingFee = {
      id: generateId(),
      type: 'other',
      label: '',
      amount: 0,
      frequency: 'one_time',
      required: false,
    };
    setForm((prev) => ({ ...prev, fees: [...prev.fees, newFee] }));
  }, []);

  const updateFee = useCallback((id: string, data: Partial<ListingFee>) => {
    setForm((prev) => ({
      ...prev,
      fees: prev.fees.map((f) => (f.id === id ? { ...f, ...data } : f)),
    }));
  }, []);

  const removeFee = useCallback((id: string) => {
    setForm((prev) => ({ ...prev, fees: prev.fees.filter((f) => f.id !== id) }));
  }, []);

  const moveInTotal = useMemo(() => {
    const rent = Number(form.rentalAmount) || 0;
    const deposit = Number(form.securityDeposit) || 0;
    const feesTotal = form.fees
      .filter((f) => f.frequency === 'one_time')
      .reduce((sum, f) => sum + f.amount, 0);
    return rent + deposit + feesTotal;
  }, [form.rentalAmount, form.securityDeposit, form.fees]);

  const validateStep = useCallback((s: number): boolean => {
    const errs: Record<string, string> = {};
    if (s === 0) {
      if (!form.propertyId) errs.propertyId = 'Select a property';
      if (!form.unitId) errs.unitId = 'Select a unit';
    }
    if (s === 4) {
      if (!form.rentalAmount || Number(form.rentalAmount) <= 0) errs.rentalAmount = 'Enter a valid rent amount';
    }
    if (s === 5) {
      if (!form.availableFrom) errs.availableFrom = 'Set an availability date';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form]);

  const handleNext = useCallback(() => {
    if (!validateStep(step)) return;
    if (step === 0) {
      initPropertyAmenities();
      initUnitAmenities();
    }
    setStep((s) => Math.min(s + 1, 6));
  }, [step, validateStep, initPropertyAmenities, initUnitAmenities]);

  const handleBack = useCallback(() => setStep((s) => Math.max(s - 1, 0)), []);

  const handleSaveDraft = useCallback(() => {
    toast({ title: 'Listing saved as draft', description: 'You can publish it from the Listings page.' });
    navigate('/leases/listings');
  }, [navigate]);

  const handlePublish = useCallback(() => {
    if (!validateStep(0) || !validateStep(4) || !validateStep(5)) {
      toast({ title: 'Validation error', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    if (form.listingStatus === 'draft') {
      toast({ title: 'Listing saved as draft', description: 'You can publish it from the Listings page.' });
    } else {
      toast({ title: 'Listing published to Zillow', description: 'It may take a few minutes to appear on Zillow.' });
    }
    navigate('/leases/listings');
  }, [navigate, validateStep, form.listingStatus]);

  const suggestRent = useCallback(() => {
    // AI placeholder – generates a suggestion based on property data
    const base = selectedProperty?.marketRentAvg || 1500;
    const variation = Math.floor(Math.random() * 400) - 200;
    const suggested = Math.max(800, base + variation);
    updateForm('aiSuggestedRent', suggested);
    toast({ title: 'AI Rent Suggestion', description: `Based on market comps, suggested rent is $${suggested.toLocaleString()}/mo.` });
  }, [selectedProperty, updateForm]);

  return {
    step,
    setStep,
    form,
    updateForm,
    errors,
    mode,
    selectedProperty,
    selectedUnit,
    vacantUnits,
    activeProperties,
    addFee,
    updateFee,
    removeFee,
    moveInTotal,
    handleNext,
    handleBack,
    handleSaveDraft,
    handlePublish,
    suggestRent,
    navigate,
  };
}
