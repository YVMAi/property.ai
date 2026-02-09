import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useOwnersContext } from '@/contexts/OwnersContext';
import type {
  OwnerFormData,
  OwnerType,
  TaxClassification,
  OwnerAddress,
  PaymentSetup,
  AgreementMode,
  OwnerAgreement,
  OwnerDocument,
  OwnerEmail,
} from '@/types/owner';
import { emptyPaymentSetup, emptyAgreement } from '@/types/owner';

const emptyAddress: OwnerAddress = { street: '', city: '', state: '', zip: '' };

type EmailEntry = Omit<OwnerEmail, 'loginCount' | 'lastLogin'> & {
  loginCount?: number;
  lastLogin?: string;
};

type AgreementEntry = Omit<OwnerAgreement, 'id'> & { id?: string };
type DocEntry = Omit<OwnerDocument, 'id'> & { id?: string };

export function useOwnerFormState() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getOwnerById, addOwner, updateOwner, getAllEmails, addPayment } = useOwnersContext();

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
  const [emails, setEmails] = useState<EmailEntry[]>(editingOwner?.emails || []);
  const [linkedPropertyIds, setLinkedPropertyIds] = useState<string[]>(
    editingOwner?.linkedPropertyIds || []
  );
  const [agreements, setAgreements] = useState<AgreementEntry[]>(
    editingOwner?.agreements || [{ ...emptyAgreement }]
  );
  const [agreementMode, setAgreementMode] = useState<AgreementMode>(
    editingOwner?.agreementMode || 'single'
  );
  const [documents, setDocuments] = useState<DocEntry[]>(editingOwner?.documents || []);
  const [paymentSetup, setPaymentSetup] = useState<PaymentSetup>(
    editingOwner?.paymentSetup || { ...emptyPaymentSetup }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const allOwnerEmails = getAllEmails(editingOwner?.id);

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
    if (step === 4) {
      if (paymentSetup.payoutMethod === 'ach') {
        if (!paymentSetup.bankName.trim()) newErrors.bankName = 'Bank name is required';
        if (!paymentSetup.accountNumber.trim()) newErrors.accountNumber = 'Account number is required';
        if (!paymentSetup.routingNumber.trim()) newErrors.routingNumber = 'Routing number is required';
      }
      if (paymentSetup.payoutMethod === 'other' && !paymentSetup.payoutMethodOther.trim()) {
        newErrors.payoutMethodOther = 'Specify the payout method';
      }
      if (paymentSetup.managementFeeEnabled && (paymentSetup.managementFeeValue === '' || paymentSetup.managementFeeValue <= 0)) {
        newErrors.managementFeeValue = 'Set a fee amount';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < 4) setStep(step + 1);
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
        inviteStatus: e.inviteStatus,
        inviteToken: e.inviteToken,
        inviteSentAt: e.inviteSentAt,
      })) as any,
      linkedPropertyIds,
      agreements: agreements.map((a) => ({
        ...(a.id ? { id: a.id } : {}),
        propertyId: a.propertyId,
        fileName: a.fileName,
        fileUrl: a.fileUrl,
        feePerUnit: a.feePerUnit,
        feePercentRent: a.feePercentRent,
        createdAt: a.createdAt,
      })) as any,
      agreementMode,
      documents: documents.map((d) => ({
        ...(d.id ? { id: d.id } : {}),
        fileName: d.fileName,
        fileUrl: d.fileUrl,
        tags: d.tags,
        uploadedAt: d.uploadedAt,
      })) as any,
      paymentSetup,
    };

    if (isEditing && editingOwner) {
      updateOwner(editingOwner.id, formData);
      toast({ title: 'Owner updated', description: 'Changes affect future disbursements only.' });
    } else {
      addOwner(formData);
      const displayName = ownerType === 'individual' ? `${firstName} ${lastName}` : companyName;
      toast({ title: 'Owner created', description: `${displayName} has been added successfully.` });
    }
    navigate('/users/owners');
  };

  const handleAddPayment = (payment: Omit<import('@/types/owner').OwnerPayment, 'id'>) => {
    if (editingOwner) {
      addPayment(editingOwner.id, payment);
      toast({ title: 'Payment recorded', description: `$${payment.amount.toLocaleString()} payment has been recorded.` });
    }
  };

  return {
    // Computed
    isEditing,
    editingOwner,
    id,

    // Step
    step,
    setStep,

    // Personal details
    ownerType, setOwnerType,
    firstName, setFirstName,
    lastName, setLastName,
    companyName, setCompanyName,
    contactPerson, setContactPerson,
    phone, setPhone,
    address, setAddress,
    ssn, setSsn,
    ein, setEin,

    // Tax
    taxId, setTaxId,
    taxClassification, setTaxClassification,

    // Emails
    emails, setEmails,
    allOwnerEmails,

    // Properties & Agreements
    linkedPropertyIds, setLinkedPropertyIds,
    agreements, setAgreements,
    agreementMode, setAgreementMode,
    documents, setDocuments,

    // Payment
    paymentSetup, setPaymentSetup,

    // Validation & Actions
    errors,
    validateStep,
    handleNext,
    handleBack,
    handleSave,
    handleAddPayment,
    navigate,
  };
}
