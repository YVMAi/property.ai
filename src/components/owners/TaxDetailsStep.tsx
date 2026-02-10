import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import type { TaxClassification } from '@/types/owner';

interface TaxDetailsStepProps {
  data: {
    taxId: string;
    taxClassification: TaxClassification;
  };
  onChange: (data: Partial<TaxDetailsStepProps['data']>) => void;
}

const TAX_CLASSIFICATIONS: { value: TaxClassification; label: string }[] = [
  { value: 'individual', label: 'Individual / Sole Proprietor' },
  { value: 'llc', label: 'LLC' },
  { value: 'corporation', label: 'C Corporation' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'trust', label: 'Trust / Estate' },
  { value: 'other', label: 'Other' },
];

export default function TaxDetailsStep({ data, onChange }: TaxDetailsStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="taxId">Tax ID (if different from SSN/EIN)</Label>
        <Input
          id="taxId"
          type="password"
          value={data.taxId}
          onChange={(e) => onChange({ taxId: e.target.value })}
          placeholder="•••-••-••••"
        />
        <p className="text-xs text-muted-foreground">
          Optional. Leave blank if same as SSN or EIN entered in personal details.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Tax Classification</Label>
        <SearchableSelect
          options={TAX_CLASSIFICATIONS.map((tc) => ({ value: tc.value, label: tc.label }))}
          value={data.taxClassification}
          onValueChange={(val) => onChange({ taxClassification: val as TaxClassification })}
          placeholder="Select classification"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="w9">W-9 Upload</Label>
        <Input id="w9" type="file" accept=".pdf,.doc,.docx" className="cursor-pointer" />
        <p className="text-xs text-muted-foreground">PDF or DOC format preferred.</p>
      </div>
    </div>
  );
}
