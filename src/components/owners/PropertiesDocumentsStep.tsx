import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Upload, X, FileText, Search, ChevronDown, Building2, FileCheck } from 'lucide-react';
import { MOCK_PROPERTIES } from '@/hooks/useOwners';
import type { OwnerDocument, OwnerAgreement, AgreementMode } from '@/types/owner';

type DocEntry = Omit<OwnerDocument, 'id'> & { id?: string };
type AgreementEntry = Omit<OwnerAgreement, 'id'> & { id?: string };

interface PropertiesDocumentsStepProps {
  linkedPropertyIds: string[];
  documents: DocEntry[];
  agreements: AgreementEntry[];
  agreementMode: AgreementMode;
  onPropertyChange: (ids: string[]) => void;
  onDocumentsChange: (docs: DocEntry[]) => void;
  onAgreementsChange: (agreements: AgreementEntry[]) => void;
  onAgreementModeChange: (mode: AgreementMode) => void;
}

export default function PropertiesDocumentsStep({
  linkedPropertyIds,
  documents,
  agreements,
  agreementMode,
  onPropertyChange,
  onDocumentsChange,
  onAgreementsChange,
  onAgreementModeChange,
}: PropertiesDocumentsStepProps) {
  const [tagInput, setTagInput] = useState<Record<number, string>>({});
  const [propertySearch, setPropertySearch] = useState('');
  const [propertyDropdownOpen, setPropertyDropdownOpen] = useState(false);

  const filteredProperties = MOCK_PROPERTIES.filter((p) =>
    p.name.toLowerCase().includes(propertySearch.toLowerCase())
  );

  const linkedProperties = MOCK_PROPERTIES.filter((p) => linkedPropertyIds.includes(p.id));

  // --- Agreement Mode ---
  const handleModeChange = (isSingle: boolean) => {
    const mode: AgreementMode = isSingle ? 'single' : 'per_property';
    onAgreementModeChange(mode);
    if (mode === 'single') {
      const globalAgreement: AgreementEntry = {
        fileName: agreements[0]?.fileName || '',
        fileUrl: agreements[0]?.fileUrl || '#',
        feePerUnit: agreements[0]?.feePerUnit || '',
        feePercentRent: agreements[0]?.feePercentRent || '',
        createdAt: new Date().toISOString(),
      };
      onAgreementsChange([globalAgreement]);
    } else {
      const perPropertyAgreements: AgreementEntry[] = linkedPropertyIds.map((pid) => {
        const existing = agreements.find((a) => a.propertyId === pid);
        return {
          propertyId: pid,
          fileName: existing?.fileName || '',
          fileUrl: existing?.fileUrl || '#',
          feePerUnit: existing?.feePerUnit || '',
          feePercentRent: existing?.feePercentRent || '',
          createdAt: new Date().toISOString(),
        };
      });
      onAgreementsChange(perPropertyAgreements);
    }
  };

  // --- Property Toggle ---
  const toggleProperty = (id: string) => {
    let newIds: string[];
    if (linkedPropertyIds.includes(id)) {
      newIds = linkedPropertyIds.filter((p) => p !== id);
    } else {
      newIds = [...linkedPropertyIds, id];
    }
    onPropertyChange(newIds);

    if (agreementMode === 'per_property') {
      let newAgreements = [...agreements];
      if (!linkedPropertyIds.includes(id)) {
        newAgreements.push({
          propertyId: id,
          fileName: '',
          fileUrl: '#',
          feePerUnit: '',
          feePercentRent: '',
          createdAt: new Date().toISOString(),
        });
      } else {
        newAgreements = newAgreements.filter((a) => a.propertyId !== id);
      }
      onAgreementsChange(newAgreements);
    }
  };

  // --- Agreement update ---
  const updateAgreement = (index: number, field: Partial<AgreementEntry>) => {
    const updated = [...agreements];
    updated[index] = { ...updated[index], ...field };
    onAgreementsChange(updated);
  };

  const getAgreementForProperty = (propertyId: string) => {
    return agreements.findIndex((a) => a.propertyId === propertyId);
  };

  // --- Documents ---
  const addDocument = () => {
    const doc: DocEntry = {
      fileName: '',
      fileUrl: '#',
      tags: [],
      uploadedAt: new Date().toISOString(),
    };
    onDocumentsChange([...documents, doc]);
  };

  const updateDocName = (index: number, name: string) => {
    const updated = [...documents];
    updated[index] = { ...updated[index], fileName: name };
    onDocumentsChange(updated);
  };

  const addTag = (index: number) => {
    const tag = tagInput[index]?.trim();
    if (!tag) return;
    const updated = [...documents];
    if (!updated[index].tags.includes(tag)) {
      updated[index] = { ...updated[index], tags: [...updated[index].tags, tag] };
      onDocumentsChange(updated);
    }
    setTagInput((prev) => ({ ...prev, [index]: '' }));
  };

  const removeTag = (docIndex: number, tagIndex: number) => {
    const updated = [...documents];
    updated[docIndex] = {
      ...updated[docIndex],
      tags: updated[docIndex].tags.filter((_, i) => i !== tagIndex),
    };
    onDocumentsChange(updated);
  };

  const removeDocument = (index: number) => {
    onDocumentsChange(documents.filter((_, i) => i !== index));
  };

  // --- Fee Summary ---
  const renderFeeSummary = () => {
    if (agreements.length === 0 || !agreements.some((a) => a.feePerUnit || a.feePercentRent)) return null;

    return (
      <div className="mt-4">
        <Label className="mb-2 block">Fee Summary</Label>
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-card">
                <th className="text-left p-2 font-medium text-muted-foreground">Property</th>
                <th className="text-right p-2 font-medium text-muted-foreground">Fee/Unit</th>
                <th className="text-right p-2 font-medium text-muted-foreground">% of Rent</th>
              </tr>
            </thead>
            <tbody>
              {agreementMode === 'single' && agreements[0] ? (
                <tr className="border-t border-border/30">
                  <td className="p-2 text-muted-foreground">All Properties (Global)</td>
                  <td className="p-2 text-right">{agreements[0].feePerUnit ? `$${agreements[0].feePerUnit}` : '—'}</td>
                  <td className="p-2 text-right">{agreements[0].feePercentRent ? `${agreements[0].feePercentRent}%` : '—'}</td>
                </tr>
              ) : (
                agreements
                  .filter((a) => a.propertyId)
                  .map((a, i) => {
                    const prop = MOCK_PROPERTIES.find((p) => p.id === a.propertyId);
                    return (
                      <tr key={i} className="border-t border-border/30">
                        <td className="p-2">{prop?.name || 'Unknown'}</td>
                        <td className="p-2 text-right">{a.feePerUnit ? `$${a.feePerUnit}` : '—'}</td>
                        <td className="p-2 text-right">{a.feePercentRent ? `${a.feePercentRent}%` : '—'}</td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* ─── Agreements ─── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold text-foreground">Agreements Setup</h3>
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card">
          <div className="space-y-0.5">
            <Label className="cursor-pointer" htmlFor="agreement-mode">
              Single Agreement for All Properties
            </Label>
            <p className="text-xs text-muted-foreground">
              Toggle off to set different agreements per property.
            </p>
          </div>
          <Switch
            id="agreement-mode"
            checked={agreementMode === 'single'}
            onCheckedChange={handleModeChange}
          />
        </div>

        {/* Single Agreement */}
        {agreementMode === 'single' && (
          <div className="space-y-4 p-4 rounded-lg border border-border/50 bg-card animate-fade-in">
            <div className="flex items-center gap-2">
              <Input type="file" accept=".pdf,.doc,.docx" className="flex-1 h-9 text-xs cursor-pointer" />
              <Input
                value={agreements[0]?.fileName || ''}
                onChange={(e) => updateAgreement(0, { fileName: e.target.value })}
                placeholder="Agreement name"
                className="flex-1 h-9 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Fee Per Unit ($)</Label>
                <Input
                  type="number"
                  min={0}
                  value={agreements[0]?.feePerUnit ?? ''}
                  onChange={(e) => updateAgreement(0, { feePerUnit: e.target.value === '' ? '' : Number(e.target.value) })}
                  placeholder="e.g. 50"
                  className="h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Fee % of Rent Collection</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={agreements[0]?.feePercentRent ?? ''}
                  onChange={(e) => updateAgreement(0, { feePercentRent: e.target.value === '' ? '' : Number(e.target.value) })}
                  placeholder="e.g. 8"
                  className="h-9"
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ─── Properties ─── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold text-foreground">Link Properties</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Select properties this owner is associated with.
        </p>

        {/* Searchable Multi-Select Dropdown */}
        <Popover open={propertyDropdownOpen} onOpenChange={setPropertyDropdownOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between h-auto min-h-10 py-2 bg-background"
            >
              <div className="flex flex-wrap gap-1 flex-1">
                {linkedPropertyIds.length === 0 ? (
                  <span className="text-muted-foreground text-sm">Select properties...</span>
                ) : (
                  linkedProperties.map((p) => (
                    <Badge
                      key={p.id}
                      variant="outline"
                      className="text-xs bg-primary/10 text-primary-foreground border-primary/20"
                    >
                      {p.name}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleProperty(p.id);
                        }}
                      />
                    </Badge>
                  ))
                )}
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 ml-2 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 bg-popover" align="start">
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={propertySearch}
                  onChange={(e) => setPropertySearch(e.target.value)}
                  placeholder="Search properties..."
                  className="pl-7 h-8 text-sm"
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto p-1">
              {filteredProperties.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No properties found.</p>
              ) : (
                filteredProperties.map((prop) => (
                  <label
                    key={prop.id}
                    className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent transition-colors"
                  >
                    <Checkbox
                      checked={linkedPropertyIds.includes(prop.id)}
                      onCheckedChange={() => toggleProperty(prop.id)}
                    />
                    <span className="text-sm flex-1">{prop.name}</span>
                    <span className="text-xs text-muted-foreground">{prop.units} units</span>
                  </label>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Per-Property Agreements Accordion */}
        {agreementMode === 'per_property' && linkedPropertyIds.length > 0 && (
          <Accordion type="multiple" className="space-y-2">
            {linkedProperties.map((prop) => {
              const agIndex = getAgreementForProperty(prop.id);
              const ag = agIndex >= 0 ? agreements[agIndex] : null;
              return (
                <AccordionItem
                  key={prop.id}
                  value={prop.id}
                  className="border border-border/50 rounded-lg bg-card px-4"
                >
                  <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      {prop.name}
                      {ag && (ag.feePerUnit || ag.feePercentRent) && (
                        <Badge variant="outline" className="text-xs bg-secondary/10 ml-2">
                          {ag.feePerUnit ? `$${ag.feePerUnit}/unit` : ''}{ag.feePerUnit && ag.feePercentRent ? ' + ' : ''}{ag.feePercentRent ? `${ag.feePercentRent}%` : ''}
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 space-y-3">
                    {ag && agIndex >= 0 ? (
                      <>
                        <div className="flex items-center gap-2">
                          <Input type="file" accept=".pdf,.doc,.docx" className="flex-1 h-8 text-xs cursor-pointer" />
                          <Input
                            value={ag.fileName}
                            onChange={(e) => updateAgreement(agIndex, { fileName: e.target.value })}
                            placeholder="Agreement name"
                            className="flex-1 h-8 text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Fee Per Unit ($)</Label>
                            <Input
                              type="number"
                              min={0}
                              value={ag.feePerUnit}
                              onChange={(e) => updateAgreement(agIndex, { feePerUnit: e.target.value === '' ? '' : Number(e.target.value) })}
                              placeholder="e.g. 50"
                              className="h-8"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Fee % of Rent</Label>
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              step={0.5}
                              value={ag.feePercentRent}
                              onChange={(e) => updateAgreement(agIndex, { feePercentRent: e.target.value === '' ? '' : Number(e.target.value) })}
                              placeholder="e.g. 8"
                              className="h-8"
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">No agreement configured.</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}

        {renderFeeSummary()}
      </section>

      {/* ─── Documents ─── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold text-foreground">Documents</h3>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addDocument}>
            <Upload className="h-4 w-4 mr-1" />
            Add Document
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Upload supporting documents (W-9 forms, contracts, etc.)
        </p>

        {documents.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-border rounded-lg bg-card">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No documents yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc, i) => (
              <div key={i} className="p-3 rounded-lg border border-border/50 bg-card space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Input
                    value={doc.fileName}
                    onChange={(e) => updateDocName(i, e.target.value)}
                    placeholder="Document name"
                    className="flex-1 h-8 text-sm"
                  />
                  <Input type="file" accept=".pdf,.doc,.docx" className="w-40 h-8 text-xs cursor-pointer" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => removeDocument(i)}
                  >
                    <X className="h-3.5 w-3.5 text-destructive-foreground" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {doc.tags.map((tag, ti) => (
                    <Badge
                      key={ti}
                      variant="outline"
                      className="text-xs gap-1 bg-background cursor-pointer"
                      onClick={() => removeTag(i, ti)}
                    >
                      {tag} <X className="h-3 w-3" />
                    </Badge>
                  ))}
                  <Input
                    value={tagInput[i] || ''}
                    onChange={(e) => setTagInput((prev) => ({ ...prev, [i]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        addTag(i);
                      }
                    }}
                    placeholder="Add tag..."
                    className="h-7 w-28 text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
