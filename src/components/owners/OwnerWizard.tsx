import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import PersonalDetailsStep from './PersonalDetailsStep';
import TaxDetailsStep from './TaxDetailsStep';
import EmailsStep from './EmailsStep';
import PropertiesDocumentsStep from './PropertiesDocumentsStep';
import type { Owner, OwnerFormData, TaxClassification, OwnerAddress } from '@/types/owner';

const STEPS = ['Personal Details', 'Tax Details', 'Emails & Invites', 'Properties & Documents'];

interface OwnerWizardProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: OwnerFormData) => void;
  editingOwner?: Owner | null;
}

const emptyAddress: OwnerAddress = { street: '', city: '', state: '', zip: '' };

export default function OwnerWizard({ open, onClose, onSave, editingOwner }: OwnerWizardProps) {
  const [step, setStep] = useState(0);
  const { toast } = useToast();

  const [firstName, setFirstName] = useState(editingOwner?.firstName || '');
  const [lastName, setLastName] = useState(editingOwner?.lastName || '');
  const [phone, setPhone] = useState(editingOwner?.phone || '');
  const [address, setAddress] = useState<OwnerAddress>(editingOwner?.address || { ...emptyAddress });
  const [taxId, setTaxId] = useState(editingOwner?.taxId || '');
  const [taxClassification, setTaxClassification] = useState<TaxClassification>(
    editingOwner?.taxClassification || 'individual'
  );
  const [emails, setEmails] = useState(
    editingOwner?.emails || []
  );
  const [linkedPropertyIds, setLinkedPropertyIds] = useState<string[]>(
    editingOwner?.linkedPropertyIds || []
  );
  const [documents, setDocuments] = useState(editingOwner?.documents || []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setStep(0);
    setFirstName('');
    setLastName('');
    setPhone('');
    setAddress({ ...emptyAddress });
    setTaxId('');
    setTaxClassification('individual');
    setEmails([]);
    setLinkedPropertyIds([]);
    setDocuments([]);
    setErrors({});
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 0) {
      if (!firstName.trim()) newErrors.firstName = 'First name is required';
      if (!lastName.trim()) newErrors.lastName = 'Last name is required';
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
      firstName,
      lastName,
      phone,
      address,
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
    onSave(formData);
    toast({
      title: editingOwner ? 'Owner updated' : 'Owner created',
      description: `${firstName} ${lastName} has been ${editingOwner ? 'updated' : 'added'} successfully.`,
    });
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingOwner ? 'Edit Owner' : 'Add New Owner'}
          </DialogTitle>
          <DialogDescription>
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </DialogDescription>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center gap-1 mb-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`h-2 w-full rounded-full transition-colors ${
                  i <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="py-2">
          {step === 0 && (
            <PersonalDetailsStep
              data={{ firstName, lastName, phone, address }}
              onChange={(d) => {
                if (d.firstName !== undefined) setFirstName(d.firstName);
                if (d.lastName !== undefined) setLastName(d.lastName);
                if (d.phone !== undefined) setPhone(d.phone);
                if (d.address) setAddress(d.address);
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
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button className="btn-primary" onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button className="btn-primary" onClick={handleSave}>
              <Check className="h-4 w-4 mr-1" />
              {editingOwner ? 'Update Owner' : 'Save Owner'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
