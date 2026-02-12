import { Calendar, FileText } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { LEASE_TYPE_LABELS, LEASE_TYPE_DESCRIPTIONS, type LeaseType } from '@/types/listing';

interface Props {
  leaseType: LeaseType;
  availableFrom: string;
  minTermMonths: number;
  maxTermMonths: number;
  errors: Record<string, string>;
  onLeaseTypeChange: (v: LeaseType) => void;
  onAvailableFromChange: (v: string) => void;
  onMinTermChange: (v: number) => void;
  onMaxTermChange: (v: number) => void;
  readOnly?: boolean;
}

export default function ListingStepLeaseAvailability({
  leaseType, availableFrom, minTermMonths, maxTermMonths, errors,
  onLeaseTypeChange, onAvailableFromChange, onMinTermChange, onMaxTermChange, readOnly,
}: Props) {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Lease Type */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h3 className="font-medium text-sm">Lease Type</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(Object.entries(LEASE_TYPE_LABELS) as [LeaseType, string][]).map(([key, label]) => (
            <Tooltip key={key}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => !readOnly && onLeaseTypeChange(key)}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    leaseType === key
                      ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                      : 'border-border hover:bg-muted/40'
                  } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{LEASE_TYPE_DESCRIPTIONS[key]}</p>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs max-w-[200px]">{LEASE_TYPE_DESCRIPTIONS[key]}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <h3 className="font-medium text-sm">Availability</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label>Available From <span className="text-destructive">*</span></Label>
            <Input
              type="date"
              min={today}
              value={availableFrom}
              onChange={(e) => onAvailableFromChange(e.target.value)}
              className={errors.availableFrom ? 'border-destructive' : ''}
              readOnly={readOnly}
            />
            {errors.availableFrom && <p className="text-xs text-destructive mt-1">{errors.availableFrom}</p>}
          </div>
          {leaseType !== 'month_to_month' && (
            <>
              <div>
                <Label>Min Term (months)</Label>
                <Input type="number" min={1} value={minTermMonths} onChange={(e) => onMinTermChange(Number(e.target.value))} readOnly={readOnly} />
              </div>
              <div>
                <Label>Max Term (months)</Label>
                <Input type="number" min={1} value={maxTermMonths} onChange={(e) => onMaxTermChange(Number(e.target.value))} readOnly={readOnly} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
