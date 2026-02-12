import { BookOpen, Shield } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import type { TenantCriteria } from '@/types/listing';

interface Props {
  criteria: TenantCriteria;
  houseRules: string;
  onCriteriaChange: (criteria: TenantCriteria) => void;
  onRulesChange: (rules: string) => void;
  readOnly?: boolean;
}

export default function ListingStepTenantCriteria({
  criteria, houseRules, onCriteriaChange, onRulesChange, readOnly,
}: Props) {
  const update = <K extends keyof TenantCriteria>(key: K, value: TenantCriteria[K]) => {
    onCriteriaChange({ ...criteria, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Screening Criteria */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <h3 className="font-medium text-sm">Screening Criteria</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Minimum Credit Score</Label>
            <Input type="number" value={criteria.minCreditScore} onChange={(e) => update('minCreditScore', Number(e.target.value))} readOnly={readOnly} />
          </div>
          <div>
            <Label>Income Ratio (x rent)</Label>
            <Input type="number" step="0.5" value={criteria.incomeRatio} onChange={(e) => update('incomeRatio', Number(e.target.value))} readOnly={readOnly} />
            <p className="text-xs text-muted-foreground mt-1">e.g. 3 means tenant must earn 3× monthly rent</p>
          </div>
          <div>
            <Label>Max Occupants</Label>
            <Input type="number" value={criteria.maxOccupants} onChange={(e) => update('maxOccupants', Number(e.target.value))} readOnly={readOnly} />
          </div>
          <div>
            <Label>Pet Policy</Label>
            <Select value={criteria.petPolicy} onValueChange={(v) => update('petPolicy', v as TenantCriteria['petPolicy'])} disabled={readOnly}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="allowed">Pets Allowed</SelectItem>
                <SelectItem value="not_allowed">No Pets</SelectItem>
                <SelectItem value="case_by_case">Case by Case</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div>
              <p className="text-sm font-medium">No Prior Evictions</p>
              <p className="text-xs text-muted-foreground">Require tenants with no eviction history</p>
            </div>
            <Switch checked={criteria.noEvictions} onCheckedChange={(v) => update('noEvictions', v)} disabled={readOnly} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div>
              <p className="text-sm font-medium">Background Check Required</p>
              <p className="text-xs text-muted-foreground">Mandatory background screening</p>
            </div>
            <Switch checked={criteria.backgroundCheck} onCheckedChange={(v) => update('backgroundCheck', v)} disabled={readOnly} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div>
              <p className="text-sm font-medium">Smoking Allowed</p>
              <p className="text-xs text-muted-foreground">Allow smoking on premises</p>
            </div>
            <Switch checked={criteria.smokingAllowed} onCheckedChange={(v) => update('smokingAllowed', v)} disabled={readOnly} />
          </div>
        </div>
      </div>

      {/* House Rules */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <h3 className="font-medium text-sm">House Rules</h3>
        </div>
        <Textarea
          placeholder="e.g. Quiet hours 10PM–7AM, No subletting, Trash pickup on Tuesdays..."
          value={houseRules}
          onChange={(e) => onRulesChange(e.target.value)}
          className="min-h-[100px]"
          readOnly={readOnly}
        />
      </div>

      {/* Preview Card */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-4">
          <h4 className="text-sm font-medium mb-2">Tenant Requirements Summary</h4>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>Credit Score: {criteria.minCreditScore}+</li>
            <li>Income: {criteria.incomeRatio}× monthly rent</li>
            <li>Max Occupants: {criteria.maxOccupants}</li>
            <li>Pets: {criteria.petPolicy === 'allowed' ? 'Allowed' : criteria.petPolicy === 'not_allowed' ? 'Not Allowed' : 'Case by Case'}</li>
            {criteria.noEvictions && <li>No prior evictions required</li>}
            {criteria.backgroundCheck && <li>Background check mandatory</li>}
            <li>Smoking: {criteria.smokingAllowed ? 'Allowed' : 'Not Allowed'}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
