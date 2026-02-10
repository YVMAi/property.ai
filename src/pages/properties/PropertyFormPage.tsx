import { useState, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Upload, X, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { usePropertiesContext } from '@/contexts/PropertiesContext';
import { useOwnersContext } from '@/contexts/OwnersContext';
import { useToast } from '@/hooks/use-toast';
import {
  PROPERTY_TYPE_LABELS,
  UNIT_TYPE_LABELS,
  type PropertyType,
  type PropertyFormData,
  type PropertyUnit,
  type UnitType,
} from '@/types/property';
import { AMENITIES_OPTIONS } from '@/data/propertiesMockData';
import { US_STATES, US_CITIES, DEFAULT_CITIES } from '@/data/usLocations';

const STEPS = ['Details', 'Owner & Agreements', 'Leases & Documents'];

// --- Formatting helpers ---
const formatComma = (v: number | ''): string => {
  if (v === '' || v === 0) return '';
  return v.toLocaleString('en-US');
};

const parseComma = (s: string): number | '' => {
  const cleaned = s.replace(/[^0-9]/g, '');
  return cleaned ? Number(cleaned) : '';
};

const formatCurrency = (v: number | ''): string => {
  if (v === '' || v === 0) return '';
  return v.toLocaleString('en-US');
};

const CURRENT_YEAR = new Date().getFullYear();

const needsUnits = (t: PropertyType) => ['multi_family', 'affordable_multi', 'student_housing'].includes(t);
const needsBedBath = (t: PropertyType) => ['single_family', 'affordable_single', 'commercial'].includes(t);
const isStudentType = (t: PropertyType) => t === 'student_housing';

const emptyForm: PropertyFormData = {
  name: '',
  type: 'single_family',
  address: { street: '', city: '', state: '', zip: '' },
  sqFt: '',
  yearBuilt: '',
  purchasePrice: '',
  purchaseDate: '',
  description: '',
  photos: [],
  ownerId: '',
  bedrooms: '',
  bathrooms: '',
  amenities: [],
  hoaFees: '',
  taxes: '',
  insurance: '',
  units: [],
  agreementIds: [],
  marketRentAvg: '',
};

export default function PropertyFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addProperty, updateProperty, getPropertyById } = usePropertiesContext();
  const { activeOwners } = useOwnersContext();
  const isEdit = Boolean(id);

  const existing = id ? getPropertyById(id) : undefined;

  const [step, setStep] = useState(0);
  const [photoFiles, setPhotoFiles] = useState<{ name: string; url: string; tags: string[]; tagInput: string }[]>([]);
  const [activeTagDropdown, setActiveTagDropdown] = useState<number | null>(null);

  // Master tag list – collects all tags ever used across photos
  const MASTER_TAGS = ['Exterior', 'Interior', 'Kitchen', 'Bathroom', 'Bedroom', 'Living Room', 'Garage', 'Pool', 'Garden', 'Lobby', 'Entrance', 'Aerial', 'Before Renovation', 'After Renovation'];

  const allUsedTags = useMemo(() => {
    const set = new Set(MASTER_TAGS);
    photoFiles.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [photoFiles]);

  const getSuggestions = (input: string, currentTags: string[]) => {
    if (!input.trim()) return [];
    const lower = input.toLowerCase();
    return allUsedTags.filter(
      (t) => t.toLowerCase().includes(lower) && !currentTags.includes(t)
    ).slice(0, 6);
  };
  const [docFiles, setDocFiles] = useState<{ name: string; size: number; type: string }[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<PropertyFormData>(() => {
    if (existing) {
      return {
        name: existing.name,
        type: existing.type,
        address: existing.address,
        sqFt: existing.sqFt,
        yearBuilt: existing.yearBuilt,
        purchasePrice: existing.purchasePrice,
        purchaseDate: existing.purchaseDate,
        description: existing.description,
        photos: existing.photos,
        ownerId: existing.ownerId,
        bedrooms: existing.bedrooms || '',
        bathrooms: existing.bathrooms || '',
        amenities: existing.amenities,
        hoaFees: existing.hoaFees || '',
        taxes: existing.taxes || '',
        insurance: existing.insurance || '',
        units: existing.units,
        agreementIds: existing.agreementIds,
        marketRentAvg: existing.marketRentAvg || '',
      };
    }
    return { ...emptyForm };
  });

  const set = <K extends keyof PropertyFormData>(key: K, val: PropertyFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const setAddress = (field: string, val: string) =>
    setForm((prev) => ({ ...prev, address: { ...prev.address, [field]: val } }));

  const toggleAmenity = (amenity: string) =>
    set('amenities', form.amenities.includes(amenity) ? form.amenities.filter((a) => a !== amenity) : [...form.amenities, amenity]);

  const addUnit = () => {
    if (isStudentType(form.type)) {
      set('units', [...form.units, { unitNumber: `Unit ${form.units.length + 1}`, size: 0, bedrooms: 1, bathrooms: 1, isShared: false, independentWashroom: false, unitAmenities: [] }]);
    } else {
      set('units', [...form.units, { unitNumber: `${100 + form.units.length + 1}`, size: 0, bedrooms: 1, bathrooms: 1, unitType: 'studio' as const }]);
    }
  };

  const removeUnit = (idx: number) => set('units', form.units.filter((_, i) => i !== idx));

  const updateUnit = (idx: number, field: string, val: any) =>
    set('units', form.units.map((u, i) => (i === idx ? { ...u, [field]: val } : u)));

  const handlePhotoUpload = (fileList: FileList | null) => {
    if (!fileList) return;
    Array.from(fileList).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPhotoFiles((prev) => [...prev, { name: file.name, url, tags: [], tagInput: '' }]);
        set('photos', [...form.photos, file.name]);
      }
    });
  };

  const addPhotoTag = (idx: number, tagOverride?: string) => {
    setPhotoFiles((prev) =>
      prev.map((p, i) => {
        const tag = tagOverride || p.tagInput.trim();
        if (i !== idx || !tag) return p;
        if (p.tags.includes(tag)) return { ...p, tagInput: '' };
        return { ...p, tags: [...p.tags, tag], tagInput: '' };
      })
    );
    setActiveTagDropdown(null);
  };

  const removePhotoTag = (photoIdx: number, tagIdx: number) => {
    setPhotoFiles((prev) =>
      prev.map((p, i) => (i === photoIdx ? { ...p, tags: p.tags.filter((_, ti) => ti !== tagIdx) } : p))
    );
  };

  const updatePhotoTagInput = (idx: number, val: string) => {
    setPhotoFiles((prev) => prev.map((p, i) => (i === idx ? { ...p, tagInput: val } : p)));
  };

  const removePhoto = (idx: number) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== idx));
    set('photos', form.photos.filter((_, i) => i !== idx));
  };

  const handleDocUpload = (fileList: FileList | null) => {
    if (!fileList) return;
    Array.from(fileList).forEach((file) => {
      setDocFiles((prev) => [...prev, { name: file.name, size: file.size, type: file.type }]);
    });
  };

  const removeDoc = (idx: number) => {
    setDocFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const selectedOwner = activeOwners.find((o) => o.id === form.ownerId);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Property name is required';
    if (!form.address.street.trim()) errs.street = 'Street is required';
    if (!form.address.state) errs.state = 'State is required';
    if (!form.address.city) errs.city = 'City is required';
    if (form.address.zip && !/^\d{5}$/.test(form.address.zip)) errs.zip = 'ZIP must be 5 digits';
    if (form.sqFt !== '' && (Number(form.sqFt) <= 0 || Number(form.sqFt) > 1000000)) errs.sqFt = 'Enter a valid Sq Ft';
    if (form.yearBuilt !== '' && (Number(form.yearBuilt) < 1800 || Number(form.yearBuilt) > CURRENT_YEAR)) errs.yearBuilt = `Year: 1800–${CURRENT_YEAR}`;
    if (form.purchasePrice !== '' && Number(form.purchasePrice) <= 0) errs.purchasePrice = 'Enter a valid price';
    if (!form.ownerId) errs.ownerId = 'Owner is required';
    if (needsBedBath(form.type)) {
      if (form.bedrooms !== '' && (Number(form.bedrooms) < 0 || Number(form.bedrooms) > 50)) errs.bedrooms = '0–50';
      if (form.bathrooms !== '' && (Number(form.bathrooms) < 0 || Number(form.bathrooms) > 50)) errs.bathrooms = '0–50';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      toast({ title: 'Please fix validation errors', description: 'Check highlighted fields.', variant: 'destructive' });
      if (!form.ownerId && step !== 1) setStep(0);
      return;
    }
    if (isEdit && id) {
      updateProperty(id, form);
      toast({ title: 'Property updated' });
    } else {
      addProperty(form);
      toast({ title: 'Property created' });
    }
    navigate('/properties');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/properties')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-semibold text-foreground">
          {isEdit ? 'Edit Property' : 'Add New Property'}
        </h1>
      </div>

      {/* Steps */}
      <div className="flex gap-2">
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => setStep(i)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              i === step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            {i + 1}. {s}
          </button>
        ))}
      </div>

      {/* Step 1: Details */}
      {step === 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Property Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Property Name *</Label>
                <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Sunset Blvd Complex" />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label>Property Type *</Label>
                <Select value={form.type} onValueChange={(v) => set('type', v as PropertyType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROPERTY_TYPE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Street *</Label>
                <Input value={form.address.street} onChange={(e) => setAddress('street', e.target.value)} placeholder="e.g. 123 Main St" />
                {errors.street && <p className="text-xs text-destructive mt-1">{errors.street}</p>}
              </div>
              <div>
                <Label>City *</Label>
                <Select value={form.address.city} onValueChange={(v) => setAddress('city', v)}>
                  <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                  <SelectContent className="bg-popover z-50 max-h-60">
                    {(form.address.state ? (US_CITIES[form.address.state] || DEFAULT_CITIES) : []).map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.city && <p className="text-xs text-destructive mt-1">{errors.city}</p>}
              </div>
              <div>
                <Label>State *</Label>
                <Select value={form.address.state} onValueChange={(v) => { setAddress('state', v); setAddress('city', ''); }}>
                  <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                  <SelectContent className="bg-popover z-50 max-h-60">
                    {US_STATES.map((st) => (
                      <SelectItem key={st} value={st}>{st}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.state && <p className="text-xs text-destructive mt-1">{errors.state}</p>}
              </div>
              <div>
                <Label>ZIP</Label>
                <Input
                  value={form.address.zip}
                  onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 5); setAddress('zip', v); }}
                  placeholder="e.g. 60601"
                  maxLength={5}
                  inputMode="numeric"
                />
                {errors.zip && <p className="text-xs text-destructive mt-1">{errors.zip}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <Label>Sq Ft</Label>
                <Input
                  value={formatComma(form.sqFt)}
                  onChange={(e) => set('sqFt', parseComma(e.target.value))}
                  placeholder="e.g. 2,500"
                  inputMode="numeric"
                />
                {errors.sqFt && <p className="text-xs text-destructive mt-1">{errors.sqFt}</p>}
              </div>
              <div>
                <Label>Year Built</Label>
                <Input
                  value={form.yearBuilt}
                  onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 4); set('yearBuilt', v ? Number(v) : ''); }}
                  placeholder={`e.g. ${CURRENT_YEAR - 20}`}
                  maxLength={4}
                  inputMode="numeric"
                />
                {errors.yearBuilt && <p className="text-xs text-destructive mt-1">{errors.yearBuilt}</p>}
              </div>
              <div>
                <Label>Purchase Price ($)</Label>
                <Input
                  value={formatCurrency(form.purchasePrice)}
                  onChange={(e) => set('purchasePrice', parseComma(e.target.value))}
                  placeholder="e.g. 350,000"
                  inputMode="numeric"
                />
                {errors.purchasePrice && <p className="text-xs text-destructive mt-1">{errors.purchasePrice}</p>}
              </div>
              <div>
                <Label>Purchase Date</Label>
                <Input type="date" value={form.purchaseDate} onChange={(e) => set('purchaseDate', e.target.value)} max={new Date().toISOString().split('T')[0]} />
              </div>
            </div>

            {/* Type-specific: Beds/Baths/HOA */}
            {needsBedBath(form.type) && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <Label>Bedrooms</Label>
                  <Input
                    value={form.bedrooms}
                    onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 2); set('bedrooms', v ? Number(v) : ''); }}
                    placeholder="e.g. 3"
                    inputMode="numeric"
                    maxLength={2}
                  />
                  {errors.bedrooms && <p className="text-xs text-destructive mt-1">{errors.bedrooms}</p>}
                </div>
                <div>
                  <Label>Bathrooms</Label>
                  <Input
                    value={form.bathrooms}
                    onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 2); set('bathrooms', v ? Number(v) : ''); }}
                    placeholder="e.g. 2"
                    inputMode="numeric"
                    maxLength={2}
                  />
                  {errors.bathrooms && <p className="text-xs text-destructive mt-1">{errors.bathrooms}</p>}
                </div>
                <div>
                  <Label>HOA Fees ($)</Label>
                  <Input
                    value={formatCurrency(form.hoaFees)}
                    onChange={(e) => set('hoaFees', parseComma(e.target.value))}
                    placeholder="e.g. 500"
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <Label>Taxes ($)</Label>
                  <Input
                    value={formatCurrency(form.taxes)}
                    onChange={(e) => set('taxes', parseComma(e.target.value))}
                    placeholder="e.g. 3,200"
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <Label>Insurance ($)</Label>
                  <Input
                    value={formatCurrency(form.insurance)}
                    onChange={(e) => set('insurance', parseComma(e.target.value))}
                    placeholder="e.g. 1,500"
                    inputMode="numeric"
                  />
                </div>
              </div>
            )}

            {/* Units for multi-family */}
            {needsUnits(form.type) && !isStudentType(form.type) && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Units</Label>
                  <Button size="sm" variant="outline" onClick={addUnit} className="gap-1">
                    <Plus className="h-3 w-3" /> Add Unit
                  </Button>
                </div>
                {form.units.length > 0 && (
                  <div className="flex items-center gap-2 px-2 pb-1 text-xs font-medium text-muted-foreground">
                    <span className="w-24">Unit Name</span>
                    <span className="w-20">Sq Ft</span>
                    <span className="w-28">Type</span>
                    <span className="w-20">Bathrooms</span>
                    <span className="w-7" />
                  </div>
                )}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {form.units.map((u, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                      <Input className="w-24 h-8 text-sm" value={u.unitNumber} onChange={(e) => updateUnit(i, 'unitNumber', e.target.value)} placeholder="Unit name" />
                      <Input className="w-20 h-8 text-sm" type="number" value={u.size || ''} onChange={(e) => updateUnit(i, 'size', Number(e.target.value))} placeholder="Sq ft" />
                      <Select value={u.unitType || 'studio'} onValueChange={(v) => updateUnit(i, 'unitType', v)}>
                        <SelectTrigger className="w-28 h-8 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(UNIT_TYPE_LABELS).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input className="w-20 h-8 text-sm" type="number" value={u.bathrooms} onChange={(e) => updateUnit(i, 'bathrooms', Number(e.target.value))} placeholder="Baths" />
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeUnit(i)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Beds for student housing */}
            {isStudentType(form.type) && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Units / Beds</Label>
                  <Button size="sm" variant="outline" onClick={addUnit} className="gap-1">
                    <Plus className="h-3 w-3" /> Add Unit
                  </Button>
                </div>
                {form.units.length > 0 && (
                  <div className="flex items-center gap-2 px-2 pb-1 text-xs font-medium text-muted-foreground">
                    <span className="w-24">Unit Name</span>
                    <span className="w-20"># of Beds</span>
                    <span className="w-16">Shared</span>
                    <span className="w-20">Ind. Washroom</span>
                    <span className="w-28">Amenities</span>
                    <span className="w-7" />
                  </div>
                )}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {form.units.map((u, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                      <Input className="w-24 h-8 text-sm" value={u.unitNumber} onChange={(e) => updateUnit(i, 'unitNumber', e.target.value)} placeholder="Unit name" />
                      <Input className="w-20 h-8 text-sm" type="number" value={u.bedrooms} onChange={(e) => updateUnit(i, 'bedrooms', Number(e.target.value))} placeholder="Beds" />
                      <div className="w-16 flex justify-center">
                        <Checkbox checked={u.isShared || false} onCheckedChange={(v) => updateUnit(i, 'isShared', v)} />
                      </div>
                      <div className="w-20 flex justify-center">
                        <Checkbox checked={u.independentWashroom || false} onCheckedChange={(v) => updateUnit(i, 'independentWashroom', v)} />
                      </div>
                      <Input className="w-28 h-8 text-sm" value={(u.unitAmenities || []).join(', ')} onChange={(e) => updateUnit(i, 'unitAmenities', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} placeholder="AC, WiFi..." />
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeUnit(i)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} />
            </div>

            <div>
              <Label>Market Rent Avg ($)</Label>
              <Input type="number" value={form.marketRentAvg} onChange={(e) => set('marketRentAvg', e.target.value ? Number(e.target.value) : '')} placeholder="Placeholder for market data" />
            </div>

            <div>
              <Label className="mb-2 block">Amenities</Label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES_OPTIONS.map((a) => (
                  <Badge
                    key={a}
                    variant={form.amenities.includes(a) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleAmenity(a)}
                  >
                    {a}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <Label className="mb-2 block">Property Photos</Label>
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors border-border hover:border-primary/50"
                onClick={() => photoInputRef.current?.click()}
              >
                <Image className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                <p className="text-sm text-muted-foreground">Click to upload photos</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">JPG, PNG, WebP up to 10 MB each</p>
                <input
                  ref={photoInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handlePhotoUpload(e.target.files)}
                />
              </div>
              {photoFiles.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                  {photoFiles.map((p, i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden bg-muted border border-border">
                      <div className="aspect-video relative">
                        <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="p-2 space-y-1.5">
                        <div className="flex flex-wrap gap-1">
                          {p.tags.map((tag, ti) => (
                            <Badge key={ti} variant="secondary" className="text-xs gap-0.5 pr-1">
                              {tag}
                              <button type="button" onClick={() => removePhotoTag(i, ti)} className="ml-0.5 hover:text-destructive">
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="relative flex gap-1">
                          <Input
                            className="h-7 text-xs"
                            placeholder="Add tag..."
                            value={p.tagInput}
                            onChange={(e) => { updatePhotoTagInput(i, e.target.value); setActiveTagDropdown(i); }}
                            onFocus={() => setActiveTagDropdown(i)}
                            onBlur={() => setTimeout(() => setActiveTagDropdown(null), 150)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPhotoTag(i); } }}
                          />
                          <Button type="button" size="sm" variant="outline" className="h-7 px-2 text-xs shrink-0" onClick={() => addPhotoTag(i)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                          {activeTagDropdown === i && getSuggestions(p.tagInput, p.tags).length > 0 && (
                            <div className="absolute top-full left-0 mt-1 w-48 z-50 bg-popover border border-border rounded-md shadow-md py-1 max-h-40 overflow-y-auto">
                              {getSuggestions(p.tagInput, p.tags).map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent text-popover-foreground transition-colors"
                                  onMouseDown={(e) => { e.preventDefault(); addPhotoTag(i, s); }}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Owner & Agreements */}
      {step === 1 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Owner & Agreements</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Link Owner *</Label>
              <Select value={form.ownerId} onValueChange={(v) => set('ownerId', v)}>
                <SelectTrigger><SelectValue placeholder="Select an owner" /></SelectTrigger>
                <SelectContent>
                  {activeOwners.filter((o) => o.status === 'active').map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.ownerType === 'company' ? o.companyName : `${o.firstName} ${o.lastName}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedOwner && selectedOwner.agreements.length > 0 && (
              <div>
                <Label className="mb-2 block">Owner's Agreements</Label>
                <div className="space-y-2">
                  {selectedOwner.agreements.map((ag) => (
                    <label key={ag.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 cursor-pointer">
                      <Checkbox
                        checked={form.agreementIds.includes(ag.id)}
                        onCheckedChange={(checked) => {
                          set(
                            'agreementIds',
                            checked
                              ? [...form.agreementIds, ag.id]
                              : form.agreementIds.filter((x) => x !== ag.id)
                          );
                        }}
                      />
                      <span className="text-sm">{ag.fileName}</span>
                      <Badge variant="outline" className="text-xs ml-auto">
                        {ag.feePerUnit ? `$${ag.feePerUnit}/unit` : ''} {ag.feePercentRent ? `${ag.feePercentRent}%` : ''}
                      </Badge>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 rounded-lg bg-muted/30 text-sm text-muted-foreground">
              <Upload className="h-4 w-4 inline mr-2" />
              Property-specific document uploads (Deed, Survey, HOA Rules) will be available with Lovable Cloud storage.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Leases & Documents */}
      {step === 2 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Leases & Documents</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/30 text-sm text-muted-foreground">
              {needsUnits(form.type)
                ? isStudentType(form.type)
                  ? 'Leases are added at the bed level. You can manage leases after creating the property.'
                  : 'Leases are added at the unit level. You can manage leases after creating the property.'
                : 'Leases are added at the property level. You can manage leases after creating the property.'}
            </div>

            {existing && existing.leases.length > 0 && (
              <div>
                <Label className="mb-2 block">Existing Leases</Label>
                <div className="space-y-2">
                  {existing.leases.map((l) => (
                    <div key={l.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <div>
                        <p className="text-sm font-medium">{l.tenantName}</p>
                        <p className="text-xs text-muted-foreground">
                          {l.unitId || 'Property-level'} · ${l.rent}/mo · {l.startDate} to {l.endDate}
                        </p>
                      </div>
                      <Badge variant={l.status === 'active' ? 'secondary' : 'outline'} className="text-xs">
                        {l.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Document Upload */}
            <div>
              <Label className="mb-2 block">Upload Documents</Label>
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors border-border hover:border-primary/50"
                onClick={() => docInputRef.current?.click()}
              >
                <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                <p className="text-sm text-muted-foreground">Click to upload documents</p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">PDF, Images, Documents up to 50 MB</p>
                <input
                  ref={docInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleDocUpload(e.target.files)}
                />
              </div>
              {docFiles.length > 0 && (
                <div className="space-y-1.5 mt-3">
                  {docFiles.map((f, i) => (
                    <div key={i} className="flex items-center justify-between bg-muted/50 rounded px-3 py-1.5 text-sm">
                      <span className="truncate mr-2">{f.name}</span>
                      <span className="text-xs text-muted-foreground mr-2">{(f.size / 1024).toFixed(0)} KB</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => removeDoc(i)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => step > 0 ? setStep(step - 1) : navigate('/properties')}>
          {step === 0 ? 'Cancel' : 'Previous'}
        </Button>
        <div className="flex gap-2">
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(step + 1)}>Next</Button>
          ) : (
            <Button onClick={handleSave}>{isEdit ? 'Save Changes' : 'Create Property'}</Button>
          )}
        </div>
      </div>
    </div>
  );
}
