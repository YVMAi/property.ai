import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText } from 'lucide-react';
import type { OwnerAgreement, AgreementManagementFeeType, AgreementFeeType } from '@/types/owner';

const MGMT_FEE_OPTIONS = [
  { value: 'fixed_per_unit', label: 'Fixed Per Unit' },
  { value: 'percent_rent', label: '% of Rent' },
  { value: 'percent_total_income', label: '% of Total Income' },
  { value: 'combination', label: 'Combination (Fixed + %)' },
];

const LEASE_FEE_OPTIONS = [
  { value: 'fixed', label: 'Fixed Amount' },
  { value: 'variable', label: 'Variable %' },
];

interface AddAgreementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (agreement: Omit<OwnerAgreement, 'id'>) => void;
}

const formatComma = (v: number | ''): string => {
  if (v === '' || v === 0) return '';
  return v.toLocaleString('en-US');
};

const parseComma = (s: string): number | '' => {
  const cleaned = s.replace(/[^0-9.]/g, '');
  return cleaned ? Number(cleaned) : '';
};

export default function AddAgreementDialog({ open, onOpenChange, onSave }: AddAgreementDialogProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [managementFeeType, setManagementFeeType] = useState<AgreementManagementFeeType>('fixed_per_unit');
  const [managementFeeFixed, setManagementFeeFixed] = useState<number | ''>('');
  const [managementFeePercent, setManagementFeePercent] = useState<number | ''>('');
  const [leaseFeeType, setLeaseFeeType] = useState<AgreementFeeType>('fixed');
  const [leaseFeeValue, setLeaseFeeValue] = useState<number | ''>('');
  const [renewalFeeType, setRenewalFeeType] = useState<AgreementFeeType>('fixed');
  const [renewalFeeValue, setRenewalFeeValue] = useState<number | ''>('');
  const [fileName, setFileName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const showFixed = managementFeeType === 'fixed_per_unit' || managementFeeType === 'combination';
  const showPercent = managementFeeType === 'percent_rent' || managementFeeType === 'percent_total_income' || managementFeeType === 'combination';

  const reset = () => {
    setName('');
    setStartDate('');
    setEndDate('');
    setManagementFeeType('fixed_per_unit');
    setManagementFeeFixed('');
    setManagementFeePercent('');
    setLeaseFeeType('fixed');
    setLeaseFeeValue('');
    setRenewalFeeType('fixed');
    setRenewalFeeValue('');
    setFileName('');
    setErrors({});
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Agreement name is required';
    if (!startDate) errs.startDate = 'Start date is required';
    if (!endDate) errs.endDate = 'End date is required';
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      errs.endDate = 'End date must be after start date';
    }
    if (managementFeeType === 'combination') {
      if (managementFeeFixed === '') errs.managementFeeFixed = 'Required for combination';
      if (managementFeePercent === '') errs.managementFeePercent = 'Required for combination';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      toast({ title: 'Please fix validation errors', variant: 'destructive' });
      return;
    }

    const agreement: Omit<OwnerAgreement, 'id'> = {
      name: name.trim(),
      fileName: fileName || `${name.trim()}.pdf`,
      fileUrl: '#',
      startDate,
      endDate,
      managementFeeType,
      managementFeeFixed: showFixed ? managementFeeFixed : '',
      managementFeePercent: showPercent ? managementFeePercent : '',
      leaseFeeType,
      leaseFeeValue,
      renewalFeeType,
      renewalFeeValue,
      feePerUnit: showFixed ? managementFeeFixed : '',
      feePercentRent: showPercent ? managementFeePercent : '',
      createdAt: new Date().toISOString(),
    };

    onSave(agreement);
    reset();
    onOpenChange(false);
    toast({ title: 'New agreement added and linked' });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Agreement</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <Label>Agreement Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Property Management Agreement 2026" />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Start Date *</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              {errors.startDate && <p className="text-xs text-destructive mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <Label>End Date *</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate || undefined} />
              {errors.endDate && <p className="text-xs text-destructive mt-1">{errors.endDate}</p>}
            </div>
          </div>

          {startDate && new Date(startDate) > new Date() && (
            <p className="text-xs text-warning">Note: Start date is in the future.</p>
          )}

          {/* Management Fees */}
          <div className="space-y-3 p-3 rounded-lg border border-border/50 bg-muted/20">
            <Label className="text-sm font-medium">Management Fees</Label>
            <SearchableSelect
              options={MGMT_FEE_OPTIONS}
              value={managementFeeType}
              onValueChange={(v) => setManagementFeeType(v as AgreementManagementFeeType)}
              placeholder="Select fee type"
            />
            <div className="grid grid-cols-2 gap-3">
              {showFixed && (
                <div>
                  <Label className="text-xs">Fixed Amount Per Unit ($)</Label>
                  <Input
                    value={formatComma(managementFeeFixed)}
                    onChange={(e) => setManagementFeeFixed(parseComma(e.target.value))}
                    placeholder="e.g. 50"
                    inputMode="numeric"
                  />
                  {errors.managementFeeFixed && <p className="text-xs text-destructive mt-1">{errors.managementFeeFixed}</p>}
                </div>
              )}
              {showPercent && (
                <div>
                  <Label className="text-xs">
                    {managementFeeType === 'percent_rent' ? '% of Rent' : managementFeeType === 'percent_total_income' ? '% of Total Income' : '% Value'}
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={managementFeePercent}
                    onChange={(e) => setManagementFeePercent(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 8"
                  />
                  {errors.managementFeePercent && <p className="text-xs text-destructive mt-1">{errors.managementFeePercent}</p>}
                </div>
              )}
            </div>
            {managementFeeType === 'combination' && (
              <p className="text-xs text-muted-foreground">Combination applies both fixed per-unit and percentage fees.</p>
            )}
          </div>

          {/* Lease Fees */}
          <div className="space-y-3 p-3 rounded-lg border border-border/50 bg-muted/20">
            <Label className="text-sm font-medium">Lease Fees</Label>
            <div className="grid grid-cols-2 gap-3">
              <SearchableSelect
                options={LEASE_FEE_OPTIONS}
                value={leaseFeeType}
                onValueChange={(v) => setLeaseFeeType(v as AgreementFeeType)}
                placeholder="Type"
              />
              <div>
                <Input
                  value={leaseFeeType === 'fixed' ? formatComma(leaseFeeValue) : (leaseFeeValue === '' ? '' : String(leaseFeeValue))}
                  onChange={(e) => setLeaseFeeValue(leaseFeeType === 'fixed' ? parseComma(e.target.value) : (e.target.value === '' ? '' : Number(e.target.value)))}
                  placeholder={leaseFeeType === 'fixed' ? 'e.g. $500' : 'e.g. 5%'}
                  inputMode="numeric"
                />
              </div>
            </div>
          </div>

          {/* Renewal Fees */}
          <div className="space-y-3 p-3 rounded-lg border border-border/50 bg-muted/20">
            <Label className="text-sm font-medium">Renewal Fees</Label>
            <div className="grid grid-cols-2 gap-3">
              <SearchableSelect
                options={LEASE_FEE_OPTIONS}
                value={renewalFeeType}
                onValueChange={(v) => setRenewalFeeType(v as AgreementFeeType)}
                placeholder="Type"
              />
              <div>
                <Input
                  value={renewalFeeType === 'fixed' ? formatComma(renewalFeeValue) : (renewalFeeValue === '' ? '' : String(renewalFeeValue))}
                  onChange={(e) => setRenewalFeeValue(renewalFeeType === 'fixed' ? parseComma(e.target.value) : (e.target.value === '' ? '' : Number(e.target.value)))}
                  placeholder={renewalFeeType === 'fixed' ? 'e.g. $300' : 'e.g. 3%'}
                  inputMode="numeric"
                />
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <Label>Upload Agreement Copy</Label>
            <div
              className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors border-border hover:border-primary/50"
              onClick={() => fileInputRef.current?.click()}
            >
              {fileName ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm">{fileName}</span>
                </div>
              ) : (
                <>
                  <Upload className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                  <p className="text-sm text-muted-foreground">Click to upload (PDF/DOC)</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
            {!fileName && <p className="text-xs text-muted-foreground mt-1">Optional, but recommended.</p>}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>Cancel</Button>
          <Button onClick={handleSave} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
            Create & Link Agreement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
