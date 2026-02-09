import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { FileText, Image, FileSpreadsheet, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DMSFile, DMSTag, FileType } from '@/types/files';

const FILE_ICONS: Record<FileType, React.ElementType> = {
  pdf: FileText,
  image: Image,
  document: FileText,
  spreadsheet: FileSpreadsheet,
  other: File,
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

interface FilePreviewDialogProps {
  file: DMSFile | null;
  tags: DMSTag[];
  onClose: () => void;
}

export default function FilePreviewDialog({ file, tags, onClose }: FilePreviewDialogProps) {
  if (!file) return null;
  const Icon = FILE_ICONS[file.fileType];
  const fileTags = file.tags.map((tid) => tags.find((t) => t.id === tid)).filter(Boolean) as DMSTag[];

  return (
    <Dialog open={!!file} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Icon className="h-5 w-5 text-primary" />
            {file.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview area */}
          <div className="flex items-center justify-center h-48 bg-muted/50 rounded-lg">
            {file.fileType === 'image' ? (
              <div className="text-center">
                <Image className="h-16 w-16 text-secondary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Image preview placeholder</p>
              </div>
            ) : file.fileType === 'pdf' ? (
              <div className="text-center">
                <FileText className="h-16 w-16 text-destructive-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">PDF preview placeholder</p>
              </div>
            ) : (
              <div className="text-center">
                <Icon className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Preview not available</p>
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Size</p>
              <p className="font-medium">{formatSize(file.size)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Type</p>
              <p className="font-medium uppercase">{file.fileType}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Uploaded</p>
              <p className="font-medium">{file.uploadDate}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Version</p>
              <p className="font-medium">v{file.version}</p>
            </div>
          </div>

          {fileTags.length > 0 && (
            <div>
              <p className="text-muted-foreground text-xs mb-1.5">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {fileTags.map((t) => (
                  <Badge key={t.id} variant="secondary" className={cn('text-xs', t.color)}>
                    {t.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
