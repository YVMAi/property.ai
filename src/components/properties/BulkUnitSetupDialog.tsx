import { useState, useMemo } from 'react';
import { Wand2, AlertCircle, Check, ChevronDown, ChevronUp, Trash2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { UNIT_TYPE_LABELS, type UnitType } from '@/types/property';

export interface BulkUnit {
  unitNumber: string;
  size: number;
  unitType: UnitType;
  bedrooms: number;
  bathrooms: number;
  isShared: boolean;
  independentWashroom: boolean;
  unitAmenities: string[];
  notes: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isStudent: boolean;
  existingUnitNumbers: string[];
  onConfirm: (units: BulkUnit[]) => void;
  maxUnits?: number;
}

// ── Parsing engine ──────────────────────────────────────────────

function parseBulkPrompt(prompt: string, isStudent: boolean): { units: BulkUnit[]; errors: string[] } {
  const errors: string[] = [];
  const units: BulkUnit[] = [];

  if (!prompt.trim()) {
    errors.push('Please provide a description of units to generate.');
    return { units, errors };
  }

  // Split on semicolons or newlines for multiple groups
  const segments = prompt.split(/[;\n]/).map(s => s.trim()).filter(Boolean);

  for (const segment of segments) {
    try {
      const parsed = parseSegment(segment, isStudent);
      units.push(...parsed.units);
      errors.push(...parsed.errors);
    } catch {
      errors.push(`Could not parse: "${segment.slice(0, 60)}..."`);
    }
  }

  return { units, errors };
}

function parseSegment(segment: string, isStudent: boolean): { units: BulkUnit[]; errors: string[] } {
  const units: BulkUnit[] = [];
  const errors: string[] = [];
  const lower = segment.toLowerCase();

  // Extract range pattern: "101-150" or "A1-A50" or "Bed 1-20"
  const rangeMatch = segment.match(/\b(?:unit|bed|room)?\s*([A-Za-z]?\d+)\s*[-–to]+\s*([A-Za-z]?\d+)\b/i);
  // Extract count pattern: "50 studios" or "add 30 units"
  const countMatch = lower.match(/\b(?:add\s+)?(\d+)\s+(?:units?|beds?|studios?|rooms?)/i);

  // Extract type
  let unitType: UnitType = 'studio';
  if (/\b4[\s-]?b(?:ed|hk|r)\b/i.test(lower)) unitType = '4bhk';
  else if (/\b3[\s-]?b(?:ed|hk|r)\b/i.test(lower)) unitType = '3bhk';
  else if (/\b2[\s-]?b(?:ed|hk|r)\b/i.test(lower)) unitType = '2bhk';
  else if (/\b1[\s-]?b(?:ed|hk|r)\b/i.test(lower)) unitType = '1bhk';
  else if (/\bstudio\b/i.test(lower)) unitType = 'studio';

  // Extract sq ft
  const sqFtMatch = lower.match(/(\d{2,5})\s*(?:sq\s*ft|sqft|square\s*feet|sf)/i);
  const size = sqFtMatch ? parseInt(sqFtMatch[1]) : (unitType === 'studio' ? 450 : unitType === '1bhk' ? 600 : unitType === '2bhk' ? 850 : unitType === '3bhk' ? 1100 : 1400);

  // Extract bedrooms
  const bedroomMatch = lower.match(/(\d+)\s*(?:bed(?:room)?s?|bd)/i);
  const bedrooms = bedroomMatch ? parseInt(bedroomMatch[1]) : (unitType === 'studio' ? 0 : parseInt(unitType[0]) || 1);

  // Extract bathrooms
  const bathMatch = lower.match(/(\d+)\s*(?:bath(?:room)?s?|ba)/i);
  const bathrooms = bathMatch ? parseInt(bathMatch[1]) : 1;

  // Extract shared flag
  const isShared = /\bshared\b/i.test(lower);
  const independentWashroom = /\bindependent\s*washroom\b/i.test(lower) || /\bprivate\s*bath\b/i.test(lower);

  // Extract amenities
  const amenityMatch = lower.match(/(?:amenities?|with)\s*[:\-]?\s*(.+?)(?:$|[;])/i);
  const unitAmenities = amenityMatch
    ? amenityMatch[1].split(',').map(a => a.trim()).filter(a => a && !a.match(/^\d+/) && a.length < 30)
    : [];

  // Extract notes
  const notesMatch = segment.match(/(?:note|notes?)[:\-]\s*(.+?)$/i);
  const notes = notesMatch ? notesMatch[1].trim() : '';

  // Determine entries from range or count
  let startNum = 1;
  let count = 1;
  let prefix = '';

  if (rangeMatch) {
    const startStr = rangeMatch[1];
    const endStr = rangeMatch[2];
    // Extract alpha prefix if any
    const startAlpha = startStr.match(/^([A-Za-z]+)/)?.[1] || '';
    const endAlpha = endStr.match(/^([A-Za-z]+)/)?.[1] || '';
    prefix = startAlpha || endAlpha;
    const startN = parseInt(startStr.replace(/^[A-Za-z]+/, ''));
    const endN = parseInt(endStr.replace(/^[A-Za-z]+/, ''));

    if (isNaN(startN) || isNaN(endN) || endN < startN) {
      errors.push(`Invalid range: ${startStr} to ${endStr}`);
      return { units, errors };
    }
    if (endN - startN + 1 > 1000) {
      errors.push(`Range too large (${endN - startN + 1}). Maximum 1,000 per batch.`);
      return { units, errors };
    }
    startNum = startN;
    count = endN - startN + 1;
  } else if (countMatch) {
    count = parseInt(countMatch[1]);
    if (count > 1000) {
      errors.push(`Count too large (${count}). Maximum 1,000 per batch.`);
      return { units, errors };
    }
    // Try to find a start number
    const startMatch = lower.match(/(?:start(?:ing)?|from)\s*(?:at\s+)?(\d+)/i);
    startNum = startMatch ? parseInt(startMatch[1]) : 1;
    prefix = isStudent ? 'Bed ' : '';
  } else {
    // Single unit description
    const numMatch = segment.match(/\b(?:unit|bed|room)\s*([A-Za-z]?\d+)\b/i);
    if (numMatch) {
      startNum = parseInt(numMatch[1].replace(/^[A-Za-z]+/, ''));
      prefix = numMatch[1].match(/^([A-Za-z]+)/)?.[1] || '';
    }
    count = 1;
  }

  for (let i = 0; i < count; i++) {
    const num = startNum + i;
    units.push({
      unitNumber: `${prefix}${num}`,
      size,
      unitType,
      bedrooms,
      bathrooms,
      isShared,
      independentWashroom,
      unitAmenities,
      notes,
    });
  }

  return { units, errors };
}

// ── Component ───────────────────────────────────────────────────

const ROWS_PER_PAGE = 20;

export default function BulkUnitSetupDialog({ open, onOpenChange, isStudent, existingUnitNumbers, onConfirm, maxUnits = 1000 }: Props) {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [preview, setPreview] = useState<BulkUnit[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  const duplicates = useMemo(() => {
    const existing = new Set(existingUnitNumbers.map(n => n.toLowerCase()));
    const seen = new Set<string>();
    const dups = new Set<number>();
    preview.forEach((u, i) => {
      const key = u.unitNumber.toLowerCase();
      if (existing.has(key) || seen.has(key)) dups.add(i);
      seen.add(key);
    });
    return dups;
  }, [preview, existingUnitNumbers]);

  const handleGenerate = () => {
    const { units, errors } = parseBulkPrompt(prompt, isStudent);

    if (units.length === 0 && errors.length === 0) {
      setParseErrors(['Could not parse any units. Try format: "101-150: studio, 500 sq ft, 1 bath"']);
      return;
    }

    if (units.length + existingUnitNumbers.length > maxUnits) {
      errors.push(`Total units would exceed ${maxUnits} limit. Reduce the range.`);
    }

    setPreview(units);
    setParseErrors(errors);
    setShowAll(false);
    setEditingIdx(null);
  };

  const handleConfirm = () => {
    if (duplicates.size > 0) {
      toast({ title: 'Duplicate unit numbers', description: 'Fix highlighted duplicates before confirming.', variant: 'destructive' });
      return;
    }
    if (preview.length === 0) {
      toast({ title: 'No units to add', variant: 'destructive' });
      return;
    }
    onConfirm(preview);
    toast({ title: `${preview.length} ${isStudent ? 'beds' : 'units'} added successfully` });
    handleClose();
  };

  const handleClose = () => {
    setPrompt('');
    setPreview([]);
    setParseErrors([]);
    setShowAll(false);
    setEditingIdx(null);
    onOpenChange(false);
  };

  const updatePreviewUnit = (idx: number, field: keyof BulkUnit, value: any) => {
    setPreview(prev => prev.map((u, i) => i === idx ? { ...u, [field]: value } : u));
  };

  const removePreviewUnit = (idx: number) => {
    setPreview(prev => prev.filter((_, i) => i !== idx));
  };

  const visibleUnits = showAll ? preview : preview.slice(0, ROWS_PER_PAGE);

  // Summary stats
  const summary = useMemo(() => {
    const byType: Record<string, number> = {};
    preview.forEach(u => {
      const label = UNIT_TYPE_LABELS[u.unitType] || u.unitType;
      byType[label] = (byType[label] || 0) + 1;
    });
    return byType;
  }, [preview]);

  const placeholder = isStudent
    ? 'Examples:\nBed 1-50: shared, 120 sq ft, 1 bath\nBed 51-80: private, 200 sq ft, 1 bath, independent washroom\n101-120: 2-bed, 400 sq ft, 2 bath'
    : 'Examples:\n101-150: studio, 500 sq ft, 1 bath\n151-200: 1-bed, 650 sq ft, 1 bath\nA1-A20: 2-bed, 900 sq ft, 2 bath';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Smart Bulk {isStudent ? 'Bed' : 'Unit'} Setup
          </DialogTitle>
          <DialogDescription>
            Describe your {isStudent ? 'beds' : 'units'} using natural language. The parser will generate entries for review.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Prompt input */}
          <div>
            <Label>Describe {isStudent ? 'beds' : 'units'} to add</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={placeholder}
              rows={4}
              className="mt-1.5 font-mono text-sm"
            />
          </div>

          {/* Helper text */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground mb-1">Supported syntax</p>
              <ul className="space-y-0.5 text-xs">
                <li><strong>Ranges:</strong> 101-150, A1-A50, Bed 1-20</li>
                <li><strong>Types:</strong> studio, 1-bed, 2-bed, 3-bed, 4-bed (or 1bhk, 2bhk…)</li>
                <li><strong>Details:</strong> 500 sq ft, 2 bath{isStudent ? ', shared, independent washroom' : ''}</li>
                <li><strong>Multiple groups:</strong> Separate with semicolons or new lines</li>
              </ul>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim()}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-2"
          >
            <Wand2 className="h-4 w-4" />
            Generate Preview
          </Button>

          {/* Parse errors */}
          {parseErrors.length > 0 && (
            <div className="space-y-1">
              {parseErrors.map((err, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {err}
                </div>
              ))}
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <div className="space-y-3">
              {/* Summary */}
              <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <Check className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  Generating {preview.length} {isStudent ? 'beds' : 'units'}:
                </span>
                {Object.entries(summary).map(([type, count]) => (
                  <Badge key={type} variant="secondary" className="text-xs">
                    {count} {type}
                  </Badge>
                ))}
                {duplicates.size > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {duplicates.size} duplicate{duplicates.size > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>

              {/* Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="w-[100px]">{isStudent ? 'Bed #' : 'Unit #'}</TableHead>
                        <TableHead className="w-[80px]">Sq Ft</TableHead>
                        {!isStudent && <TableHead className="w-[100px]">Type</TableHead>}
                        <TableHead className="w-[70px]">{isStudent ? 'Beds' : 'BR'}</TableHead>
                        <TableHead className="w-[70px]">Bath</TableHead>
                        {isStudent && <TableHead className="w-[70px]">Shared</TableHead>}
                        {isStudent && <TableHead className="w-[80px]">Ind. WR</TableHead>}
                        <TableHead className="w-[120px]">Notes</TableHead>
                        <TableHead className="w-[50px]" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleUnits.map((u, i) => {
                        const isDup = duplicates.has(i);
                        const isEditing = editingIdx === i;
                        return (
                          <TableRow
                            key={i}
                            className={`${isDup ? 'bg-destructive/5' : ''} ${isEditing ? 'bg-accent/50' : ''} cursor-pointer`}
                            onClick={() => setEditingIdx(isEditing ? null : i)}
                          >
                            <TableCell>
                              {isEditing ? (
                                <Input
                                  className="h-7 text-xs w-full"
                                  value={u.unitNumber}
                                  onChange={(e) => updatePreviewUnit(i, 'unitNumber', e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <span className={isDup ? 'text-destructive font-medium' : ''}>
                                  {u.unitNumber}
                                  {isDup && <AlertCircle className="h-3 w-3 inline ml-1" />}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {isEditing ? (
                                <Input
                                  className="h-7 text-xs w-full"
                                  type="number"
                                  value={u.size || ''}
                                  onChange={(e) => updatePreviewUnit(i, 'size', Number(e.target.value))}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                u.size.toLocaleString()
                              )}
                            </TableCell>
                            {!isStudent && (
                              <TableCell>
                                {isEditing ? (
                                  <Select
                                    value={u.unitType}
                                    onValueChange={(v) => updatePreviewUnit(i, 'unitType', v)}
                                  >
                                    <SelectTrigger className="h-7 text-xs" onClick={(e) => e.stopPropagation()}>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Object.entries(UNIT_TYPE_LABELS).map(([k, v]) => (
                                        <SelectItem key={k} value={k}>{v}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  UNIT_TYPE_LABELS[u.unitType]
                                )}
                              </TableCell>
                            )}
                            <TableCell>
                              {isEditing ? (
                                <Input
                                  className="h-7 text-xs w-full"
                                  type="number"
                                  value={u.bedrooms}
                                  onChange={(e) => updatePreviewUnit(i, 'bedrooms', Number(e.target.value))}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                u.bedrooms
                              )}
                            </TableCell>
                            <TableCell>
                              {isEditing ? (
                                <Input
                                  className="h-7 text-xs w-full"
                                  type="number"
                                  value={u.bathrooms}
                                  onChange={(e) => updatePreviewUnit(i, 'bathrooms', Number(e.target.value))}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                u.bathrooms
                              )}
                            </TableCell>
                            {isStudent && (
                              <TableCell>
                                {isEditing ? (
                                  <Checkbox
                                    checked={u.isShared}
                                    onCheckedChange={(v) => updatePreviewUnit(i, 'isShared', !!v)}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                ) : (
                                  u.isShared ? <Badge variant="outline" className="text-xs">Shared</Badge> : '—'
                                )}
                              </TableCell>
                            )}
                            {isStudent && (
                              <TableCell>
                                {isEditing ? (
                                  <Checkbox
                                    checked={u.independentWashroom}
                                    onCheckedChange={(v) => updatePreviewUnit(i, 'independentWashroom', !!v)}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                ) : (
                                  u.independentWashroom ? <Check className="h-4 w-4 text-primary" /> : '—'
                                )}
                              </TableCell>
                            )}
                            <TableCell className="text-xs text-muted-foreground truncate max-w-[120px]">
                              {isEditing ? (
                                <Input
                                  className="h-7 text-xs w-full"
                                  value={u.notes}
                                  onChange={(e) => updatePreviewUnit(i, 'notes', e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  placeholder="Notes..."
                                />
                              ) : (
                                u.notes || '—'
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => { e.stopPropagation(); removePreviewUnit(i); }}
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Show more / less */}
              {preview.length > ROWS_PER_PAGE && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full gap-1 text-muted-foreground"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? (
                    <>
                      <ChevronUp className="h-4 w-4" /> Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" /> Show all {preview.length} {isStudent ? 'beds' : 'units'}
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {preview.length > 0 && (
            <Button onClick={handleConfirm} className="gap-1.5">
              <Check className="h-4 w-4" />
              Confirm & Add {preview.length} {isStudent ? 'Beds' : 'Units'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
