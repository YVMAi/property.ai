import { Check, ChevronLeft, ChevronRight, ArrowLeft, ExternalLink, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useListingFormState } from '@/hooks/useListingFormState';
import ListingStepPropertyUnit from '@/components/listings/ListingStepPropertyUnit';
import ListingStepPropertyDetails from '@/components/listings/ListingStepPropertyDetails';
import ListingStepUnitDetails from '@/components/listings/ListingStepUnitDetails';
import ListingStepTenantCriteria from '@/components/listings/ListingStepTenantCriteria';
import ListingStepRentalFees from '@/components/listings/ListingStepRentalFees';
import ListingStepLeaseAvailability from '@/components/listings/ListingStepLeaseAvailability';
import ListingStepPreview from '@/components/listings/ListingStepPreview';

const STEPS = [
  'Property & Unit',
  'Property Details',
  'Unit Details',
  'Tenant Criteria',
  'Rental & Fees',
  'Lease & Availability',
  'Preview & Post',
];

export default function PostListing() {
  const f = useListingFormState();
  const isViewMode = f.mode === 'view';
  const isLastStep = f.step === STEPS.length - 1;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => f.navigate('/leases/listings')} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {isViewMode ? 'View Listing' : f.mode === 'edit' ? 'Edit Listing' : 'Create Listing'}
          </h1>
          <p className="text-muted-foreground mt-0.5">
            Step {f.step + 1} of {STEPS.length}: {STEPS[f.step]}
          </p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => { if (i < f.step) f.setStep(i); }}
            className="flex items-center gap-2 flex-1 group"
            disabled={i > f.step}
          >
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 transition-colors ${
                i < f.step
                  ? 'bg-primary text-primary-foreground'
                  : i === f.step
                  ? 'bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {i < f.step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`hidden lg:block text-xs truncate ${i <= f.step ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`hidden lg:block flex-1 h-0.5 rounded-full ml-1 ${i < f.step ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </button>
        ))}
      </div>

      {/* Step content */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          {f.step === 0 && (
            <ListingStepPropertyUnit
              form={f.form}
              activeProperties={f.activeProperties}
              selectedProperty={f.selectedProperty}
              vacantUnits={f.vacantUnits}
              errors={f.errors}
              onPropertyChange={(id) => { f.updateForm('propertyId', id); f.updateForm('unitId', ''); }}
              onUnitChange={(id) => f.updateForm('unitId', id)}
              onBulkToggle={(unitId, checked) => {
                const current = f.form.bulkUnitIds;
                f.updateForm('bulkUnitIds', checked ? [...current, unitId] : current.filter((u) => u !== unitId));
              }}
            />
          )}

          {f.step === 1 && (
            <ListingStepPropertyDetails
              amenities={f.form.propertyAmenities}
              locationDescription={f.form.locationDescription}
              photos={f.form.propertyPhotos}
              onAmenitiesChange={(a) => f.updateForm('propertyAmenities', a)}
              onLocationChange={(d) => f.updateForm('locationDescription', d)}
              onPhotosChange={(p) => f.updateForm('propertyPhotos', p)}
              readOnly={isViewMode}
            />
          )}

          {f.step === 2 && (
            <ListingStepUnitDetails
              amenities={f.form.unitAmenities}
              locationNotes={f.form.unitLocationNotes}
              photos={f.form.unitPhotos}
              onAmenitiesChange={(a) => f.updateForm('unitAmenities', a)}
              onLocationChange={(d) => f.updateForm('unitLocationNotes', d)}
              onPhotosChange={(p) => f.updateForm('unitPhotos', p)}
              readOnly={isViewMode}
            />
          )}

          {f.step === 3 && (
            <ListingStepTenantCriteria
              criteria={f.form.tenantCriteria}
              houseRules={f.form.houseRules}
              onCriteriaChange={(c) => f.updateForm('tenantCriteria', c)}
              onRulesChange={(r) => f.updateForm('houseRules', r)}
              readOnly={isViewMode}
            />
          )}

          {f.step === 4 && (
            <ListingStepRentalFees
              form={f.form}
              errors={f.errors}
              moveInTotal={f.moveInTotal}
              onRentChange={(v) => f.updateForm('rentalAmount', v)}
              onDepositChange={(v) => f.updateForm('securityDeposit', v)}
              onDepositDueChange={(v) => f.updateForm('depositDueOn', v)}
              onSuggestRent={f.suggestRent}
              addFee={f.addFee}
              updateFee={f.updateFee}
              removeFee={f.removeFee}
              readOnly={isViewMode}
            />
          )}

          {f.step === 5 && (
            <ListingStepLeaseAvailability
              leaseType={f.form.leaseType}
              availableFrom={f.form.availableFrom}
              minTermMonths={f.form.minTermMonths}
              maxTermMonths={f.form.maxTermMonths}
              errors={f.errors}
              onLeaseTypeChange={(v) => f.updateForm('leaseType', v)}
              onAvailableFromChange={(v) => f.updateForm('availableFrom', v)}
              onMinTermChange={(v) => f.updateForm('minTermMonths', v)}
              onMaxTermChange={(v) => f.updateForm('maxTermMonths', v)}
              readOnly={isViewMode}
            />
          )}

          {f.step === 6 && (
            <ListingStepPreview
              form={f.form}
              selectedProperty={f.selectedProperty}
              moveInTotal={f.moveInTotal}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between pb-6">
        <Button
          variant="outline"
          onClick={f.step === 0 ? () => f.navigate('/leases/listings') : f.handleBack}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {f.step === 0 ? 'Cancel' : 'Back'}
        </Button>

        <div className="flex gap-2">
          {isLastStep ? (
            <>
              {!isViewMode && (
                <Button variant="outline" onClick={f.handleSaveDraft}>
                  <Save className="h-4 w-4 mr-1" /> Save as Draft
                </Button>
              )}
              {!isViewMode && (
                <Button className="btn-primary gap-1.5" onClick={f.handlePublish}>
                  <ExternalLink className="h-4 w-4" /> Publish to Zillow
                </Button>
              )}
              {isViewMode && (
                <Button className="btn-primary" onClick={() => f.navigate('/leases/post-listing?mode=edit')}>
                  Edit Listing
                </Button>
              )}
            </>
          ) : (
            <Button className="btn-primary" onClick={f.handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
