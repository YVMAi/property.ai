import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Check, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import type { TenantFormData, TenantEntityType, BGVSchedule, Tenant } from '@/types/tenant';
import { emptyTenantForm, getTenantDisplayName } from '@/types/tenant';
import { useToast } from '@/hooks/use-toast';

const STEPS = ['Personal Details', 'Email & Invite', 'Background Verification'];

interface TenantFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: TenantFormData) => void;
  existingEmails: string[];
  editingTenant?: Tenant | null;
  onResendInvite?: (id: string) => void;
}

export default function TenantFormDialog({
  open,
  onClose,
  onSave,
  existingEmails,
  editingTenant,
  onResendInvite,
}: TenantFormDialogProps) {
  const isEditing = !!editingTenant;
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<TenantFormData>(
    editingTenant
      ? {
          entityType: editingTenant.entityType,
          firstName: editingTenant.firstName,
          lastName: editingTenant.lastName,
          companyName: editingTenant.companyName,
          contactPerson: editingTenant.contactPerson,
          dob: editingTenant.dob,
          ssn: editingTenant.ssn,
          ein: editingTenant.ein,
          phone: editingTenant.phone,
          address: { ...editingTenant.address },
          email: editingTenant.email,
          bgvEnabled: editingTenant.bgvEnabled,
          bgvSchedule: editingTenant.bgvSchedule,
        }
      : { ...emptyTenantForm }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const update = (patch: Partial<TenantFormData>) => setForm((p) => ({ ...p, ...patch }));

  const validateStep = (): boolean => {
    const errs: Record<string, string> = {};
    if (step === 0) {
      if (form.entityType === 'individual') {
        if (!form.firstName.trim()) errs.firstName = 'Required';
        if (!form.lastName.trim()) errs.lastName = 'Required';
      } else {
        if (!form.companyName.trim()) errs.companyName = 'Required';
      }
    }
    if (step === 1) {
      if (!form.email.trim()) {
        errs.email = 'Required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errs.email = 'Invalid email';
      } else {
        const checkEmail = form.email.toLowerCase();
        const excludeEmail = editingTenant?.email.toLowerCase();
        if (existingEmails.filter((e) => e !== excludeEmail).includes(checkEmail)) {
          errs.email = 'Email already in use';
        }
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
    onSave(form);
    toast({
      title: isEditing ? 'Tenant updated' : 'Tenant added',
      description: isEditing
        ? `${form.entityType === 'company' ? form.companyName : `${form.firstName} ${form.lastName}`} has been updated.`
        : 'New tenant has been added and invite sent.',
    });
    setForm({ ...emptyTenantForm });
    setStep(0);
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setForm({ ...emptyTenantForm });
      setStep(0);
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Tenant' : 'Add New Tenant'}</DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-4">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                  i < step
                    ? 'bg-primary text-primary-foreground'
                    : i === step
                    ? 'bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-1'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {i < step ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              <span className={`hidden sm:block text-xs truncate ${i <= step ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {s}
              </span>
              {i < STEPS.length - 1 && <div className={`hidden sm:block flex-1 h-0.5 rounded-full ${i < step ? 'bg-primary' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        {/* Step 0: Personal Details */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <Label>Tenant Type</Label>
              <Select value={form.entityType} onValueChange={(v) => update({ entityType: v as TenantEntityType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.entityType === 'individual' ? (
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Date of Birth</Label>
                    <Input type="date" value={form.dob} onChange={(e) => update({ dob: e.target.value })} />
                  </div>
                  <div>
                    <Label>SSN (for BGV)</Label>
                    <Input value={form.ssn} onChange={(e) => update({ ssn: e.target.value })} placeholder="XXX-XX-XXXX" />
                  </div>
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
          </div>
        )}

        {/* Step 1: Email & Invite */}
        {step === 1 && (
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
              <p>An invitation email will be sent to this address upon saving. The tenant must accept the invite before being linked to a lease.</p>
            </div>
            {isEditing && editingTenant?.inviteStatus === 'pending' && onResendInvite && (
              <Button variant="outline" size="sm" onClick={() => onResendInvite(editingTenant.id)}>
                Resend Invite
              </Button>
            )}
          </div>
        )}

        {/* Step 2: BGV */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium text-sm">Run Background Verification</p>
                <p className="text-xs text-muted-foreground">Uses SSN/EIN to generate a screening report</p>
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
                  <p>A background verification will be initiated after saving. Reports will appear in the tenant's dashboard.</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={step === 0 ? onClose : handleBack}>
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
              {isEditing ? 'Update Tenant' : 'Save Tenant'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
