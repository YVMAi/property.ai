import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Check, ChevronLeft, ChevronRight, ArrowLeft, AlertCircle, X, Plus, Upload, FileText, Trash2 } from 'lucide-react';
import type { VendorFormData, VendorType, PaymentTerms, PaymentMethod, BGVSchedule, VendorFormDocument } from '@/types/vendor';
import { emptyVendorForm, PREDEFINED_CATEGORIES, PREDEFINED_REGIONS, VENDOR_TAGS } from '@/types/vendor';
import { useVendorsContext } from '@/contexts/VendorsContext';
import { useOwnersContext } from '@/contexts/OwnersContext';
import { useTenantsContext } from '@/contexts/TenantsContext';
import { useToast } from '@/hooks/use-toast';

const STEPS = ['Personal / Business Details', 'Categories & Regions', 'Payment & Compliance', 'Email & Invite', 'Background Verification'];

export default function VendorFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getVendorById, addVendor, updateVendor, getAllEmails, runBGV, resendInvite } = useVendorsContext();
  const { getAllEmails: getOwnerEmails } = useOwnersContext();
  const { getAllEmails: getTenantEmails } = useTenantsContext();
  const { toast } = useToast();

  const editingVendor = id ? getVendorById(id) : undefined;
  const isEditing = !!editingVendor;

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<VendorFormData>(
    editingVendor
      ? {
          vendorType: editingVendor.vendorType,
          firstName: editingVendor.firstName,
          lastName: editingVendor.lastName,
          companyName: editingVendor.companyName,
          contactPerson: editingVendor.contactPerson,
          phone: editingVendor.phone,
          address: { ...editingVendor.address },
          ssn: editingVendor.ssn,
          ein: editingVendor.ein,
          emergencyContactName: editingVendor.emergencyContactName,
          emergencyContactPhone: editingVendor.emergencyContactPhone,
          availability247: editingVendor.availability247,
          categories: [...editingVendor.categories],
          customCategories: [...editingVendor.customCategories],
          regions: [...editingVendor.regions],
          defaultHourlyRate: editingVendor.defaultHourlyRate,
          paymentTerms: editingVendor.paymentTerms,
          defaultPaymentMethod: editingVendor.defaultPaymentMethod,
          tags: [...editingVendor.tags],
          email: editingVendor.email,
          bgvEnabled: editingVendor.bgvEnabled,
          bgvSchedule: editingVendor.bgvSchedule,
          formDocuments: editingVendor.documents.map((d) => ({
            id: d.id,
            fileName: d.fileName,
            type: d.type === 'w9' ? 'w9' as const : d.type === 'insurance' ? 'insurance' as const : d.type === 'license' ? 'license' as const : 'other' as const,
            fileSize: 0,
            addedAt: d.uploadedAt,
          })),
        }
      : { ...emptyVendorForm }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [customRegionInput, setCustomRegionInput] = useState('');

  const update = (patch: Partial<VendorFormData>) => setForm((p) => ({ ...p, ...patch }));

  const allSystemEmails = [
    ...getAllEmails(editingVendor?.id),
    ...getOwnerEmails(),
    ...getTenantEmails(),
  ];

  const toggleCategory = (cat: string) => {
    const cats = form.categories.includes(cat)
      ? form.categories.filter((c) => c !== cat)
      : [...form.categories, cat];
    update({ categories: cats });
  };

  const addCustomCategory = () => {
    const trimmed = customCategoryInput.trim();
    if (trimmed && !form.categories.includes(trimmed) && !form.customCategories.includes(trimmed)) {
      update({
        categories: [...form.categories, trimmed],
        customCategories: [...form.customCategories, trimmed],
      });
      setCustomCategoryInput('');
    }
  };

  const toggleRegion = (region: string) => {
    const regions = form.regions.includes(region)
      ? form.regions.filter((r) => r !== region)
      : [...form.regions, region];
    update({ regions });
  };

  const addCustomRegion = () => {
    const trimmed = customRegionInput.trim();
    if (trimmed && !form.regions.includes(trimmed)) {
      update({ regions: [...form.regions, trimmed] });
      setCustomRegionInput('');
    }
  };

  const toggleTag = (tag: string) => {
    const tags = form.tags.includes(tag)
      ? form.tags.filter((t) => t !== tag)
      : [...form.tags, tag];
    update({ tags });
  };

  const validateStep = (): boolean => {
    const errs: Record<string, string> = {};
    if (step === 0) {
      if (form.vendorType === 'individual') {
        if (!form.firstName.trim()) errs.firstName = 'Required';
        if (!form.lastName.trim()) errs.lastName = 'Required';
      } else {
        if (!form.companyName.trim()) errs.companyName = 'Required';
      }
    }
    if (step === 1) {
      if (form.categories.length === 0) errs.categories = 'Select at least one category';
    }
    if (step === 3) {
      if (!form.email.trim()) {
        errs.email = 'Required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errs.email = 'Invalid email';
      } else if (allSystemEmails.includes(form.email.toLowerCase())) {
        errs.email = 'Email already in use across the system';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSave = () => {
    if (!validateStep()) return;
    if (isEditing) {
      updateVendor(editingVendor.id, form);
      toast({ title: 'Vendor updated', description: 'Vendor details have been updated.' });
    } else {
      const newVendor = addVendor(form);
      if (form.bgvEnabled) runBGV(newVendor.id);
      toast({ title: 'Vendor added', description: 'New vendor has been added and invite sent.' });
    }
    navigate('/users/vendors');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/users/vendors')} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {isEditing ? 'Edit Vendor' : 'Add New Vendor'}
          </h1>
          <p className="text-muted-foreground mt-0.5">
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => { if (i < step) setStep(i); }}
            className="flex items-center gap-2 flex-1 group"
            disabled={i > step}
          >
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 transition-colors ${
                i < step
                  ? 'bg-primary text-primary-foreground'
                  : i === step
                  ? 'bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`hidden lg:block text-xs truncate ${i <= step ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`hidden lg:block flex-1 h-0.5 rounded-full ml-2 ${i < step ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </button>
        ))}
      </div>

      {/* Step content */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          {/* Step 0: Personal/Business Details */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <Label>Vendor Type</Label>
                <Select value={form.vendorType} onValueChange={(v) => update({ vendorType: v as VendorType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.vendorType === 'individual' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>First Name *</Label>
                      <Input value={form.firstName} onChange={(e) => update({ firstName: e.target.value })} className={errors.firstName ? 'border-destructive' : ''} />
                      {errors.firstName && <p className="text-xs text-destructive-foreground mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <Label>Last Name *</Label>
                      <Input value={form.lastName} onChange={(e) => update({ lastName: e.target.value })} className={errors.lastName ? 'border-destructive' : ''} />
                      {errors.lastName && <p className="text-xs text-destructive-foreground mt-1">{errors.lastName}</p>}
                    </div>
                  </div>
                  <div>
                    <Label>SSN (for BGV)</Label>
                    <Input value={form.ssn} onChange={(e) => update({ ssn: e.target.value })} placeholder="XXX-XX-XXXX" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label>Company Name *</Label>
                    <Input value={form.companyName} onChange={(e) => update({ companyName: e.target.value })} className={errors.companyName ? 'border-destructive' : ''} />
                    {errors.companyName && <p className="text-xs text-destructive-foreground mt-1">{errors.companyName}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Contact Person</Label>
                      <Input value={form.contactPerson} onChange={(e) => update({ contactPerson: e.target.value })} />
                    </div>
                    <div>
                      <Label>EIN / Tax ID</Label>
                      <Input value={form.ein} onChange={(e) => update({ ein: e.target.value })} />
                    </div>
                  </div>
                </>
              )}

              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => update({ phone: e.target.value })} />
              </div>
              <div>
                <Label>Address</Label>
                <Input placeholder="Street" value={form.address.street} onChange={(e) => update({ address: { ...form.address, street: e.target.value } })} className="mb-2" />
                <div className="grid grid-cols-3 gap-2">
                  <Input placeholder="City" value={form.address.city} onChange={(e) => update({ address: { ...form.address, city: e.target.value } })} />
                  <Input placeholder="State" value={form.address.state} onChange={(e) => update({ address: { ...form.address, state: e.target.value } })} />
                  <Input placeholder="ZIP" value={form.address.zip} onChange={(e) => update({ address: { ...form.address, zip: e.target.value } })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Emergency Contact Name</Label>
                  <Input value={form.emergencyContactName} onChange={(e) => update({ emergencyContactName: e.target.value })} />
                </div>
                <div>
                  <Label>Emergency Contact Phone</Label>
                  <Input value={form.emergencyContactPhone} onChange={(e) => update({ emergencyContactPhone: e.target.value })} />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm">24/7 Availability</p>
                  <p className="text-xs text-muted-foreground">Available for emergency calls anytime</p>
                </div>
                <Switch checked={form.availability247} onCheckedChange={(v) => update({ availability247: v })} />
              </div>
            </div>
          )}

          {/* Step 1: Categories & Regions */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label className="mb-2 block">Categories *</Label>
                {errors.categories && <p className="text-xs text-destructive-foreground mb-2 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.categories}</p>}
                <div className="flex flex-wrap gap-2 mb-3">
                  {PREDEFINED_CATEGORIES.map((cat) => (
                    <Badge
                      key={cat}
                      variant={form.categories.includes(cat) ? 'default' : 'outline'}
                      className={`cursor-pointer transition-colors ${form.categories.includes(cat) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                      onClick={() => toggleCategory(cat)}
                    >
                      {cat}
                      {form.categories.includes(cat) && <X className="h-3 w-3 ml-1" />}
                    </Badge>
                  ))}
                  {form.customCategories.map((cat) => (
                    <Badge
                      key={cat}
                      className="bg-primary text-primary-foreground cursor-pointer"
                      onClick={() => {
                        update({
                          categories: form.categories.filter((c) => c !== cat),
                          customCategories: form.customCategories.filter((c) => c !== cat),
                        });
                      }}
                    >
                      {cat} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom category..."
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomCategory())}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addCustomCategory}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Regions / Service Areas</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {PREDEFINED_REGIONS.map((region) => (
                    <Badge
                      key={region}
                      variant={form.regions.includes(region) ? 'default' : 'outline'}
                      className={`cursor-pointer transition-colors ${form.regions.includes(region) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                      onClick={() => toggleRegion(region)}
                    >
                      {region}
                      {form.regions.includes(region) && <X className="h-3 w-3 ml-1" />}
                    </Badge>
                  ))}
                  {form.regions.filter((r) => !PREDEFINED_REGIONS.includes(r)).map((region) => (
                    <Badge
                      key={region}
                      className="bg-primary text-primary-foreground cursor-pointer"
                      onClick={() => update({ regions: form.regions.filter((r) => r !== region) })}
                    >
                      {region} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom region..."
                    value={customRegionInput}
                    onChange={(e) => setCustomRegionInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomRegion())}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addCustomRegion}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label>Default Hourly Rate ($/hr)</Label>
                <Input
                  type="number"
                  value={form.defaultHourlyRate}
                  onChange={(e) => update({ defaultHourlyRate: e.target.value ? Number(e.target.value) : '' })}
                  placeholder="Optional"
                />
              </div>
            </div>
          )}

          {/* Step 2: Payment & Compliance */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Payment Terms</Label>
                  <Select value={form.paymentTerms} onValueChange={(v) => update({ paymentTerms: v as PaymentTerms })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="net_15">Net 15</SelectItem>
                      <SelectItem value="net_30">Net 30</SelectItem>
                      <SelectItem value="net_60">Net 60</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="bi_weekly">Bi-Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Default Payment Method</Label>
                  <Select value={form.defaultPaymentMethod} onValueChange={(v) => update({ defaultPaymentMethod: v as PaymentMethod })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ach">ACH</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="wire">Wire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Document Uploads</Label>
                <p className="text-xs text-muted-foreground mb-3">Upload Master Agreement, W-9/Tax Form, Insurance Certificate, and License/Certification documents.</p>
                
                {/* Uploaded documents list */}
                {form.formDocuments.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {form.formDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{doc.fileName}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs capitalize">{doc.type.replace('_', ' ')}</Badge>
                              {doc.fileSize > 0 && <span className="text-xs text-muted-foreground">{(doc.fileSize / 1024).toFixed(1)} KB</span>}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => update({ formDocuments: form.formDocuments.filter((d) => d.id !== doc.id) })}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive-foreground" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { type: 'master_agreement', label: 'Master Agreement' },
                    { type: 'w9', label: 'W-9 / Tax Form' },
                    { type: 'insurance', label: 'Insurance Certificate' },
                    { type: 'license', label: 'License / Certification' },
                    { type: 'other', label: 'Other Document' },
                  ] as { type: VendorFormDocument['type']; label: string }[]).map(({ type, label }) => (
                    <label key={type} className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const newDoc: VendorFormDocument = {
                            id: Math.random().toString(36).substring(2, 11),
                            fileName: file.name,
                            type,
                            fileSize: file.size,
                            addedAt: new Date().toISOString(),
                          };
                          update({ formDocuments: [...form.formDocuments, newDoc] });
                          e.target.value = '';
                        }}
                      />
                      <div className="flex items-center gap-2 p-3 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-muted/30 transition-colors">
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{label}</span>
                      </div>
                    </label>
                  ))}
                </div>

                {!form.formDocuments.some((d) => d.type === 'insurance') && form.formDocuments.length > 0 && (
                  <p className="text-xs text-warning-foreground mt-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> No insurance certificate uploaded. Consider adding one.
                  </p>
                )}
              </div>

              <div>
                <Label className="mb-2 block">Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {VENDOR_TAGS.map((tag) => (
                    <Badge
                      key={tag}
                      variant={form.tags.includes(tag) ? 'default' : 'outline'}
                      className={`cursor-pointer transition-colors ${form.tags.includes(tag) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                      {form.tags.includes(tag) && <X className="h-3 w-3 ml-1" />}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Email & Invite */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label>Email Address *</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => update({ email: e.target.value })}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && <p className="text-xs text-destructive-foreground mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.email}</p>}
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                <p>An invitation email will be sent to this address upon saving. The vendor can accept to access the portal (view assigned work orders, submit invoices).</p>
              </div>
              {isEditing && editingVendor?.inviteStatus === 'pending' && (
                <Button variant="outline" size="sm" onClick={() => resendInvite(editingVendor.id)}>
                  Resend Invite
                </Button>
              )}
            </div>
          )}

          {/* Step 4: BGV */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm">Run Background Verification</p>
                  <p className="text-xs text-muted-foreground">Uses SSN/EIN to generate a screening report (Credit, Criminal, License)</p>
                </div>
                <Switch checked={form.bgvEnabled} onCheckedChange={(v) => update({ bgvEnabled: v })} />
              </div>

              {form.bgvEnabled && (
                <>
                  <div>
                    <Label>Schedule</Label>
                    <Select value={form.bgvSchedule} onValueChange={(v) => update({ bgvSchedule: v as BGVSchedule })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one-time">One-time</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                    <p>A background verification will be initiated after saving. Reports will appear in the vendor's dashboard.</p>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={step === 0 ? () => navigate('/users/vendors') : handleBack}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          {step === 0 ? 'Cancel' : 'Back'}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button className="btn-primary" onClick={handleNext}>
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button className="btn-primary" onClick={handleSave}>
            <Check className="h-4 w-4 mr-1" />
            {isEditing ? 'Update Vendor' : 'Save Vendor'}
          </Button>
        )}
      </div>
    </div>
  );
}
