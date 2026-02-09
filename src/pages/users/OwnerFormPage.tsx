import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import PersonalDetailsStep from '@/components/owners/PersonalDetailsStep';
import TaxDetailsStep from '@/components/owners/TaxDetailsStep';
import EmailsStep from '@/components/owners/EmailsStep';
import PropertiesDocumentsStep from '@/components/owners/PropertiesDocumentsStep';
import PaymentFeesStep from '@/components/owners/PaymentFeesStep';
import PaymentHistorySection from '@/components/owners/PaymentHistorySection';
import { useOwnerFormState } from '@/hooks/useOwnerFormState';

const STEPS = ['Personal Details', 'Tax Details', 'Emails & Invites', 'Agreements & Properties', 'Payment & Fees'];

export default function OwnerFormPage() {
  const form = useOwnerFormState();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => form.navigate('/users/owners')}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {form.isEditing ? 'Edit Owner' : 'Add New Owner'}
          </h1>
          <p className="text-muted-foreground mt-0.5">
            Step {form.step + 1} of {STEPS.length}: {STEPS[form.step]}
          </p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => { if (i < form.step) form.setStep(i); }}
            className="flex items-center gap-2 flex-1 group"
            disabled={i > form.step}
          >
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 transition-colors ${
                i < form.step
                  ? 'bg-primary text-primary-foreground'
                  : i === form.step
                  ? 'bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {i < form.step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={`hidden md:block text-sm truncate ${
                i <= form.step ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}
            >
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={`hidden md:block flex-1 h-0.5 rounded-full ml-2 ${
                  i < form.step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </button>
        ))}
      </div>

      {/* Step content */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          {form.step === 0 && (
            <PersonalDetailsStep
              data={{
                ownerType: form.ownerType,
                firstName: form.firstName,
                lastName: form.lastName,
                companyName: form.companyName,
                contactPerson: form.contactPerson,
                phone: form.phone,
                address: form.address,
                ssn: form.ssn,
                ein: form.ein,
              }}
              onChange={(d) => {
                if (d.ownerType !== undefined) form.setOwnerType(d.ownerType);
                if (d.firstName !== undefined) form.setFirstName(d.firstName);
                if (d.lastName !== undefined) form.setLastName(d.lastName);
                if (d.companyName !== undefined) form.setCompanyName(d.companyName);
                if (d.contactPerson !== undefined) form.setContactPerson(d.contactPerson);
                if (d.phone !== undefined) form.setPhone(d.phone);
                if (d.address) form.setAddress(d.address);
                if (d.ssn !== undefined) form.setSsn(d.ssn);
                if (d.ein !== undefined) form.setEin(d.ein);
              }}
              errors={form.errors}
            />
          )}
          {form.step === 1 && (
            <TaxDetailsStep
              data={{ taxId: form.taxId, taxClassification: form.taxClassification }}
              onChange={(d) => {
                if (d.taxId !== undefined) form.setTaxId(d.taxId);
                if (d.taxClassification) form.setTaxClassification(d.taxClassification);
              }}
            />
          )}
          {form.step === 2 && (
            <EmailsStep
              emails={form.emails}
              onChange={(updated) => form.setEmails(updated as any)}
              errors={form.errors}
              allOwnerEmails={form.allOwnerEmails}
            />
          )}
          {form.step === 3 && (
            <PropertiesDocumentsStep
              linkedPropertyIds={form.linkedPropertyIds}
              documents={form.documents}
              agreements={form.agreements}
              agreementMode={form.agreementMode}
              onPropertyChange={form.setLinkedPropertyIds}
              onDocumentsChange={(docs) => form.setDocuments(docs as any)}
              onAgreementsChange={(ags) => form.setAgreements(ags as any)}
              onAgreementModeChange={form.setAgreementMode}
            />
          )}
          {form.step === 4 && (
            <PaymentFeesStep
              data={form.paymentSetup}
              linkedPropertyIds={form.linkedPropertyIds}
              agreements={form.agreements}
              onChange={(d) => form.setPaymentSetup((prev) => ({ ...prev, ...d }))}
              errors={form.errors}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={form.step === 0 ? () => form.navigate('/users/owners') : form.handleBack}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {form.step === 0 ? 'Cancel' : 'Back'}
        </Button>
        {form.step < STEPS.length - 1 ? (
          <Button className="btn-primary" onClick={form.handleNext}>
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button className="btn-primary" onClick={form.handleSave}>
            <Check className="h-4 w-4 mr-1" />
            {form.isEditing ? 'Update Owner' : 'Save Owner'}
          </Button>
        )}
      </div>

      {/* Payment History (Edit mode only) */}
      {form.isEditing && form.editingOwner && (
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <PaymentHistorySection
              payments={form.editingOwner.payments}
              onAddPayment={form.handleAddPayment}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
