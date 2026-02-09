import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import type { DMSFile, DMSTag } from '@/types/files';

interface EditTagsDialogProps {
  file: DMSFile | null;
  tags: DMSTag[];
  onClose: () => void;
  onSave: (fileId: string, tagIds: string[]) => void;
}

export default function EditTagsDialog({ file, tags, onClose, onSave }: EditTagsDialogProps) {
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (file) setSelected([...file.tags]);
  }, [file]);

  const toggle = (tagId: string) => {
    setSelected((prev) => prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]);
  };

  if (!file) return null;

  return (
    <Dialog open={!!file} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Tags — {file.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          {tags.map((tag) => (
            <label key={tag.id} className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={selected.includes(tag.id)} onCheckedChange={() => toggle(tag.id)} />
              <Badge variant="secondary" className={cn('text-xs', tag.color)}>{tag.name}</Badge>
            </label>
          ))}
          <Button className="w-full" onClick={() => { onSave(file.id, selected); onClose(); }}>
            Save Tags
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
