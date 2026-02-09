import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DMSTag } from '@/types/files';

interface TagManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tags: DMSTag[];
  onAddTag: (name: string) => void;
  onDeleteTag: (tagId: string) => void;
}

export default function TagManagerDialog({ open, onOpenChange, tags, onAddTag, onDeleteTag }: TagManagerDialogProps) {
  const [newTag, setNewTag] = useState('');

  const handleAdd = () => {
    if (!newTag.trim()) return;
    onAddTag(newTag.trim());
    setNewTag('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="flex gap-2">
            <Input
              placeholder="New tag name…"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button size="icon" onClick={handleAdd} disabled={!newTag.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag.id} variant="secondary" className={cn('text-xs gap-1 pr-1', tag.color)}>
                {tag.name}
                <button onClick={() => onDeleteTag(tag.id)} className="hover:bg-foreground/10 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
