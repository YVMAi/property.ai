import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DMSTag } from '@/types/files';

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tags: DMSTag[];
  onUpload: (files: { name: string; size: number; type: string }[], tagIds: string[]) => void;
}

export default function UploadDialog({ open, onOpenChange, tags, onUpload }: UploadDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    setSelectedFiles((prev) => [...prev, ...Array.from(fileList)]);
  };

  const removeFile = (idx: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    if (selectedFiles.length === 0) return;
    onUpload(
      selectedFiles.map((f) => ({ name: f.name, size: f.size, type: f.type })),
      selectedTags
    );
    setSelectedFiles([]);
    setSelectedTags([]);
    onOpenChange(false);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) => prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>

        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          )}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        >
          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Drag & drop files here or click to browse</p>
          <p className="text-xs text-muted-foreground/60 mt-1">PDF, Images, Documents up to 50 MB</p>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {selectedFiles.length > 0 && (
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {selectedFiles.map((f, i) => (
              <div key={i} className="flex items-center justify-between bg-muted/50 rounded px-3 py-1.5 text-sm">
                <span className="truncate mr-2">{f.name}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => removeFile(i)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <label key={tag.id} className="flex items-center gap-1.5 cursor-pointer">
                <Checkbox
                  checked={selectedTags.includes(tag.id)}
                  onCheckedChange={() => toggleTag(tag.id)}
                />
                <Badge variant="secondary" className={cn('text-xs', tag.color)}>{tag.name}</Badge>
              </label>
            ))}
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={selectedFiles.length === 0} className="w-full">
          <Upload className="h-4 w-4 mr-1.5" />
          Upload {selectedFiles.length > 0 ? `${selectedFiles.length} File(s)` : ''}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
