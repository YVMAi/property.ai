import { useState } from 'react';
import { Plus, X, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
import { GROUP_COLOR_PRESETS } from '@/types/propertyGroup';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (groupId: string) => void;
}

export default function CreateGroupDialog({ open, onOpenChange, onCreated }: Props) {
  const { toast } = useToast();
  const { groups, addGroup } = usePropertyGroupsContext();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(GROUP_COLOR_PRESETS[0].value);
  const [error, setError] = useState('');

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
    const newGroup = addGroup(trimmed, description.trim(), color);
    toast({ title: 'Group created and linked', description: `"${trimmed}" is ready to use.` });
    onCreated?.(newGroup.id);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setColor(GROUP_COLOR_PRESETS[0].value);
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
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
