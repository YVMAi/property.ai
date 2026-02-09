import { useState } from 'react';
import { Download, Eye, FileText, FileImage, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface AttachmentPreviewProps {
  filename: string;
  /** Optional: compact chip style (for chat bubbles) vs default */
  variant?: 'chip' | 'badge';
}

function getFileType(filename: string): 'image' | 'pdf' | 'other' {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
  if (ext === 'pdf') return 'pdf';
  return 'other';
}

function getFileIcon(filename: string) {
  const type = getFileType(filename);
  if (type === 'image') return FileImage;
  if (type === 'pdf') return FileText;
  return File;
}

export default function AttachmentPreview({ filename, variant = 'chip' }: AttachmentPreviewProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const { toast } = useToast();
  const FileIcon = getFileIcon(filename);
  const fileType = getFileType(filename);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    // In a real app this would trigger a file download from storage
    toast({
      title: 'Download started',
      description: `Downloading ${filename}…`,
    });
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          'inline-flex items-center gap-1 cursor-pointer transition-colors hover:bg-primary/10',
          variant === 'chip'
            ? 'text-[10px] bg-accent rounded px-1.5 py-0.5 text-accent-foreground'
            : 'text-xs bg-accent text-accent-foreground rounded-full px-2.5 py-1'
        )}
      >
        <FileIcon className="h-3 w-3 shrink-0" />
        <span className="truncate max-w-[120px]">{filename}</span>
      </button>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <FileIcon className="h-4 w-4 text-primary" />
              {filename}
            </DialogTitle>
          </DialogHeader>

          {/* Preview area */}
          <div className="rounded-lg border border-border bg-muted/50 flex flex-col items-center justify-center min-h-[220px] p-6 gap-4">
            {fileType === 'image' ? (
              <>
                <FileImage className="h-16 w-16 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Image preview</p>
                <div className="w-full h-40 rounded-md bg-gradient-to-br from-muted to-accent/30 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground italic">
                    {filename}
                  </span>
                </div>
              </>
            ) : fileType === 'pdf' ? (
              <>
                <FileText className="h-16 w-16 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">PDF document</p>
                <div className="w-full rounded-md bg-background border border-border p-4 space-y-2">
                  <div className="h-2.5 bg-muted-foreground/10 rounded w-full" />
                  <div className="h-2.5 bg-muted-foreground/10 rounded w-4/5" />
                  <div className="h-2.5 bg-muted-foreground/10 rounded w-3/5" />
                  <div className="h-2.5 bg-muted-foreground/10 rounded w-full" />
                  <div className="h-2.5 bg-muted-foreground/10 rounded w-2/3" />
                </div>
              </>
            ) : (
              <>
                <File className="h-16 w-16 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">File attachment</p>
                <p className="text-xs text-muted-foreground">{filename}</p>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
            <Button size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
