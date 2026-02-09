import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Check, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import PersonalDetailsStep from '@/components/owners/PersonalDetailsStep';
import TaxDetailsStep from '@/components/owners/TaxDetailsStep';
import EmailsStep from '@/components/owners/EmailsStep';
import PropertiesDocumentsStep from '@/components/owners/PropertiesDocumentsStep';
import { useOwnersContext } from '@/contexts/OwnersContext';
import type { OwnerFormData, OwnerType, TaxClassification, OwnerAddress } from '@/types/owner';

const STEPS = ['Personal Details', 'Tax Details', 'Emails & Invites', 'Properties & Documents'];

const emptyAddress: OwnerAddress = { street: '', city: '', state: '', zip: '' };

export default function OwnerFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getOwnerById, addOwner, updateOwner } = useOwnersContext();

  const editingOwner = id ? getOwnerById(id) : null;
  const isEditing = !!editingOwner;

  const [step, setStep] = useState(0);
  const [ownerType, setOwnerType] = useState<OwnerType>(editingOwner?.ownerType || 'individual');
  const [firstName, setFirstName] = useState(editingOwner?.firstName || '');
  const [lastName, setLastName] = useState(editingOwner?.lastName || '');
  const [companyName, setCompanyName] = useState(editingOwner?.companyName || '');
  const [contactPerson, setContactPerson] = useState(editingOwner?.contactPerson || '');
  const [phone, setPhone] = useState(editingOwner?.phone || '');
  const [address, setAddress] = useState<OwnerAddress>(editingOwner?.address || { ...emptyAddress });
  const [ssn, setSsn] = useState(editingOwner?.ssn || '');
  const [ein, setEin] = useState(editingOwner?.ein || '');
  const [taxId, setTaxId] = useState(editingOwner?.taxId || '');
  const [taxClassification, setTaxClassification] = useState<TaxClassification>(
    editingOwner?.taxClassification || 'individual'
  );
  const [emails, setEmails] = useState(editingOwner?.emails || []);
  const [linkedPropertyIds, setLinkedPropertyIds] = useState<string[]>(
    editingOwner?.linkedPropertyIds || []
  );
  const [documents, setDocuments] = useState(editingOwner?.documents || []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 0) {
      if (ownerType === 'individual') {
        if (!firstName.trim()) newErrors.firstName = 'First name is required';
        if (!lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!ssn.trim()) newErrors.ssn = 'SSN is required';
      } else {
        if (!companyName.trim()) newErrors.companyName = 'Company name is required';
        if (!contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';
        if (!ein.trim()) newErrors.ein = 'EIN is required';
      }
    }
    if (step === 2) {
      if (emails.length === 0) newErrors.emails = 'At least one email is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < STEPS.length - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSave = () => {
    if (!validateStep()) return;
    const formData: OwnerFormData = {
      ownerType,
      firstName,
      lastName,
      companyName,
      contactPerson,
      phone,
      address,
      ssn,
      ein,
      taxId,
      taxClassification,
      emails: emails.map((e) => ({
        id: e.id,
        email: e.email,
        isPrimary: e.isPrimary,
        status: e.status,
        inviteToken: e.inviteToken,
        inviteSentAt: e.inviteSentAt,
      })) as any,
      linkedPropertyIds,
      documents: documents.map((d) => ({
        id: (d as any).id,
        fileName: d.fileName,
        fileUrl: d.fileUrl,
        tags: d.tags,
        uploadedAt: d.uploadedAt,
      })) as any,
    };

    if (isEditing && editingOwner) {
      updateOwner(editingOwner.id, formData);
    } else {
      addOwner(formData);
    }

    const displayName = ownerType === 'individual'
      ? `${firstName} ${lastName}`
      : companyName;

    toast({
      title: isEditing ? 'Owner updated' : 'Owner created',
      description: `${displayName} has been ${isEditing ? 'updated' : 'added'} successfully.`,
    });
    navigate('/users/owners');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/users/owners')}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {isEditing ? 'Edit Owner' : 'Add New Owner'}
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
            onClick={() => {
              if (i < step) setStep(i);
            }}
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
            <span
              className={`hidden md:block text-sm truncate ${
                i <= step ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}
            >
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={`hidden md:block flex-1 h-0.5 rounded-full ml-2 ${
                  i < step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </button>
        ))}
      </div>

      {/* Step content */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          {step === 0 && (
            <PersonalDetailsStep
              data={{
                ownerType,
                firstName,
                lastName,
                companyName,
                contactPerson,
                phone,
                address,
                ssn,
                ein,
              }}
              onChange={(d) => {
                if (d.ownerType !== undefined) setOwnerType(d.ownerType);
                if (d.firstName !== undefined) setFirstName(d.firstName);
                if (d.lastName !== undefined) setLastName(d.lastName);
                if (d.companyName !== undefined) setCompanyName(d.companyName);
                if (d.contactPerson !== undefined) setContactPerson(d.contactPerson);
                if (d.phone !== undefined) setPhone(d.phone);
                if (d.address) setAddress(d.address);
                if (d.ssn !== undefined) setSsn(d.ssn);
                if (d.ein !== undefined) setEin(d.ein);
              }}
              errors={errors}
            />
          )}
          {step === 1 && (
            <TaxDetailsStep
              data={{ taxId, taxClassification }}
              onChange={(d) => {
                if (d.taxId !== undefined) setTaxId(d.taxId);
                if (d.taxClassification) setTaxClassification(d.taxClassification);
              }}
            />
          )}
          {step === 2 && (
            <EmailsStep
              emails={emails}
              onChange={(updated) => setEmails(updated as any)}
              errors={errors}
            />
          )}
          {step === 3 && (
            <PropertiesDocumentsStep
              linkedPropertyIds={linkedPropertyIds}
              documents={documents}
              onPropertyChange={setLinkedPropertyIds}
              onDocumentsChange={(docs) => setDocuments(docs as any)}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={step === 0 ? () => navigate('/users/owners') : handleBack}
        >
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
            {isEditing ? 'Update Owner' : 'Save Owner'}
          </Button>
        )}
      </div>
    </div>
  );
}
