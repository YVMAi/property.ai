import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TaxClassification } from '@/types/owner';

interface TaxDetailsStepProps {
  data: {
    taxId: string;
    taxClassification: TaxClassification;
  };
  onChange: (data: Partial<TaxDetailsStepProps['data']>) => void;
}

const TAX_CLASSIFICATIONS: { value: TaxClassification; label: string }[] = [
  { value: 'individual', label: 'Individual' },
  { value: 'llc', label: 'LLC' },
  { value: 'corporation', label: 'Corporation' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'trust', label: 'Trust' },
  { value: 'other', label: 'Other' },
];

export default function TaxDetailsStep({ data, onChange }: TaxDetailsStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="taxId">Tax ID / SSN</Label>
        <Input
          id="taxId"
          type="password"
          value={data.taxId}
          onChange={(e) => onChange({ taxId: e.target.value })}
          placeholder="•••-••-••••"
        />
        <p className="text-xs text-muted-foreground">
          This information is securely stored and masked.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Tax Classification</Label>
        <Select
          value={data.taxClassification}
          onValueChange={(val) => onChange({ taxClassification: val as TaxClassification })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select classification" />
          </SelectTrigger>
          <SelectContent>
            {TAX_CLASSIFICATIONS.map((tc) => (
              <SelectItem key={tc.value} value={tc.value}>
                {tc.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="w9">W-9 Upload</Label>
        <Input id="w9" type="file" accept=".pdf,.doc,.docx" className="cursor-pointer" />
        <p className="text-xs text-muted-foreground">PDF or DOC format preferred.</p>
      </div>
    </div>
  );
}
