import { useState, useMemo } from 'react';
import { Search, Link2, Unlink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS, STATUS_COLORS } from '@/types/property';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
}

export default function AssignPropertiesDialog({ open, onOpenChange, groupId }: Props) {
  const { toast } = useToast();
  const { getGroupById, getPropertyIdsForGroup, setGroupProperties } = usePropertyGroupsContext();
  const { activeProperties } = usePropertiesContext();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);

  const group = getGroupById(groupId);

  // Initialize selection from current links when dialog opens
  if (open && !initialized) {
    const currentIds = getPropertyIdsForGroup(groupId);
    setSelected(new Set(currentIds));
    setInitialized(true);
  }
  if (!open && initialized) {
    setInitialized(false);
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return activeProperties;
    const q = search.toLowerCase();
    return activeProperties.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.address.street.toLowerCase().includes(q) ||
      p.address.city.toLowerCase().includes(q)
    );
  }, [activeProperties, search]);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = () => {
    setGroupProperties(groupId, Array.from(selected));
    toast({ title: 'Properties updated', description: `${selected.size} properties linked to "${group?.name}".` });
    onOpenChange(false);
  };

  if (!group) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Assign Properties — {group.name}
          </DialogTitle>
          <DialogDescription>
            Select which properties belong to this group. {selected.size} selected.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search properties..."
            className="pl-9 h-9"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 max-h-[400px] min-h-[200px]">
          {filtered.map(p => {
            const isLinked = selected.has(p.id);
            return (
              <div
                key={p.id}
                className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                  isLinked ? 'bg-primary/10' : 'hover:bg-muted/50'
                }`}
                onClick={() => toggle(p.id)}
              >
                <Checkbox checked={isLinked} onCheckedChange={() => toggle(p.id)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {p.address.street}, {p.address.city}
                  </p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Badge variant="outline" className="text-xs">{PROPERTY_TYPE_LABELS[p.type]}</Badge>
                  <Badge className={`${STATUS_COLORS[p.status]} text-xs`}>
                    {PROPERTY_STATUS_LABELS[p.status]}
                  </Badge>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No properties found.</p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={() => setSelected(new Set())}>
            <Unlink className="h-3.5 w-3.5 mr-1.5" /> Clear All
          </Button>
          <Button onClick={handleSave}>{selected.size} Properties — Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
