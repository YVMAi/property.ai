import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LISTING_STATUS_CONFIG, type ListingStatus, type ListingFormData } from '@/types/listing';

interface Props {
  form: Pick<ListingFormData, 'listingStatus' | 'expiryDate'>;
  errors: Record<string, string>;
  onStatusChange: (v: ListingStatus) => void;
  onExpiryChange: (v: string) => void;
  readOnly?: boolean;
}

export default function ListingStepStatus({
  form, errors, onStatusChange, onExpiryChange, readOnly,
}: Props) {
  const today = new Date().toISOString().split('T')[0];
  const cfg = LISTING_STATUS_CONFIG[form.listingStatus];

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="font-medium text-sm">Listing Status</h3>
        <p className="text-xs text-muted-foreground">
          Choose whether to save as a draft or publish immediately. You can also set an optional expiry date.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(['draft', 'active'] as ListingStatus[]).map((s) => {
            const c = LISTING_STATUS_CONFIG[s];
            return (
              <button
                key={s}
                type="button"
                onClick={() => !readOnly && onStatusChange(s)}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  form.listingStatus === s
                    ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                    : 'border-border hover:bg-muted/40'
                } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={`text-xs ${c.badgeClass}`}>{c.label}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {s === 'draft' ? 'Save without publishing. You can publish later from the Listings page.' : 'Publish immediately to Zillow. The listing will be live.'}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {form.listingStatus === 'active' && (
        <div className="space-y-3">
          <h3 className="font-medium text-sm">Expiry Date (Optional)</h3>
          <p className="text-xs text-muted-foreground">
            Set an auto-expiry date. The listing will automatically move to Expired status on this date.
          </p>
          <Input
            type="date"
            min={today}
            value={form.expiryDate}
            onChange={(e) => onExpiryChange(e.target.value)}
            className={errors.expiryDate ? 'border-destructive' : ''}
            readOnly={readOnly}
          />
          {errors.expiryDate && <p className="text-xs text-destructive mt-1">{errors.expiryDate}</p>}
        </div>
      )}

      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-4">
          <h4 className="text-sm font-medium mb-2">What happens next?</h4>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            {form.listingStatus === 'draft' ? (
              <>
                <li>Listing saved locally as a draft</li>
                <li>Not visible on Zillow</li>
                <li>You can publish from the Listings table anytime</li>
              </>
            ) : (
              <>
                <li>Listing will be posted to Zillow immediately</li>
                <li>Inquiries and tour requests will flow in</li>
                {form.expiryDate && <li>Auto-expires on {form.expiryDate}</li>}
                <li>You can pause or edit anytime from the Listings page</li>
              </>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
