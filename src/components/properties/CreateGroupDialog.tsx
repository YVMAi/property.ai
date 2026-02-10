import { useState } from 'react';
import { Plus, X, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { usePropertyGroupsContext } from '@/contexts/PropertyGroupsContext';
import { usePropertiesContext } from '@/contexts/PropertiesContext';
import { GROUP_COLOR_PRESETS } from '@/types/propertyGroup';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (groupId: string) => void;
}

export default function CreateGroupDialog({ open, onOpenChange, onCreated }: Props) {
  const { toast } = useToast();
  const { groups, addGroup, setPropertyGroups, getGroupsForProperty } = usePropertyGroupsContext();
  const { activeProperties } = usePropertiesContext();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(GROUP_COLOR_PRESETS[0].value);
  const [error, setError] = useState('');
  const [linkedPropertyIds, setLinkedPropertyIds] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const TAG_SUGGESTIONS = ['Portfolio', 'High-Yield', 'Residential', 'Commercial', 'Student', 'Affordable', 'Urban', 'Suburban', 'Renovation', 'New Build'];

  const addTag = (tag?: string) => {
    const t = (tag || tagInput).trim();
    if (!t || tags.includes(t)) return;
    setTags(prev => [...prev, t]);
    setTagInput('');
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Group name is required');
      return;
    }
    if (groups.some(g => g.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('Group name already exists');
      return;
    }
    const newGroup = addGroup(trimmed, description.trim(), color, tags);

    // Link selected properties to this new group
    linkedPropertyIds.forEach(pid => {
      const existingGroups = getGroupsForProperty(pid).map(g => g.id);
      setPropertyGroups(pid, [...existingGroups, newGroup.id]);
    });

    toast({ title: 'Group created', description: `"${trimmed}" with ${linkedPropertyIds.length} linked properties.` });
    onCreated?.(newGroup.id);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setColor(GROUP_COLOR_PRESETS[0].value);
    setError('');
    setLinkedPropertyIds([]);
    setTags([]);
    setTagInput('');
    onOpenChange(false);
  };

  const filteredSuggestions = TAG_SUGGESTIONS.filter(
    t => !tags.includes(t) && t.toLowerCase().includes(tagInput.toLowerCase())
  ).slice(0, 5);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            Create New Group
          </DialogTitle>
          <DialogDescription>
            Group properties for filtering, reporting, or portfolio management.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Group Name *</Label>
            <Input
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="e.g. Student Housing Cluster"
              className="mt-1"
            />
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={2}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="mb-2 block">Color</Label>
            <div className="flex flex-wrap gap-2">
              {GROUP_COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    color === preset.value ? 'border-foreground scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: preset.value }}
                  onClick={() => setColor(preset.value)}
                  title={preset.label}
                />
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label className="mb-1.5 block">Tags</Label>
            <div className="flex gap-1.5">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="Add a tag..."
                className="h-9"
              />
              <Button type="button" size="sm" variant="outline" onClick={() => addTag()} className="h-9 px-3 shrink-0">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            {tagInput && filteredSuggestions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {filteredSuggestions.map(s => (
                  <Badge
                    key={s}
                    variant="outline"
                    className="text-xs cursor-pointer hover:bg-accent"
                    onClick={() => addTag(s)}
                  >
                    + {s}
                  </Badge>
                ))}
              </div>
            )}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map(t => (
                  <Badge key={t} variant="secondary" className="text-xs gap-1 pr-1">
                    {t}
                    <button type="button" onClick={() => setTags(prev => prev.filter(x => x !== t))} className="hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Link existing properties */}
          <div>
            <Label className="mb-1.5 block">Link Existing Properties</Label>
            <SearchableSelect
              options={activeProperties.map(p => ({
                value: p.id,
                label: `${p.name} — ${p.address.city}, ${p.address.state}`,
              }))}
              value={linkedPropertyIds.length > 0 ? linkedPropertyIds[linkedPropertyIds.length - 1] : ''}
              onValueChange={(v) => {
                if (!linkedPropertyIds.includes(v)) {
                  setLinkedPropertyIds(prev => [...prev, v]);
                }
              }}
              placeholder="Search properties to link..."
            />
            {linkedPropertyIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {linkedPropertyIds.map(pid => {
                  const p = activeProperties.find(x => x.id === pid);
                  if (!p) return null;
                  return (
                    <Badge key={pid} variant="outline" className="text-xs gap-1 pr-1">
                      {p.name}
                      <button
                        type="button"
                        onClick={() => setLinkedPropertyIds(prev => prev.filter(x => x !== pid))}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} className="gap-1.5">
            <Plus className="h-4 w-4" /> Create Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
