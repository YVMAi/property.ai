import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, X, Sparkles, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Vendor } from '@/types/vendor';
import { PREDEFINED_CATEGORIES, PREDEFINED_REGIONS } from '@/types/vendor';

interface VendorSelectorProps {
  vendors: Vendor[];
  mode: 'multi' | 'single';
  selected: string[];
  onSelectionChange: (ids: string[]) => void;
  /** SR/WO description for AI matching */
  taskDescription?: string;
  /** SR/WO category keyword */
  taskCategory?: string;
  /** Property region for proximity matching */
  taskRegion?: string;
}

/* ── Rule-based "AI" suggestion scoring ── */

interface ScoredVendor {
  vendor: Vendor;
  score: number;
  reasons: string[];
}

function scoreVendors(
  vendors: Vendor[],
  description: string,
  category: string,
  region: string,
): ScoredVendor[] {
  const descLower = description.toLowerCase();
  const catLower = category.toLowerCase();

  // Extract keywords from description
  const keywords = descLower.split(/\s+/).filter(w => w.length > 3);

  return vendors.map(v => {
    let score = 0;
    const reasons: string[] = [];

    // Category match
    const vendorCats = [...v.categories, ...v.customCategories].map(c => c.toLowerCase());
    if (catLower && vendorCats.some(c => c.includes(catLower) || catLower.includes(c))) {
      score += 40;
      reasons.push(`${category} specialist`);
    } else if (keywords.some(kw => vendorCats.some(c => c.includes(kw)))) {
      score += 25;
      reasons.push('Category match');
    }

    // Region match
    if (region && v.regions.some(r => r.toLowerCase().includes(region.toLowerCase()))) {
      score += 25;
      reasons.push('Service area match');
    }

    // Preferred / Licensed tags
    if (v.tags.includes('Preferred')) { score += 10; reasons.push('Preferred vendor'); }
    if (v.tags.includes('Licensed')) { score += 5; reasons.push('Licensed'); }
    if (v.tags.includes('Insured')) { score += 5; reasons.push('Insured'); }

    // Completion history (use work order count as proxy)
    const completedWOs = v.workOrders.filter(wo => wo.status === 'completed').length;
    if (completedWOs >= 3) { score += 10; reasons.push(`${completedWOs} jobs completed`); }
    else if (completedWOs >= 1) { score += 5; reasons.push(`${completedWOs} job(s) completed`); }

    // 24/7 availability bonus for urgent-sounding descriptions
    if (v.availability247 && (descLower.includes('urgent') || descLower.includes('emergency') || descLower.includes('broken'))) {
      score += 10;
      reasons.push('24/7 available');
    }

    // Lower rate bonus
    if (typeof v.defaultHourlyRate === 'number' && v.defaultHourlyRate > 0 && v.defaultHourlyRate <= 60) {
      score += 5;
      reasons.push(`$${v.defaultHourlyRate}/hr`);
    }

    return { vendor: v, score, reasons: reasons.slice(0, 3) };
  }).sort((a, b) => b.score - a.score);
}

/* ── Component ── */

export function VendorSelector({
  vendors,
  mode,
  selected,
  onSelectionChange,
  taskDescription = '',
  taskCategory = '',
  taskRegion = '',
}: VendorSelectorProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(!isMobile);
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [regionFilters, setRegionFilters] = useState<string[]>([]);

  // Only active vendors (blacklisted excluded)
  const activeOnly = useMemo(() => vendors.filter(v => v.status === 'active'), [vendors]);

  // All unique categories & regions from vendors
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    activeOnly.forEach(v => { v.categories.forEach(c => cats.add(c)); v.customCategories.forEach(c => cats.add(c)); });
    PREDEFINED_CATEGORIES.forEach(c => cats.add(c));
    return Array.from(cats).sort();
  }, [activeOnly]);

  const allRegions = useMemo(() => {
    const regs = new Set<string>();
    activeOnly.forEach(v => v.regions.forEach(r => regs.add(r)));
    PREDEFINED_REGIONS.forEach(r => regs.add(r));
    return Array.from(regs).sort();
  }, [activeOnly]);

  // AI suggestions (top 5 from all active, unfiltered)
  const suggestions = useMemo(() => {
    if (!taskDescription && !taskCategory) return [];
    return scoreVendors(activeOnly, taskDescription, taskCategory, taskRegion)
      .filter(s => s.score >= 15)
      .slice(0, 5);
  }, [activeOnly, taskDescription, taskCategory, taskRegion]);

  // Filtered vendor list
  const filteredVendors = useMemo(() => {
    return activeOnly.filter(v => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const name = (v.companyName || `${v.firstName} ${v.lastName}`).toLowerCase();
        const cats = [...v.categories, ...v.customCategories].join(' ').toLowerCase();
        const regs = v.regions.join(' ').toLowerCase();
        if (!name.includes(q) && !cats.includes(q) && !regs.includes(q)) return false;
      }
      // Category filter
      if (categoryFilters.length > 0) {
        const vendorCats = [...v.categories, ...v.customCategories];
        if (!categoryFilters.some(cf => vendorCats.includes(cf))) return false;
      }
      // Region filter
      if (regionFilters.length > 0) {
        if (!regionFilters.some(rf => v.regions.includes(rf))) return false;
      }
      return true;
    });
  }, [activeOnly, search, categoryFilters, regionFilters]);

  const toggleSelection = (id: string) => {
    if (mode === 'single') {
      onSelectionChange(selected.includes(id) ? [] : [id]);
    } else {
      onSelectionChange(
        selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]
      );
    }
  };

  const toggleCategoryFilter = (cat: string) => {
    setCategoryFilters(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const toggleRegionFilter = (reg: string) => {
    setRegionFilters(prev => prev.includes(reg) ? prev.filter(r => r !== reg) : [...prev, reg]);
  };

  const clearFilters = () => { setCategoryFilters([]); setRegionFilters([]); };

  const getVendorName = (v: Vendor) => v.companyName || `${v.firstName} ${v.lastName}`;

  const hasActiveFilters = categoryFilters.length > 0 || regionFilters.length > 0;

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, category, or region…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      {/* Selected badges (multi mode) */}
      {mode === 'multi' && selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map(id => {
            const v = activeOnly.find(av => av.id === id);
            return (
              <Badge key={id} variant="outline" className="bg-secondary/30 text-secondary-foreground gap-1 pr-1">
                {v ? getVendorName(v) : id}
                <button onClick={() => toggleSelection(id)} className="ml-1 hover:bg-secondary/50 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
            <Filter className="h-3.5 w-3.5" />
            Filters
            {hasActiveFilters && (
              <Badge className="bg-primary text-primary-foreground border-0 h-4 px-1.5 text-[10px]">
                {categoryFilters.length + regionFilters.length}
              </Badge>
            )}
            {filtersOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-3">
            {/* Category filters */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Category</p>
              <div className="flex flex-wrap gap-1.5">
                {allCategories.slice(0, 12).map(cat => (
                  <button
                    key={cat}
                    onClick={() => toggleCategoryFilter(cat)}
                    className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                      categoryFilters.includes(cat)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-foreground border-border hover:bg-muted'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            {/* Region filters */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Region</p>
              <div className="flex flex-wrap gap-1.5">
                {allRegions.slice(0, 10).map(reg => (
                  <button
                    key={reg}
                    onClick={() => toggleRegionFilter(reg)}
                    className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                      regionFilters.includes(reg)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-foreground border-border hover:bg-muted'
                    }`}
                  >
                    {reg}
                  </button>
                ))}
              </div>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={clearFilters}>
                Clear all filters
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-2 p-3 rounded-lg bg-warning/15 border border-warning/30">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-warning-foreground" />
            <span className="text-sm font-semibold text-warning-foreground">Best Matches</span>
            <div className="flex-1 h-px bg-warning/40" />
          </div>
          <div className={`flex gap-2 ${isMobile ? 'overflow-x-auto pb-1' : 'flex-wrap'}`}>
            {suggestions.map(({ vendor: v, reasons }) => {
              const isSelected = selected.includes(v.id);
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => toggleSelection(v.id)}
                  className={`flex-shrink-0 p-2.5 rounded-lg border text-left transition-all hover:scale-[1.02] ${
                    isSelected
                      ? 'border-warning bg-warning/30 ring-1 ring-warning'
                      : 'border-warning/20 bg-background hover:bg-warning/10'
                  }`}
                  style={{ minWidth: isMobile ? '180px' : 'auto', maxWidth: '220px' }}
                >
                  <p className="text-sm font-medium truncate">{getVendorName(v)}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {v.categories.slice(0, 2).map(c => (
                      <span key={c} className="px-1.5 py-0.5 text-[10px] rounded-full bg-secondary/40 text-secondary-foreground">
                        {c}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {reasons.map((r, i) => (
                      <span key={i} className="px-1.5 py-0.5 text-[10px] rounded-full bg-warning/25 text-warning-foreground">
                        {r}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {suggestions.length === 0 && taskDescription && (
        <p className="text-xs text-muted-foreground italic px-1">No strong recommendations — see all vendors below</p>
      )}

      <Separator />

      {/* Main Vendor List */}
      <div className="border rounded-lg max-h-52 overflow-y-auto">
        {filteredVendors.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-muted-foreground">No vendors found</p>
            <p className="text-xs text-muted-foreground mt-1">Try clearing filters or add a new vendor</p>
          </div>
        ) : (
          filteredVendors.map(v => {
            const name = getVendorName(v);
            const isSelected = selected.includes(v.id);
            const completedCount = v.workOrders.filter(wo => wo.status === 'completed').length;
            return (
              <div
                key={v.id}
                className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0 ${
                  isSelected ? 'bg-secondary/15' : ''
                }`}
                onClick={() => toggleSelection(v.id)}
              >
                <div className="flex items-center justify-center h-4 w-4 shrink-0">
                  {mode === 'multi' ? (
                    <Checkbox checked={isSelected} className="pointer-events-none" />
                  ) : (
                    <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'border-primary' : 'border-muted-foreground/40'
                    }`}>
                      {isSelected && <div className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{name}</p>
                    <span className="h-2 w-2 rounded-full bg-secondary shrink-0" title="Active" />
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground truncate">
                      {v.categories.slice(0, 2).join(', ')}
                    </span>
                    {v.regions.length > 0 && (
                      <>
                        <span className="text-muted-foreground/40">·</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {v.regions.slice(0, 2).join(', ')}
                        </span>
                      </>
                    )}
                    {completedCount > 0 && (
                      <>
                        <span className="text-muted-foreground/40">·</span>
                        <span className="text-xs text-muted-foreground">{completedCount} completed</span>
                      </>
                    )}
                  </div>
                </div>
                {v.tags.length > 0 && (
                  <div className="hidden sm:flex gap-1 shrink-0">
                    {v.tags.slice(0, 2).map(t => (
                      <Badge key={t} variant="outline" className="text-[10px] px-1.5 py-0 h-5">{t}</Badge>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Vendor count + max warning */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {filteredVendors.length} vendor{filteredVendors.length !== 1 ? 's' : ''} available
          {selected.length > 0 && ` · ${selected.length} selected`}
        </p>
        {mode === 'multi' && selected.length > 10 && (
          <p className="text-xs text-destructive-foreground">Max 10 vendors recommended</p>
        )}
      </div>

      {/* Add New Vendor */}
      <Button
        variant="outline"
        size="sm"
        className="text-xs gap-1.5"
        onClick={() => navigate('/users/vendors/new')}
      >
        <UserPlus className="h-3.5 w-3.5" /> Add New Vendor
      </Button>
    </div>
  );
}
