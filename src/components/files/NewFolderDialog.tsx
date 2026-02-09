import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FolderPlus } from 'lucide-react';

interface NewFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentFolderName: string | null;
  onCreate: (name: string) => void;
}

export default function NewFolderDialog({ open, onOpenChange, parentFolderName, onCreate }: NewFolderDialogProps) {
  const [name, setName] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim());
    setName('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>New Folder</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {parentFolderName && (
            <p className="text-sm text-muted-foreground">Inside: <span className="font-medium text-foreground">{parentFolderName}</span></p>
          )}
          <div className="space-y-1.5">
            <Label>Folder name</Label>
            <Input
              placeholder="e.g. Inspections"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
          </div>
          <Button onClick={handleCreate} disabled={!name.trim()} className="w-full">
            <FolderPlus className="h-4 w-4 mr-1.5" />
            Create Folder
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
