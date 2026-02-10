import { useState } from 'react';
import { Trash2, Edit2, Check, X, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { usePropertyGroupsContext } from '@/contexts/PropertyGroupsContext';
import { GROUP_COLOR_PRESETS } from '@/types/propertyGroup';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ManageGroupsDialog({ open, onOpenChange }: Props) {
  const { toast } = useToast();
  const { groups, updateGroup, deleteGroup, getGroupPropertyCount } = usePropertyGroupsContext();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const startEdit = (id: string) => {
    const g = groups.find(x => x.id === id);
    if (!g) return;
    setEditingId(id);
    setEditName(g.name);
    setEditColor(g.color);
  };

  const saveEdit = () => {
    if (!editingId || !editName.trim()) return;
    if (groups.some(g => g.id !== editingId && g.name.toLowerCase() === editName.trim().toLowerCase())) {
      toast({ title: 'Group name already exists', variant: 'destructive' });
      return;
    }
    updateGroup(editingId, { name: editName.trim(), color: editColor });
    setEditingId(null);
    toast({ title: 'Group updated' });
  };

  const handleDelete = (id: string) => {
    const success = deleteGroup(id);
    if (!success) {
      toast({ title: 'Cannot delete', description: 'Unlink all properties from this group first.', variant: 'destructive' });
    } else {
      toast({ title: 'Group deleted' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            Manage Property Groups
          </DialogTitle>
          <DialogDescription>
            Edit or remove existing groups. Unlink properties before deleting.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {groups.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No groups created yet.</p>
          ) : (
            groups.map(g => {
              const count = getGroupPropertyCount(g.id);
              const isEditing = editingId === g.id;

              return (
                <div key={g.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <div
                    className="h-6 w-6 rounded-full shrink-0 border border-border"
                    style={{ backgroundColor: isEditing ? editColor : g.color }}
                  />
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Input
                          className="h-8 text-sm"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                        />
                        <div className="flex gap-1">
                          {GROUP_COLOR_PRESETS.slice(0, 4).map(p => (
                            <button
                              key={p.value}
                              className={`h-5 w-5 rounded-full border ${editColor === p.value ? 'border-foreground' : 'border-transparent'}`}
                              style={{ backgroundColor: p.value }}
                              onClick={() => setEditColor(p.value)}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium">{g.name}</p>
                        {g.description && <p className="text-xs text-muted-foreground truncate">{g.description}</p>}
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">{count} properties</Badge>
                  <div className="flex gap-1 shrink-0">
                    {isEditing ? (
                      <>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={saveEdit}>
                          <Check className="h-3.5 w-3.5 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingId(null)}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(g.id)}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(g.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
